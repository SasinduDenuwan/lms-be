import { AUTHRequest } from "../middleware/auth.middleware";
import { Response } from "express";
import { Order } from "../models/order.model";
import { Payment, PaymentMethod, Status } from "../models/payment.model";
import { OrderItem } from "../models/order_item.model";
import { Course } from "../models/course.model";
import { StudentCourse } from "../models/student_courses";
import { Instructor } from "../models/instructor.model";

export const createOrder = async (req: AUTHRequest, res: Response) => {
  try {
    // Extract User ID from the authenticated token (preferred) or body
    const userID = req.user?.id || req.user?._id || req.body.userID || req.body.userId || req.body.user_id;

    // Extract other fields with fallback for casing
    const paymentID = req.body.paymentID || req.body.paymentId || req.body.payment_id;
    const courseIDs = req.body.courseIDs || req.body.courseIds || req.body.itemIds || req.body.item_ids; // itemIds common in carts
    const amount = req.body.amount || req.body.totalAmount || req.body.total_amount;

    console.log("CreateOrder Request Body:", req.body);
    console.log("CreateOrder User from Token:", req.user);
    console.log("Resolved IDs:", { userID, paymentID, courseIDs, amount });

    if (!userID || !paymentID || !courseIDs || !amount) {
        console.error("Missing fields in CreateOrder:", { userID, paymentID, courseIDs, amount });
        return res.status(400).json({ code: 400, message: "Missing required fields" });
    }
    
    const newOrder = new Order({
        user_id: userID,
        payment_id: paymentID,
        total_amount: amount
    });
    
    const savedOrder = await newOrder.save();

    // Update the payment with the order ID
    await Payment.findByIdAndUpdate(paymentID, { order_id: savedOrder._id });

    if (courseIDs && courseIDs.length > 0) {
        for (const courseId of courseIDs) {
           const course = await Course.findById(courseId);
           const price = course ? course.price : 0; 

            const newOrderItem = new OrderItem({
                order_id: savedOrder._id,
                course_id: courseId,
                price: price
            });
            await newOrderItem.save();

            const studentCourse = await StudentCourse.create({
              user_id: userID,
              course_id: courseId
            })
            await studentCourse.save();

            if (course && course.instructor) {
              await Instructor.findByIdAndUpdate(course.instructor, { $inc: { students: 1 } });
            }
        }
    }

    return res.status(200).json({
      code: 200,
      message: "Order created successfully",
      orderID: savedOrder._id,
      paymentID: paymentID
    });

  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ code: 500, message: "Server Error" });
  }
};
