import URLS from "@/utilities/endpoints";
import type { Credentials, Transaction } from "@/utilities/shared/types";

const BASE_URL = `${URLS.TAG_BASE_URL}${URLS.TAG_BASE_PATH}`;
const TOKEN_KEY = "tz.auth.token";

class DatabaseService {
  /** Authenticate a user and store the JWT token. */
  async login(credentials: Credentials): Promise<string> {
    const response = await fetch(`${BASE_URL}${URLS.TAG_API_AUTH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Sign in failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // FastAPI standard response usually contains 'access_token'
    const token = data.access_token || data.token;
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    }

    // Return the username for the AuthProvider state
    return data.username || credentials.username;
  }

  /** Helper to get the current auth headers */
  private getHeaders(): HeadersInit {
    const token = window.localStorage.getItem(TOKEN_KEY);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  /** Logout helper to clear tokens */
  logout() {
    window.localStorage.removeItem(TOKEN_KEY);
  }

  /** Export transactions as CSV, XLSX, or JSON */
  async exportTransactions(
    format: "csv" | "xlsx" | "json",
    params?: {
      start_date?: string;
      end_date?: string;
      trantype?: string;
      page?: number;
      page_size?: number;
      rrn?: string;
      paymentserno?: string;
      [key: string]: any;
    }
  ): Promise<Blob> {
    const query = new URLSearchParams();
    query.append("format", format);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, String(value));
        }
      });
    }

    const queryString = query.toString();
    const url = `${BASE_URL}${URLS.TAG_API_TRANSACTION_EXPORT}?${queryString}`;

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (response.status === 401) {
      this.logout();
      window.location.href = "/signin";
      throw new Error("Session expired. Please sign in again.");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Failed to export transactions: ${response.statusText}`);
    }

    return await response.blob();
  }

  /** Fetch all transactions with optional filtering and pagination. */
  async getTransactions(params?: {
    start_date?: string;
    end_date?: string;
    trantype?: string;
    page?: number;
    page_size?: number;
    rrn?: string;
    paymentserno?: string;
    [key: string]: any;
  }): Promise<{ items: Transaction[]; pagination?: any }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, String(value));
        }
      });
    }

    const queryString = query.toString();
    const url = `${BASE_URL}${URLS.TAG_API_TRANSACTIONS}${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (response.status === 401) {
      this.logout();
      window.location.href = "/signin";
      throw new Error("Session expired. Please sign in again.");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Failed to fetch transactions: ${response.statusText}`);
    }

    const rawData = await response.json();

    // Handle different API response structures:
    // 1. Direct array: [...]
    // 2. Paginated: { items: [...] }
    // 3. Enveloped: { data: [...] }
    const items = Array.isArray(rawData)
      ? rawData
      : (rawData.items || rawData.data || []);

    if (!Array.isArray(items)) {
      throw new Error("Invalid response format: expected an array of transactions.");
    }

    // Map the response to ensure Date strings are converted to Date objects
    const transactions = items.map((tx: any) => ({
      ...tx,
      createdate: tx.createdate ? new Date(tx.createdate) : new Date(),
      batchdate: tx.batchdate ? new Date(tx.batchdate) : new Date(),
    }));

    return {
      items: transactions,
      pagination: rawData.pagination,
    };
  }
}

export const databaseService = new DatabaseService();
