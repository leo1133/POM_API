// import {
//     authTest as test,
//     authExpect as expect,
// } from "../src/fixtures/login.fixtures.js";
// import { AuthAPI } from "../src/api/login.api.js";
// import { loginData } from "../test-data/loginData.js";
// import {
//     generateRandomString,
//     generateRandomEmail,
//     generateOtherMethodNotChoose,
// } from "../utils/helpers.js";
// import { METHODS } from "../utils/constants.js";

// test.describe("API Auth Login Suite", () => {
//     test("Case 1: Login successfully", async ({ unauthenticatedRequest }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login(loginData);

//         expect(response.status()).toBe(200);
//         const body = await response.json();

//         expect(body.access_token).toBeDefined();
//         expect(typeof body.access_token).toBe("string");
//         expect(body.access_token).not.toBe("");

//         expect(body.refresh_token).toBeDefined();
//         expect(typeof body.refresh_token).toBe("string");

//         expect(body.firebase_access_token).toBeDefined();
//         expect(typeof body.firebase_access_token).toBe("string");

//         expect(typeof body.is_agency).toBe("boolean");
//         expect(body.is_agency).toBe(false);
//     });

//     test("Case 2: Login failed with wrong password", async ({
//         unauthenticatedRequest,
//     }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login({
//             ...loginData,
//             password: generateRandomString(20, true, true),
//         });

//         expect(response.status()).toBe(401);
//         expect(response.headers()["content-type"]).toContain("application/json");
//         await expect(response.json()).resolves.toEqual({
//             detail: loginData.errorMessages,
//         });
//     });

//     test("Case 3: Login failed with wrong account", async ({
//         unauthenticatedRequest,
//     }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);

//         const response = await authApi.login({
//             ...loginData,
//             email_user_id: generateRandomEmail(true),
//         });

//         expect(response.status()).toBe(401);
//         expect(response.headers()["content-type"]).toContain("application/json");
//         await expect(response.json()).resolves.toEqual({
//             detail: loginData.errorMessages,
//         });
//     });

//     const invalidMethods = generateOtherMethodNotChoose(METHODS.POST);

//     invalidMethods.forEach((method, index) => {
//         test(`Case ${index + 4}: Login failed with ${method} method`, async ({
//             unauthenticatedRequest,
//         }) => {
//             const authApi = new AuthAPI(unauthenticatedRequest);
//             const response = await authApi.loginWithMethod(method);

//             expect(response.status()).toBe(405);
//             expect(response.headers()["content-type"]).toContain("application/json");

//             const body = await response.json();
//             expect(body).toHaveProperty("detail");
//             expect(body.detail).toBe("Method Not Allowed");
//         });
//     });

//     test("Case 8: Login - No header", async ({ unauthenticatedRequest }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login(loginData, {});
//         expect(response.status()).toBe(200);
//     });

//     test("Case 9: Login - Empty header", async ({ unauthenticatedRequest }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login(loginData, {
//             accept: "",
//             "Content-Type": "",
//         });
//         expect(response.status()).toBe(200);
//     });

//     test("Case 10: Login - No Accept header", async ({
//         unauthenticatedRequest,
//     }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login(loginData, {});
//         expect(response.status()).toBe(200);
//     });

//     test("Case 11: Login - Empty Accept header", async ({
//         unauthenticatedRequest,
//     }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login(loginData, {
//             accept: "",
//         });
//         expect(response.status()).toBe(200);
//     });

//     test("Case 12: Login - Invalid Accept header", async ({
//         unauthenticatedRequest,
//     }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login(loginData, {
//             accept: "text/html",
//         });
//         expect(response.status()).toBe(200);
//     });

//     test("Case 13: Login - No Content-Type header", async ({
//         unauthenticatedRequest,
//     }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login(loginData, {});
//         expect(response.status()).toBe(200);
//     });

//     test("Case 14: Login - Empty Content-Type header", async ({
//         unauthenticatedRequest,
//     }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login(loginData, {
//             "Content-Type": "",
//         });
//         expect(response.status()).toBe(200);
//     });

//     test("Case 15: Login failed - Invalid Content-Type header", async ({
//         unauthenticatedRequest,
//     }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login(loginData, {
//             "Content-Type": "text/plain",
//         });
//         expect(response.status()).toBe(422);
//     });

