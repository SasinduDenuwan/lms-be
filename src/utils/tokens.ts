import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { IUSER } from "../models/user.model";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export const signAccessToken = (user: IUSER) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      roles: user.roles,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: "30m",
    }
  );
};

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export const signRefreshToken = (user: IUSER) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};
