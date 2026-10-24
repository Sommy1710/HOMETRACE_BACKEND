import axios from "axios";
import {config} from "dotenv"
config()



const BASE_URL =
  process.env.QOREID_BASE_URL || "https://api.qoreid.com";

export const getQoreIDToken = async () => {
  try {
    const response = await axios.post(
      `${BASE_URL}/token`,
      {
        clientId: process.env.QOREID_CLIENT_ID,
        secret: process.env.QOREID_CLIENT_SECRET,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const token =
      response.data.accessToken ??
      response.data.access_token ??
      response.data.token;

    if (!token) {
      throw new Error("QoreID token missing from response");
    }

    return token;
  } catch (err) {
    console.error("QOREID TOKEN REQUEST FAILED", {
      status: err.response?.status,
      code: err.code,
      message: err.message,
      providerMessage:
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : undefined,
    });

    throw err;
  }
};

export const verifyNINWithQoreID = async ({
  nin,
  firstname,
  lastname,
  email,
}) => {
  // If this fails, the token request is the problem.
  const token = await getQoreIDToken();

  try {
    const response = await axios.post(
      `${BASE_URL}/v1/ng/identities/nin/${encodeURIComponent(nin)}`,
      {
        firstname,
        lastname,
        email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    return response.data;
  } catch (err) {
    console.error("QOREID NIN REQUEST FAILED", {
      status: err.response?.status,
      code: err.code,
      message: err.message,
      providerMessage:
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : undefined,
    });

    throw err;
  }
};
