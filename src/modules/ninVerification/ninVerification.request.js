import Joi from "joi";

export const VerifyNINRequest = Joi.object({
  nin: Joi.string()
    .pattern(/^\d{11}$/)
    .required()
    .messages({
      "string.pattern.base": "NIN must contain exactly 11 digits",
      "any.required": "NIN is required",
    }),
});