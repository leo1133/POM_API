# POM API Test Automation Framework

Dự án kiểm thử tự động **API**, được xây dựng trên nền tảng **[Playwright](https://playwright.dev/)**.

---

## 📑 Mục lục

1. [Tổng quan kiến trúc](#-tổng-quan-kiến-trúc)
2. [Cấu trúc thư mục & Giải thích chi tiết](#-cấu-trúc-thư-mục--giải-thích-chi-tiết)
3. [Cài đặt & Biến môi trường](#-cài-đặt--biến-môi-trường)
4. [Hướng dẫn chạy kiểm thử](#-hướng-dẫn-chạy-kiểm-thử)
5. [Quy chuẩn & Hướng dẫn mở rộng](#-quy-chuẩn--hướng-dẫn-mở-rộng)

---

## 🏛 Tổng quan kiến trúc

Dự án áp dụng các mô hình chuẩn trong kiểm thử tự động API:

- **API Object Model (AOM/POM biến tấu)**: Đóng gói các HTTP endpoint thành các class service có thể tái sử dụng.
- **Custom Test Fixtures**: Tự động inject dependency (ví dụ: `authAPI`, `authenticatedRequest`, `unauthenticatedRequest`).
- **Data-Driven Testing (DDT)**: Phân tách cấu trúc dữ liệu kiểm thử ra khỏi logic test, sử dụng các thư viện hỗ trợ (như `csv-parse` nếu cần).

---

## 📂 Cấu trúc thư mục & Giải thích chi tiết

```text
POM_API/
├── .env.dev                    # Biến môi trường cho môi trường Dev
├── .env.stg                    # Biến môi trường cho môi trường Staging
├── package.json                # Danh sách dependencies và các scripts thực thi
├── playwright.config.js        # File cấu hình trung tâm của Playwright Test Runner
│
├── src/                        # Mã nguồn khung kiểm thử (Framework Source)
│   ├── api/                    # API Services Wrapper (API Object Model)
│   │   ├── base.api.js         # Gửi request chung và bắt lỗi cơ bản
│   │   ├── login.api.js        # Xử lý các endpoint xác thực (Login)
│   │   └── user.api.js         # Xử lý các endpoint quản lý người dùng
│   │
│   ├── config/                 # Cấu hình dự án 
│   │
│   └── fixtures/               # Playwright Custom Fixtures
│       └── login.fixtures.js   # Khởi tạo ngữ cảnh tự động cho các test case liên quan đăng nhập
│
├── test-data/                  # Dữ liệu phục vụ kiểm thử (Test Data)
│   └── loginData.js            # Dữ liệu kiểm thử cho luồng Đăng nhập (payload, header, status mong muốn)
│
├── tests/                      # Kịch bản kiểm thử (Test Specs)
│   ├── auth/                   # Chứa các bài test hoặc cache xác thực đặc thù
│   ├── login.spec.js           # Kịch bản kiểm tra chức năng Login (Happy path, Validation, Errors)
│   └── user.spec.js            # Kịch bản kiểm tra chức năng User
│
└── utils/                      # Thư viện tiện ích (Helpers & Constants)
    ├── constants.js            # Các hằng số định nghĩa sẵn (METHODS, HTTP_STATUS_CODE, v.v)
    └── helpers.js              # Các hàm tiện ích (tạo chuỗi ngẫu nhiên, tạo email ngẫu nhiên...)
```

---

## ⚙️ Cài đặt & Biến môi trường

### 1. Danh sách thư viện & Lệnh cài đặt

Dự án sử dụng các gói thư viện sau:

| Thư viện               | Mục đích                                                      | Lệnh cài đặt                      |
| :--------------------- | :------------------------------------------------------------ | :-------------------------------- |
| **`@playwright/test`** | Core Test Runner cho UI & API Testing                         | `npm install -D @playwright/test` |
| **`dotenv`**           | Quản lý nạp biến môi trường (`.env.dev`, `.env.stg`)          | `npm install -D dotenv`           |
| **`csv-parse`**        | Parser đọc và chuyển đổi file CSV phục vụ Data-Driven Testing | `npm install csv-parse`           |

#### Cài đặt toàn bộ dự án từ đầu:

```bash
# 1. Cài đặt tất cả dependencies từ package.json
npm install

# 2. Cài đặt trình duyệt Playwright (Chromium) để hỗ trợ chạy UI mode nếu cần thiết
npx playwright install
```

### 2. Cấu hình biến môi trường (Environment - `dotenv`)

Hệ thống hỗ trợ chạy đa môi trường (Dev, Staging) thông qua cờ `ENV=<env>`. Tạo các file `.env.dev` hoặc `.env.stg` ở thư mục gốc:

```env
# URL Cấu hình
UI_BASE_URL=https://admin-dev.surrealdolls.com
API_BASE_URL=https://api-admin-dev.surrealdolls.com

# HTTP Basic Auth (Lớp bảo vệ server / popup trình duyệt)
BASIC_AUTH_USER=suriaru
BASIC_AUTH_PASS=suriaru

# Tài khoản Admin dùng để test
email_user_id=admin@admin.com
id=admin
password=!Ch4ng3Th1sP4ssW0rd!
login_type=1
```

---

## 🚀 Hướng dẫn chạy kiểm thử

### 1. Lệnh NPM Scripts có sẵn

| Lệnh                  | Mô tả                                                        | Chi tiết lệnh thực thi                 |
| :-------------------- | :----------------------------------------------------------- | :------------------------------------- |
| `npm run test:dev`    | Chạy toàn bộ test suites trên môi trường **Dev**             | `ENV=dev npx playwright test`          |
| `npm run test:stg`    | Chạy toàn bộ test suites trên môi trường **Staging**         | `ENV=staging npx playwright test`      |
| `npm run test:ui:dev` | Mở giao diện tương tác **Playwright UI Mode** (Dev)          | `ENV=dev npx playwright test --ui`     |
| `npm run test:ui:stg` | Mở giao diện tương tác **Playwright UI Mode** (Staging)      | `ENV=staging npx playwright test --ui` |
| `npm run report`      | Mở báo cáo kết quả kiểm thử HTML gần nhất                    | `npx playwright show-report`           |
| `npm run codegen:dev` | Mở công cụ Playwright Codegen để sinh mã tự động             | `ENV=dev npx playwright codegen ...`   |

### 2. Chạy kịch bản chi tiết (CLI)

```bash
# Chạy một file test cụ thể trên môi trường Dev
ENV=dev npx playwright test tests/login.spec.js

# Chạy ở chế độ Debug (có UI từng bước)
ENV=dev npx playwright test tests/login.spec.js --debug

# Chạy có hiển thị giao diện UI Runner
ENV=dev npx playwright test --ui
```

---

## 📝 Quy chuẩn & Hướng dẫn mở rộng

Dự án này tách biệt hoàn toàn Logic Gọi API (`src/api`), Dữ Liệu Test (`test-data`) và Mã Chạy Test (`tests`).

### Thêm một API Service mới:

1. **Khởi tạo Class API**: Tạo class mới trong thư mục `src/api/` (VD: `product.api.js`), kế thừa hàm xử lý hoặc sử dụng biến `request` context trực tiếp. 
2. **Khai báo Dữ liệu (Test Data)**: Khởi tạo file trong `test-data/` (VD: `productData.js`) chứa các kịch bản đúng, kịch bản lỗi, và kết quả mong muốn (`expected status/body`).
3. **Sử dụng Fixtures**: Đăng ký service này vào Fixtures của Playwright (nếu có sử dụng mô hình Fixtures) tại `src/fixtures/` để có thể nhúng trực tiếp (inject) vào hàm test.
4. **Viết Test Spec**: Viết file kịch bản trong thư mục `tests/` (VD: `tests/product.spec.js`) sử dụng `test` và `expect` của Playwright kết hợp với data đã chuẩn bị. 
