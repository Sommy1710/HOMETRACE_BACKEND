/*import {UnauthenticatedError} from "../../lib/error-definitions.js";
import { verifyAuthenticationToken } from "../providers/jwt.provider.js";
import { PropertyProvider } from "../../modules/propertyProvider/propertyProvider.schema.js";

export default function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.authentication;
    const decoded = verifyAuthenticationToken(token);
    req.propertyProvider = decoded;
    next();
    } catch (error) {
        throw new UnauthenticatedError('invalid or missing token');
    }
}*/

import { PropertyProvider } from "../../modules/propertyProvider/propertyProvider.schema.js";
import { UnauthenticatedError } from "../../lib/error-definitions.js";
import { verifyAuthenticationToken } from "../providers/jwt.provider.js";

export default async function propertyProviderMiddleware(req, res, next) {
  try {
    const token = req.cookies.authentication;
    if (!token) throw new UnauthenticatedError("Missing authentication token");

    const decoded = verifyAuthenticationToken(token);

    // Fetch property provider from DB to get username
    const propertyProvider = await PropertyProvider.findById(decoded.id).select("_id username email");

    if (!propertyProvider) throw new UnauthenticatedError("Property provider not found");

    req.propertyProvider = {
      id: propertyProvider._id,
      username: propertyProvider.username,
      email: propertyProvider.email
    };

    next();
  } catch (error) {
    throw new UnauthenticatedError("Invalid or missing token");
  }
}
