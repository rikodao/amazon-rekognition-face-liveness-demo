import boto3
import os
import json

class S3Manager:
    def __init__(self):
        self.bucket_name = os.getenv('CROPED_BUCKET')
        self.client = boto3.client('s3')

    def generate_presigned_url(self, sessionid):
        print("generate_presigned_url")
        return self.client.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket_name, 'Key': sessionid},
            ExpiresIn=3600
        )


class RekognitionManager:
    def __init__(self):
        self.client = boto3.client('rekognition')
        self.crop_face_bucket_name = os.getenv('CROPED_BUCKET')
        self.faceliveness_face_bucket_name = os.getenv('FACELIVENESS_BUCKET')

    def compare_faces(self, sessionid, similarity_threshold=50):
        print("compare_faces")
        response = self.client.compare_faces(
            SourceImage={'S3Object': {'Bucket': self.crop_face_bucket_name, 'Name': sessionid}},
            TargetImage={'S3Object': {'Bucket': self.faceliveness_face_bucket_name, 'Name': sessionid}},
            SimilarityThreshold=similarity_threshold
        )
        return response


def lambda_handler(event, context):
    body = json.loads(event['body'])
    sessionid = body['sessionid']
    
    s3_manager = S3Manager(sessionid)
    rekognition_manager = RekognitionManager()

    croppedImage = s3_manager.generate_presigned_url(sessionid)

    face_response = rekognition_manager.compare_faces(sessionid)
    similarity_score = face_response['FaceMatches'][0]['Similarity'] if face_response['FaceMatches'] else 0

    return {
        'statusCode': 200,
        'body': json.dumps({'body': {
            'croppedImage': croppedImage,
            'similarityScore': similarity_score
        }}),
        'headers': {
            "Access-Control-Allow-Origin": "*",
            'Content-Type': 'application/json'
        }
    }
