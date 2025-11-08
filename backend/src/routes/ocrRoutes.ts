import { Router } from 'express';
import { upload } from '../middlewares/uploadMiddleware';
import {
  uploadAndExtract,
  getOCRDocument,
  getOCRDocumentsByCompany,
  deleteOCRDocument,
} from '../controllers/ocrController';

const router = Router();

/**
 * @route   POST /api/ocr/upload
 * @desc    Upload and extract text from document
 * @access  Private
 */
router.post('/upload', upload.single('file'), uploadAndExtract);

/**
 * @route   GET /api/ocr/:id
 * @desc    Get OCR document by ID
 * @access  Private
 */
router.get('/:id', getOCRDocument);

/**
 * @route   GET /api/ocr/company/:companyId
 * @desc    Get all OCR documents for a company
 * @access  Private
 */
router.get('/company/:companyId', getOCRDocumentsByCompany);

/**
 * @route   DELETE /api/ocr/:id
 * @desc    Delete OCR document
 * @access  Private
 */
router.delete('/:id', deleteOCRDocument);

export default router;
