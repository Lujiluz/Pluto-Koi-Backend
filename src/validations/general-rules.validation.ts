import z from "zod";
import { Request, Response, NextFunction } from "express";
import { CustomErrorHandler } from "../middleware/errorHandler.js";

const generalRulesValidation = z.object({
  content: z.string().min(1, "Content is required"),
});

export const validateGeneralRules = (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = generalRulesValidation.parse(req.body);

    req.body = result;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      });

      throw new CustomErrorHandler(400, `Validation failed: ${errors.join(", ")}`);
    }
  }
};
