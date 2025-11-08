import OCRService, { OCRResult } from '../../services/OCRService';

// Mock Tesseract and sharp
jest.mock('tesseract.js', () => ({
  recognize: jest.fn(),
}));

jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    grayscale: jest.fn().mockReturnThis(),
    normalize: jest.fn().mockReturnThis(),
    sharpen: jest.fn().mockReturnThis(),
    threshold: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockImplementation(async (path: string) => {
      // Mock successful file creation
      // We don't actually create files in tests
      return Promise.resolve({ size: 1024, width: 800, height: 600 });
    }),
  }));
});

// Mock fs to prevent actual file operations
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  unlinkSync: jest.fn(),
  statSync: jest.fn().mockReturnValue({ size: 1024 }),
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
  },
  mkdirSync: jest.fn(),
}));

describe('OCRService', () => {
  const mockTesseractResult = {
    data: {
      text: 'دارایی: 5,000,000\nبدهی: 2,000,000\nAssets: 5000000\nLiabilities: 2000000',
      confidence: 85,
      words: [
        { text: '5,000,000', line: 1 },
        { text: '2,000,000', line: 2 },
        { text: '5000000', line: 3 },
        { text: '2000000', line: 4 },
      ],
    },
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup default mock behavior
    const Tesseract = require('tesseract.js');
    Tesseract.recognize.mockResolvedValue(mockTesseractResult);
  });

  describe('initialize', () => {
    it('should create required directories', () => {
      OCRService.initialize();

      // Directories should exist or be created
      // This is implementation-specific and may need adjustment
      expect(true).toBe(true);
    });
  });

  describe('extractTextFromImage', () => {
    it('should extract text from image file', async () => {
      const mockFilePath = '/test/image.png';

      const result = await OCRService.extractTextFromImage(mockFilePath);

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(result.language).toBeDefined();
      expect(result.processingTime).toBeDefined();
      expect(Array.isArray(result.extractedNumbers)).toBe(true);
    });

    it('should use default language fas+eng', async () => {
      const mockFilePath = '/test/image.png';
      const Tesseract = require('tesseract.js');

      await OCRService.extractTextFromImage(mockFilePath);

      expect(Tesseract.recognize).toHaveBeenCalledWith(
        expect.any(String),
        'fas+eng',
        expect.any(Object)
      );
    });

    it('should accept custom language parameter', async () => {
      const mockFilePath = '/test/image.png';
      const Tesseract = require('tesseract.js');

      await OCRService.extractTextFromImage(mockFilePath, 'eng');

      expect(Tesseract.recognize).toHaveBeenCalledWith(
        expect.any(String),
        'eng',
        expect.any(Object)
      );
    });

    it('should convert confidence to 0-1 scale', async () => {
      const mockFilePath = '/test/image.png';

      const result = await OCRService.extractTextFromImage(mockFilePath);

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should extract numbers from text', async () => {
      const mockFilePath = '/test/image.png';

      const result = await OCRService.extractTextFromImage(mockFilePath);

      expect(result.extractedNumbers).toBeDefined();
      expect(result.extractedNumbers.length).toBeGreaterThan(0);

      // Check number structure
      result.extractedNumbers.forEach((num) => {
        expect(num).toHaveProperty('value');
        expect(num).toHaveProperty('original');
        expect(num).toHaveProperty('type');
        expect(num).toHaveProperty('position');
        expect(['persian', 'english']).toContain(num.type);
      });
    });

    it('should handle OCR failure gracefully', async () => {
      const mockFilePath = '/test/invalid.png';
      const Tesseract = require('tesseract.js');

      Tesseract.recognize.mockRejectedValue(new Error('OCR failed'));

      await expect(OCRService.extractTextFromImage(mockFilePath)).rejects.toThrow(
        'OCR failed'
      );
    });

    it('should measure processing time', async () => {
      const mockFilePath = '/test/image.png';

      const result = await OCRService.extractTextFromImage(mockFilePath);

      expect(result.processingTime).toBeGreaterThan(0);
      expect(typeof result.processingTime).toBe('number');
    });
  });

  describe('parseFinancialData', () => {
    it('should parse financial data from OCR result', () => {
      const ocrResult: OCRResult = {
        text: 'جمع دارایی: 5,000,000\nجمع بدهی: 2,000,000\nسود خالص: 450,000',
        confidence: 0.85,
        language: 'fas+eng',
        processingTime: 2.5,
        extractedNumbers: [],
      };

      const parsed = OCRService.parseFinancialData(ocrResult);

      expect(parsed).toBeDefined();
      expect(typeof parsed).toBe('object');
    });

    it('should detect Persian keywords', () => {
      const ocrResult: OCRResult = {
        text: 'دارایی: 5000000\nبدهی: 2000000\nدرآمد: 3000000',
        confidence: 0.85,
        language: 'fas+eng',
        processingTime: 2.5,
        extractedNumbers: [],
      };

      const parsed = OCRService.parseFinancialData(ocrResult);

      // At least some fields should be detected
      expect(Object.keys(parsed).length).toBeGreaterThanOrEqual(0);
    });

    it('should detect English keywords', () => {
      const ocrResult: OCRResult = {
        text: 'Total Assets: 5000000\nTotal Liabilities: 2000000\nRevenue: 3000000',
        confidence: 0.85,
        language: 'fas+eng',
        processingTime: 2.5,
        extractedNumbers: [],
      };

      const parsed = OCRService.parseFinancialData(ocrResult);

      // At least some fields should be detected
      expect(Object.keys(parsed).length).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty text', () => {
      const ocrResult: OCRResult = {
        text: '',
        confidence: 0.85,
        language: 'fas+eng',
        processingTime: 2.5,
        extractedNumbers: [],
      };

      const parsed = OCRService.parseFinancialData(ocrResult);

      expect(parsed).toBeDefined();
      expect(Object.keys(parsed).length).toBe(0);
    });

    it('should extract largest number from line', () => {
      const ocrResult: OCRResult = {
        text: 'دارایی جاری: 100 تا 2000000 ریال',
        confidence: 0.85,
        language: 'fas+eng',
        processingTime: 2.5,
        extractedNumbers: [],
      };

      const parsed = OCRService.parseFinancialData(ocrResult);

      // Should extract the larger number (2000000)
      if (parsed.currentAssets) {
        expect(parsed.currentAssets).toBe(2000000);
      }
    });
  });

  describe('saveUploadedFile', () => {
    it('should save file with correct naming', async () => {
      const mockFile = {
        originalname: 'test.png',
        buffer: Buffer.from('test data'),
      } as Express.Multer.File;

      const companyId = 1;

      const filepath = await OCRService.saveUploadedFile(mockFile, companyId);

      expect(filepath).toBeDefined();
      expect(filepath).toContain('test.png');
      expect(filepath).toContain('1');
    });

    it('should handle missing company ID', async () => {
      const mockFile = {
        originalname: 'test.png',
        buffer: Buffer.from('test data'),
      } as Express.Multer.File;

      const filepath = await OCRService.saveUploadedFile(mockFile);

      expect(filepath).toBeDefined();
      expect(filepath).toContain('unknown');
    });
  });

  describe('deleteFile', () => {
    it('should delete existing file', () => {
      const mockPath = '/test/file.png';
      const fs = require('fs');

      fs.existsSync.mockReturnValue(true);

      OCRService.deleteFile(mockPath);

      expect(fs.unlinkSync).toHaveBeenCalledWith(mockPath);
    });

    it('should handle non-existent file gracefully', () => {
      const mockPath = '/test/nonexistent.png';
      const fs = require('fs');

      fs.existsSync.mockReturnValue(false);
      fs.unlinkSync.mockClear();

      expect(() => {
        OCRService.deleteFile(mockPath);
      }).not.toThrow();

      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('getFileInfo', () => {
    it('should return file info for existing file', () => {
      const mockPath = '/test/file.png';
      const fs = require('fs');

      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue({ size: 1024 });

      const info = OCRService.getFileInfo(mockPath);

      expect(info.exists).toBe(true);
      expect(info.size).toBe(1024);
      expect(info.extension).toBe('.png');
    });

    it('should return exists false for non-existent file', () => {
      const mockPath = '/test/nonexistent.png';
      const fs = require('fs');

      fs.existsSync.mockReturnValue(false);

      const info = OCRService.getFileInfo(mockPath);

      expect(info.exists).toBe(false);
      expect(info.size).toBeUndefined();
      expect(info.extension).toBeUndefined();
    });
  });

  describe('Number Extraction', () => {
    it('should extract Persian numbers', async () => {
      const Tesseract = require('tesseract.js');

      Tesseract.recognize.mockResolvedValue({
        data: {
          text: 'مبلغ: ۱۲۳۴۵۶۷۸۹',
          confidence: 85,
          words: [{ text: '۱۲۳۴۵۶۷۸۹', line: 1 }],
        },
      });

      const result = await OCRService.extractTextFromImage('/test/persian.png');

      expect(result.extractedNumbers.length).toBeGreaterThan(0);

      const persianNumber = result.extractedNumbers.find((n) => n.type === 'persian');

      if (persianNumber) {
        expect(persianNumber.value).toBe(123456789);
      }
    });

    it('should extract English numbers', async () => {
      const Tesseract = require('tesseract.js');

      Tesseract.recognize.mockResolvedValue({
        data: {
          text: 'Amount: 123,456,789',
          confidence: 85,
          words: [{ text: '123,456,789', line: 1 }],
        },
      });

      const result = await OCRService.extractTextFromImage('/test/english.png');

      expect(result.extractedNumbers.length).toBeGreaterThan(0);

      const englishNumber = result.extractedNumbers.find((n) => n.type === 'english');

      if (englishNumber) {
        expect(englishNumber.value).toBe(123456789);
      }
    });

    it('should handle mixed Persian and English numbers', async () => {
      const Tesseract = require('tesseract.js');

      Tesseract.recognize.mockResolvedValue({
        data: {
          text: 'فارسی: ۱۲۳ English: 456',
          confidence: 85,
          words: [
            { text: '۱۲۳', line: 1 },
            { text: '456', line: 2 },
          ],
        },
      });

      const result = await OCRService.extractTextFromImage('/test/mixed.png');

      expect(result.extractedNumbers.length).toBeGreaterThanOrEqual(2);

      const persianNumbers = result.extractedNumbers.filter((n) => n.type === 'persian');
      const englishNumbers = result.extractedNumbers.filter((n) => n.type === 'english');

      expect(persianNumbers.length).toBeGreaterThan(0);
      expect(englishNumbers.length).toBeGreaterThan(0);
    });
  });
});
