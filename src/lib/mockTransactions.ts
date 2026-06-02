export type TxType = "Credit" | "Debit" | "Reversal" | "Transfer";
export type RespType = "Success" | "Failed" | "Pending" | "Timeout";
export type DbName = "MainDB" | "ArchiveDB" | "BackupDB";

export interface Transaction {
  instId: string;
  dateTime: Date;
  paymentRef: string;
  transactionType: TxType;
  trace: string;
  issuer: string;
  provider: string;
  fromAccount: string;
  toAccount: string;
  toAccountName: string;
  rrn: string;
  amount: number;
  fee: number;
  dbName: DbName;
  responseType: RespType;
  institution: string;
}

export const INSTITUTIONS = [
  "First National Bank",
  "Global Trust Bank",
  "Heritage Credit Union",
  "Pinnacle Financial",
  "Summit Savings",
  "Atlas Bank",
  "Meridian Capital",
  "Cornerstone Bank",
];

const TX_TYPES: TxType[] = ["Credit", "Debit", "Reversal", "Transfer"];
const RESP_TYPES: RespType[] = ["Success", "Failed", "Pending", "Timeout"];
const DB_NAMES: DbName[] = ["MainDB", "ArchiveDB", "BackupDB"];
const ISSUERS = ["VISA", "MasterCard", "AmEx", "UnionPay", "Discover"];
const PROVIDERS = ["Stripe", "Adyen", "PayPal", "Square", "Worldpay"];
const NAMES = [
  "John Smith", "Mary Johnson", "James Brown", "Patricia Davis",
  "Robert Wilson", "Linda Garcia", "Michael Miller", "Barbara Anderson",
  "William Taylor", "Elizabeth Thomas", "David Moore", "Jennifer Jackson",
  "Richard White", "Susan Harris", "Joseph Martin",
];

// Seeded PRNG for stable mock data
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
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
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

export const MOCK_TRANSACTIONS = generateTransactions(135);
