import { model, Schema } from "mongoose"

export interface IGeneralRules {
    content: string
}

const generalRulesSchema = new Schema<IGeneralRules>(
    {
        content: { type: String, required: true }
    }
)

export const GeneralRulesModel = model<IGeneralRules>("GeneralRules", generalRulesSchema)