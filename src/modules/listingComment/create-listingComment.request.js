import Joi from "joi";

export const createListingCommentRequest = Joi.object({
    comment: Joi.string()
        .trim()
        .min(1)
        .max(1000)
        .required(),
});