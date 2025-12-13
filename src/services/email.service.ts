import nodemailer from "nodemailer";
import { logger } from "../utils/logger.js";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface ApprovalEmailData {
  userName: string;
  userEmail: string;
  approvalToken: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly backendUrl: string;
  private readonly frontendUrl: string;

  constructor() {
    this.fromEmail = process.env.SMTP_FROM_EMAIL || "noreply@plutokoi.com";
    this.fromName = process.env.SMTP_FROM_NAME || "Pluto Koi";
    this.backendUrl = process.env.BASE_URL || "http://localhost:3000";
    this.frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      logger.warn("⚠️ SMTP configuration incomplete. Email service will not work.");
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Verify transporter configuration
    this.transporter.verify((error) => {
      if (error) {
        logger.error("❌ SMTP configuration error:", error);
      } else {
        logger.info("✅ Email service ready");
      }
    });
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      logger.error("Email transporter not initialized. Check SMTP configuration.");
      return false;
    }

    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Email sent successfully to ${options.to}`, { messageId: info.messageId });
      return true;
    } catch (error) {
      logger.error("❌ Failed to send email:", error);
      return false;
    }
  }

  /**
   * Send approval email to user after admin approves their registration
   */
  async sendApprovalEmail(data: ApprovalEmailData): Promise<boolean> {
    const verificationUrl = `${this.backendUrl}${process.env.API_PREFIX || "/api"}/auth/verify-approval/${data.approvalToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved - Pluto Koi</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 28px;
          }
          .header .logo {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .content {
            margin-bottom: 30px;
          }
          .content h2 {
            color: #27ae60;
            margin-bottom: 20px;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            background-color: #27ae60;
            color: #ffffff !important;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
          }
          .button:hover {
            background-color: #219a52;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 5px;
            padding: 15px;
            margin-top: 20px;
            font-size: 14px;
          }
          .link-fallback {
            word-break: break-all;
            font-size: 12px;
            color: #666;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🐟</div>
            <h1>Pluto Koi</h1>
          </div>
          
          <div class="content">
            <h2>🎉 Your Account Has Been Approved!</h2>
            <p>Hello <strong>${data.userName}</strong>,</p>
            <p>Great news! Your registration has been reviewed and approved by our admin team.</p>
            <p>To activate your account and start using Pluto Koi, please click the button below:</p>
          </div>
          
          <div class="button-container">
            <a href="${verificationUrl}" class="button">Activate My Account</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This activation link will expire in 24 hours. If the link expires, please contact our support team.
          </div>
          
          <p class="link-fallback">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
          
          <div class="footer">
            <p>If you didn't register for a Pluto Koi account, please ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} Pluto Koi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Hello ${data.userName},

      Great news! Your registration has been reviewed and approved by our admin team.

      To activate your account, please visit the following link:
      ${verificationUrl}

      This activation link will expire in 24 hours.

      If you didn't register for a Pluto Koi account, please ignore this email.

      © ${new Date().getFullYear()} Pluto Koi. All rights reserved.
    `;

    return this.sendEmail({
      to: data.userEmail,
      subject: "🎉 Your Account Has Been Approved - Pluto Koi",
      html,
      text,
    });
  }

  /**
   * Send rejection email to user when admin rejects their registration
   */
  async sendRejectionEmail(userName: string, userEmail: string, reason?: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Status - Pluto Koi</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 28px;
          }
          .header .logo {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .content {
            margin-bottom: 30px;
          }
          .content h2 {
            color: #e74c3c;
            margin-bottom: 20px;
          }
          .reason-box {
            background-color: #f8f9fa;
            border-left: 4px solid #e74c3c;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🐟</div>
            <h1>Pluto Koi</h1>
          </div>
          
          <div class="content">
            <h2>Registration Status Update</h2>
            <p>Hello <strong>${userName}</strong>,</p>
            <p>We regret to inform you that your registration request has not been approved at this time.</p>
            ${
              reason
                ? `
            <div class="reason-box">
              <strong>Reason:</strong><br>
              ${reason}
            </div>
            `
                : ""
            }
            <p>If you believe this was a mistake or would like more information, please contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for your interest in Pluto Koi.</p>
            <p>&copy; ${new Date().getFullYear()} Pluto Koi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Hello ${userName},

      We regret to inform you that your registration request has not been approved at this time.

      ${reason ? `Reason: ${reason}` : ""}

      If you believe this was a mistake or would like more information, please contact our support team.

      Thank you for your interest in Pluto Koi.

      © ${new Date().getFullYear()} Pluto Koi. All rights reserved.
    `;

    return this.sendEmail({
      to: userEmail,
      subject: "Registration Status Update - Pluto Koi",
      html,
      text,
    });
  }

  /**
   * Send notification email to user that their registration is pending approval
   */
  async sendPendingApprovalEmail(userName: string, userEmail: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Received - Pluto Koi</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 28px;
          }
          .header .logo {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .content {
            margin-bottom: 30px;
          }
          .content h2 {
            color: #3498db;
            margin-bottom: 20px;
          }
          .status-box {
            background-color: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .status-box .icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🐟</div>
            <h1>Pluto Koi</h1>
          </div>
          
          <div class="content">
            <h2>📝 Registration Received!</h2>
            <p>Hello <strong>${userName}</strong>,</p>
            <p>Thank you for registering with Pluto Koi! We've received your registration request.</p>
            
            <div class="status-box">
              <div class="icon">⏳</div>
              <strong>Status: Pending Approval</strong>
              <p>Your registration is currently being reviewed by our admin team.</p>
            </div>
            
            <p>You will receive another email once your account has been approved. This usually takes 1-2 business days.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for your patience!</p>
            <p>&copy; ${new Date().getFullYear()} Pluto Koi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Hello ${userName},

      Thank you for registering with Pluto Koi! We've received your registration request.

      Status: Pending Approval

      Your registration is currently being reviewed by our admin team.
      You will receive another email once your account has been approved. This usually takes 1-2 business days.

      Thank you for your patience!

      © ${new Date().getFullYear()} Pluto Koi. All rights reserved.
    `;

    return this.sendEmail({
      to: userEmail,
      subject: "📝 Registration Received - Pluto Koi",
      html,
      text,
    });
  }

  /**
   * Strip HTML tags for plain text version
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
}

export const emailService = new EmailService();
