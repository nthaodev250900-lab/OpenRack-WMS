# Kết quả kiểm tra bản nền

Thực hiện ngày 02/11/2026 trên Windows, Node.js 26.13.0.

| Kiểm tra                        | Kết quả                                       |
| ------------------------------- | --------------------------------------------- |
| TypeScript `npm run typecheck`  | Đạt                                           |
| ESLint `npm run lint`           | Đạt, không cảnh báo                           |
| Prettier `npm run format:check` | Đạt                                           |
| Vitest `npm test`               | 56/56 kiểm thử đạt                            |
| Production `npm run build`      | Đạt, 11 route động                            |
| Playwright `npm run test:e2e`   | 9/9 kiểm thử đạt                              |
| `npm audit`                     | 0 lỗ hổng được báo cáo tại thời điểm kiểm tra |

Unit test kiểm tra bộ khóa dịch, bản dịch, số/ngày giờ theo locale, bảng màu Regent St Blue chính xác, màu tùy chỉnh và tương phản, phân quyền, cookie/người dùng/công ty bằng mock, số dư/sức chứa và nhật ký trong transaction bằng mock, phòng công thức CSV.

Playwright chạy Chromium trên bản production ở chế độ demo: ngôn ngữ mặc định, giữ query/filter khi đổi ngôn ngữ, lưu qua reload, preview không ghi cấu hình, Apply/Cancel/Reset, màu không hợp lệ, thông báo demo chỉ đọc, Light/Dark/System, QR, các trang lõi ở cả hai ngôn ngữ, điều hướng mobile, ảnh desktop/mobile và axe-core WCAG AA tự động. Kiểm tra màu tùy chỉnh bao gồm trắng, đen và vàng.

Đã khắc phục vấn đề tương phản tạm thời do chuyển màu chữ/nền khi đổi màu thương hiệu cực sáng/cực tối. Chữ và nền hiện đổi đồng thời; hiệu ứng nhỏ chỉ áp dụng cho viền và bóng.

## Chưa xác minh trên môi trường này

- Máy không có Docker hoặc MySQL server. Migration SQL đã được tạo nhưng **chưa áp dụng vào MySQL thật**. Seed, đăng nhập với DB, lưu cấu hình sau khởi động lại server và giao dịch đồng thời cần được kiểm tra tích hợp trên MySQL.
- Kiểm thử DB trong Vitest dùng mock, không chứng minh hành vi cách ly hoặc rollback thực tế của MySQL.
- axe-core và kiểm tra tương phản tự động không thay thế đánh giá WCAG đầy đủ bằng bàn phím, trình đọc màn hình và người dùng thực.
- Workflow GitHub Actions được cung cấp nhưng chưa chạy trên GitHub.

Hướng dẫn cấu hình và giới hạn nghiệp vụ nằm trong [README](../README.md).
