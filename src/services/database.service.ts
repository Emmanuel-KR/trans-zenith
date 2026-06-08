// Database service: the single data-access layer for the app.
//
// Today it returns seeded mock data so the UI runs without a backend. When a
// real API is available, swap the method bodies to fetch from the endpoints in
// `@/utilities/endpoints` (apiUrl + ENDPOINTS) — the call sites won't change.

import URLS from "@/utilities/endpoints";
import {
  DB_NAMES,
  INSTITUTIONS,
  RESP_TYPES,
  TX_TYPES,
  type Credentials,
  type Transaction,
} from "@/utilities/shared/types";

const ISSUERS = ["VISA", "MasterCard", "AmEx", "UnionPay", "Discover"];
const PROVIDERS = ["Stripe", "Adyen", "PayPal", "Square", "Worldpay"];
const NAMES = [
  "John Smith",
  "Mary Johnson",
  "James Brown",
  "Patricia Davis",
  "Robert Wilson",
  "Linda Garcia",
  "Michael Miller",
  "Barbara Anderson",
  "William Taylor",
  "Elizabeth Thomas",
  "David Moore",
  "Jennifer Jackson",
  "Richard White",
  "Susan Harris",
  "Joseph Martin",
];

// Seeded PRNG for stable mock data.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const pick = <T>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
const pad = (n: number, len: number) => n.toString().padStart(len, "0");

function generateTransactions(count: number): Transaction[] {
  const txs: Transaction[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const offsetMs = Math.floor(rand() * 60 * 24 * 60 * 60 * 1000); // up to 60 days back
    txs.push({
      instId: `INST${pad(1000 + i, 5)}`,
      dateTime: new Date(now - offsetMs),
      paymentRef: `PAY-${pad(Math.floor(rand() * 999999), 6)}`,
      transactionType: pick(TX_TYPES),
      trace: pad(Math.floor(rand() * 999999), 6),
      issuer: pick(ISSUERS),
      provider: pick(PROVIDERS),
      fromAccount: pad(Math.floor(rand() * 9999999999), 10),
      toAccount: pad(Math.floor(rand() * 9999999999), 10),
      toAccountName: pick(NAMES),
      rrn: pad(Math.floor(rand() * 999999999999), 12),
      amount: Math.round(rand() * 1000000) / 100,
      fee: Math.round(rand() * 5000) / 100,
      dbName: pick(DB_NAMES),
      responseType: pick(RESP_TYPES),
      institution: pick(INSTITUTIONS),
    });
  }
  return txs;
}

const MOCK_TRANSACTIONS = generateTransactions(135);

class DatabaseService {
  /** Authenticate a user. Mock: any non-empty credentials succeed. */
  async login({ username, password }: Credentials): Promise<string> {
    void `${URLS.TAG_BASE_URL}${URLS.TAG_BASE_PATH}${URLS.TAG_API_AUTH}`; // real impl would POST here
    if (!username.trim() || !password.trim()) {
      throw new Error("Username and password are required");
    }
    return username.trim();
  }

  /** Fetch all transactions. */
  async getTransactions(): Promise<Transaction[]> {
    void `${URLS.TAG_BASE_URL}${URLS.TAG_BASE_PATH}${URLS.TAG_API_TRANSACTIONS}`; // real impl would GET here
    return Promise.resolve(MOCK_TRANSACTIONS);
  }
}

export const databaseService = new DatabaseService();
