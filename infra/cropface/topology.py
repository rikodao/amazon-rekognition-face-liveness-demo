import aws_cdk as core
import builtins
import os
from infra.interfaces import IRflStack
from constructs import Construct
from aws_cdk import aws_s3 as s3
from aws_cdk.aws_s3_notifications import LambdaDestination

from aws_cdk import (
    CfnOutput,
    aws_iam as iam,
    aws_lambda as lambda_,
    aws_ecr_assets as ecr_assets,
)
from os import path

shared_deps_path = path.join(path.dirname(__file__),'../src/shared')

base_path = f"./src/backend/shared"

output_dir = f"./cdk.out/shared"


class CropFace(Construct):

    def __init__(self, scope: Construct, id: builtins.str, rfl_stack:IRflStack) -> None:
        super().__init__(scope, id)

        # S3バケットの作成
        self.bucket =  s3.Bucket(self, "identificationCardBucket",
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

        # S3バケットの作成
        self.faceCroppedBucket =  s3.Bucket(self, "faceCroppedImageBucket",
            bucket_name="rekognition-face-cropped-image-bucket-" + core.Aws.ACCOUNT_ID + core.Aws.REGION,
            block_public_access=s3.BlockPublicAccess(
                block_public_acls=True,
                ignore_public_acls=True,
                block_public_policy=True,
                restrict_public_buckets=True
            ),
            encryption=s3.BucketEncryption.S3_MANAGED, # AES256を指定
            removal_policy=core.RemovalPolicy.DESTROY,  # バケットの削除ポリシーをDESTROYに設定
            auto_delete_objects=True  # スタック削除時にバケット内のオブジェクトを自動削除
        )


        lambda_role = iam.Role(
            self, "LambdaExecutionRole",
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            description="Lambda execution role with permissions to access ECR."
        )

        # ECRへのアクセス権限をLambda実行ロールに付与
        lambda_role.add_to_policy(iam.PolicyStatement(
            effect=iam.Effect.ALLOW,
            actions=[
                "ecr:BatchGetImage",
                "ecr:GetDownloadUrlForLayer",
                "ecr:DescribeImages",
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            resources=["*"]  # 必要に応じてより具体的なリソースARNに制限することを推奨
        ))

        docker_image_asset = ecr_assets.DockerImageAsset(self, "CropFaceImage",
            directory=path.join(path.dirname(__file__), "../../src/backend/crop-face")
        )

        # Dockerイメージを使用するLambda関数の作成
        self.function = lambda_.DockerImageFunction(self, "CropFaceFunction",
            code=lambda_.DockerImageCode.from_ecr(
                repository=docker_image_asset.repository,
                tag=docker_image_asset.asset_hash
            ),
            role=lambda_role,
            environment={'CROPED_BUCKET': self.faceCroppedBucket.bucket_name}
        )

        self.function.role.add_managed_policy(
            policy=iam.ManagedPolicy.from_aws_managed_policy_name('AmazonRekognitionFullAccess'))

        self.function.role.add_managed_policy(
            policy=iam.ManagedPolicy.from_aws_managed_policy_name('AmazonS3FullAccess'))
        
        # Lambda関数をS3バケットの通知に設定
        self.bucket.add_event_notification(s3.EventType.OBJECT_CREATED, LambdaDestination(self.function))


        # 本人確認確認用バケットをCloudFormation Outputに登録
        CfnOutput(self, id="RFL-identity-card-bucket-name",
                  value=self.bucket.bucket_name, export_name="identity-card-bucket-name")
