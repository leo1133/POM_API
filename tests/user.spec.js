import { expect } from "@playwright/test";
import { authTest as test } from "../src/fixtures/login.fixtures.js";
import { UserAPI } from "../src/api/user.api.js";
import { userData } from "../test-data/userData.js";

test.describe("API Get List User Suite (POM Pattern)", () => {
  let userApi;

  // ------------------------------------------------------------------
  // 1. KỊCH BẢN CẦN XÁC THỰC (AUTHENTICATED REQUESTS)
  // ------------------------------------------------------------------
  test.describe("Authenticated Requests", () => {
    test.beforeEach(async ({ authenticatedRequest }) => {
      // Khởi tạo instance duy nhất cho nhóm test case authen
      userApi = new UserAPI(authenticatedRequest);
    });

    test("Case 1: Get list user successfully with default pagination", async () => {
      const response = await userApi.getUsers(userData.defaultParams);
      const expected = userData.expectedResponses.successList;

      // 1. Verify Status & Header
      expect(response.status()).toBe(expected.status);
      expect(response.headers()["content-type"]).toContain(
        expected.contentType,
      );

      // 2. Verify Body Root Schema & Item Schema
      const body = await response.json();
      expect(body).toMatchObject(expected.rootSchema);

      if (body.data.length > 0) {
        expect(body.data[0]).toMatchObject(expected.itemSchema);
      }
    });

    // test("Case 2: Pass invalid query params (e.g., negative page)", async () => {
    //   const response = await userApi.getUsers({ page: -1, items_per_page: 10 });
    //   const expected = userData.expectedResponses.invalidParams;

    //   expect(response.status()).toBe(expected.status);
    //   expect(response.headers()["content-type"]).toContain(
    //     expected.contentType,
    //   );
    // });

    // ------------------------------------------------------------------
    // 2. KỊCH BẢN KHÔNG XÁC THỰC (UNAUTHENTICATED REQUESTS)
    // ------------------------------------------------------------------
  });
});
