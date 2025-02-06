import { Request } from "express";
import { bucket } from "../firebaseConfig"; // Import Firebase bucket

// Type for a single file
interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

// Type for uploaded file data
interface UploadedFileData {
  public_id: string;
  url: string;
}

// Return type for uploadAttachments
interface UploadResult {
  success: boolean;
  data?: UploadedFileData[];
  error?: string;
}

// Upload file(s)
export const uploadAttachments = async (req: Request): Promise<UploadResult> => {
  try {
    // Check if attachments are uploaded
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return { success: false, error: "No files uploaded" };
    }

    // Explicitly cast req.files to an array of UploadedFile objects
    const filesArray: UploadedFile[] = Array.isArray(req.files)
      ? (req.files as UploadedFile[])
      : [(req.files as UploadedFile)];

    // Process each file in the array
    const uploadedFilesData: UploadedFileData[] = [];

    for (const file of filesArray) {
      if (
        !file ||
        typeof file !== "object" ||
        !file.mimetype ||
        !file.originalname ||
        !file.buffer
      ) {
        return { success: false, error: "Invalid file format" };
      }

      const fileName = `${Date.now()}-${file.originalname}`;
      const fileUpload = bucket.file(fileName);

      // Upload the file to Firebase Storage
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      // Pipe the file data into the write stream
      blobStream.end(file.buffer);

      // Wait for the upload to complete
      await new Promise((resolve, reject) => {
        blobStream.on("finish", resolve).on("error", reject);
      });

      // Get the public URL of the uploaded file
      const [url] = await fileUpload.getSignedUrl({
        action: "read",
        expires: "03-09-2491", // Expiry date far in the future
      });

      // Store the file data
      uploadedFilesData.push({
        public_id: fileName,
        url,
      });
    }

    // Return all uploaded file data
    return { success: true, data: uploadedFilesData };
  } catch (error) {
    console.error(error); // Log the error for debugging
    return { success: false, error: "Uploading file(s) failed on Firebase" };
  }
};