import multer from 'multer';
import { Request } from 'express';
import { ApiError } from './errorHandler';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/tiff',
    'image/bmp',
    'application/pdf',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        'Invalid file type. Only JPG, PNG, TIFF, BMP, and PDF files are allowed.'
      )
    );
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
});

export default upload;
