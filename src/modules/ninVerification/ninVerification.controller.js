
import axios from "axios";

import { PropertyProvider } from "../propertyProvider/propertyProvider.schema.js";
import { NINVerification } from "./ninVerification.schema.js";
import { VerifyNINRequest } from "./ninVerification.request.js";
import { verifyNINWithQoreID } from "../../lib/qoreid.service.js";
import { asyncHandler } from "../../lib/util.js";

export const verifyNIN = asyncHandler(async (req, res) => {
  // 1. Get the authenticated property provider's ID.
  const providerId = req.propertyProvider?.id;

  if (!providerId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // 2. Validate the submitted NIN.
  const { error, value } = VerifyNINRequest.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid NIN",
      errors: error.details.map((detail) => detail.message),
    });
  }

  // 3. Find the authenticated property provider.
  const provider = await PropertyProvider.findById(providerId);

  if (!provider || provider.isDeleted || provider.isBanned) {
    return res.status(403).json({
      success: false,
      message: "This account cannot perform NIN verification",
    });
  }

  // 4. Check whether verification has already succeeded.
  let verification = await NINVerification.findOne({
    propertyProvider: provider._id,
  });

  if (verification?.status === "verified") {
    return res.status(409).json({
      success: false,
      message: "Your NIN has already been verified",
      ninVerified: true,
      verifiedAt: verification.verifiedAt,
    });
  }

  // 5. Create or reuse the provider's verification record.
  if (!verification) {
    verification = new NINVerification({
      propertyProvider: provider._id,
      status: "pending",
    });
  } else {
    verification.status = "pending";
    verification.matchStatus = null;
  }

  await verification.save();

  try {
    // 6. Submit the NIN and account details to QoreID.
    const result = await verifyNINWithQoreID({
      nin: value.nin,
      firstname: provider.firstname,
      lastname: provider.lastname,
      email: provider.email,
    });

    // 7. Inspect QoreID's verification result.
    const matchStatus = result?.summary?.nin_check?.status;
    const providerStatus = result?.status?.status;
    const verificationState = result?.status?.state;

    const isVerified =
      providerStatus === "verified" &&
      verificationState === "complete" &&
      matchStatus === "EXACT_MATCH";

    verification.matchStatus = matchStatus ?? null;

    if (!isVerified) {
      verification.status = "failed";
      await verification.save();

      return res.status(422).json({
        success: false,
        ninVerified: false,
        message: "NIN verification could not be confirmed",
      });
    }

    // 8. Save the successful verification.
    verification.status = "verified";
    verification.verifiedAt = new Date();

    if (result?.id != null) {
      verification.verificationReference = String(result.id);
    }

    await verification.save();

    // 9. Return only safe information.
    return res.status(200).json({
      success: true,
      message: "NIN verification successful",
      ninVerified: true,
      verifiedAt: verification.verifiedAt,
    });
  } catch (err) {
    // Do not log the NIN or QoreID's full response.
    if (axios.isAxiosError(err)) {
  console.error("QoreID verification request failed:", {
    status: err.response?.status,
    code: err.code,
    message: err.message,
    responseMessage:
      typeof err.response?.data?.message === "string"
        ? err.response.data.message
        : undefined,
  });

  // Keep your existing error response below.
}

    throw err;
  }
});
