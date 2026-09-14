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

test.describe("API Auth Login Suite (JavaScript)", () => {
  test("Case 1: Login successfully", async ({ unauthenticatedRequest }) => {
    const authApi = new AuthAPI(unauthenticatedRequest);
    const response = await authApi.login(loginData);

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.access_token).toBeDefined();
    expect(typeof body.access_token).toBe("string");
    expect(body.access_token).not.toBe("");

    expect(body.refresh_token).toBeDefined();
    expect(typeof body.refresh_token).toBe("string");

    expect(body.firebase_access_token).toBeDefined();
    expect(typeof body.firebase_access_token).toBe("string");

    expect(typeof body.is_agency).toBe("boolean");
    expect(body.is_agency).toBe(false);
  });

  test("Case 2: Login failed with wrong password", async ({
    unauthenticatedRequest,
  }) => {
    const authApi = new AuthAPI(unauthenticatedRequest);
    const response = await authApi.login({
      ...loginData,
      password: generateRandomString(20, true, true),
    });

    expect(response.status()).toBe(401);
    expect(response.headers()["content-type"]).toContain("application/json");
    await expect(response.json()).resolves.toEqual({
      detail: loginData.errorMessages,
    });
  });

  test("Case 3: Login failed with wrong account", async ({
    unauthenticatedRequest,
  }) => {
    const authApi = new AuthAPI(unauthenticatedRequest);

    const response = await authApi.login({
      ...loginData,
      email_user_id: generateRandomEmail(true),
    });

    expect(response.status()).toBe(400);
    expect(response.headers()["content-type"]).toContain("application/json");
    // await expect(response.json()).resolves.toEqual({
    //   detail: loginData.errorMessages,
    // });
  });

  const invalidMethods = generateOtherMethodNotChoose(METHODS.POST);

  invalidMethods.forEach((method, index) => {
    test(`Case ${index + 4}: Login failed with ${method} method`, async ({
      unauthenticatedRequest,
    }) => {
      const authApi = new AuthAPI(unauthenticatedRequest);
      const response = await authApi.loginWithMethod(method);

      expect(response.status()).toBe(405);
      expect(response.headers()["content-type"]).toContain("application/json");

      const body = await response.json();
      expect(body).toHaveProperty("detail");
      expect(body.detail).toBe("Method Not Allowed");
    });
  });

  test("Case 8: Login - No header", async ({ unauthenticatedRequest }) => {
    const authApi = new AuthAPI(unauthenticatedRequest);
    const response = await authApi.login(loginData, {});
    expect(response.status()).toBe(200);
  });

  test("Case 9: Login - Empty header", async ({ unauthenticatedRequest }) => {
    const authApi = new AuthAPI(unauthenticatedRequest);
    const response = await authApi.login(loginData, {
      accept: "",
      "Content-Type": "",
    });
    expect(response.status()).toBe(200);
  });

  test("Case 10: Login - No Accept header", async ({
    unauthenticatedRequest,
  }) => {
    const authApi = new AuthAPI(unauthenticatedRequest);
    const response = await authApi.login(loginData, {});
    expect(response.status()).toBe(200);
  });

  test("Case 11: Login - Empty Accept header", async ({
    unauthenticatedRequest,
  }) => {
    const authApi = new AuthAPI(unauthenticatedRequest);
    const response = await authApi.login(loginData, {
      accept: "",
    });
    expect(response.status()).toBe(200);
  });

  test("Case 12: Login - Invalid Accept header", async ({
    unauthenticatedRequest,
  }) => {
    const authApi = new AuthAPI(unauthenticatedRequest);
    const response = await authApi.login(loginData, {
      accept: "text/html",
    });
    expect(response.status()).toBe(200);
  });

  test("Case 13: Login - No Content-Type header", async ({
    unauthenticatedRequest,
  }) => {
    const authApi = new AuthAPI(unauthenticatedRequest);
    const response = await authApi.login(loginData, {});
    expect(response.status()).toBe(200);
  });

  test("Case 14: Login - Empty Content-Type header", async ({
    unauthenticatedRequest,
  }) => {
    const authApi = new AuthAPI(unauthenticatedRequest);
    const response = await authApi.login(loginData, {
      "Content-Type": "",
    });
    expect(response.status()).toBe(200);
  });

  test("Case 15: Login failed - Invalid Content-Type header", async ({
    unauthenticatedRequest,
  }) => {
    const authApi = new AuthAPI(unauthenticatedRequest);
    const response = await authApi.login(loginData, {
      "Content-Type": "text/plain",
    });
    expect(response.status()).toBe(422);
  });
});
