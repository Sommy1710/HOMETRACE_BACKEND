import {NotFoundError, UnauthenticatedError} from "../../lib/error-definitions.js";
import {generateAuthenticationToken} from "../../app/providers/jwt.provider.js";
import argon from 'argon2';
import * as propertyProviderService from './propertyProvider.service.js';

export const registerPropertyProvider = async(payload) => {
    await propertyProviderService.createPropertyProvider(payload);
};

export const authenticatePropertyProvider = async (payload) => 
{
    const propertyProvider = await propertyProviderService.getPropertyProviderByEmail(payload.email);

    if(!propertyProvider) throw new NotFoundError('we could not validate your credentials, please try again');

    if(!(await argon.verify(propertyProvider.password, payload.password))) throw new UnauthenticatedError('we could not validate your credentials, please try again');

    //create the token and set it in the cookie

    return generateAuthenticationToken({
        id: propertyProvider.id,
        email: propertyProvider.email,
        username: propertyProvider.username,
        role: propertyProvider.role,

    });

}