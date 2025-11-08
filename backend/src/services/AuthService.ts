import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserRepository, { User } from '../repositories/UserRepository';
import { ApiError } from '../middlewares/errorHandler';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  role?: 'admin' | 'analyst' | 'viewer';
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    full_name?: string;
  };
}

export class AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private jwtExpiry: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'change_me';
    this.jwtExpiry = process.env.JWT_EXPIRY || '24h';
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    // Validate input
    if (!data.username || data.username.length < 3) {
      throw new ApiError(400, 'نام کاربری باید حداقل 3 کاراکتر باشد');
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new ApiError(400, 'ایمیل نامعتبر است');
    }

    if (!data.password || data.password.length < 6) {
      throw new ApiError(400, 'رمز عبور باید حداقل 6 کاراکتر باشد');
    }

    // Check if username already exists
    if (await this.userRepository.usernameExists(data.username)) {
      throw new ApiError(400, 'این نام کاربری قبلاً استفاده شده است');
    }

    // Check if email already exists
    if (await this.userRepository.emailExists(data.email)) {
      throw new ApiError(400, 'این ایمیل قبلاً ثبت شده است');
    }

    // Hash password
    const password_hash = await bcrypt.hash(data.password, 10);

    // Create user
    const userId = await this.userRepository.create({
      username: data.username,
      email: data.email,
      password_hash,
      role: data.role || 'viewer',
      full_name: data.full_name,
    });

    // Get created user
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new ApiError(500, 'خطا در ایجاد کاربر');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id!,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
    };
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Find user
    const user = await this.userRepository.findByUsername(credentials.username);

    if (!user) {
      throw new ApiError(401, 'نام کاربری یا رمز عبور اشتباه است');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new ApiError(403, 'حساب کاربری غیرفعال است');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash!);

    if (!isPasswordValid) {
      throw new ApiError(401, 'نام کاربری یا رمز عبور اشتباه است');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id!);

    // Generate token
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id!,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
    };
  }

  /**
   * Verify token
   */
  verifyToken(token: string): { userId: number; username: string; role: string } {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      };
    } catch (error) {
      throw new ApiError(401, 'توکن نامعتبر است');
    }
  }

  /**
   * Change password
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new ApiError(404, 'کاربر یافت نشد');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash!);

    if (!isPasswordValid) {
      throw new ApiError(401, 'رمز عبور فعلی اشتباه است');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new ApiError(400, 'رمز عبور جدید باید حداقل 6 کاراکتر باشد');
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.userRepository.update(userId, { password_hash });
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      this.jwtSecret,
      {
        expiresIn: this.jwtExpiry,
      }
    );
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get user profile
   */
  async getProfile(userId: number): Promise<Omit<User, 'password_hash'>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new ApiError(404, 'کاربر یافت نشد');
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default AuthService;
