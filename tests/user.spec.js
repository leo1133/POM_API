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
  // 1. HTTP METHODS TESTING (405 Method Not Allowed)
  // =========================================================================
  test.describe("1. Method Cases", () => {
    let userApi;

    test.beforeEach(async ({ authenticatedRequest }) => {
      userApi = new UserAPI(authenticatedRequest);
    });

    // Case Happy Path: Phương thức GET chuẩn
    test("Case 1: Get user list successfully with GET method", async () => {
      const response = await userApi.getUsers({
        method: "GET",
        queryParams: userData.defaultParams,
      });

      expect(response.status()).toBe(userData.expectedResponses.success.status);
    });

    // Sinh ra các phương thức không hợp lệ (POST, PUT, PATCH, DELETE)
    const invalidMethods = generateOtherMethodNotChoose(METHODS.GET);

    invalidMethods.forEach((method, index) => {
      test(`Case ${index + 2}: Get user list failed with ${method} method`, async () => {
        const response = await userApi.getUsers({
          method,
          queryParams: userData.defaultParams,
        });

        const { status, contentType, body: expectedBody } =
          userData.expectedResponses.invalidMethod;

        // Verify Status Code, Content-Type Header và Detail Message
        expect(response.status()).toBe(status);
        if (contentType) {
          expect(response.headers()["content-type"]).toContain(contentType);
        }
        if (expectedBody) {
          const body = await response.json();
          expect(body.detail).toBe(expectedBody.detail);
        }
      });
    });
  });

  // =========================================================================
  // 2. ACCEPT & AUTHORIZATION HEADERS TESTING (Data-Driven from userData.js)
  // =========================================================================
  test.describe("2. Accept & Authorization Header Cases", () => {
    // -----------------------------------------------------------------------
    // 2.1. Accept Header Cases (Dùng authenticatedRequest)
    // -----------------------------------------------------------------------
    test.describe("2.1. Accept Header Cases", () => {
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
    // 2.2. Authorization & Role Cases (Dùng unauthenticatedRequest)
    // -----------------------------------------------------------------------
    test.describe("2.2. Authorization & Role Cases", () => {
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
  // 3. QUERY PARAMETERS TESTING (Data-Driven from CSV)
  // =========================================================================
  test.describe("3. Query Parameters Cases (Data-Driven from CSV)", () => {
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

          // 1. Assert Status Code
          expect(response.status()).toBe(expectedStatus);

          // 2. Dynamic Assert Response Body theo Status Code
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
