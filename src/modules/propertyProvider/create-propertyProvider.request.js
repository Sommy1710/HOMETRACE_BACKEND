import Joi from "joi";

export const CreatePropertyProviderRequest = Joi.object({
    firstname: Joi.string().min(2).max(50).required(),
    lastname: Joi.string().min(2).max(50).required(),
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(32).required(),
    country: Joi.string().default("Nigeria"),
    bio: Joi.string().max(500).optional(),
    profilePhoto: Joi.string().uri().optional(),
});

export const UpdatePropertyProviderRequest = Joi.object({
    firstname: Joi.string().min(2).max(50).optional(),
    lastname: Joi.string().min(2).max(50).optional(),
    username: Joi.string().min(3).max(30).optional(),
    bio: Joi.string().max(500).optional(),
    profilePhoto: Joi.string().uri().optional(),
}).or('firstname', 'lastname', 'username', 'bio', 'profilePhoto'); // Ensures at least one field is provided
