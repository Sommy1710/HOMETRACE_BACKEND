import Joi from "joi";

export const CreateUserRequest = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(32).required(),
    country: Joi.string().default("Nigeria"),
    profilePhoto: Joi.string().uri().optional(),
});

export const UpdateUserRequest = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  profilePhoto: Joi.string().uri().optional(),
}).or('username', 'profilePhoto'); // Ensures at least one field is provided