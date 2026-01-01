import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document {
    _id: mongoose.Types.ObjectId;
    user_id: mongoose.Schema.Types.ObjectId;
    payment_id: mongoose.Schema.Types.ObjectId;
    total_amount: number;
    createdAt: Date;
    updatedAt: Date;
}   

const orderSchema = new Schema<IOrder>(
    {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    payment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    total_amount: { type: Number },
    }, { 
        timestamps: true 
    }
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);  