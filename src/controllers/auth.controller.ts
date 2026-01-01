import { Request, Response } from "express";
import { IUSER, Role, User } from "../models/user.model";
import OTP from "../models/otp.model";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "../utils/tokens";
import { AUTHRequest } from "../middleware/auth.middleware";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import transporter from "../config/email.config";
dotenv.config();

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstname, lastname } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    //   new User()
    const user = await User.create({
      email,
      password: hash,
      firstname,
      lastname,
      roles: [Role.USER],
    });

    res.status(201).json({
      message: "User registed",
      data: { email: user.email, roles: user.roles },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal; server error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = (await User.findOne({ email })) as IUSER | null;
    if (!existingUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!existingUser.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    const valid = await bcrypt.compare(password, existingUser.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = signAccessToken(existingUser);
    const refreshToken = signRefreshToken(existingUser);

    res.status(200).json({
      message: "success",
      data: {
        userID: existingUser._id,
        email: existingUser.email,
        roles: existingUser.roles,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMyProfile = async (req: AUTHRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(req.user.sub).select("-password");

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: "Account is inactive" });
  }

  const { email, roles, _id } = user as IUSER;

  res.status(200).json({ message: "ok", data: { id: _id, email, roles } });
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    const payload: any = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    const accessToken = signAccessToken(user);

    res.status(200).json({
      accessToken,
    });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expire token" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
  
    if (!existingUser) {
      return res.status(200).json({ code:404, message: "No account found with that email !" });
    } else {
      // delete any existing otp for that email
      await OTP.deleteMany({ email });

      // otp generation
      // otp has 6 digit numeric code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

      const savedOTP = await OTP.create({ email, code: otpCode, expiresAt });

      if (!savedOTP) {
        return res.status(500).json({ code:500, message: "Could not generate OTP, please try again !" });
      }

      // Email sending logic
      const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              background: linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%);
              padding: 40px 20px;
              line-height: 1.6;
            }
            .email-wrapper { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #ffffff;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(79, 70, 229, 0.15);
            }
            .header-pattern {
              background: linear-gradient(135deg, #6366F1 0%, #3B82F6 50%, #14B8A6 100%);
              padding: 50px 40px;
              position: relative;
              overflow: hidden;
            }
            .header-pattern::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -20%;
              width: 300px;
              height: 300px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 50%;
            }
            .header-pattern::after {
              content: '';
              position: absolute;
              bottom: -30%;
              left: -10%;
              width: 200px;
              height: 200px;
              background: rgba(255, 255, 255, 0.08);
              border-radius: 50%;
            }
            .header-content {
              position: relative;
              z-index: 1;
              text-align: center;
            }
            .logo-icon {
              width: 60px;
              height: 60px;
              background: rgba(255, 255, 255, 0.2);
              backdrop-filter: blur(10px);
              border-radius: 16px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20px;
              border: 2px solid rgba(255, 255, 255, 0.3);
            }
            .logo-icon svg {
              width: 32px;
              height: 32px;
              fill: #ffffff;
            }
            .header-title {
              color: #ffffff;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
              text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header-subtitle {
              color: rgba(255, 255, 255, 0.9);
              font-size: 15px;
              font-weight: 400;
            }
            .content {
              padding: 50px 40px;
            }
            .greeting {
              font-size: 18px;
              color: #1F2937;
              font-weight: 600;
              margin-bottom: 16px;
            }
            .message {
              color: #6B7280;
              font-size: 15px;
              margin-bottom: 30px;
              line-height: 1.7;
            }
            .otp-container {
              background: linear-gradient(135deg, #F0FDFA 0%, #EFF6FF 100%);
              border: 2px dashed #14B8A6;
              border-radius: 16px;
              padding: 30px;
              margin: 30px 0;
              text-align: center;
              position: relative;
            }
            .otp-label {
              font-size: 13px;
              color: #0D9488;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 12px;
            }
            .otp-code {
              font-size: 42px;
              font-weight: 800;
              color: #4F46E5;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
              text-shadow: 0 2px 4px rgba(79, 70, 229, 0.1);
            }
            .otp-timer {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              margin-top: 16px;
              padding: 8px 16px;
              background: rgba(255, 255, 255, 0.8);
              border-radius: 20px;
              font-size: 13px;
              color: #0D9488;
              font-weight: 500;
            }
            .timer-icon {
              width: 16px;
              height: 16px;
              fill: #14B8A6;
            }
            .security-notice {
              background: #EEF2FF;
              border-left: 4px solid #6366F1;
              padding: 20px;
              border-radius: 8px;
              margin: 30px 0;
            }
            .security-notice p {
              color: #4F46E5;
              font-size: 14px;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .security-icon {
              width: 20px;
              height: 20px;
              fill: #6366F1;
              flex-shrink: 0;
            }
            .help-section {
              text-align: center;
              padding: 30px 40px;
              background: #F9FAFB;
              border-top: 1px solid #E5E7EB;
            }
            .help-text {
              color: #6B7280;
              font-size: 14px;
              margin-bottom: 16px;
            }
            .button {
              display: inline-block;
              padding: 12px 28px;
              background: linear-gradient(135deg, #6366F1 0%, #3B82F6 100%);
              color: #ffffff;
              text-decoration: none;
              border-radius: 10px;
              font-weight: 600;
              font-size: 14px;
              transition: transform 0.2s, box-shadow 0.2s;
              box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
            }
            .footer {
              background: #1F2937;
              padding: 30px 40px;
              text-align: center;
            }
            .footer-links {
              display: flex;
              justify-content: center;
              gap: 24px;
              margin-bottom: 20px;
              flex-wrap: wrap;
            }
            .footer-links a {
              color: #9CA3AF;
              text-decoration: none;
              font-size: 13px;
              transition: color 0.2s;
            }
            .footer-links a:hover {
              color: #14B8A6;
            }
            .footer-text {
              color: #6B7280;
              font-size: 12px;
              margin-top: 16px;
            }
            .social-icons {
              display: flex;
              justify-content: center;
              gap: 16px;
              margin-bottom: 20px;
            }
            .social-icon {
              width: 36px;
              height: 36px;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: background 0.2s;
            }
            .social-icon:hover {
              background: rgba(20, 184, 166, 0.2);
            }
            .social-icon svg {
              width: 18px;
              height: 18px;
              fill: #9CA3AF;
            }
            @media (max-width: 600px) {
              body { padding: 20px 10px; }
              .header-pattern { padding: 40px 30px; }
              .content { padding: 40px 30px; }
              .otp-code { font-size: 36px; letter-spacing: 6px; }
              .header-title { font-size: 24px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header-pattern">
              <div class="header-content">
                <div class="logo-icon">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-4.41 0-8-3.59-8-8V8.3l8-4.74 8 4.74V12c0 4.41-3.59 8-8 8z"/>
                  </svg>
                </div>
                <h1 class="header-title">Password Reset Request</h1>
                <p class="header-subtitle">Secure verification code for your account</p>
              </div>
            </div>

            <div class="content">
              <p class="message">
                We received a request to reset your password. To proceed with resetting your password, please use the verification code below. This code has been generated specifically for your account security.
              </p>

              <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otpCode}</div>
                <div class="otp-timer">
                  <svg class="timer-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                  </svg>
                  Expires in 15 minutes
                </div>
              </div>

              <div class="security-notice">
                <p>
                  <svg class="security-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                  </svg>
                  If you didn't request this password reset, please ignore this email or contact our support team immediately to secure your account.
                </p>
              </div>
            </div>


          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Your OTP for Password Reset',
        html: htmlTemplate,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ code:200, message: `OTP sent successfully !` });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const checkOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const existingOTP = await OTP.findOne({ email, code: otp });

    if (existingOTP) {
      res.status(200).json({ code: 200, message: "OTP verified successfully" });
    } else {
      res.status(400).json({ code: 400, message: "Invalid OTP" });
    }
 
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    const hash = await bcrypt.hash(password, 10);

    existingUser.password = hash;
    await existingUser.save();

    res.status(200).json({ code: 200, message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
}

export const getAllStudents = async (req: AUTHRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const students = await User.find({ isActive: true, roles: { $in: [Role.STUDENT] } }).select("-password");
    res.status(200).json({ code: 200, message: "success", data: students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

export const updateMyProfile = async (req: AUTHRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { firstname, lastname, mobile, address, profilePicLink } = req.body;

    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;
    user.mobile = mobile || user.mobile;
    user.address = address || user.address;
    user.profilePicLink = profilePicLink || user.profilePicLink;

    const updatedUser = await user.save();

    res.status(200).json({
      code: 200,
      message: "Profile updated successfully",
      data: {
        email: updatedUser.email,
        roles: updatedUser.roles,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        mobile: updatedUser.mobile,
        address: updatedUser.address,
        profilePicLink: updatedUser.profilePicLink
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};