import { NextFunction, Request, Response } from "express";
import { generalRulesService } from "../services/general-rules.service.js";

class GeneralRulesController {
  async getAllRules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await generalRulesService.getRules();

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createRules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await generalRulesService.createRules(req.body);

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateRules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const response = await generalRulesService.updateRules(id, req.body);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const generalRulesController = new GeneralRulesController();
