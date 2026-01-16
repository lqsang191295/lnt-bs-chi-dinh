export const SMARTCA_CONFIG = {
  BASE_URL: process.env.SMARTCA_BASE_URL || "https://gwsca.vnpt.vn",
  AUTH_URL: process.env.SMARTCA_AUTH_URL || "https://gwsca.vnpt.vn/auth/token",
  CLIENT_ID: process.env.SMARTCA_CLIENT_ID || "",
  CLIENT_SECRET: process.env.SMARTCA_CLIENT_SECRET || "",
  USERNAME: process.env.SMARTCA_USERNAME || "",
  PASSWORD: process.env.SMARTCA_PASSWORD || "",
  USER_SECRET: process.env.SMARTCA_USER_SECRET || "",
};

export const API_ENDPOINTS = {
  CREDENTIALS_LIST: `${SMARTCA_CONFIG.BASE_URL}/csc/credentials/list`,
  CALCULATE_HASH: `${SMARTCA_CONFIG.BASE_URL}/rest/signature/calculateHash`,
  SIGN_HASH: `${SMARTCA_CONFIG.BASE_URL}/en/csc/signature/signhash`,
  TRAN_INFO: `${SMARTCA_CONFIG.BASE_URL}/rest/signature/getTranInfo`,
};
