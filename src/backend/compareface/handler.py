import boto3
import os
import json

class S3Manager:
    def __init__(self):
        self.bucket_name = os.getenv('CROPED_BUCKET')
        self.client = boto3.client('s3')

    def generate_presigned_url(self, key):
        try:
            print("generate_presigned_url")
            return self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=3600
            )
        except Exception as e:
            print(f"Error generating presigned URL: {str(e)}")
            return None


class RekognitionManager:
    def __init__(self):
        self.client = boto3.client('rekognition')
        self.crop_face_bucket_name = os.getenv('CROPED_BUCKET')
        self.faceliveness_face_bucket_name = os.getenv('FACELIVENESS_BUCKET')

    def compare_faces(self, sessionid, similarity_threshold=50):
        try:
            print("compare_faces")
            croppedImageKey = 'faces/' + sessionid + ".jpg"
            FaceLivenessImageKey = "referenceImage/" + sessionid + '.jpg'


            print("self.crop_face_bucket_name")
            print(self.crop_face_bucket_name)
            print("self.faceliveness_face_bucket_name")
            print(self.faceliveness_face_bucket_name)
            print("croppedImageKey")
            print(croppedImageKey)
            print("FaceLivenessImageKey")
            print(FaceLivenessImageKey)
            
            response = self.client.compare_faces(
                SourceImage={'S3Object': {'Bucket': self.crop_face_bucket_name, 'Name': croppedImageKey}},
                TargetImage={'S3Object': {'Bucket': self.faceliveness_face_bucket_name, 'Name': FaceLivenessImageKey}},
                SimilarityThreshold=similarity_threshold
            )
            return response
        except Exception as e:
            print(f"Error comparing faces: {str(e)}")
            return None


def lambda_handler(event, context):
    try:
        sessionid = event.get('queryStringParameters', {}).get('key')
        
        s3_manager = S3Manager()
        rekognition_manager = RekognitionManager()

        croppedImageKey = 'faces/' + sessionid + ".jpg"
        croppedImage = s3_manager.generate_presigned_url(croppedImageKey)
        

        if not croppedImage:
            raise Exception("Failed to generate presigned URL for cropped image.")

        face_response = rekognition_manager.compare_faces(sessionid)
        if not face_response:
            raise Exception("Failed to compare faces.")

        similarity_score = face_response['FaceMatches'][0]['Similarity'] if face_response['FaceMatches'] else 0

        return {
            'statusCode': 200,
            'body': json.dumps({
                'croppedImage': croppedImage,
                'similarityScore': similarity_score
            }),
            'headers': {
                "Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json'
            }
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
            'headers': {
                "Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json'
            }
        }
