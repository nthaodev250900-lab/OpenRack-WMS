# OpenRack WMS

Basecode quản lý kho với Next.js App Router, TypeScript, React, Prisma/MySQL, next-intl và Tailwind CSS. Mặc định tiếng Việt và bảng màu Regent St Blue.

## Chạy nhanh

Yêu cầu Node.js 22.12+ (khuyến nghị LTS) và npm. Trên Windows PowerShell bị chặn script, dùng `npm.cmd` / `npx.cmd` thay cho `npm` / `npx`.

```sh
npm ci
npm run db:generate
npm run dev
```

Mở http://localhost:3000. Nếu chưa đặt `DATABASE_URL`, ứng dụng sử dụng dữ liệu mẫu **chỉ đọc**, không giả lập lưu dữ liệu thành công. Đổi ngôn ngữ và chế độ sáng/tối vẫn hoạt động qua cookie/trình duyệt.

## Kết nối MySQL

1. Sao chép `.env.example` thành `.env`.
2. Cấu hình `DATABASE_URL` trỏ đến MySQL 8; có thể khởi động MySQL phát triển bằng `docker compose up -d`.
3. Đặt `SEED_ADMIN_EMAIL` và `SEED_ADMIN_PASSWORD` (12–128 ký tự).
4. Chạy:

```sh
npm run db:migrate
npm run db:seed
npm run dev
```

Prisma CLI đọc `.env`; seed dùng `tsx` nên truyền môi trường qua Node:

```sh
node --env-file=.env --import tsx prisma/seed.ts
```

Lệnh `db:seed` cũng tự đọc `.env` (qua `dotenv/config`). Seed tạo một công ty, quản trị viên và dữ liệu kho minh họa; chạy lại không ghi đè số lượng tồn hoặc mật khẩu hiện có. Chỉ seed trên môi trường mới/phát triển. Không đưa `.env` hoặc mật khẩu vào Git. Docker Compose chỉ dành cho phát triển; đổi mật khẩu và cấu hình MySQL phù hợp trước khi vận hành.

## Cấu trúc

```text
messages/                 # Từ điển vi-VN / en-US, cùng bộ khóa
prisma/
  schema.prisma           # Mô hình và quan hệ dữ liệu
  migrations/             # Migration SQL MySQL đầu tiên
  seed.ts                 # Khởi tạo dữ liệu có kiểm tra mật khẩu
src/
  app/                    # Route, layout, API chỉ đọc
    (workspace)/          # Vùng làm việc có bảo vệ đăng nhập
  actions/                # Server Actions: kiểm tra đầu vào + phân quyền
  components/
    ui/                   # Button, Card, Field, Modal, Badge, Toast
    layout/               # Header, Sidebar, ngôn ngữ và chế độ hiển thị
  features/               # Component/kiểu dữ liệu theo nghiệp vụ
    auth/ dashboard/ warehouse/ stock/ settings/ reports/ qr/
  services/stock.ts       # Giao dịch tồn kho và nhật ký nguyên tử
  theme/                  # Palette OKLCH, tương phản, đọc cấu hình công ty
  i18n/                   # Locale duy nhất cho server/client
  lib/                    # Prisma singleton, phiên đăng nhập, lỗi, định dạng, CSV
tests/                    # Kiểm tra logic, phân quyền, persistence bằng mock
e2e/                      # Kiểm tra trình duyệt trên bản production
```

Quy tắc mở rộng: trang chỉ tải dữ liệu và ghép tính năng; component tính năng xử lý giao diện; Server Action kiểm tra Zod và quyền; service giữ các bất biến nghiệp vụ; không truy cập Prisma từ Client Component. Chuỗi giao diện nằm trong `messages/`. Màu giao diện dùng token CSS; bảng màu thương hiệu được sinh trong `theme/palette.ts`, màu ngữ nghĩa được định nghĩa riêng trong `globals.css`.

## Phân quyền và nghiệp vụ

- `ADMIN`: tạo kho/khu vực/kệ/ô chứa/sản phẩm/thành viên; nhập/xuất/chuyển; lưu thương hiệu và thiết lập công ty.
- `OPERATOR`: xem dữ liệu và nhập/xuất/chuyển kho.
- `VIEWER`: xem dữ liệu, báo cáo và mã QR.
- Mọi tài khoản: đổi ngôn ngữ và chế độ sáng/tối cá nhân.

