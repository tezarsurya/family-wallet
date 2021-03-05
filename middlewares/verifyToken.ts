import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const bearerToken = req.headers.authorization;

  if (!bearerToken || bearerToken == undefined || bearerToken == null) {
    return res.status(403).json({ message: "Unauthorized, please sign in" });
  }

  const token = bearerToken.substr(7);

  jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
    if (err)
      return res
        .status(403)
        .json({ message: "Your token is invalid, please sign in" });
    next();
  });
};

export default verifyToken;
