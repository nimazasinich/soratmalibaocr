import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CloudCoder Financial Fraud Detection API',
      version: '1.0.0',
      description: `
        سیستم هوشمند تحلیل صورت‌های مالی و تشخیص تقلب

        این API شامل قابلیت‌های زیر است:
        - تحلیل نسبت‌های مالی (12+ نسبت)
        - تشخیص تقلب (5 الگوریتم)
        - ارزیابی ریسک (4 دسته)
        - پیش‌بینی مالی (Z-Score)
        - OCR فارسی و انگلیسی
        - احراز هویت JWT
      `,
      contact: {
        name: 'CloudCoder Team',
        url: 'https://github.com/cloudcoder',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
      {
        url: 'https://api.cloudcoder.ir',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token برای احراز هویت',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'خطا در پردازش درخواست',
                },
                statusCode: {
                  type: 'number',
                  example: 400,
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              example: 1,
            },
            username: {
              type: 'string',
              example: 'admin',
            },
            email: {
              type: 'string',
              example: 'admin@example.com',
            },
            role: {
              type: 'string',
              enum: ['admin', 'analyst', 'viewer'],
              example: 'analyst',
            },
            full_name: {
              type: 'string',
              example: 'احمد احمدی',
            },
          },
        },
        Company: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'شرکت نمونه',
            },
            sector: {
              type: 'string',
              example: 'تولیدی',
            },
            fiscal_year: {
              type: 'number',
              example: 1402,
            },
          },
        },
        FinancialStatement: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              example: 1,
            },
            company_id: {
              type: 'number',
              example: 1,
            },
            period: {
              type: 'string',
              example: '1402-Q1',
            },
            assets: {
              type: 'number',
              example: 5000000,
            },
            liabilities: {
              type: 'number',
              example: 2000000,
            },
            revenue: {
              type: 'number',
              example: 3000000,
            },
            net_income: {
              type: 'number',
              example: 500000,
            },
          },
        },
        FinancialRatio: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Current Ratio',
            },
            category: {
              type: 'string',
              enum: ['Liquidity', 'Leverage', 'Profitability', 'Efficiency'],
              example: 'Liquidity',
            },
            value: {
              type: 'number',
              example: 1.5,
            },
            status: {
              type: 'string',
              enum: ['Good', 'Warning', 'Critical'],
              example: 'Good',
            },
          },
        },
        FraudIndicator: {
          type: 'object',
          properties: {
            flagType: {
              type: 'string',
              example: "Benford's Law",
            },
            severity: {
              type: 'string',
              enum: ['Low', 'Medium', 'High', 'Critical'],
              example: 'Medium',
            },
            score: {
              type: 'number',
              example: 45,
            },
            description: {
              type: 'string',
              example: 'توزیع ارقام با قانون بنفورد مطابقت ندارد',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'مدیریت احراز هویت و کاربران',
      },
      {
        name: 'Health',
        description: 'وضعیت سلامت سیستم',
      },
      {
        name: 'Companies',
        description: 'مدیریت شرکت‌ها',
      },
      {
        name: 'Financial Statements',
        description: 'مدیریت صورت‌های مالی',
      },
      {
        name: 'Analysis',
        description: 'تحلیل مالی و نسبت‌ها',
      },
      {
        name: 'Fraud Detection',
        description: 'تشخیص تقلب',
      },
      {
        name: 'OCR',
        description: 'استخراج متن از تصویر',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
