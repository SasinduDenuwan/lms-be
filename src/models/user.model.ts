import mongoose, { Document, Schema} from "mongoose";

export enum Role {
    ADMIN = "ADMIN",
    TEACHER = "TEACHER",
    STUDENT = "STUDENT",
    USER = "USER"
}

export enum Status {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    PENDING = "PENDING",
    REJECTED = "REJECTED"
}

export interface IUSER extends Document {
    _id: mongoose.Types.ObjectId;
    firstname?: string;
    lastname?: string;
    email: string;
    password: string;
    roles: Role[];
    mobile?: string;
    profilePicLink?: string;
    address?: string;
    isActive?: boolean;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUSER>(
    {
    firstname: { type: String},
    lastname: { type: String},
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    roles: { type: [String], enum: Object.values(Role), default: [Role.USER] },
    mobile: { type: String },
    profilePicLink: { type: String },
    address: { type: String },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: Object.values(Status), default: Status.PENDING }
    }, { 
        timestamps: true 
    }
);

export const User = mongoose.model<IUSER>("User", userSchema);