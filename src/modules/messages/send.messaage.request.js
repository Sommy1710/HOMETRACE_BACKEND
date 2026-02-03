import Joi from 'joi';
export const sendMessageRequest = Joi.object({
    receiver: Joi.string().required(),
    content: Joi.string().min(1).max(2000).optional(),
    photos: Joi.array().items(Joi.string().uri()).optional()
}).or('content', 'photos'); //here we require at least one of the two