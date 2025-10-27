import { GeneralResponse } from "../interfaces/global.interface.js";
import { CustomErrorHandler } from "../middleware/errorHandler.js";
import { IGeneralRules } from "../models/general-rules.model.js";
import { generalRulesRepository } from "../repository/general-rules.repository.js";

class GeneralRulesService {
  /**
   * Get general rules
   * @returns GeneralResponse<any>
   */
  async getRules(): Promise<GeneralResponse<any>> {
    try {
      const rules = await generalRulesRepository.getRules();

      return {
        status: "success",
        message: "Berhasil mendapatkan data peraturan umum",
        data: rules,
      };
    } catch (error) {
      console.log("Error retrieving general rules:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to retrieve general rules");
    }
  }

  async createRules(rulesData: IGeneralRules): Promise<GeneralResponse<any>> {
    try {
      const newRule = await generalRulesRepository.create(rulesData);

      return {
        status: "success",
        message: "Berhasil membuat peraturan umum",
        data: newRule,
      };
    } catch (error) {
      console.log("Error creating general rules:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to create general rules");
    }
  }

  async updateRules(id: string, rulesData: Partial<IGeneralRules>): Promise<GeneralResponse<any>> {
    try {
      const updatedRules = await generalRulesRepository.updateRules(id, rulesData);

      return {
        status: "success",
        message: "Berhasil memperbarui peraturan umum",
        data: updatedRules,
      };
    } catch (error) {
      console.log("Error updating general rules:", error);

      if (error instanceof CustomErrorHandler) {
        throw error;
      }

      throw new CustomErrorHandler(500, "Failed to update general rules");
    }
  }
}

export const generalRulesService = new GeneralRulesService();
