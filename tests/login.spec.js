import {
  authTest as test,
  authExpect as expect,
} from "../src/fixtures/login.fixtures.js";
import { AuthAPI } from "../src/api/login.api.js";
import {
  loginData,
  invalidContentTypePayloads,
  headerTestCases,
  missingFieldCases,
} from "../test-data/loginData.js";
import {
  generateRandomString,
  generateRandomEmail,
  generateOtherMethodNotChoose,
} from "../utils/helpers.js";
import { METHODS } from "../utils/constants.js";

test.describe("API Auth Login Suite", () => {
  let authApi;

  // Khởi tạo AuthAPI 1 lần duy nhất cho tất cả các test case
  test.beforeEach(async ({ unauthenticatedRequest }) => {
    authApi = new AuthAPI(unauthenticatedRequest);
  });

  // ------------------------------------------------------------------
  // 1. HAPPY PATH & AUTHENTICATION ERRORS
  // ------------------------------------------------------------------
  test("Case 1: Login successfully", async () => {
    const response = await authApi.login(loginData);

    expect(response.status()).toBe(loginData.successResponse.status);
    expect(response.headers()["content-type"]).toContain(
      loginData.successResponse.contentType,
    );
    const body = await response.json();

    expect(body.access_token).toBeDefined();
    expect(typeof body.access_token).toBe(
      loginData.successResponse.body.access_token,
    );
    expect(body.access_token).not.toBe("");

    expect(body.refresh_token).toBeDefined();
    expect(typeof body.refresh_token).toBe(
      loginData.successResponse.body.refresh_token,
    );
    expect(body.refresh_token).not.toBe("");

    expect(body.firebase_access_token).toBeDefined();
    expect(typeof body.firebase_access_token).toBe(
      loginData.successResponse.body.firebase_access_token,
    );
    expect(body.firebase_access_token).not.toBe("");

    expect(typeof body.is_agency).toBe(
      loginData.successResponse.body.is_agency,
    );
    expect(body.is_agency).toBe(false);
  });

  test("Case 2: Login failed with wrong password", async () => {
    const response = await authApi.login({
      ...loginData,
      password: generateRandomString(10, true, true),
    });

    // 1. Check HTTP Status Code
    expect(response.status()).toBe(
      loginData.expectedResponses.unauthorized.status,
    );
    // 2. Check Content-Type Header
    expect(response.headers()["content-type"]).toContain(
      loginData.expectedResponses.unauthorized.contentType,
    );
    // 3. Check Response Body Structure and Data
    const body = await response.json();
    expect(body).toEqual(loginData.expectedResponses.unauthorized.body);
  });

  test("Case 3: Login failed with wrong account", async () => {
    const response = await authApi.login({
      ...loginData,
      email_user_id: generateRandomEmail(true),
    });

    // 1. Check HTTP Status Code
    expect(response.status()).toBe(
      loginData.expectedResponses.unauthorized.status,
    );
    // 2. Check Content-Type Header
    expect(response.headers()["content-type"]).toContain(
      loginData.expectedResponses.unauthorized.contentType,
    );
    // 3. Check Response Body Structure and Data
    const body = await response.json();
    expect(body).toEqual(loginData.expectedResponses.unauthorized.body);
  });

  // ------------------------------------------------------------------
  // 2. HTTP METHODS TESTING (405 Method Not Allowed)
  // ------------------------------------------------------------------
  const invalidMethods = generateOtherMethodNotChoose(METHODS.POST);

  invalidMethods.forEach((method, index) => {
    test(`Case ${index + 4}: Login failed with ${method} method`, async () => {
      const response = await authApi.loginWithMethod(method);

      expect(response.status()).toBe(
        loginData.expectedResponses.invalidMethod.status,
      );
      expect(response.headers()["content-type"]).toContain(
        loginData.expectedResponses.invalidMethod.contentType,
      );

      const body = await response.json();
      expect(body).toHaveProperty("detail");
      // Fix: Access detail from expectedResponses instead of the undefined invalidData property
      expect(body.detail).toBe(
        loginData.expectedResponses.invalidMethod.body.detail,
      );
    });
  });

  // ------------------------------------------------------------------
  // 3. HEADER TESTING
  // ------------------------------------------------------------------

  headerTestCases.forEach(
    ({ title, headers, expectedStatus, checkErrorBody }, index) => {
      const caseId = index + 8; // Tự động đánh số từ Case 8

      test(`Case ${caseId}: Login - ${title}`, async () => {
        const response = await authApi.login(loginData, headers);

        // 1. Check HTTP Status
        expect(response.status()).toBe(expectedStatus);

        // 2. Check Response Body cho các case lỗi 422 (nếu có)
        if (checkErrorBody) {
          await expect(response.json()).resolves.toMatchObject({
            detail: loginData.expectedResponses.invalidBodyFormat.detail,
          });
        }
      });
    },
  );

  // ------------------------------------------------------------------
  // 4. INVALID CONTENT-TYPE & BODY FORMATS
  // ------------------------------------------------------------------
  invalidContentTypePayloads.forEach(({ type, payload }, index) => {
    test(`Case ${index + 16}: Login failed - Invalid body - ${type}`, async () => {
      const response = await authApi.login(payload, {
        "Content-Type": type,
      });

      // 1. Check Status Code & Header
      expect(response.status()).toBe(
        loginData.expectedResponses.invalidBodyFormat.status,
      );
      expect(response.headers()["content-type"]).toContain(
        loginData.expectedResponses.invalidBodyFormat.contentType,
      );

      // 2. Check Response Body Structure
      const body = await response.json();
      expect(body).toHaveProperty("detail");
    });
  });

  // ------------------------------------------------------------------
  // 5. MISSING FIELD VALIDATIONS
  // ------------------------------------------------------------------
  // test("Case 19: Missing all fields", async () => {
  //   const response = await authApi.login({});

  //   expect(response.status()).toBe(
  //     loginData.expectedResponses.invalidBodyFormat.status,
  //   );
  //   await expect(response.json()).resolves.toMatchObject({
  //     detail: [
  //       loginData.expectedResponses.fieldRequired("email_user_id").detail[0],
  //       loginData.expectedResponses.fieldRequired("password").detail[0],
  //     ],
  //   });
  // });

  // missingFieldCases.forEach(
  //   ({ field, title, expectedStatus, isOptional }, index) => {
  //     const caseId = index + 20; // Tự động đánh số thứ tự từ Case 20

  //     test(`Case ${caseId}: ${title}`, async () => {
  //       // Tách trường 'field' ra khỏi loginData
  //       const { [field]: omitted, ...payloadWithoutField } = loginData;

  //       const response = await authApi.login(payloadWithoutField);

  //       // 1. Check HTTP Status Code
  //       expect(response.status()).toBe(expectedStatus);

  //       // 2. Check Response Body cho các field bắt buộc (422)
  //       if (!isOptional) {
  //         const expectedError =
  //           loginData.expectedResponses.fieldRequired(field);
  //         await expect(response.json()).resolves.toMatchObject({
  //           detail: expectedError.detail,
  //         });
  //       }
  //     });
  //   },
  // );
});
