import { Request, Response, NextFunction } from 'express';
import { asyncHandler, ApiError } from '../middlewares/errorHandler';
import AuthService from '../services/AuthService';
import Joi from 'joi';

const authService = new AuthService();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.min': 'نام کاربری باید حداقل 3 کاراکتر باشد',
    'any.required': 'نام کاربری الزامی است',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'ایمیل نامعتبر است',
    'any.required': 'ایمیل الزامی است',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'رمز عبور باید حداقل 6 کاراکتر باشد',
    'any.required': 'رمز عبور الزامی است',
  }),
  full_name: Joi.string().optional(),
  role: Joi.string().valid('admin', 'analyst', 'viewer').optional(),
});

const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'any.required': 'نام کاربری الزامی است',
  }),
  password: Joi.string().required().messages({
    'any.required': 'رمز عبور الزامی است',
  }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'رمز عبور فعلی الزامی است',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'رمز عبور جدید باید حداقل 6 کاراکتر باشد',
    'any.required': 'رمز عبور جدید الزامی است',
  }),
});

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);

    if (error) {
      throw new ApiError(400, error.details[0].message);
    }

    // Register user
    const result = await authService.register(value);

    res.status(201).json({
      success: true,
      message: 'ثبت‌نام با موفقیت انجام شد',
      data: result,
    });
  }
);

/**
 * Login user
 * @route POST /api/auth/login
 */
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      throw new ApiError(400, error.details[0].message);
    }

    // Login user
    const result = await authService.login(value);

    res.json({
      success: true,
      message: 'ورود موفقیت‌آمیز',
      data: result,
    });
  }
);

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
export const getMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const profile = await authService.getProfile(req.user.userId);

    res.json({
      success: true,
      data: profile,
    });
  }
);

/**
 * Change password
 * @route POST /api/auth/change-password
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    // Validate input
    const { error, value } = changePasswordSchema.validate(req.body);

    if (error) {
      throw new ApiError(400, error.details[0].message);
    }

    await authService.changePassword(
      req.user.userId,
      value.currentPassword,
      value.newPassword
    );

    res.json({
      success: true,
      message: 'رمز عبور با موفقیت تغییر کرد',
    });
  }
);

/**
 * Logout (client-side token removal)
 * @route POST /api/auth/logout
 */
export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({
      success: true,
      message: 'خروج موفقیت‌آمیز',
    });
  }
);
