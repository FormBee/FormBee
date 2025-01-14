import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export type AuthRequest = Request & {
    user?: {
        githubId: number;
    };
};

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    // console.log("verifying auth: ", authHeader)
    
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded as { githubId: number };
        next();
    } catch (error) {
        res.status(401).json('Invalid token.');
    }
}; 