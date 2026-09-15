import { HTTP_STATUS_CODE, CONTENT_TYPE } from "../utils/constants.js";
export const loginData = {
  email_user_id: process.env.email_user_id,
  password: process.env.password,
  login_type: process.env.login_type,

  // Cấu trúc response status 200
  successResponse: {
    status: HTTP_STATUS_CODE.OK,
    contentType: CONTENT_TYPE.JSON,
    body: {
      access_token: "string",
      refresh_token: "string",
      firebase_access_token: "string",
      is_agency: "boolean",
    },
  },

  // Cấu trúc response status 401 - Authentication Failed
  expectedResponses: {
    unauthorized: {
      status: HTTP_STATUS_CODE.UNAUTHORIZED,
      contentType: CONTENT_TYPE.JSON,
      body: {
        detail:
          "メールアドレス・IDまたはパスワードが一致しません。もう一度入力してください。",
      },
    },

    // Cấu trúc response status 405 - Method Not Allowed
    invalidMethod: {
      status: HTTP_STATUS_CODE.METHOD_NOT_ALLOWED,
      contentType: CONTENT_TYPE.JSON,
      body: {
        detail: "Method Not Allowed",
      },
    },

    // Cấu trúc response status 422 - Unprocessable Entity
    invalidBodyFormat: {
      status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
      contentType: CONTENT_TYPE.JSON,
      detail: [
        {
          type: "model_attributes_type",
          loc: ["body"],
          msg: "Input should be a valid dictionary or object to extract fields from",
        },
      ],
    },

    // Cấu trúc response status 422 - Missing/Invalid Field
    fieldRequired: (field) => ({
      status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
      contentType: CONTENT_TYPE.JSON,
      detail: [
        {
          type: "missing",
          loc: ["body", field],
          msg: "Field required",
        },
      ],
    }),
  },
};

// Data Test với Incorrect Content-Type
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
  {
    title: "No Accept header",
    headers: {},
    expectedStatus: HTTP_STATUS_CODE.OK,
  },
  {
    title: "Empty Accept header",
    headers: { accept: "" },
    expectedStatus: HTTP_STATUS_CODE.OK,
  },
  {
    title: "Invalid Accept header",
    headers: { accept: "text/html" },
    expectedStatus: HTTP_STATUS_CODE.OK,
  },
  {
    title: "No Content-Type header",
    headers: {},
    expectedStatus: HTTP_STATUS_CODE.OK,
  },
  {
    title: "Empty Content-Type header",
    headers: { "Content-Type": "" },
    expectedStatus: HTTP_STATUS_CODE.OK,
  },
  {
    title: "Invalid Content-Type header",
    headers: { "Content-Type": "text/plain" },
    expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
    checkErrorBody: true, // Cờ tùy chọn để assert body lỗi 422
  },
];
// export const missingFieldCases = [
//   {
//     field: "email_user_id",
//     title: "Missing email field",
//     expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
//     isOptional: false,
//   },
//   {
//     field: "password",
//     title: "Missing password field",
//     expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
//     isOptional: false,
//   },
//   {
//     field: "login_type",
//     title: "Missing login type field",
//     expectedStatus: HTTP_STATUS_CODE.OK,
//     isOptional: true,
//   },
// ];
