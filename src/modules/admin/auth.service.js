import {NotFoundError, UnauthenticatedError} from "../../lib/error-definitions.js";
import {generateAuthenticationToken} from "../../app/providers/jwt.provider.js";
import argon from 'argon2';
import * as adminService from './admin.service.js';

export const registerAdmin = async(payload) => {
    await adminService.createAdmin(payload);
};

export const authenticateAdmin = async (payload) => 
{
    const admin = await adminService.getAdminByEmail(payload.email);

    if(!admin) throw new NotFoundError('we could not validate your credentials, please try again');

    if(!(await argon.verify(admin.password, payload.password))) throw new UnauthenticatedError('we could not validate your credentials, please try again');

    //create the token and set it in the cookie

    return generateAuthenticationToken({
        id: admin.id,
        email: admin.email,
        role: admin.role,

    });

}