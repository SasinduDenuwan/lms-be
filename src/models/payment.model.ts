import mongoose, { Document, Schema } from "mongoose";

export enum Status {
    PENDING = "Pending",
    COMPLETED = "Completed",
    FAILED = "Failed",
    CANCELLED = "Cancelled",
    REFUNDED = "Refunded",    
}

export enum PaymentMethod {
    CASH = "Cash",
    CREDIT_CARD = "Credit Card",
    PAYPAL = "PayPal",
    STRIPE = "Stripe",
    BANK_TRANSFER = "Bank Transfer",
}   

export interface IPayment extends Document {
    _id: mongoose.Types.ObjectId;
    user_id: mongoose.Schema.Types.ObjectId;
    order_id?: mongoose.Schema.Types.ObjectId;
    transaction_id: string;
    payment_status: Status;
    amount: number;
    payment_method: PaymentMethod;
    createdAt: Date;
    updatedAt: Date;
}   

const paymentSchema = new Schema<IPayment>(
    {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    transaction_id: { type: String },
    payment_status: { type: String, enum: Object.values(Status), default: Status.PENDING },
    amount: { type: Number },
    payment_method: { type: String, enum: Object.values(PaymentMethod), default: PaymentMethod.CREDIT_CARD },
    }, { 
        timestamps: true 
    }
);

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
