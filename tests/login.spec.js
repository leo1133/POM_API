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
  invalidValueCases,
} from "../test-data/loginData.js";
import {
  generateRandomString,
  generateRandomEmail,
  generateOtherMethodNotChoose,
} from "../utils/helpers.js";
import { METHODS, HTTP_STATUS_CODE } from "../utils/constants.js";

test.describe("API Auth Login Suite", () => {
  let authApi;

  test.beforeEach(async ({ unauthenticatedRequest }) => {
    authApi = new AuthAPI(unauthenticatedRequest);
  });

  // ------------------------------------------------------------------
  // 1. HAPPY PATH & AUTHENTICATION ERRORS
  // ------------------------------------------------------------------
  test("Case 1: Login successfully", async () => {
    const response = await authApi.login(loginData.credentials);
    const { status, contentType, body: expectedBody } = loginData.expectedResponses.success;

    expect(response.status()).toBe(status);
    expect(response.headers()["content-type"]).toContain(contentType);

    const body = await response.json();

    expect(body.access_token).toBeDefined();
    expect(typeof body.access_token).toBe(expectedBody.access_token);
    expect(body.access_token).not.toBe("");

    expect(body.refresh_token).toBeDefined();
    expect(typeof body.refresh_token).toBe(expectedBody.refresh_token);
    expect(body.refresh_token).not.toBe("");

    expect(body.firebase_access_token).toBeDefined();
    expect(typeof body.firebase_access_token).toBe(expectedBody.firebase_access_token);
    expect(body.firebase_access_token).not.toBe("");

    expect(typeof body.is_agency).toBe(expectedBody.is_agency);
    expect(body.is_agency).toBe(false);
  });

  test("Case 2: Login failed with wrong password", async () => {
    const response = await authApi.login({
      ...loginData.credentials,
      password: generateRandomString(10, true, true),
    });

    const { status, contentType, body: expectedBody } = loginData.expectedResponses.unauthorized;
    expect(response.status()).toBe(status);
    expect(response.headers()["content-type"]).toContain(contentType);

    const body = await response.json();
    expect(body).toEqual(expectedBody);
  });

  test("Case 3: Login failed with wrong account", async () => {
    const response = await authApi.login({
      ...loginData.credentials,
      email_user_id: generateRandomEmail(true),
    });

    const { status, contentType, body: expectedBody } = loginData.expectedResponses.unauthorized;
    expect(response.status()).toBe(status);
    expect(response.headers()["content-type"]).toContain(contentType);

    const body = await response.json();
    expect(body).toEqual(expectedBody);
  });

  // ------------------------------------------------------------------
  // 2. HTTP METHODS TESTING (405 Method Not Allowed)
  // ------------------------------------------------------------------
  const invalidMethods = generateOtherMethodNotChoose(METHODS.POST);

  invalidMethods.forEach((method, index) => {
    test(`Case ${index + 4}: Login failed with ${method} method`, async () => {
      const response = await authApi.loginWithMethod(method);
      const { status, contentType, body: expectedBody } = loginData.expectedResponses.invalidMethod;

      expect(response.status()).toBe(status);
      expect(response.headers()["content-type"]).toContain(contentType);

      const body = await response.json();
      expect(body.detail).toBe(expectedBody.detail);
    });
  });

  // ------------------------------------------------------------------
  // 3. HEADER TESTING
  // ------------------------------------------------------------------
  headerTestCases.forEach(
    ({ title, headers, expectedStatus, checkErrorBody }, index) => {
      const caseId = index + 8;

      test(`Case ${caseId}: Login - ${title}`, async () => {
        const response = await authApi.login(loginData.credentials, headers);

        expect(response.status()).toBe(expectedStatus);

        if (checkErrorBody) {
          await expect(response.json()).resolves.toMatchObject({
            detail: loginData.expectedResponses.invalidBodyFormat.detail,
          });
        }
      });
    }
  );

  // ------------------------------------------------------------------
  // 4. INVALID CONTENT-TYPE & BODY FORMATS
  // ------------------------------------------------------------------
  invalidContentTypePayloads.forEach(({ type, payload }, index) => {
    test(`Case ${index + 16}: Login failed - Invalid body - ${type}`, async () => {
      const response = await authApi.login(payload, {
        "Content-Type": type,
      });

      const { status, contentType } = loginData.expectedResponses.invalidBodyFormat;

      expect(response.status()).toBe(status);
      expect(response.headers()["content-type"]).toContain(contentType);

      const body = await response.json();
      expect(body).toHaveProperty("detail");
    });
  });

  // ------------------------------------------------------------------
  // 5. MISSING FIELD VALIDATIONS
  // ------------------------------------------------------------------
  test("Case 19: Missing all fields", async () => {
    const response = await authApi.login({});
    const { status, detail } = loginData.expectedResponses.missingAllFields;

    expect(response.status()).toBe(status);

    const body = await response.json();
    expect(body.detail).toEqual(
      expect.arrayContaining([
        expect.objectContaining(detail[0]),
        expect.objectContaining(detail[1]),
      ])
    );
  });

  missingFieldCases.forEach(
    ({ field, title, expectedStatus, isOptional }, index) => {
      const caseId = index + 20;

      test(`Case ${caseId}: ${title}`, async () => {
        const { [field]: omitted, ...payloadWithoutField } = loginData.credentials;
        const response = await authApi.login(payloadWithoutField);

        expect(response.status()).toBe(expectedStatus);

        if (!isOptional) {
          await expect(response.json()).resolves.toMatchObject({
            detail: [
              {
                type: "missing",
                loc: ["body", field],
              },
            ],
          });
        }
      });
    }
  );

  // ------------------------------------------------------------------
  // 6. FIELD VALUE VALIDATIONS (Email, Password & Login Type)
  // ------------------------------------------------------------------
  invalidValueCases.forEach(({ title, override, expectedStatus }, index) => {
    const caseId = index + 26;

    test(`Case ${caseId}: ${title}`, async () => {
      const payload = { ...loginData.credentials, ...override };
      const response = await authApi.login(payload);

      expect(response.status()).toBe(expectedStatus);
    });
  });
});