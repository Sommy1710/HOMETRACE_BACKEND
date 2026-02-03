import authMiddleware from "./auth.middleware.js";
import propertyProviderMiddleware from "./propertyProvider.middleware.js";
import { UnauthenticatedError } from "../../lib/error-definitions.js";

/*export default function dualAuthMiddleware(req, res, next) {
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
}*/


export default function dualAuthMiddleware(req, res, next) {
  try {
    // First, try user authentication
    authMiddleware(req, res, () => {
      if (req.user) {
        // Set both .id and ._id for consistency
        if (!req.user.id) req.user.id = req.user._id?.toString();
        if (!req.user._id) req.user._id = req.user.id;

        return next();
      }

      // Then try property provider authentication
      propertyProviderMiddleware(req, res, () => {
        if (req.propertyProvider) {
          // Set both .id and ._id for consistency
          if (!req.propertyProvider.id)
            req.propertyProvider.id = req.propertyProvider._id?.toString();
          if (!req.propertyProvider._id)
            req.propertyProvider._id = req.propertyProvider.id;

          return next();
        }

        throw new UnauthenticatedError("Not authenticated");
      });
    });
  } catch (err) {
    throw new UnauthenticatedError("Not authenticated");
  }
}

