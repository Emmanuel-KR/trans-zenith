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
