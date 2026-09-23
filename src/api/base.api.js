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

  async get(endpoint, options = {}) {
    return await this.request.get(endpoint, options);
  }

  async post(endpoint, payload, options = {}) {
    return await this.request.post(endpoint, {
      data: payload,
      ...options,
    });
  }

  async put(endpoint, payload, options = {}) {
    return await this.request.put(endpoint, {
      data: payload,
      ...options,
    });
  }

  async patch(endpoint, payload, options = {}) {
    return await this.request.patch(endpoint, {
      data: payload,
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return await this.request.delete(endpoint, options);
  }
}
