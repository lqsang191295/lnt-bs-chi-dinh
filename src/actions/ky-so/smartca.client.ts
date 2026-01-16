import axios from "axios";
import { API_ENDPOINTS, SMARTCA_CONFIG } from "./smartca.config";

// --- Interfaces ---
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface CredentialsResponse {
  content: string[]; // Danh sách credentialId
}

export interface HashRequest {
  fileContent: string;
  hashResps: Array<{
    fileName: string;
    appearance: {
      fontName: "Time" | "Roboto" | "Arial";
      fontSize: number;
      page: number;
      rectangle: string;
      text: string;
      type: number;
    };
    signatures: Array<{
      page: number;
      rectangle: string;
    }>;
  }>;
}

export interface HashResponse {
  hashResps: Array<{
    code: string;
    hash: string;
    fileID: string;
  }>;
}

export interface SignHashRequest {
  credentialId: string;
  refTranId: string;
  description: string;
  authorize_mode: "implicit" | "explicit";
  response_type: "code" | "token";
  datas: Array<{
    name: string;
    hash: string;
    fileID: string;
  }>;
}

export interface SignHashResponse {
  tranId: string;
  code?: string;
  message?: string;
}

export interface TranInfoResponse {
  content: {
    tranStatus: number; // 1: Thành công, 2: Đang chờ, 3: Từ chối/Lỗi
    documents: Array<{
      sig: string;
    }>;
  };
}

// --- Client Class ---
export class SmartCAClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  async getCredentials(): Promise<CredentialsResponse> {
    const { data } = await axios.post<CredentialsResponse>(
      API_ENDPOINTS.CREDENTIALS_LIST,
      {},
      { headers: this.headers }
    );
    return data;
  }

  async calculateHash(payload: HashRequest): Promise<HashResponse> {
    const { data } = await axios.post<HashResponse>(
      API_ENDPOINTS.CALCULATE_HASH,
      payload,
      { headers: this.headers }
    );
    return data;
  }

  async signHash(payload: SignHashRequest): Promise<SignHashResponse> {
    const { data } = await axios.post<SignHashResponse>(
      API_ENDPOINTS.SIGN_HASH,
      payload,
      { headers: this.headers }
    );
    return data;
  }

  async getTranInfo(tranId: string): Promise<TranInfoResponse> {
    const { data } = await axios.post<TranInfoResponse>(
      API_ENDPOINTS.TRAN_INFO,
      { tranId },
      { headers: this.headers }
    );
    return data;
  }
}

export async function getAccessToken(): Promise<AuthResponse> {
  const res = await fetch(SMARTCA_CONFIG.AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "password",
      client_id: SMARTCA_CONFIG.CLIENT_ID,
      client_secret: SMARTCA_CONFIG.CLIENT_SECRET,
      username: SMARTCA_CONFIG.USERNAME,
      password: SMARTCA_CONFIG.PASSWORD,
    }),
  });

  if (!res.ok) throw new Error("Không lấy được access token");

  const data = await res.json();
  return data.access_token;
}