Phiên đăng nhập 7 ngày lưu trong MySQL bằng SHA-256 của token ngẫu nhiên; cookie HttpOnly, SameSite=Lax và Secure trên production. Mật khẩu băm bcrypt; khóa đăng nhập 15 phút sau 5 lần sai cho tài khoản tồn tại. Server Actions dùng kiểm tra nguồn gốc của Next.js. Khi đưa hệ thống lên Internet, cấu hình rate limit tại reverse proxy cho đăng nhập và request nói chung.

Nhập/xuất/chuyển dùng transaction Serializable, cập nhật số dư có điều kiện, kiểm tra sức chứa tổng của ô chứa và lưu nhật ký trong cùng transaction; tự thử lại tối đa 3 lần khi xung đột serialization. Không sửa hoặc xóa giao dịch đã ghi nhận. Đơn vị tồn kho hiện tại là số nguyên; không hỗ trợ lô, hạn sử dụng, đặt trước hoặc đơn vị quy đổi trong bản nền.

## Ngôn ngữ và giao diện

- `vi-VN` mặc định, `en-US` tùy chọn. Đổi ngôn ngữ không đổi đường dẫn/query/filter; người đăng nhập lưu vào `User`, khách lưu cookie.
- Thời gian hiển thị theo múi giờ công ty, mặc định `Asia/Ho_Chi_Minh`; DB dùng UTC (cấu hình máy chủ MySQL về UTC).
- Trang `/settings/appearance` có preset, HEX/color picker, sinh 11 sắc độ OKLCH, chọn chữ trắng/đen đạt tương phản AA trên nút, preview, Apply tạm, Save, Cancel và xác nhận Reset.
- Preview không ghi DB; Apply chỉ áp dụng tạm vào trang hiện tại; rời trang hoặc Cancel sẽ trả lại cấu hình đã lưu. Save kiểm tra quyền admin, ghi `ThemeSetting`, áp dụng không tải lại toàn trang. Reset đưa bảng màu về mặc định trong preview; cần Save để lưu cho công ty.
- Cấu hình công ty được đọc từ DB trên request. Các phiên đang mở đồng bộ thương hiệu mỗi 60 giây hoặc khi quay lại tab; thay đổi locale/mode của tài khoản được nhận khi tải lại trang.
- Light/Dark/System dùng một `next-themes` provider. Màu thành công/cảnh báo/nguy hiểm/sức chứa không đổi theo thương hiệu. Focus, nhãn, dialog bàn phím và reduced motion được hỗ trợ.

## Báo cáo và QR

Tìm kiếm/lọc/phân trang giữ trên URL. Xuất CSV UTF-8 BOM tương thích Excel, bảo vệ công thức CSV; xuất toàn bộ bản ghi đang lọc. PDF dùng hộp thoại in của trình duyệt. Chưa có tệp `.xlsx` hoặc bộ dựng PDF riêng. Báo cáo hiện tại là ảnh chụp tồn kho theo vị trí; lịch sử giao dịch được hiển thị tối đa 1.000 bản ghi mới nhất. QR chứa mã ô chứa, có tải PNG, in và tra cứu từ máy quét dạng bàn phím; chưa có camera scanner.

API `GET /api/inventory` và `GET /api/theme` yêu cầu phiên đăng nhập khi có DB; chế độ demo trả dữ liệu mẫu. Ghi dữ liệu qua Server Actions cùng nguồn, không mở REST ghi công khai.

## Kiểm tra

```sh
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npx playwright test
npm run format:check
```

E2E khởi động production server trên port 3000 và kiểm tra demo; chạy trong môi trường **không đặt `DATABASE_URL`**. Unit test dùng mock cho DB và không chứng minh transaction/persistence trên MySQL thật. Kiểm tra tích hợp MySQL và kiểm thử tải là bước cần thực hiện trên môi trường DB triển khai.

## Phạm vi bản nền

Đây là dự án được tạo mới vì thư mục ban đầu không có mã nguồn. Không có tính năng cũ để di chuyển. Bản nền có tạo và xem danh mục, ghi giao dịch, quản lý tài khoản ban đầu, tùy chọn và báo cáo cơ bản. Chưa có sửa/xóa danh mục, chỉnh quyền thành viên sau khi tạo, quên/đổi mật khẩu, gửi email, MFA, camera scanner hoặc báo cáo nâng cao. Thiết kế dành cho **một công ty**, không triển khai đa tenant.
