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

      // Generate a unique file name and specify the folder path
      const fileName = `${Date.now()}-${file.originalname}`;
      const folderName = "attachments"; // Designated folder
      const filePath = `${folderName}/${fileName}`; 

      // Create a reference to the file in the specified folder
      const fileUpload = bucket.file(filePath);

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

      // Make the file publicly accessible
      await fileUpload.makePublic(); // This makes the file publicly readable

      // Construct the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      // Store the file data
      uploadedFilesData.push({
        public_id: fileName,
        url: publicUrl,
      });
    }

    // Return all uploaded file data
    return { success: true, data: uploadedFilesData };
  } catch (error) {
    console.error(error); // Log the error for debugging
    return { success: false, error: "Uploading file(s) failed on Firebase" };
  }
};


// Delete file(s) from Firebase Storage
export const deleteAttachments = async (filePaths: string[]): Promise<boolean> => {
  try {
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      console.warn("No file paths provided for deletion.");
      return false;
    }

    // Process each file path for deletion
    const deletionPromises = filePaths.map(async (filePath) => {
      try {
        const file = bucket.file(filePath);

        // Check if the file exists before attempting to delete
        const [exists] = await file.exists();
        if (!exists) {
          console.warn(`File not found: ${filePath}`);
          return;
        }

        // Delete the file
        await file.delete();
        console.log(`File deleted successfully: ${filePath}`);
      } catch (error) {
        console.error(`Error deleting file: ${filePath}`, error);
        throw error; // Rethrow the error for centralized handling
      }
    });

    // Wait for all deletion promises to resolve
    await Promise.all(deletionPromises);

    return true; 
  } catch (error) {
    console.error("Failed to delete one or more files:", error);
    return false; // Return false if any error occurs
  }
};