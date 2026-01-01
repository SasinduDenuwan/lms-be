import { Schema, model } from "mongoose";

export interface IOTP {
    _id: string;
    email: string;
    code: string;
    createdAt: Date;
    expiresAt: Date;
}

const otpSchema = new Schema<IOTP>(
    {
    email: { type: String, required: true, lowercase: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true }
    }, { 
        timestamps: true 
    }
);

const OTP = model<IOTP>("OTP", otpSchema);

export default OTP;