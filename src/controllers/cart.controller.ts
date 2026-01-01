import { AUTHRequest } from "../middleware/auth.middleware";
import { Response } from "express";
import { CartItem } from "../models/cart_item.model";

export const getAllCartItems = async (req: AUTHRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ code: 401, message: "Unauthorized" });
        }

        const cartItems = await CartItem.find({ user_id: req.user.sub }).populate("course_id", "_id title image price");

        return res.status(200).json({
            code: 200,
            message: "All cart items fetched successfully",
            data: cartItems,
        });

    } catch (error) {
        res.status(500).json({ code: 500, message: "Internal Server Error" });
    }
}

export const addCartItem = async (req: AUTHRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ code: 401, message: "Unauthorized" });
        }

        const existingItem = await CartItem.findOne({
            user_id: req.user.sub,
            course_id: req.body.course_id,
        });

        if (existingItem) {
            return res.status(400).json({
                code: 400,
                message: "This course is already in your cart",
            });
        }

        const cartItem = await CartItem.create({
            user_id: req.user.sub,
            course_id: req.body.course_id,
        });

        return res.status(201).json({
            code: 201,
            message: "Cart item added successfully",
            data: cartItem,
        });

    } catch (error) {
        res.status(500).json({ code: 500, message: "Internal Server Error" });
    }
}   

export const deleteCartItem = async (req: AUTHRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ code: 401, message: "Unauthorized" });
        }

        const { cartItemId } = req.body;

        if (!cartItemId) {
            return res.status(400).json({ message: "Course ID is required" });
        }

        const cartItem = await CartItem.findOneAndDelete({
            user_id: req.user.sub,
            course_id: cartItemId,
        });

        return res.status(200).json({
            code: 200,
            message: "Cart item deleted successfully",
            data: cartItem,
        });

    } catch (error) {
        res.status(500).json({ code: 500, message: "Internal Server Error" });
    }
}   