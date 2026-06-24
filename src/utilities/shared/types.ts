// Shared domain types and reference data used across views and services.

export type TxType = "QTWALLET" | "AIRTELWALLET" | "MPESAPAYBILL" | "BANK" | "VERWALLET" | "MPESAWALLET" | "MPESATILL" | "TKWALLET" | "ISW WALLET" | "VCWALLET" | "OTHER";
export type RespType = "00" | "0" | "OTHER";
export type DbName = "MainDB" | "ArchiveDB" | "BackupDB";

export interface Transaction {
  instid: string;
  batchid: string;
  batchdate: Date;
  paymentserno: string;  
  trantype: TxType;
  trace: string;
  issuercode: string;
  provider: string;
  fromaccount: string;
  toaccount: string;
  toaccountname: string;  
  rrn: string;
  amount: number;
  instfee: number;
  fee: number;
  createdate: Date;
  responsecode: string;
  responsemessage: string;
  inst:string;
  profileName: string;
  paymentName: string;
}

export const TX_TYPES: TxType[] = ["QTWALLET", "AIRTELWALLET", "MPESAPAYBILL", "BANK", "VERWALLET", "MPESAWALLET", "MPESATILL", "TKWALLET", "ISW WALLET", "VCWALLET", "OTHER"];
export const RESP_TYPES: RespType[] = ["00", "0", "OTHER"];
export const DB_NAMES: DbName[] = ["MainDB", "ArchiveDB", "BackupDB"];

export const INSTITUTIONS = [
  "ACCESS BANK PLC",
  "DISBURSE TEST 2",
  "DISBURSE TEST 3",
  "Ellie Technologies",
  "FIRE BANK",
  "GT BANK KE",
  "Sheria Sacco",
  "M-ORIENTAL BANK",
  "Nine One One",
];

export interface Credentials {
  username: string;
  password: string;
}

/** A merchant transaction row as returned by `GET /api/v1/merchants`. */
export interface MerchantTransaction {
  transaction_id: string;
  transaction_ref: string;
  transaction_state: string;
  payment_item: string | null;
  transaction_type: string | null;
  amount: number;
  initial_transaction_date: string | null;
  final_transaction_date: string | null;
  response_code: string | null;
  result_code: string | null;
  result_message: string | null;
  merchant_id: string;
  created_on: string | null;
  customer_id: string;
  esb_reference: string | null;
  currency: string;
  retries: number;
  terminal_id: string | null;
  provider: string | null;
  order_id: string | null;
  cs_decision: string | null;
  domain: string | null;
  config_id: string | null;
  merchant_name: string | null;
}

/**
 * Canonical column order for the merchants table. Used as the fallback header
 * set before any rows arrive; once data is present the headers are derived
 * from the actual response keys.
 */
export const MERCHANT_FIELDS: (keyof MerchantTransaction)[] = [
  "transaction_id",
  "transaction_ref",
  "transaction_state",
  "payment_item",
  "transaction_type",
  "amount",
  "currency",
  "merchant_id",
  "merchant_name",
  "customer_id",
  "provider",
  "order_id",
  "initial_transaction_date",
  "final_transaction_date",
  "response_code",
  "result_code",
  "result_message",
  "esb_reference",
  "retries",
  "terminal_id",
  "cs_decision",
  "domain",
  "config_id",
  "created_on",
];
