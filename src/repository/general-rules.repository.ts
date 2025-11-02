import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { GeneralRulesModel, IGeneralRules } from "../models/general-rules.model.js";

class GeneralRulesRepository {
  /**
   * Create general rules
   */
  async create(rulesData: IGeneralRules): Promise<IGeneralRules> {
    try {
      const rules = new GeneralRulesModel(rulesData);
      return await rules.save();
    } catch (error) {
      console.log('error create general rules: ', error)
      throw new CustomErrorHandler(500,"Failed to create general rules");
    }
  }

  /**
   * Get general rules
   */
  async getRules(): Promise<any> {
    try {
      const rules = await GeneralRulesModel.findOne();

      if (!rules) {
        throw new CustomErrorHandler(404, "General rules not found");
      }

      return {
        _id: rules._id,
        content: rules.content,
      };
    } catch (error) {
      console.log('error get general rules: ', error)
      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to get general rules");
    }
  }

  async updateRules(id: string, rulesData: Partial<IGeneralRules>): Promise<IGeneralRules | null> {
    try {
      const updatedRules = await GeneralRulesModel.findByIdAndUpdate(id, rulesData, { new: true });

      if (!updatedRules) {
        throw new CustomErrorHandler(404, "General rules not found");
      }

      return updatedRules;
    } catch (error) {
      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to update general rules");
    }
  }
}

export const generalRulesRepository = new GeneralRulesRepository();
