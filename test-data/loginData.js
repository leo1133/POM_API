import { HTTP_STATUS_CODE, CONTENT_TYPE } from "../utils/constants.js";
export const loginData = {
  email_user_id: process.env.email_user_id,
  password: process.env.password,
  login_type: process.env.login_type,

  // Cấu trúc response status 200
  successResponse: {
    status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
    contentType: CONTENT_TYPE.JSON,
    body: {
      access_token: "string",
      refresh_token: "string",
      firebase_access_token: "string",
      is_agency: "boolean",
    }
  },

  // Cấu trúc response status 401 - Authentication Failed
  expectedResponses: {
    unauthorized: {
      status: HTTP_STATUS_CODE.UNAUTHORIZED,
      contentType: CONTENT_TYPE.JSON,
      body: {
        detail: "メールアドレス・IDまたはパスワードが一致しません。もう一度入力してください。",
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
      body: {
        detail: [
          {
            type: "missing",
            loc: ["body", field],
            msg: "Field required",
          },
        ],
      }
    }),
  }
}


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
