import { Request, Response, NextFunction } from 'express';
import { asyncHandler, ApiError } from '../middlewares/errorHandler';
import OCRService from '../services/OCRService';
import DatabaseManager from '../utils/database';

/**
 * Upload and process document with OCR
 * @route POST /api/ocr/upload
 */
export const uploadAndExtract = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    const { companyId, language = 'fas+eng' } = req.body;

    try {
      // Save uploaded file
      const filepath = await OCRService.saveUploadedFile(req.file, companyId);

      // Perform OCR
      const ocrResult = await OCRService.extractTextFromImage(filepath, language);

      // Parse financial data
      const parsedData = OCRService.parseFinancialData(ocrResult);

      // Save to database
      const db = await DatabaseManager.getConnection();

      const result = await db.run(
        `INSERT INTO ocr_documents
        (company_id, file_name, file_path, file_type, file_size, text_extracted, confidence, language, processing_time, parsed_data, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          companyId || null,
          req.file.originalname,
          filepath,
          req.file.mimetype,
          req.file.size,
          ocrResult.text,
          ocrResult.confidence,
          language,
          ocrResult.processingTime,
          JSON.stringify(parsedData),
          'completed',
        ]
      );

      res.json({
        success: true,
        message: 'فایل با موفقیت پردازش شد',
        data: {
          id: result.lastID,
          filename: req.file.originalname,
          ocrResult: {
            text: ocrResult.text,
            confidence: ocrResult.confidence,
            processingTime: ocrResult.processingTime,
            extractedNumbers: ocrResult.extractedNumbers,
          },
          parsedData,
        },
      });
    } catch (error: any) {
      throw new ApiError(500, `OCR processing failed: ${error.message}`);
    }
  }
);

/**
 * Get OCR document by ID
 * @route GET /api/ocr/:id
 */
export const getOCRDocument = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const db = await DatabaseManager.getConnection();

    const doc = await db.get(`SELECT * FROM ocr_documents WHERE id = ?`, [id]);

    if (!doc) {
      throw new ApiError(404, 'OCR document not found');
    }

    res.json({
      success: true,
      data: doc,
    });
  }
);

/**
 * Get all OCR documents for a company
 * @route GET /api/ocr/company/:companyId
 */
export const getOCRDocumentsByCompany = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { companyId } = req.params;

    const db = await DatabaseManager.getConnection();

    const docs = await db.all(
      `SELECT * FROM ocr_documents WHERE company_id = ? ORDER BY created_at DESC`,
      [companyId]
    );

    res.json({
      success: true,
      data: docs,
    });
  }
);

/**
 * Delete OCR document
 * @route DELETE /api/ocr/:id
 */
export const deleteOCRDocument = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const db = await DatabaseManager.getConnection();

    // Get document to delete file
    const doc = await db.get<any>(`SELECT * FROM ocr_documents WHERE id = ?`, [id]);

    if (!doc) {
      throw new ApiError(404, 'OCR document not found');
    }

    // Delete file
    OCRService.deleteFile(doc.file_path);

    // Delete from database
    await db.run(`DELETE FROM ocr_documents WHERE id = ?`, [id]);

    res.json({
      success: true,
      message: 'OCR document deleted successfully',
    });
  }
);
