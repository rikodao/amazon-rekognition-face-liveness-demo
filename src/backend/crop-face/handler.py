import boto3
import io
import os
import ssl
print(ssl.OPENSSL_VERSION_INFO)
from PIL import Image

s3_client = boto3.client('s3')
rekognition_client = boto3.client('rekognition')

def lambda_handler(event, context):
    # S3イベントからバケット名とファイル名を取得
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']

    
    # アップロードされた画像を取得
    print("アップロードされた画像を取得")
    response = s3_client.get_object(Bucket=bucket, Key=key)
    image_bytes = response['Body'].read()
    print("アップロードされた画像を取得")

    # Rekognitionで顔検出
    print("Rekognitionで顔検出")
    face_response = rekognition_client.detect_faces(
        Image={'Bytes': image_bytes},
        Attributes=['DEFAULT']
    )
    
    if face_response['FaceDetails']:
        # 最初に検出された顔の情報を使用
        print("Rekognitionで顔検出")
        faceDetail = face_response['FaceDetails'][0]
        box = faceDetail['BoundingBox']
        image = Image.open(io.BytesIO(image_bytes))
        imgWidth, imgHeight = image.size
        left = imgWidth * box['Left']
        top = imgHeight * box['Top']
        width = imgWidth * box['Width']
        height = imgHeight * box['Height']
        print("Rekognitionで顔検出")
        # 顔の部分を切り出し
        face_image = image.crop((left, top, left + width, top + height))
        
        # 切り出した顔画像をバイト配列に変換
        buffer = io.BytesIO()
        face_image.save(buffer, 'JPEG')
        buffer.seek(0)

        # 切り出した顔画像をS3にアップロード
        print("切り出した顔画像をS3にアップロード")
        face_key = 'faces/' + key.split('/')[-1]
        s3_client.put_object(Bucket=os.getenv('CROPED_BUCKET'), Key=face_key, Body=buffer, ContentType='image/jpeg')
        print("切り出した顔画像をS3にアップロード")
        return {
            'statusCode': 200,
            'body': 'Face detected and cropped successfully!'
        }
    else:
        return {
            'statusCode': 400,
            'body': 'No faces detected.'
        }
