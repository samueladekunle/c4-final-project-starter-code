import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
export class AttachmentUtils {
    constructor(
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' })
    ) { }

    async getUploadUrl(bucketName: string, todoId: string, urlExpiration: string) {
        return this.s3.getSignedUrl('putObject', {
            Bucket: bucketName,
            Key: todoId,
            Expires: Number(urlExpiration)
        })
    }
}