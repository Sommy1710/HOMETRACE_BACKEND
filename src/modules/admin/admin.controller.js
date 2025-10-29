import {asyncHandler} from '../../lib/util.js';
import * as authService from './auth.service.js';
import {Validator} from '../../lib/validator.js';
import { CreateAdminRequest, UpdateAdminRequest } from './create-admin.request.js';
import { AuthAdminRequest } from './auth-admin.request.js';
import { ValidationError } from '../../lib/error-definitions.js';
//import {Admin} from './admin.schema.js';
//import { deleteAdminById } from './admin.service.js';
//import config from '../../config/app.config.js';
//import { UnauthorizedError } from '../../lib/error-definitions.js';
//import validator from './../../../../speakeasy-troubleshooting/src/lib/input-validator';

export const createAdminAccount = asyncHandler(async (req, res) => {
    const validator = new Validator();

    const {value, errors} = validator.validate(CreateAdminRequest, req.body);
    if (errors)
        throw new ValidationError(
    'the request failed with the following errors', errors)
    await authService.registerAdmin(value);

    return res.status(201).json({
        success: true,
        message: 'admin registered successfully',
    });
});

export const authenticateAdmin = asyncHandler(async(req, res) =>
{
    const validator = new Validator();
    const {value, errors} = validator.validate(AuthAdminRequest, req.body);
    if (errors) throw new ValidationError('the request failed with the following errors', errors);
    const token = await authService.authenticateAdmin(value, req);
    res.cookie("authentication", token);
    return res.status(200).json({success: true, message: "admin successfully logged in"});

});

export const getAuthenticatedAdmin = asyncHandler(async(req, res) =>
{
    const admin = req.admin;
    return res.status(200).json({
        success: true,
        message: "admin found successfully",
        data: {
            admin
        },
    });
});
