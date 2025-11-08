import AuthService from '../../services/AuthService';
import UserRepository from '../../repositories/UserRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../repositories/UserRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    authService = new AuthService();
    mockUserRepository = authService['userRepository'] as jest.Mocked<UserRepository>;

    // Setup environment variables
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_EXPIRY = '24h';
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      };

      // Mock repository methods
      mockUserRepository.usernameExists = jest.fn().mockResolvedValue(false);
      mockUserRepository.emailExists = jest.fn().mockResolvedValue(false);
      mockUserRepository.create = jest.fn().mockResolvedValue(1);
      mockUserRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'viewer',
        full_name: 'Test User',
        is_active: true,
      });

      // Mock bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      // Mock jwt
      (jwt.sign as jest.Mock).mockReturnValue('test_token');

      const result = await authService.register(registerData);

      expect(result).toBeDefined();
      expect(result.token).toBe('test_token');
      expect(result.user).toBeDefined();
      expect(result.user.username).toBe('testuser');
      expect(result.user.email).toBe('test@example.com');

      // Verify bcrypt was called with correct salt rounds
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw error if username is too short', async () => {
      const registerData = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(authService.register(registerData)).rejects.toThrow(
        'نام کاربری باید حداقل 3 کاراکتر باشد'
      );
    });

    it('should throw error if email is invalid', async () => {
      const registerData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
      };

      await expect(authService.register(registerData)).rejects.toThrow(
        'ایمیل نامعتبر است'
      );
    });

    it('should throw error if password is too short', async () => {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '12345',
      };

      await expect(authService.register(registerData)).rejects.toThrow(
        'رمز عبور باید حداقل 6 کاراکتر باشد'
      );
    });

    it('should throw error if username already exists', async () => {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserRepository.usernameExists = jest.fn().mockResolvedValue(true);

      await expect(authService.register(registerData)).rejects.toThrow(
        'این نام کاربری قبلاً استفاده شده است'
      );
    });

    it('should throw error if email already exists', async () => {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserRepository.usernameExists = jest.fn().mockResolvedValue(false);
      mockUserRepository.emailExists = jest.fn().mockResolvedValue(true);

      await expect(authService.register(registerData)).rejects.toThrow(
        'این ایمیل قبلاً ثبت شده است'
      );
    });

    it('should set default role to viewer if not specified', async () => {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserRepository.usernameExists = jest.fn().mockResolvedValue(false);
      mockUserRepository.emailExists = jest.fn().mockResolvedValue(false);
      mockUserRepository.create = jest.fn().mockResolvedValue(1);
      mockUserRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'viewer',
        is_active: true,
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (jwt.sign as jest.Mock).mockReturnValue('test_token');

      await authService.register(registerData);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'viewer',
        })
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const credentials = {
        username: 'testuser',
        password: 'password123',
      };

      mockUserRepository.findByUsername = jest.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'viewer',
        is_active: true,
      });

      mockUserRepository.updateLastLogin = jest.fn().mockResolvedValue(undefined);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test_token');

      const result = await authService.login(credentials);

      expect(result).toBeDefined();
      expect(result.token).toBe('test_token');
      expect(result.user.username).toBe('testuser');

      // Verify updateLastLogin was called
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith(1);
    });

    it('should throw error if user not found', async () => {
      const credentials = {
        username: 'nonexistent',
        password: 'password123',
      };

      mockUserRepository.findByUsername = jest.fn().mockResolvedValue(null);

      await expect(authService.login(credentials)).rejects.toThrow(
        'نام کاربری یا رمز عبور اشتباه است'
      );
    });

    it('should throw error if user is inactive', async () => {
      const credentials = {
        username: 'testuser',
        password: 'password123',
      };

      mockUserRepository.findByUsername = jest.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'viewer',
        is_active: false,
      });

      await expect(authService.login(credentials)).rejects.toThrow(
        'حساب کاربری غیرفعال است'
      );
    });

    it('should throw error if password is incorrect', async () => {
      const credentials = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      mockUserRepository.findByUsername = jest.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'viewer',
        is_active: true,
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(credentials)).rejects.toThrow(
        'نام کاربری یا رمز عبور اشتباه است'
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const mockDecoded = {
        userId: 1,
        username: 'testuser',
        role: 'viewer',
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      const result = authService.verifyToken('valid_token');

      expect(result).toBeDefined();
      expect(result.userId).toBe(1);
      expect(result.username).toBe('testuser');
      expect(result.role).toBe('viewer');
    });

    it('should throw error for invalid token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => {
        authService.verifyToken('invalid_token');
      }).toThrow('توکن نامعتبر است');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      mockUserRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        password_hash: 'old_hashed_password',
      });

      mockUserRepository.update = jest.fn().mockResolvedValue(undefined);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');

      await authService.changePassword(1, 'oldpassword', 'newpassword123');

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          password_hash: 'new_hashed_password',
        })
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        authService.changePassword(999, 'oldpassword', 'newpassword123')
      ).rejects.toThrow('کاربر یافت نشد');
    });

    it('should throw error if current password is incorrect', async () => {
      mockUserRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        password_hash: 'hashed_password',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.changePassword(1, 'wrongpassword', 'newpassword123')
      ).rejects.toThrow('رمز عبور فعلی اشتباه است');
    });

    it('should throw error if new password is too short', async () => {
      mockUserRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        password_hash: 'hashed_password',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(authService.changePassword(1, 'oldpassword', '12345')).rejects.toThrow(
        'رمز عبور جدید باید حداقل 6 کاراکتر باشد'
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      mockUserRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'viewer',
        full_name: 'Test User',
        password_hash: 'hashed_password',
        is_active: true,
      });

      const profile = await authService.getProfile(1);

      expect(profile).toBeDefined();
      expect(profile.username).toBe('testuser');
      expect(profile.email).toBe('test@example.com');
      expect(profile).not.toHaveProperty('password_hash');
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(authService.getProfile(999)).rejects.toThrow('کاربر یافت نشد');
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
      ];

      for (const email of validEmails) {
        mockUserRepository.usernameExists = jest.fn().mockResolvedValue(false);
        mockUserRepository.emailExists = jest.fn().mockResolvedValue(false);
        mockUserRepository.create = jest.fn().mockResolvedValue(1);
        mockUserRepository.findById = jest.fn().mockResolvedValue({
          id: 1,
          username: 'testuser',
          email,
          role: 'viewer',
          is_active: true,
        });

        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
        (jwt.sign as jest.Mock).mockReturnValue('test_token');

        await expect(
          authService.register({
            username: 'testuser',
            email,
            password: 'password123',
          })
        ).resolves.toBeDefined();
      }
    });

    it('should reject invalid email formats', async () => {
      const invalidEmails = ['notanemail', 'missing@domain', '@example.com', 'user@'];

      for (const email of invalidEmails) {
        await expect(
          authService.register({
            username: 'testuser',
            email,
            password: 'password123',
          })
        ).rejects.toThrow('ایمیل نامعتبر است');
      }
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate token with correct payload', async () => {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserRepository.usernameExists = jest.fn().mockResolvedValue(false);
      mockUserRepository.emailExists = jest.fn().mockResolvedValue(false);
      mockUserRepository.create = jest.fn().mockResolvedValue(1);
      mockUserRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'viewer',
        is_active: true,
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (jwt.sign as jest.Mock).mockReturnValue('test_token');

      await authService.register(registerData);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: 1,
          username: 'testuser',
          role: 'viewer',
        },
        'test_secret',
        {
          expiresIn: '24h',
        }
      );
    });
  });
});
