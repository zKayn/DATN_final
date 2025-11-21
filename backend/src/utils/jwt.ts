import { JWTPayload } from '../types';

// Use require for jsonwebtoken
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bc0d884bfd552d34bfee6e64ad9125bf44f3ea3223c79d957f040c7c40943910b87f36639693ff90399618c6f6a3e96e9c5f1c97dec89ea5aeb2434a5a373468';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '8faaec8a144774f1f7f72f5f4177ebf09eb2209577aa7c370664142037d21ec1f47979bca2df55b21f3033848385472fd658f0b8cca6b60118efae5c7b7aced0';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export class JWTUtil {
  /**
   * Generate access token
   */
  static generateAccessToken(payload: JWTPayload): string {
    console.log('🔑 JWTUtil: Generating access token with payload:', payload);
    
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    
    console.log('✅ JWTUtil: Token generated:', token.substring(0, 20) + '...');
    return token;
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: JWTPayload): string {
    console.log('🔑 JWTUtil: Generating refresh token');
    
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokens(payload: JWTPayload) {
    console.log('🔑 JWTUtil: Generating both tokens for:', payload.email);
    
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      console.log('🔍 JWTUtil: Verifying access token...');
      
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      
      console.log('✅ JWTUtil: Token verified:', {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });
      
      return decoded;
    } catch (error: any) {
      console.error('❌ JWTUtil: Token verification failed:', error.message);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      console.log('🔍 JWTUtil: Verifying refresh token...');
      
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
      
      console.log('✅ JWTUtil: Refresh token verified');
      return decoded;
    } catch (error: any) {
      console.error('❌ JWTUtil: Refresh token verification failed:', error.message);
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Decode token without verification
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      
      console.log('🔍 JWTUtil: Token decoded (without verification):', {
        userId: decoded?.userId,
        email: decoded?.email,
        role: decoded?.role,
      });
      
      return decoded;
    } catch (error) {
      console.error('❌ JWTUtil: Failed to decode token');
      return null;
    }
  }
}