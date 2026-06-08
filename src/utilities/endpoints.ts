// API endpoints. Mirrors the flat `URLS` layout used across the gateway
// projects: a base URL + path, then grouped TAG_API_* route constants.
// Override the base URL per environment with VITE_API_BASE_URL in .env.

const URLS = {
  TAG_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  TAG_BASE_PATH: "/api/v1",

  // Authentication
  TAG_API_AUTH: "/authentication",
  TAG_API_VALIDATE_OTP: "/validate-otp",
  TAG_API_LOGOUT: "/app/users/log-out",
  TAG_API_STATUS: "/keys",

  // Users
  TAG_API_USERS: "/app/users",
  TAG_API_PROFILE: "/app/user-profile",

  // Transactions
  TAG_API_TRANSACTIONS: "/app/transactions",
  TAG_API_TRANSACTION_EXPORT: "/app/transactions/export",

  // Audit
  TAG_API_TRANSACTION_AUDIT: "/app/audit-trail/transactions",
};

export default URLS;
