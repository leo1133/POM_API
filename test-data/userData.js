// src/test-data/userData.js
import { expect } from "@playwright/test";
import { HTTP_STATUS_CODE, CONTENT_TYPE } from "../utils/constants.js";

export const ERROR_MESSAGES = {
  PAGE_MIN: "UserListRequest.pageは1以上の値を入力してください。",
  ITEMS_PER_PAGE_MIN:
    "UserListRequest.items_per_pageは1以上の値を入力してください。",
  INVALID_BOOLEAN: "value is not a valid boolean",
  INVALID_ENUM: "value is not a valid enumeration member",
  UNAUTHORIZED: "Not authenticated",
  FORBIDDEN: "Permission denied",
  METHOD_NOT_ALLOWED: "Method Not Allowed",
};

export const userData = {
  // Query parameters chuẩn mặc định từ cURL
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

  // Token mẫu dùng cho các kịch bản test đặc thù
  testTokens: {
    expiredToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDA0MDAwMDB9.invalid_sig",
    invalidToken: "Bearer_invalid_12345_format",
    nonAdminToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciJ9.invalid_sig",
  },

  // =========================================================================
  // 1. ACCEPT HEADER TEST CASES
  // =========================================================================
  acceptTestCases: [
    {
      tcId: "TC_HEADER_01",
      title: "No header",
      headers: {},
      expectedStatus: [200],
    },
    {
      tcId: "TC_HEADER_02",
      title: "Empty header",
      headers: {},
      expectedStatus: [200],
    },
    {
      tcId: "TC_HEADER_03",
      title: "No accept header",
      headers: { "Content-Type": "application/json" },
      expectedStatus: [200],
    },
    {
      tcId: "TC_HEADER_04",
      title: "Empty accept header",
      headers: { Accept: "" },
      expectedStatus: [200],
    },
    {
      tcId: "TC_HEADER_05",
      title: "Invalid value accept (e.g. application/xml)",
      headers: { Accept: "application/xml" },
      expectedStatus: [200, 406], // 200 nếu server bỏ qua Accept, 406 nếu validate nghiêm ngặt
    },
  ],

  // =========================================================================
  // 2. AUTHORIZATION & ROLE TEST CASES
  // =========================================================================
  authTestCases: [
    {
      tcId: "TC_AUTH_01",
      title: "No Authorization",
      headers: {},
      expectedStatus: HTTP_STATUS_CODE?.UNAUTHORIZED || 401,
    },
    {
      tcId: "TC_AUTH_02",
      title: "Empty Authorization",
      headers: { Authorization: "" },
      expectedStatus: HTTP_STATUS_CODE?.UNAUTHORIZED || 401,
    },
    {
      tcId: "TC_AUTH_03",
      title: "Invalid value Authorization (Not Bearer format)",
      headers: { Authorization: "Basic invalid_format_123" },
      expectedStatus: HTTP_STATUS_CODE?.UNAUTHORIZED || 401,
    },
    {
      tcId: "TC_AUTH_04",
      title: "Authorization is not correct (Malformed / Fake signature)",
      headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.fake",
      },
      expectedStatus: HTTP_STATUS_CODE?.UNAUTHORIZED || 401,
    },
    {
      tcId: "TC_AUTH_05",
      title: "Authorization is expired",
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDA0MDAwMDB9.invalid_sig",
      },
      expectedStatus: HTTP_STATUS_CODE?.UNAUTHORIZED || 401,
    },
    {
      tcId: "TC_AUTH_06",
      title: "Authorization is not [admin]",
      headers: { Authorization: "Bearer user_token_without_admin_role" },
      expectedStatus: HTTP_STATUS_CODE?.FORBIDDEN || 403,
    },
  ],

  // Quản lý tập trung Status, Content-Type & Body Schema kỳ vọng
  expectedResponses: {
    // Status 200 - OK
    success: {
      status: HTTP_STATUS_CODE?.OK || 200,
      contentType: CONTENT_TYPE?.JSON || "application/json",
      bodySchema: {
        page: expect.any(Number),
        items_per_page: expect.any(Number),
        data: expect.any(Array),
      },
    },

    // Status 401 - Unauthorized
    unauthorized: {
      status: HTTP_STATUS_CODE?.UNAUTHORIZED || 401,
      contentType: CONTENT_TYPE?.JSON || "application/json",
      body: {
        detail: ERROR_MESSAGES.UNAUTHORIZED,
      },
    },

    // Status 403 - Forbidden
    forbidden: {
      status: HTTP_STATUS_CODE?.FORBIDDEN || 403,
      contentType: CONTENT_TYPE?.JSON || "application/json",
      body: {
        detail: ERROR_MESSAGES.FORBIDDEN,
      },
    },

    // Status 405 - Method Not Allowed
    invalidMethod: {
      status: HTTP_STATUS_CODE?.METHOD_NOT_ALLOWED || 405,
      contentType: CONTENT_TYPE?.JSON || "application/json",
      body: {
        detail: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
      },
    },

    // Status 422 - Param Validation Error
    getParamErrorResponse: (paramName, overrideMsg = null) => {
      let expectedMsg = overrideMsg;

      if (!expectedMsg) {
        switch (paramName) {
          case "page":
            expectedMsg = ERROR_MESSAGES.PAGE_MIN;
            break;
          case "items_per_page":
            expectedMsg = ERROR_MESSAGES.ITEMS_PER_PAGE_MIN;
            break;
          default:
            expectedMsg = expect.any(String);
        }
      }

      return {
        status: HTTP_STATUS_CODE?.UNPROCESSABLE_ENTITY || 422,
        contentType: CONTENT_TYPE?.JSON || "application/json",
        detail: [
          {
            loc: ["query", paramName],
            msg: expectedMsg,
          },
        ],
      };
    },
  },
};
