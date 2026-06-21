import nodemailer from 'nodemailer';
import { env } from '../config/env.config';
import { logger } from '../utils/logger';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  public static async sendVerificationEmail(email: string, token: string): Promise<void> {
    const url = `${env.APP_URL}/api/v1/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: env.SMTP_FROM,
      to: email,
      subject: 'Verify your FortifyAuth registration',
      html: `
        <h2>Welcome to FortifyAuth!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${url}" style="background-color: #2563eb; color: white; padding: 10px 18px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email Address</a></p>
        <p>This verification link expires in 24 hours.</p>
      `,
    };

    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      logger.info(`📧 [MOCK EMAIL] To: ${email}, Subject: ${mailOptions.subject}, URL: ${url}`);
      return;
    }

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
    }
  }

  public static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const url = `${env.APP_URL}/api/v1/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: env.SMTP_FROM,
      to: email,
      subject: 'Reset your FortifyAuth Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. If you didn't initiate this, ignore this email.</p>
        <p><a href="${url}" style="background-color: #dc2626; color: white; padding: 10px 18px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p>
        <p>This recovery token expires in 1 hour.</p>
      `,
    };

    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      logger.info(`📧 [MOCK EMAIL] To: ${email}, Subject: ${mailOptions.subject}, URL: ${url}`);
      return;
    }

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
    }
  }
}
