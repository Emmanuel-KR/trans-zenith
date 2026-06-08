// Shared domain types and reference data used across views and services.

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

export const TX_TYPES: TxType[] = ["Credit", "Debit", "Reversal", "Transfer"];
export const RESP_TYPES: RespType[] = ["Success", "Failed", "Pending", "Timeout"];
export const DB_NAMES: DbName[] = ["MainDB", "ArchiveDB", "BackupDB"];

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

export interface Credentials {
  username: string;
  password: string;
}
