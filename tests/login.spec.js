import {
  authTest as test,
  authExpect as expect,
} from "../src/fixtures/login.fixtures.js";
import { AuthAPI } from "../src/api/login.api.js";
import { loginData } from "../test-data/loginData.js";
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
    expect(response.headers()["content-type"]).toContain(loginData.successResponse.contentType);
    const body = await response.json();

    expect(body.access_token).toBeDefined();
    expect(typeof body.access_token).toBe(loginData.successResponse.body.access_token);
    expect(body.access_token).not.toBe("");

    expect(body.refresh_token).toBeDefined();
    expect(typeof body.refresh_token).toBe(loginData.successResponse.body.refresh_token);
    expect(body.refresh_token).not.toBe("");

    expect(body.firebase_access_token).toBeDefined();
    expect(typeof body.firebase_access_token).toBe(loginData.successResponse.body.firebase_access_token);
    expect(body.firebase_access_token).not.toBe("");

    expect(typeof body.is_agency).toBe(loginData.successResponse.is_agency);
    expect(body.is_agency).toBe(false);
  });

  test("Case 2: Login failed with wrong password", async () => {
    const response = await authApi.login({
      ...loginData,
      password: generateRandomString(20, true, true),
    });

    // 1. Check HTTP Status Code
    expect(response.status()).toBe(loginData.expectedResponses.unauthorized.status);
    // 2. Check Content-Type Header
    expect(response.headers()["content-type"]).toContain(loginData.expectedResponses.unauthorized.contentType);
    // 3. Check Response Body Structure and Data
    const body = await response.json();
    expect(body).toEqual(loginData.expectedResponses.unauthorized);
  });

  test("Case 3: Login failed with wrong account", async () => {
    const response = await authApi.login({
      ...loginData,
      email_user_id: generateRandomEmail(true),
    });

    // 1. Check HTTP Status Code
    expect(response.status()).toBe(loginData.expectedResponses.unauthorized.status);
    // 2. Check Content-Type Header
    expect(response.headers()["content-type"]).toContain(loginData.expectedResponses.unauthorized.contentType);
    // 3. Check Response Body Structure and Data
    const body = await response.json();
    expect(body).toHaveProperty("detail");
    expect(typeof body.detail).toBe(loginData.invalidData.detail);
    expect(body.detail).toBe(loginData.invalidData.detail);
  });

  // ------------------------------------------------------------------
  // 2. HTTP METHODS TESTING (405 Method Not Allowed)
  // ------------------------------------------------------------------
  const invalidMethods = generateOtherMethodNotChoose(METHODS.POST);

  invalidMethods.forEach((method, index) => {
    test(`Case ${index + 4}: Login failed with ${method} method`, async () => {
      const response = await authApi.loginWithMethod(method);

      expect(response.status()).toBe(loginData.expectedResponses.invalidMethod.status);
      expect(response.headers()["content-type"]).toContain(loginData.expectedResponses.invalidMethod.contentType);

      const body = await response.json();
      expect(body).toHaveProperty("detail");
      expect(body.detail).toBe(loginData.invalidData.detail);
    });
  });

  // ------------------------------------------------------------------
  // 4. INVALID CONTENT-TYPE & BODY FORMATS
  // ------------------------------------------------------------------
  invalidContentTypePayloads.forEach(({ type, payload }, index) => {
    test(`Case ${index + 16}: Login failed - Invalid body - ${type}`, async () => {
      const response = await authApi.login(payload, {
        "Content-Type": type,
      });

      // 1. Check Status Code & Header
      expect(response.status()).toBe(loginData.expectedResponses.invalidBodyFormat.status);
      expect(response.headers()["content-type"]).toContain(loginData.expectedResponses.invalidBodyFormat.contentType);

      // 2. Check Response Body Structure & Specific Values
      await expect(response.json()).resolves.toMatchObject(loginData.invalidBodyFormat);
    });
  });

  // ------------------------------------------------------------------
  // 5. FIELD VALIDATIONS (400 / 401 / 422)
  // ------------------------------------------------------------------

  test("Case 22: Missing all fields", async () => {
    const response = await authApi.login({});
    expect(response.status()).toBe(loginData.expectedResponses.invalidBodyFormat.status);
    await expect(response.json()).resolves.toMatchObject(loginData.invalidBodyFormat);
  });

  test("Case 23: Missing email field", async () => {
    const { email_user_id, ...payloadWithoutEmail } = loginData;
    const response = await authApi.login(payloadWithoutEmail);
    expect(response.status()).toBe(loginData.expectedResponses.invalidBodyFormat.status);
    await expect(response.json()).resolves.toMatchObject(loginData.fieldRequired("email_user_id"));
  });

  test("Case 24: Missing password field", async () => {
    const { password, ...payloadWithoutPassword } = loginData;
    const response = await authApi.login(payloadWithoutPassword);
    expect(response.status()).toBe(loginData.expectedResponses.invalidBodyFormat.status);
    await expect(response.json()).resolves.toMatchObject(loginData.fieldRequired("password"));
  });

  test("Case 25: Missing login type field", async () => {
    const { login_type, ...payloadWithoutLoginType } = loginData;
    const response = await authApi.login(payloadWithoutLoginType);
    expect(response.status()).toBe(loginData.expectedResponses.invalidBodyFormat.status);
    const body = await response.json();
    expect(body).toHaveProperty("access_token");
    expect(typeof body.access_token).toBe(loginData.successResponse.body.access_token);
    expect(body.access_token).not.toBe("");

    expect(body.refresh_token).toBeDefined();
    expect(typeof body.refresh_token).toBe(loginData.successResponse.body.refresh_token);
    expect(body.refresh_token).not.toBe("");

    expect(body.firebase_access_token).toBeDefined();
    expect(typeof body.firebase_access_token).toBe(loginData.successResponse.firebase_access_token);
    expect(body.firebase_access_token).not.toBe("");

    expect(typeof body.is_agency).toBe(loginData.successResponse.is_agency);
    expect(body.is_agency).toBe(false);
  });
});
