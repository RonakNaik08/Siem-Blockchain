import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const auth = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) throw new Error();

      const decoded = jwt.verify(token, ENV.JWT_SECRET);

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ message: "Unauthorized" });
    }
  };
};