import aws_cdk as core
import builtins
from infra.interfaces import IRflStack
from constructs import Construct
from aws_cdk import aws_s3 as s3
from aws_cdk import aws_lambda as lambda_
from aws_cdk.aws_s3_notifications import LambdaDestination

from aws_cdk import (
    CfnOutput,
)



class CropFace(Construct):

    def __init__(self, scope: Construct, id: builtins.str, rfl_stack:IRflStack) -> None:
        super().__init__(scope, id)

        # S3バケットの作成
        self.bucket =  s3.Bucket(self, "MyBucket",
            bucket_name="rekognition-identification-card-bucket-" + core.Aws.ACCOUNT_ID + core.Aws.REGION,
            block_public_access=s3.BlockPublicAccess(
                block_public_acls=True,
                ignore_public_acls=True,
                block_public_policy=True,
                restrict_public_buckets=True
            ),
            cors=[
                s3.CorsRule(
                    allowed_headers=["*"],
                    allowed_methods=[s3.HttpMethods.PUT, s3.HttpMethods.POST],
                    allowed_origins=["*"]
                )
            ],
            encryption=s3.BucketEncryption.S3_MANAGED, # AES256を指定
            removal_policy=core.RemovalPolicy.DESTROY,  # バケットの削除ポリシーをDESTROYに設定
            auto_delete_objects=True  # スタック削除時にバケット内のオブジェクトを自動削除
        )


        # 本人確認確認用バケットをCloudFormation Outputに登録
        
        CfnOutput(self, id="RFL-identity-card-bucket-name",
                  value=self.bucket.bucket_name, export_name="identity-card-bucket-name")