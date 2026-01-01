import { NextFunction, Response } from "express"
import { AUTHRequest } from "./auth.middleware"
import { Role } from "../models/user.model"

export const requireRole = (roles: Role[]) => {
    return (req: AUTHRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const hasRole = roles.some((role) => req.user?.roles?.includes(role))
        if(!hasRole){
            return res.status(403).json({
                message: `Forbidden: Require ${roles} role `
            })
        }
        next()
    }
}