export class BaseAPI {
  /**
   * @param {import('@playwright/test').APIRequestContext} request
   */
  constructor(request) {
    this.request = request;
  }

  getHeaders(customHeaders = {}) {
    return {
      "Content-Type": "application/json",
      ...customHeaders,
    };
  }

  async get(endpoint, headers) {
    return await this.request.get(endpoint, { headers });
  }

  async post(endpoint, payload, headers) {
    return await this.request.post(endpoint, {
      data: payload,
      headers,
    });
  }

  async put(endpoint, headers) {
    return await this.request.put(endpoint, { headers });
  }

  async patch(endpoint, headers) {
    return await this.request.patch(endpoint, { headers });
  }

  async delete(endpoint, headers) {
    return await this.request.delete(endpoint, { headers });
  }
}
