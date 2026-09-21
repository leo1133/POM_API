import { expect } from "@playwright/test";
import { HTTP_STATUS_CODE, CONTENT_TYPE } from "../utils/constants.js";

export const userData = {
  // Query parameters mặc định
  defaultParams: {
    page: 1,
    items_per_page: 10,
    sort_field: "id",
    sort_order: "desc",
  },

  // Quản lý tập trung Status, Content-Type Header & Body Schema mong đợi
  expectedResponses: {
    // Kịch bản 200 - Lấy danh sách thành công
    successList: {
      status: HTTP_STATUS_CODE?.OK || 200,
      contentType: CONTENT_TYPE?.JSON || "application/json",
      // Schema cấu trúc khung của Response
      rootSchema: {
        page: 1,
        items_per_page: 10,
        total_count: expect.any(Number),
        has_more: expect.any(Boolean),
        data: expect.any(Array),
      },
      // Schema cấu trúc dữ liệu của 1 User item
      itemSchema: {
        user_id: expect.any(Number),
        user_uid: expect.any(String),
        user_name: expect.any(String),
        status: expect.any(Number),
        can_livestream: expect.any(Boolean),
        total_sales: expect.any(Number),
        ekyc_status: expect.any(Number),
      },
    },

    // Kịch bản 401 - Chưa xác thực / Token không hợp lệ
    unauthorized: {
      status: HTTP_STATUS_CODE?.UNAUTHORIZED || 401,
      contentType: CONTENT_TYPE?.JSON || "application/json",
      body: {
        detail: "Not authenticated",
      },
    },

    // Kịch bản 422/400 - Tham số không hợp lệ
    invalidParams: {
      status: HTTP_STATUS_CODE?.UNPROCESSABLE_ENTITY || 422,
      contentType: CONTENT_TYPE?.JSON || "application/json",
    },

    // Kịch bản 405 - Phương thức HTTP không hợp lệ
    invalidMethod: {
      status: HTTP_STATUS_CODE?.METHOD_NOT_ALLOWED || 405,
      contentType: CONTENT_TYPE?.JSON || "application/json",
      body: {
        detail: "Method Not Allowed",
      },
    },
  },
};
