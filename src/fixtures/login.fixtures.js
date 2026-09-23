import { test as base, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { ENDPOINTS } from "../config/endpoint.js";

const authDir = path.join(process.cwd(), "tests", "auth");
const authFile = path.join(authDir, "user.json");

// 1. CustomApiClient Wrapper Class
export class CustomApiClient {
  constructor(requestContext, isAuthRequest = true) {
    this.requestContext = requestContext;
    this.isAuthRequest = isAuthRequest; // Đánh dấu Request này có bắt buộc Authen hay không
  }

  async handleRequest(requestFn) {
    const response = await requestFn();

    // CHỈ tự động xóa token và báo lỗi nếu đây là một Authenticated Request
    if (
      this.isAuthRequest &&
      (response.status() === 401 || response.status() === 403)
    ) {
      if (fs.existsSync(authFile)) {
        try {
          fs.unlinkSync(authFile);
          console.log("Token expired/invalid. Token file deleted.");
        } catch (e) {
          console.error("Failed to delete token file:", e);
        }
      }
    }

    // Luôn trả về response để hàm test (hoặc expect) tự xử lý assertion
    return response;
  }

  async get(url, options) {
    return this.handleRequest(() => this.requestContext.get(url, options));
  }

  async post(url, options) {
    return this.handleRequest(() => this.requestContext.post(url, options));
  }

  async put(url, options) {
    return this.handleRequest(() => this.requestContext.put(url, options));
  }

  async patch(url, options) {
    return this.handleRequest(() => this.requestContext.patch(url, options));
  }

  async delete(url, options) {
    return this.handleRequest(() => this.requestContext.delete(url, options));
  }

  async fetch(urlOrRequest, options) {
    return this.handleRequest(() =>
      this.requestContext.fetch(urlOrRequest, options),
    );
  }
}

/**
 * Hàm lấy token linh hoạt
 */
async function getOrFetchToken(playwright) {
  if (fs.existsSync(authFile)) {
    try {
      const fileContent = fs.readFileSync(authFile, "utf-8");
      const { access_token } = JSON.parse(fileContent);
      if (access_token) {
        console.log("Using existing token from:", authFile);
        return access_token;
      }
    } catch (e) {
      console.log("Token file corrupted. Re-logging in...");
      if (fs.existsSync(authFile)) fs.unlinkSync(authFile);
    }
  }

  console.log("Token not found! Executing auto-login...");
  const requestContext = await playwright.request.newContext();

  const response = await requestContext.post(ENDPOINTS.AUTH.LOGIN, {
    data: {
      email_user_id: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      login_type: env.LOGIN_TYPE,
    },
  });

  if (response.status() !== 200) {
    throw new Error(`Auto-login failed with status ${response.status()}`);
  }

  const body = await response.json();

  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
  fs.writeFileSync(
    authFile,
    JSON.stringify({ access_token: body.access_token }, null, 2),
  );
  console.log("Auto-login successful & token saved to:", authFile);

  await requestContext.dispose();
  return body.access_token;
}

// 2. Define Custom Fixtures
export const authTest = base.extend({
  // Fixture dành cho API bắt buộc Authenticated
  authenticatedRequest: async ({ playwright }, use) => {
    const access_token = await getOrFetchToken(playwright);

    const rawContext = await playwright.request.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // Truyền isAuthRequest = true (Mặc định)
    const customClient = new CustomApiClient(rawContext, true);

    await use(customClient);
    await rawContext.dispose();
  },

  // Fixture dành cho Unauthenticated Request
  unauthenticatedRequest: async ({ playwright }, use) => {
    const rawContext = await playwright.request.newContext({
      extraHTTPHeaders: {},
    });

    // Truyền isAuthRequest = false -> Tắt cơ chế throw Error khi gặp 401/403
    const customClient = new CustomApiClient(rawContext, false);

    await use(customClient);
    await rawContext.dispose();
  },
});

export { expect as authExpect };
