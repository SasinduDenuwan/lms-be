import mongoose, { Document, Schema } from "mongoose";

export interface ICartItem extends Document {
    _id: mongoose.Types.ObjectId;
    user_id: mongoose.Schema.Types.ObjectId;
    course_id: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}   

const cartItemSchema = new Schema<ICartItem>(
    {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    }, { 
        timestamps: true 
    }
);

export const CartItem = mongoose.model<ICartItem>("CartItem", cartItemSchema);
