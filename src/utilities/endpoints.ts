// API endpoints. Mirrors the flat `URLS` layout used across the gateway
// projects: a base URL + path, then grouped TAG_API_* route constants.
// Override the base URL per environment with VITE_API_BASE_URL in .env.

const URLS = {
  TAG_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  TAG_BASE_PATH: "/api/v1",

  // Authentication
  TAG_API_AUTH: "/auth/login",
  TAG_API_VALIDATE_OTP: "/validate-otp",
  // Standard logout endpoint
  TAG_API_LOGOUT: "/auth/logout",
  TAG_API_STATUS: "/keys",

  // Users
  TAG_API_USERS: "/app/users",
  TAG_API_PROFILE: "/app/user-profile",

  // Transactions
  TAG_API_TRANSACTIONS: "/transactions",
  TAG_API_TRANSACTION_EXPORT: "/transactions/export",

  // Merchants
  TAG_API_MERCHANTS: "/merchants",
  TAG_API_MERCHANTS_EXPORT: "/merchants/export",

  // Audit
  TAG_API_TRANSACTION_AUDIT: "/app/audit-trail/transactions",
};

export default URLS;
