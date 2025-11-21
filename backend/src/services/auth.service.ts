import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { HashUtil } from '../utils/hash';
import { JWTUtil } from '../utils/jwt';
import { RegisterDTO, LoginDTO } from '../types';

export class AuthService {
  /**
   * Register new user
   */
  static async registerUser(data: RegisterDTO) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await HashUtil.hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        status: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = JWTUtil.generateTokens({
      userId: user.id,
      email: user.email,
      type: 'user',
    });

    return {
      user,
      tokens,
    };
  }

  /**
   * Login user
   */
  static async loginUser(data: LoginDTO) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new Error('Account is inactive or blocked');
    }

    // Verify password
    const isValidPassword = await HashUtil.comparePassword(
      data.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = JWTUtil.generateTokens({
      userId: user.id,
      email: user.email,
      type: 'user',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
      },
      tokens,
    };
  }

  /**
   * Login admin
   */
  static async loginAdmin(data: { email: string; password: string }) {
    const { email, password } = data;

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    if (!admin.isActive) {
      throw new Error('Account is inactive');
    }

    // ✅ FIX: Generate token with ROLE included
    const token = JWTUtil.generateAccessToken({
      userId: admin.id,
      email: admin.email,
      role: admin.role, // ← ADD THIS!
    });

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { updatedAt: new Date() },
    });

    console.log('🔑 Token payload:', {
      userId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    return {
      token,
      user: {
        id: admin.id,
        email: admin.email,
        firstName: admin.name?.split(' ')[0] || 'Admin',
        lastName: admin.name?.split(' ').slice(1).join(' ') || '',
        role: admin.role,
        permissions: admin.permissions,
      },
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string) {
    try {
      const decoded = JWTUtil.verifyRefreshToken(refreshToken);

      // Generate new access token
      const accessToken = JWTUtil.generateAccessToken({
        userId: decoded.userId,
        email: decoded.email,
        type: decoded.type,
      });

      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, data: any) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        avatar: data.avatar,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        status: true,
      },
    });

    return user;
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isValidPassword = await HashUtil.comparePassword(oldPassword, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Invalid old password');
    }

    // Hash new password
    const passwordHash = await HashUtil.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password changed successfully' };
  }
}