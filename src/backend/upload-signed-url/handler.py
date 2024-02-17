import boto3
from botocore.exceptions import ClientError
import json
import random, string
import os

def randomname(n):
   randlst = [random.choice(string.ascii_letters + string.digits) for i in range(n)]
   return ''.join(randlst)

def lambda_handler(event, context):
    # initialize s3 client
    s3_client = boto3.client('s3')
    bucket_name = os.getenv('UPLOAD_BUCKET')
    print("******bucket_name********")
    print(bucket_name)
    print("******bucket_name********")
    key = event.get('queryStringParameters', {}).get('key')
    print("******key********")
    print(key)
    print("******key********")

    object_key = 'upload/'+ key + ".jpg" # アップロードするオブジェクトのキーをランダム生成
    expiration = 600  # 署名付きURLの有効期限を秒で指定
    print("******object_key********")
    print(object_key)
    print("******object_key********")

    try:
        # generate presigned url
        response = s3_client.generate_presigned_url('put_object',
                                                    Params={'Bucket': bucket_name,
                                                            'Key': object_key,
                                                            'ContentType': 'image/jpeg'
                                                            },
                                                    ExpiresIn=expiration)
        print("******response********")
        print(response)
        print("******response********")
                                                    
    except ClientError as e:
        # When error occur, return 500 status
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps('Error generating presigned URL')
        }

    # return result
    return {
        'statusCode': 200,
        'body': json.dumps({'body': response}),
        'headers': {
            "Access-Control-Allow-Origin": "*"
        }
    }

if __name__ == "__main__":
    lambda_handler()