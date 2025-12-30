import authMiddleware from "./auth.middleware.js";
import propertyProviderMiddleware from "./propertyProvider.middleware.js";
import { UnauthenticatedError } from "../../lib/error-definitions.js";

export default function dualAuthMiddleware(req, res, next) {
  try {
    // Try USER auth first
    authMiddleware(req, res, () => {
      if (req.user?.id) return next();

      // Try PROPERTY PROVIDER auth
      propertyProviderMiddleware(req, res, () => {
        if (req.propertyProvider?.id) return next();

        throw new UnauthenticatedError("Not authenticated");
      });
    });
  } catch (err) {
    throw new UnauthenticatedError("Not authenticated");
  }
}
