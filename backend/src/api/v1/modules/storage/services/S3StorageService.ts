import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  createPresignedPost,
  type PresignedPost,
} from "@aws-sdk/s3-presigned-post";
import { env } from "../../../../../env";

export default class S3StorageService {
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async getUploadUrl(key: string, contentType: string): Promise<PresignedPost> {
    const res = await createPresignedPost(this.s3Client, {
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Fields: {
        "Content-Type": contentType,
      },
      Conditions: [
        ["content-length-range", 1, 100 * 1024 * 1024],
        ["eq", "$Content-Type", contentType],
      ],
      Expires: 5 * 60, // URL expires in 5 minutes
    });

    return res;
  }

  async getDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // URL expires in 1 hour
    });

    return signedUrl;
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });

    const result = await this.s3Client.send(command);

    if (result.$metadata.httpStatusCode !== 204) {
      throw new Error(`Failed to delete object with key: ${key}`);
    }
  }
}
