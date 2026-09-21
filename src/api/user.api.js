import { BaseAPI } from "./base.api.js";
import { ENDPOINTS } from "../config/endpoint.js";

export class UserAPI extends BaseAPI {
  constructor(request) {
    super(request);
    this.userEndpoint = ENDPOINTS.USER.GET_LIST;
  }

  /**
   * Lấy danh sách User
   * @param {Object} [params] Query parameters (page, items_per_page, sort_field, sort_order)
   * @param {Object} [customHeaders] Header tùy chỉnh nếu muốn override
   */
  async getUsers(params = {}, customHeaders) {
    const defaultHeaders = this.getHeaders();
    const headers =
      customHeaders !== undefined
        ? { ...defaultHeaders, ...customHeaders }
        : defaultHeaders;

    // Gán tham số mặc định theo cURL nếu người dùng không truyền vào
    const queryParams = {
      page: 1,
      items_per_page: 10,
      sort_field: "id",
      sort_order: "desc",
      ...params,
    };

    return await this.get(this.userEndpoint, {
      headers,
      params: queryParams,
    });
  }
}
