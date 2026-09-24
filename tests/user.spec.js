import { expect } from "@playwright/test";
import { authTest as test } from "../src/fixtures/login.fixtures.js";
import { UserAPI } from "../src/api/user.api.js";
import { userData } from "../test-data/userData.js";
import { loadUserListCsvCases } from "../utils/csvHelper.js";
import { METHODS } from "../utils/constants.js";
import { generateOtherMethodNotChoose } from "../utils/helpers.js";

// Load dữ liệu testcase nhóm Params từ file CSV
const csvTestCases = loadUserListCsvCases("test-data/csv/getListUser.csv");

test.describe("API GET List User Test Suite", () => {
  // =========================================================================
  // 1. HAPPY PATH TEST SUITE (Kiểm thử chức năng chính + DB Verification)
  // =========================================================================
  test.describe("1. Happy Path Cases", () => {
    let userApi;

    test.beforeEach(async ({ authenticatedRequest }) => {
      userApi = new UserAPI(authenticatedRequest); // cite: 1
    });

    test("Get user list successfully and verify full integrity (Schema, Pagination, DB)", async ({ db }) => {
      const queryParams = userData.defaultParams; // cite: 1

      // Call API
      const response = await userApi.getUsers({
        method: METHODS.GET,
        queryParams: queryParams,
      });

      // 1. Assert Status & Content-Type Header
      expect(response.status()).toBe(userData.expectedResponses.success.status); // cite: 1
      expect(response.headers()["content-type"]).toContain("application/json");

      const body = await response.json();

      // 2. Assert Phân trang & Số lượng
      expect(body).toMatchObject({
        page: queryParams.page,
        items_per_page: queryParams.items_per_page,
        total_count: expect.any(Number),
        has_more: expect.any(Boolean),
        data: expect.any(Array),
      });
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data.length).toBeLessThanOrEqual(queryParams.items_per_page);

      // 3. Chọn 1 user ngẫu nhiên trong mảng trả về để kiểm tra Schema & DB
      const randomIndex = Math.floor(Math.random() * body.data.length);
      const apiUser = body.data[randomIndex];

      // Assert Cấu trúc & Kiểu dữ liệu (Schema) của user được chọn
      expect(apiUser).toMatchObject({
        user_id: expect.any(Number),
        user_uid: expect.any(String),
        user_name: expect.any(String),
        agency_id: expect.any(Number),
        agency_name: expect.any(String),
        streamer_type: expect.any(Number),
        agency_status: expect.any(Number),
        created_at: expect.any(String),
        last_login_at: expect.any(String),
        last_livestream_at: expect.any(String),
        status: expect.any(Number),
        can_livestream: expect.any(Boolean),
        following_count: expect.any(Number),
        follower_count: expect.any(Number),
        familia_member_count: expect.any(Number),
        livestream_like_count: expect.any(Number),
        livestream_duration: expect.any(Number),
        normal_livestream_duration: expect.any(Number),
        two_shot_livestream_duration: expect.any(Number),
        familia_livestream_duration: expect.any(Number),
        karaoke_livestream_duration: expect.any(Number),
        broadcast_livestream_duration: expect.any(Number),
        obs_livestream_duration: expect.any(Number),
        point_sales: expect.any(Number),
        two_shot_sales: expect.any(Number),
        gift_sales: expect.any(Number),
        whisper_sales: expect.any(Number),
        yell_sales: expect.any(Number),
        familia_sales: expect.any(Number),
        total_sales: expect.any(Number),
        ekyc_status: expect.any(Number),
        ocr_status: expect.any(Number),
      });

      // 4. Assert Dữ liệu thực tế với PostgreSQL Database
      const dbQuery = `
        SELECT 
          id, uid, name, status, streamer_type, can_livestream,
          following_count, follower_count, livestream_duration,
          point_sales, gift_sales, total_sales,
          ekyc_status, ocr_status, created_at
        FROM users 
        WHERE id = $1
      `;
      const dbResult = await db.query(dbQuery, [apiUser.user_id]);
      const dbUser = dbResult.rows[0];

      expect(dbUser).toBeDefined();
      expect(apiUser.user_id).toBe(Number(dbUser.id));
      expect(apiUser.user_uid).toBe(dbUser.uid);
      expect(apiUser.user_name).toBe(dbUser.name);
      expect(apiUser.status).toBe(dbUser.status);
      expect(apiUser.can_livestream).toBe(dbUser.can_livestream);
      expect(apiUser.following_count).toBe(Number(dbUser.following_count));
      expect(apiUser.follower_count).toBe(Number(dbUser.follower_count));
      expect(apiUser.total_sales).toBe(Number(dbUser.total_sales));
      expect(new Date(apiUser.created_at).getTime()).toBe(
        new Date(dbUser.created_at).getTime()
      );
    });
  });

  // =========================================================================
  // 2. INVALID HTTP METHODS TESTING (Negative Testing - 405 Method Not Allowed)
  // =========================================================================
  test.describe("2. Invalid Method Cases (405 Method Not Allowed)", () => {
    let userApi;

    test.beforeEach(async ({ authenticatedRequest }) => {
      userApi = new UserAPI(authenticatedRequest); // cite: 1
    });

    // Sinh ra các phương thức không hợp lệ (POST, PUT, PATCH, DELETE)
    const invalidMethods = generateOtherMethodNotChoose(METHODS.GET); // cite: 1

    invalidMethods.forEach((method, index) => {
      test(`Case ${index + 1}: Get user list failed with ${method} method`, async () => {
        const response = await userApi.getUsers({
          method,
          queryParams: userData.defaultParams, // cite: 1
        });

        const { status, contentType, body: expectedBody } =
          userData.expectedResponses.invalidMethod; // cite: 1

        // Verify Status Code, Content-Type Header và Message detail
        expect(response.status()).toBe(status); // cite: 1
        if (contentType) {
          expect(response.headers()["content-type"]).toContain(contentType); // cite: 1
        }
        if (expectedBody) {
          const body = await response.json(); // cite: 1
          expect(body.detail).toBe(expectedBody.detail); // cite: 1
        }
      });
    });
  });

  // =========================================================================
  // 3. ACCEPT & AUTHORIZATION HEADERS TESTING (Data-Driven from userData.js)
  // =========================================================================
  test.describe("3. Accept & Authorization Header Cases", () => {
    // -----------------------------------------------------------------------
    // 3.1. Accept Header Cases (Dùng authenticatedRequest)
    // -----------------------------------------------------------------------
    test.describe("3.1. Accept Header Cases", () => {
      let userApi;

      test.beforeEach(async ({ authenticatedRequest }) => {
        userApi = new UserAPI(authenticatedRequest);
      });

      (userData.acceptTestCases || []).forEach(
        ({ tcId, title, headers, expectedStatus }) => {
          test(`[${tcId}] ${title}`, async () => {
            const response = await userApi.getUsers({
              method: "GET",
              queryParams: userData.defaultParams,
              headers,
            });

            // Assert Status Code thuộc mảng cho phép (vd: [200] hoặc [200, 406])
            expect(expectedStatus).toContain(response.status());
          });
        },
      );
    });

    // -----------------------------------------------------------------------
    // 3.2. Authorization & Role Cases (Dùng unauthenticatedRequest)
    // -----------------------------------------------------------------------
    test.describe("3.2. Authorization & Role Cases", () => {
      let userApi;

      test.beforeEach(async ({ unauthenticatedRequest }) => {
        // Dùng unauthenticatedRequest để chủ động ghi đè/bỏ qua Authorization Header
        userApi = new UserAPI(unauthenticatedRequest);
      });

      (userData.authTestCases || []).forEach(
        ({ tcId, title, headers, expectedStatus }) => {
          test(`[${tcId}] ${title} should return ${expectedStatus}`, async () => {
            const response = await userApi.getUsers({
              method: "GET",
              queryParams: userData.defaultParams,
              headers,
            });

            // Assert Status Code (401 Unauthorized / 403 Forbidden)
            expect(response.status()).toBe(expectedStatus);

            // Assert Response Body chứa thông báo lỗi detail
            const body = await response.json();
            expect(body).toHaveProperty("detail");
          });
        },
      );
    });
  });

  // =========================================================================
  // 4. QUERY PARAMETERS TESTING (Data-Driven from CSV)
  // =========================================================================
  test.describe("4. Query Parameters Cases (Data-Driven from CSV)", () => {
    let userApi;

    test.beforeEach(async ({ authenticatedRequest }) => {
      userApi = new UserAPI(authenticatedRequest);
    });

    csvTestCases.forEach(
      ({ tcId, testName, method, headers, queryParams, expectedStatus }) => {
        test(`[${tcId}] ${testName}`, async () => {
          const response = await userApi.getUsers({
            method,
            queryParams,
            headers,
          });

          // 4.1. Assert Status Code
          expect(response.status()).toBe(expectedStatus);

          // 4.2. Dynamic Assert Response Body theo Status Code
          if (expectedStatus === userData.expectedResponses.success.status) {
            const body = await response.json();
            expect(body).toMatchObject(
              userData.expectedResponses.success.bodySchema,
            );
          } else if (expectedStatus === 422) {
            const body = await response.json();
            expect(body.detail[0]).toMatchObject({
              loc: ["query", expect.any(String)],
              msg: expect.any(String),
            });
          }
        });
      },
    );
  });
});
