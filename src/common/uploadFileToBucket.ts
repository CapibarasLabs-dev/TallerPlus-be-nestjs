import { Storage } from '@google-cloud/storage';

export class gcpBucketClass {
  private readonly storage: Storage;

  constructor() {
    this.storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      credentials: {
        type: 'service_account',
        project_id: process.env.GCP_PROJECT_ID,
        private_key_id: process.env.GCP_PRIVATE_KEY_ID,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GCP_CLIENT_EMAIL,
        client_id: process.env.GCP_CLIENT_ID,
      },
    });
  }

  async uploadFileFromBuffer(
    fileBuffer: Buffer,
    destFileName: string,
    bucketName: string,
    mimetype: string,
  ) {
    const bucket = this.storage.bucket(bucketName);
    const file = bucket.file(destFileName);

    return new Promise((resolve, reject) => {
      const stream = file.createWriteStream({
        metadata: {
          contentType: mimetype,
        },
        resumable: false,
      });

      stream.on('error', (err) => {
        console.error('Error at GCP:', err.message);
        reject(err);
      });

      stream.on('finish', () => {
        console.log(`File ${destFileName} uploaded`);
        resolve(`https://storage.googleapis.com/${bucketName}/${destFileName}`);
      });

      stream.end(fileBuffer);
    });
  }
}
