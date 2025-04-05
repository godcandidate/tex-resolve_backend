"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttachmentes = exports.deleteAttachments = exports.uploadAttachments = void 0;
const firebaseConfig_1 = require("../firebaseConfig"); // Import Firebase bucket
// Upload file(s)
const uploadAttachments = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if attachments are uploaded
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return { success: false, error: "No files uploaded" };
        }
        // Explicitly cast req.files to an array of UploadedFile objects
        const filesArray = Array.isArray(req.files)
            ? req.files
            : [req.files];
        // Process each file in the array
        const uploadedFilesData = [];
        for (const file of filesArray) {
            if (!file ||
                typeof file !== "object" ||
                !file.mimetype ||
                !file.originalname ||
                !file.buffer) {
                return { success: false, error: "Invalid file format" };
            }
            // Generate a unique file name and specify the folder path
            const fileName = `${Date.now()}-${file.originalname}`;
            const folderName = "attachments"; // Designated folder
            const filePath = `${folderName}/${fileName}`;
            // Create a reference to the file in the specified folder
            const fileUpload = firebaseConfig_1.bucket.file(filePath);
            // Upload the file to Firebase Storage
            const blobStream = fileUpload.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });
            // Pipe the file data into the write stream
            blobStream.end(file.buffer);
            // Wait for the upload to complete
            yield new Promise((resolve, reject) => {
                blobStream.on("finish", resolve).on("error", reject);
            });
            // Make the file publicly accessible
            yield fileUpload.makePublic(); // This makes the file publicly readable
            // Construct the public URL
            const publicUrl = `https://storage.googleapis.com/${firebaseConfig_1.bucket.name}/${filePath}`;
            // Store the file data
            uploadedFilesData.push({
                public_id: fileName,
                url: publicUrl,
            });
        }
        // Return all uploaded file data
        return { success: true, data: uploadedFilesData };
    }
    catch (error) {
        console.error(error); // Log the error for debugging
        return { success: false, error: "Uploading file(s) failed on Firebase" };
    }
});
exports.uploadAttachments = uploadAttachments;
// Delete file(s) from Firebase Storage
const deleteAttachments = (filePaths) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!Array.isArray(filePaths) || filePaths.length === 0) {
            console.warn("No file paths provided for deletion.");
            return false;
        }
        // Process each file path for deletion
        const deletionPromises = filePaths.map((filePath) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const file = firebaseConfig_1.bucket.file(filePath);
                // Check if the file exists before attempting to delete
                const [exists] = yield file.exists();
                if (!exists) {
                    console.warn(`File not found: ${filePath}`);
                    return;
                }
                // Delete the file
                yield file.delete();
            }
            catch (error) {
                throw error; // Rethrow the error for centralized handling
            }
        }));
        // Wait for all deletion promises to resolve
        yield Promise.all(deletionPromises);
        return true;
    }
    catch (error) {
        console.error("Failed to delete one or more files:", error);
        return false; // Return false if any error occurs
    }
});
exports.deleteAttachments = deleteAttachments;
// Delete file(s)
const deleteAttachmentes = (filePaths) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!filePaths || filePaths.length === 0) {
            return { success: false, error: "No file paths provided" };
        }
        for (const filePath of filePaths) {
            const file = firebaseConfig_1.bucket.file(filePath);
            yield file.delete();
        }
        return { success: true };
    }
    catch (error) {
        console.error(error);
        return { success: false, error: "Deleting file(s) failed on Firebase" };
    }
});
exports.deleteAttachmentes = deleteAttachmentes;
