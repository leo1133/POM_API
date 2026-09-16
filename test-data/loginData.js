import { HTTP_STATUS_CODE, CONTENT_TYPE } from "../utils/constants.js";

// ------------------------------------------------------------------
// 1. MESSAGES CONSTANTS
// ------------------------------------------------------------------
const ERROR_MESSAGES = {
  UNAUTHORIZED: "メールアドレス・IDまたはパスワードが一致しません。もう一度入力してください。",
  EMAIL_REQUIRED: "メール/IDは空欄にできません。",
  PASSWORD_REQUIRED: "パスワードは空欄にできません。",
  DEFAULT_REQUIRED: "Field required",
  INVALID_BODY: "Input should be a valid dictionary or object to extract fields from",
  METHOD_NOT_ALLOWED: "Method Not Allowed",
};

// Helper khởi tạo nhanh đối tượng lỗi missing
const createMissingDetail = (field, msg) => ({
  type: "missing",
  loc: ["body", field],
  msg,
});

// ------------------------------------------------------------------
// 2. MAIN LOGIN DATA & EXPECTED RESPONSES
// ------------------------------------------------------------------
export const loginData = {
  // Pure credentials
  credentials: {
    email_user_id: process.env.email_user_id,
    password: process.env.password,
    login_type: process.env.login_type,
  },

  // Helper hỗ trợ tương thích ngược
  get email_user_id() { return this.credentials.email_user_id; },
  get password() { return this.credentials.password; },
  get login_type() { return this.credentials.login_type; },

  expectedResponses: {
    // Status 200 - Success
    success: {
      status: HTTP_STATUS_CODE.OK,
      contentType: CONTENT_TYPE.JSON,
      body: {
        access_token: "string",
        refresh_token: "string",
        firebase_access_token: "string",
        is_agency: "boolean",
      },
    },

    // Status 401 - Unauthorized
    unauthorized: {
      status: HTTP_STATUS_CODE.UNAUTHORIZED,
      contentType: CONTENT_TYPE.JSON,
      body: {
        detail: ERROR_MESSAGES.UNAUTHORIZED,
      },
    },

    // Status 405 - Method Not Allowed
    invalidMethod: {
      status: HTTP_STATUS_CODE.METHOD_NOT_ALLOWED,
      contentType: CONTENT_TYPE.JSON,
      body: {
        detail: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
      },
    },

    // Status 422 - Invalid Body Format
    invalidBodyFormat: {
      status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
      contentType: CONTENT_TYPE.JSON,
      detail: [
        {
          type: "model_attributes_type",
          loc: ["body"],
          msg: ERROR_MESSAGES.INVALID_BODY,
        },
      ],
    },

    // Status 422 - Missing Single Field
    fieldRequired: (field, msg = ERROR_MESSAGES.DEFAULT_REQUIRED) => ({
      status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
      contentType: CONTENT_TYPE.JSON,
      detail: [createMissingDetail(field, msg)],
    }),

    // Status 422 - Missing All Fields
    missingAllFields: {
      status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
      detail: [
        createMissingDetail("email_user_id", ERROR_MESSAGES.EMAIL_REQUIRED),
        createMissingDetail("password", ERROR_MESSAGES.PASSWORD_REQUIRED),
      ],
    },
  },
};

// ------------------------------------------------------------------
// 3. PARAMETERIZED TEST DATA SETS
// ------------------------------------------------------------------
export const invalidContentTypePayloads = [
  {
    type: "text/plain",
    payload: "email=admin@example.com&password=123",
  },
  {
    type: "application/x-www-form-urlencoded",
    payload: new URLSearchParams({
      email_user_id: loginData.email_user_id,
      password: loginData.password,
    }).toString(),
  },
  {
    type: "application/xml",
    payload: `<xml><email>${loginData.email_user_id}</email><password>${loginData.password}</password></xml>`,
  },
];

export const headerTestCases = [
  { title: "No header", headers: {}, expectedStatus: HTTP_STATUS_CODE.OK },
  {
    title: "Empty header",
    headers: { accept: "", "Content-Type": "" },
    expectedStatus: HTTP_STATUS_CODE.OK,
  },
  { title: "No Accept header", headers: {}, expectedStatus: HTTP_STATUS_CODE.OK },
  { title: "Empty Accept header", headers: { accept: "" }, expectedStatus: HTTP_STATUS_CODE.OK },
  {
    title: "Invalid Accept header",
    headers: { accept: "text/html" },
    expectedStatus: HTTP_STATUS_CODE.OK,
  },
  { title: "No Content-Type header", headers: {}, expectedStatus: HTTP_STATUS_CODE.OK },
  {
    title: "Empty Content-Type header",
    headers: { "Content-Type": "" },
    expectedStatus: HTTP_STATUS_CODE.OK,
  },
  {
    title: "Invalid Content-Type header",
    headers: { "Content-Type": "text/plain" },
    expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
    checkErrorBody: true,
  },
];

export const missingFieldCases = [
  {
    field: "email_user_id",
    title: "Missing email field",
    expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
    isOptional: false,
  },
  {
    field: "password",
    title: "Missing password field",
    expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
    isOptional: false,
  },
  {
    field: "login_type",
    title: "Missing login type field",
    expectedStatus: HTTP_STATUS_CODE.OK,
    isOptional: true,
  },
];

// Data test cho các trường hợp Giá trị không hợp lệ (Value Validations)
export const invalidValueCases = [
  // Email Validations
  { title: "Email blank", override: { email_user_id: "" }, expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY },
  { title: "Email null", override: { email_user_id: null }, expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY },
  { title: "Invalid email format", override: { email_user_id: "invalid-email-format-without-at" }, expectedStatus: HTTP_STATUS_CODE.UNAUTHORIZED },
  { title: "Email not string (number)", override: { email_user_id: 123456789 }, expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY },

  // Password Validations
  { title: "Password blank", override: { password: "" }, expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY },
  { title: "Password null", override: { password: null }, expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY },
  { title: "Password not string (boolean)", override: { password: true }, expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY },

  // Login Type Validations
  { title: "Login type blank", override: { login_type: "" }, expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY },
  { title: "Login type null", override: { login_type: null }, expectedStatus: HTTP_STATUS_CODE.OK },
];