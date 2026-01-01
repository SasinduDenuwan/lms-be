import mongoose, { Document, Schema } from "mongoose";

export interface IOrderItem extends Document {
    _id: mongoose.Types.ObjectId;
    order_id: mongoose.Schema.Types.ObjectId;
    course_id: mongoose.Schema.Types.ObjectId;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}   

const orderItemSchema = new Schema<IOrderItem>(
    {
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    price: { type: Number },    
    }, { 
        timestamps: true 
    }
);

export const OrderItem = mongoose.model<IOrderItem>("OrderItem", orderItemSchema);  