//     const invalidContentTypes = [
//         {
//             type: "text/plain",
//             payload: "email=admin@example.com&password=123",
//         },
//         {
//             type: "application/x-www-form-urlencoded",
//             payload: new URLSearchParams({
//                 email_user_id: loginData.email_user_id,
//                 password: loginData.password,
//             }).toString(),
//         },
//         {
//             type: "application/xml",
//             payload: `<xml><email>${loginData.email_user_id}</email><password>${loginData.password}</password></xml>`,
//         },
//     ];

//     invalidContentTypes.forEach(({ type, payload }, index) => {
//         test(`Case ${index + 16}: Login failed - Invalid body - ${type}`, async ({ unauthenticatedRequest }) => {
//             const authApi = new AuthAPI(unauthenticatedRequest);

//             const response = await authApi.login(payload, {
//                 "Content-Type": type,
//             });

//             expect(response.status()).toBe(422);
//         });
//     });
//     // ------------------------------------------------------------------
//     // 3. FIELD VALIDATION ERRORS (422 Unprocessable Entity)
//     // ------------------------------------------------------------------

//     // --- MISSING FIELDS ---
//     test("Case 22: Missing all fields", async ({ unauthenticatedRequest }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login({});

//         expect(response.status()).toBe(422);
//     });

//     test("Case 23: Missing email field", async ({ unauthenticatedRequest }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const { email_user_id, ...payloadWithoutEmail } = loginData;
//         const response = await authApi.login(payloadWithoutEmail);

//         expect(response.status()).toBe(422);
//     });

//     test("Case 24: Missing password field", async ({ unauthenticatedRequest }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const { password, ...payloadWithoutPassword } = loginData;
//         const response = await authApi.login(payloadWithoutPassword);

//         expect(response.status()).toBe(422);
//     });

//     test("Case 25: Missing login type field", async ({ unauthenticatedRequest }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const { login_type, ...payloadWithoutLoginType } = loginData;
//         const response = await authApi.login(payloadWithoutLoginType);

//         expect(response.status()).toBe(200);
//     });

//     // --- EMAIL VALIDATIONS ---
//     test("Case 26: Email blank", async ({ unauthenticatedRequest }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login({
//             ...loginData,
//             email_user_id: "",
//         });

//         expect(response.status()).toBe(422);
//     });

//     test("Case 27: Email null", async ({ unauthenticatedRequest }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login({
//             ...loginData,
//             email_user_id: null,
//         });

//         expect(response.status()).toBe(422);
//     });

//     test("Case 28: Invalid email format", async ({ unauthenticatedRequest }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login({
//             ...loginData,
//             email_user_id: "invalid-email-format-without-at",
//         });

//         expect(response.status()).toBe(401);
//     });

//     test("Case 29: Email not string (number)", async ({ unauthenticatedRequest }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login({
//             ...loginData,
//             email_user_id: 123456789,
//         });

//         expect(response.status()).toBe(422);
//     });

//     // --- PASSWORD VALIDATIONS ---
//     test("Case 30: Password blank", async ({ unauthenticatedRequest }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login({
//             ...loginData,
//             password: "",
//         });

//         expect(response.status()).toBe(422);
//     });

//     test("Case 31: Password null", async ({ unauthenticatedRequest }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login({
//             ...loginData,
//             password: null,
//         });

//         expect(response.status()).toBe(422);
//     });

//     test("Case 32: Password not string (boolean)", async ({ unauthenticatedRequest }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login({
//             ...loginData,
//             password: true,
//         });

//         expect(response.status()).toBe(422);
//     });

//     // --- LOGIN TYPE VALIDATIONS ---
//     test("Case 33: Login type blank", async ({ unauthenticatedRequest }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login({
//             ...loginData,
//             login_type: "",
//         });

//         expect(response.status()).toBe(422);
//     });

//     test("Case 34: Login type null", async ({ unauthenticatedRequest }) => {
//         const authApi = new AuthAPI(unauthenticatedRequest);
//         const response = await authApi.login({
//             ...loginData,
//             login_type: null,
//         });

//         expect(response.status()).toBe(200);
//     });
// });
