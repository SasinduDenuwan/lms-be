import { AUTHRequest } from "../middleware/auth.middleware";
import { Response } from "express";
import { Payment, Status, PaymentMethod } from "../models/payment.model";

export const getPayments = async (req: AUTHRequest, res: Response) => {
  try {
    const payments = await Payment.find();
    res.status(200).json({
      message: "Payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createPayment = async (req: AUTHRequest, res: Response) => {
  try {
    const { userID, transactionID, amount } = req.body;

    const newPayment = await Payment.create({
      user_id: userID,
      transaction_id: transactionID,
      payment_status: Status.COMPLETED,
      amount: amount,
      payment_method: PaymentMethod.CREDIT_CARD,
    });

    res.status(201).json({
      message: "Payment created successfully",
      data: newPayment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
