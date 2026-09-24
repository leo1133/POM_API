// src/test-data/userData.js
import { expect } from "@playwright/test";
import { HTTP_STATUS_CODE, CONTENT_TYPE } from "../utils/constants.js";

// Thông báo lỗi chuẩn từ Server
export const ERROR_MESSAGES = {
  PAGE_MIN: "UserListRequest.pageは1以上の値を入力してください。",
  ITEMS_PER_PAGE_MIN: "UserListRequest.items_per_pageは1以上の値を入力してください。",
  INVALID_BOOLEAN: "value is not a valid boolean",
  INVALID_ENUM: "value is not a valid enumeration member",
  UNAUTHORIZED: "Not authenticated",
  FORBIDDEN: "Permission denied",
  METHOD_NOT_ALLOWED: "Method Not Allowed",
};

export const userData = {
  // Query parameters mặc định cho API Get List User
  defaultParams: {
    page: 1,
    items_per_page: 10,
    sort_field: "id",
    sort_order: "desc",
    keyword: "nga",
    user_status: 1,
    agency_status: 0,
    streamer_type: 1,
    can_livestream: true,
  },

  // Token mẫu dùng cho các kịch bản test đặc thù (Ưu tiên đọc từ .env)
  testTokens: {
    expiredToken:
      process.env.TEST_EXPIRED_TOKEN ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDA0MDAwMDB9.invalid_sig",
    invalidToken: "invalid_bearer_format_12345",
    nonAdminToken:
      process.env.NON_ADMIN_TOKEN ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_non_admin_payload.mock_signature",
  },

  // =========================================================================
  // 1. ACCEPT HEADER TEST CASES
  // =========================================================================
  acceptTestCases: [
    {
      tcId: "TC_HEADER_01",
      title: "No header / Default headers",
      headers: {},
      expectedStatus: [HTTP_STATUS_CODE.OK],
    },
    {
      tcId: "TC_HEADER_02",
      title: "No Accept header (With Content-Type)",
      headers: { "Content-Type": CONTENT_TYPE.JSON },
      expectedStatus: [HTTP_STATUS_CODE.OK],
    },
    {
      tcId: "TC_HEADER_03",
      title: "Empty Accept header",
      headers: { Accept: "" },
      expectedStatus: [HTTP_STATUS_CODE.OK],
    },
    {
      tcId: "TC_HEADER_04",
      title: "Unsupported Accept header (application/xml)",
      headers: { Accept: "application/xml" },
      expectedStatus: [HTTP_STATUS_CODE.OK, HTTP_STATUS_CODE.NOT_ACCEPTABLE || 406],
    },
  ],

  // =========================================================================
  // 2. AUTHORIZATION & ROLE TEST CASES
  // =========================================================================
  get authTestCases() {
    return [
      {
        tcId: "TC_AUTH_01",
        title: "No Authorization header",
        headers: {},
        expectedStatus: HTTP_STATUS_CODE.UNAUTHORIZED,
      },
      {
        tcId: "TC_AUTH_02",
        title: "Empty Authorization header",
        headers: { Authorization: "" },
        expectedStatus: HTTP_STATUS_CODE.UNAUTHORIZED,
      },
      {
        tcId: "TC_AUTH_03",
        title: "Invalid Authorization format (Not Bearer)",
        headers: { Authorization: "Basic invalid_format_123" },
        expectedStatus: HTTP_STATUS_CODE.UNAUTHORIZED,
      },
      {
        tcId: "TC_AUTH_04",
        title: "Malformed / Invalid JWT Token",
        headers: { Authorization: `Bearer ${this.testTokens.invalidToken}` },
        expectedStatus: HTTP_STATUS_CODE.UNAUTHORIZED,
      },
      {
        tcId: "TC_AUTH_05",
        title: "Expired JWT Token",
        headers: { Authorization: `Bearer ${this.testTokens.expiredToken}` },
        expectedStatus: HTTP_STATUS_CODE.UNAUTHORIZED,
      },
      {
        tcId: "TC_AUTH_06",
        title: "Non-Admin role access",
        headers: { Authorization: `Bearer ${this.testTokens.nonAdminToken}` },
        expectedStatus: HTTP_STATUS_CODE.UNAUTHORIZED,
      },
    ];
  },

  // =========================================================================
  // 3. EXPECTED RESPONSES SCHEMA & HELPERS
  // =========================================================================
  expectedResponses: {
    // Status 200 - OK
    success: {
      status: HTTP_STATUS_CODE.OK,
      contentType: CONTENT_TYPE.JSON,
      bodySchema: {
        page: expect.any(Number),
        items_per_page: expect.any(Number),
        data: expect.any(Array),
      },
    },

    // Status 401 - Unauthorized
    unauthorized: {
      status: HTTP_STATUS_CODE.UNAUTHORIZED,
      contentType: CONTENT_TYPE.JSON,
      body: { detail: ERROR_MESSAGES.UNAUTHORIZED },
    },

    // Status 403 - Forbidden
    forbidden: {
      status: HTTP_STATUS_CODE.FORBIDDEN,
      contentType: CONTENT_TYPE.JSON,
      body: { detail: ERROR_MESSAGES.FORBIDDEN },
    },

    // Status 405 - Method Not Allowed
    invalidMethod: {
      status: HTTP_STATUS_CODE.METHOD_NOT_ALLOWED,
      contentType: CONTENT_TYPE.JSON,
      body: { detail: ERROR_MESSAGES.METHOD_NOT_ALLOWED },
    },

    // Status 422 - Param Validation Error Generator
    getParamErrorResponse: (paramName, overrideMsg = null) => {
      const errorMap = {
        page: ERROR_MESSAGES.PAGE_MIN,
        items_per_page: ERROR_MESSAGES.ITEMS_PER_PAGE_MIN,
      };

      return {
        status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY || 422,
        contentType: CONTENT_TYPE.JSON,
        detail: [
          {
            loc: ["query", paramName],
            msg: overrideMsg || errorMap[paramName] || expect.any(String),
          },
        ],
      };
    },
  },
};