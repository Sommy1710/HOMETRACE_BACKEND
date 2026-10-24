import { Router } from "express";
import { verifyNIN } from "./ninVerification.controller.js";
import propertyProviderMiddleware from "../../app/middleware/propertyProvider.middleware.js";

const router = Router();

router.post("/verify", propertyProviderMiddleware, verifyNIN);

export const ninVerificationRouter = router;
