import mongoose, { Document, Schema} from "mongoose";

export interface IInstructor extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    role?: string;
    experience?: number;
    students?: number;
    courses?: number;
    image?: string;
    bio?: string;
    isActive?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const instructorSchema = new Schema<IInstructor>(
    {
        name: { type: String, required: true },
        role: { type: String },
        experience: { type: Number },
        students: { type: Number, default: 0 },
        courses: { type: Number, default: 0 },
        image: { type: String },
        bio: { type: String },
        isActive: { type: Boolean, default: true },
    }, { 
        timestamps: true    
    }
);

export const Instructor = mongoose.model<IInstructor>("Instructor", instructorSchema);