import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  processingTime: number;
  extractedNumbers: ExtractedNumber[];
}

export interface ExtractedNumber {
  value: number;
  original: string;
  type: 'persian' | 'english';
  position: {
    line: number;
    word: number;
  };
}

export interface ParsedFinancialData {
  assets?: number;
  liabilities?: number;
  revenue?: number;
  netIncome?: number;
  cash?: number;
  [key: string]: number | undefined;
}

/**
 * OCR Service for extracting text from images and PDFs
 * Supports both Persian and English text recognition
 */
export class OCRService {
  private static readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads');
  private static readonly TEMP_DIR = path.join(process.cwd(), 'temp');

  /**
   * Initialize directories
   */
  static initialize() {
    [this.UPLOAD_DIR, this.TEMP_DIR].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Perform OCR on an image file
   */
  static async extractTextFromImage(
    filePath: string,
    language: string = 'fas+eng'
  ): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      // Preprocess image for better OCR accuracy
      const preprocessedPath = await this.preprocessImage(filePath);

      // Perform OCR
      const result = await Tesseract.recognize(preprocessedPath, language, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
          }
        },
      });

      // Extract text
      const text = result.data.text;
      const confidence = result.data.confidence / 100; // Convert to 0-1 scale

      // Extract numbers (both Persian and English)
      const extractedNumbers = this.extractNumbers(result.data.text, result.data.words);

      // Clean up preprocessed file
      if (preprocessedPath !== filePath) {
        fs.unlinkSync(preprocessedPath);
      }

      const processingTime = (Date.now() - startTime) / 1000; // in seconds

      return {
        text,
        confidence,
        language,
        processingTime,
        extractedNumbers,
      };
    } catch (error) {
      throw new Error(`OCR failed: ${error}`);
    }
  }

  /**
   * Preprocess image for better OCR accuracy
   */
  private static async preprocessImage(filePath: string): Promise<string> {
    const tempPath = path.join(
      this.TEMP_DIR,
      `preprocessed_${Date.now()}_${path.basename(filePath)}`
    );

    try {
      await sharp(filePath)
        .grayscale() // Convert to grayscale
        .normalize() // Normalize contrast
        .sharpen() // Sharpen edges
        .threshold(128) // Binary threshold
        .toFile(tempPath);

      return tempPath;
    } catch (error) {
      console.warn('Image preprocessing failed, using original:', error);
      return filePath;
    }
  }

  /**
   * Extract numbers from OCR text (both Persian and English)
   */
  private static extractNumbers(text: string, words: any[]): ExtractedNumber[] {
    const numbers: ExtractedNumber[] = [];

    // Persian to English digit mapping
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    const convertPersianToEnglish = (str: string): string => {
      let result = str;
      persianDigits.forEach((pd, i) => {
        result = result.replace(new RegExp(pd, 'g'), englishDigits[i]);
      });
      return result;
    };

    // Extract from words
    words.forEach((word, wordIndex) => {
      const wordText = word.text;

      // Check for Persian numbers
      const persianNumberMatch = wordText.match(/[۰-۹,،]+/g);
      if (persianNumberMatch) {
        persianNumberMatch.forEach((match) => {
          const converted = convertPersianToEnglish(match.replace(/[,،]/g, ''));
          const value = parseFloat(converted);

          if (!isNaN(value)) {
            numbers.push({
              value,
              original: match,
              type: 'persian',
              position: {
                line: word.line || 0,
                word: wordIndex,
              },
            });
          }
        });
      }

      // Check for English numbers
      const englishNumberMatch = wordText.match(/[\d,]+/g);
      if (englishNumberMatch) {
        englishNumberMatch.forEach((match) => {
          const value = parseFloat(match.replace(/,/g, ''));

          if (!isNaN(value)) {
            numbers.push({
              value,
              original: match,
              type: 'english',
              position: {
                line: word.line || 0,
                word: wordIndex,
              },
            });
          }
        });
      }
    });

    return numbers;
  }

  /**
   * Parse financial data from extracted text
   * Uses keyword detection to identify financial line items
   */
  static parseFinancialData(ocrResult: OCRResult): ParsedFinancialData {
    const parsed: ParsedFinancialData = {};
    const lines = ocrResult.text.split('\n');

    // Keywords for financial items (Persian and English)
    const keywords = {
      assets: ['دارایی', 'جمع دارایی', 'assets', 'total assets'],
      liabilities: ['بدهی', 'جمع بدهی', 'liabilities', 'total liabilities'],
      equity: ['حقوق صاحبان سهام', 'سرمایه', 'equity', 'shareholders equity'],
      revenue: ['درآمد', 'فروش', 'revenue', 'sales'],
      netIncome: ['سود خالص', 'net income', 'net profit'],
      cash: ['وجه نقد', 'نقد', 'cash'],
      currentAssets: ['دارایی جاری', 'current assets'],
      currentLiabilities: ['بدهی جاری', 'current liabilities'],
      inventory: ['موجودی', 'کالا', 'inventory'],
      accountsReceivable: ['حساب دریافتنی', 'accounts receivable'],
    };

    // Process each line
    lines.forEach((line) => {
      const lowerLine = line.toLowerCase();

      // Try to match keywords
      Object.entries(keywords).forEach(([key, terms]) => {
        terms.forEach((term) => {
          if (lowerLine.includes(term.toLowerCase())) {
            // Extract number from this line
            const number = this.extractNumberFromLine(line);
            if (number !== null) {
              parsed[key] = number;
            }
          }
        });
      });
    });

    return parsed;
  }

  /**
   * Extract the largest number from a line (likely the value)
   */
  private static extractNumberFromLine(line: string): number | null {
    // Convert Persian digits to English
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    let converted = line;
    persianDigits.forEach((pd, i) => {
      converted = converted.replace(new RegExp(pd, 'g'), englishDigits[i]);
    });

    // Find all numbers (with or without commas)
    const matches = converted.match(/[\d,]+/g);

    if (!matches) return null;

    // Convert to numbers and find the largest
    const numbers = matches
      .map((m) => parseFloat(m.replace(/,/g, '')))
      .filter((n) => !isNaN(n));

    if (numbers.length === 0) return null;

    return Math.max(...numbers);
  }

  /**
   * Save uploaded file
   */
  static async saveUploadedFile(
    file: Express.Multer.File,
    companyId?: number
  ): Promise<string> {
    this.initialize();

    const filename = `${Date.now()}_${companyId || 'unknown'}_${file.originalname}`;
    const filepath = path.join(this.UPLOAD_DIR, filename);

    await fs.promises.writeFile(filepath, file.buffer);

    return filepath;
  }

  /**
   * Delete uploaded file
   */
  static deleteFile(filepath: string): void {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }

  /**
   * Get file info
   */
  static getFileInfo(filepath: string): {
    exists: boolean;
    size?: number;
    extension?: string;
  } {
    if (!fs.existsSync(filepath)) {
      return { exists: false };
    }

    const stats = fs.statSync(filepath);

    return {
      exists: true,
      size: stats.size,
      extension: path.extname(filepath),
    };
  }
}

export default OCRService;
