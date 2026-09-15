// src/api/login.api.js (hoặc src/api/auth.api.js)
import { BaseAPI } from "./base.api.js";

export class AuthAPI extends BaseAPI {
  /**
   * @param {import('@playwright/test').APIRequestContext | import('../fixtures/login.fixtures.js').CustomApiClient} request
   */
  constructor(request) {
    super(request);
    this.loginEndpoint = "/api/v1/auth/login/";
  }

  /**
   * Gọi API Login (POST)
   * @param {Object} payload - Thông tin credentials (email_user_id, password, login_type,...)
   * @param {Object} [customHeaders] - Header tùy chỉnh (nếu có)
   */
  async login(payload, customHeaders) {

    // 1. Lấy headers mặc định từ BaseAPI
    const defaultHeaders = this.getHeaders();

    // 2. Gộp defaultHeaders và customHeaders (customHeaders sẽ đè lên nếu trùng tên key)
    const headers = customHeaders !== undefined
      ? { ...defaultHeaders, ...customHeaders }
      : defaultHeaders;
    // const headers =
    //   customHeaders !== undefined ? customHeaders : this.getHeaders();
    return await this.post(this.loginEndpoint, payload, headers);
  }

  /**
   * Gọi API Login với các HTTP Method không hợp lệ để test đường biên (405 Method Not Allowed)
   * @param {string} method - 'GET' | 'PUT' | 'PATCH' | 'DELETE'
   * @param {Object} [customHeaders] - Header tùy chỉnh (nếu có)
   */
  async loginWithMethod(method, customHeaders) {
    const headers =
      customHeaders !== undefined ? customHeaders : this.getHeaders();
    const httpMethod = method.toUpperCase();

    switch (httpMethod) {
      case "GET":
        return await this.get(this.loginEndpoint, headers);
      case "PUT":
        return await this.put(this.loginEndpoint, headers);
      case "PATCH":
        return await this.patch(this.loginEndpoint, headers);
      case "DELETE":
        return await this.delete(this.loginEndpoint, headers);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}
