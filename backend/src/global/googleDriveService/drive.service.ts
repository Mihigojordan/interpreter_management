import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DriveService {
  private driveClient;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.driveClient = google.drive({ version: 'v3', auth });
    console.log('connected the to the  => : ');
  }


  

  /**
   * Upload file to Google Drive
   */
  async uploadFile(filePath: string, fileName: string, mimeType: string, folderId?: string) {
    const fileMetadata: any = {
      name: fileName,
    };
    if (folderId) fileMetadata.parents = [folderId];

    const media = {
      mimeType,
      body: fs.createReadStream(filePath),
    };

    const response = await this.driveClient.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, mimeType, webViewLink, webContentLink',
    });

    return response.data;
  }

  /**
   * Download file from Google Drive
   */
  async downloadFile(fileId: string, destinationPath: string) {
    const dest = fs.createWriteStream(destinationPath);

    const res = await this.driveClient.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' },
    );

    return new Promise((resolve, reject) => {
      res.data
        .on('end', () => resolve(`File downloaded to ${destinationPath}`))
        .on('error', (err) => reject(err))
        .pipe(dest);
    });
  }

  /**
   * Delete file from Google Drive
   */
  async deleteFile(fileId: string) {
    await this.driveClient.files.delete({ fileId });
    return { success: true, message: `File ${fileId} deleted.` };
  }

  /**
   * List files in folder
   */
  async listFiles(folderId?: string) {
    const query = folderId ? `'${folderId}' in parents` : '';
    const res = await this.driveClient.files.list({
      q: query,
      fields: 'files(id, name, mimeType, webViewLink)',
    });
    return res.data.files;
  }
}