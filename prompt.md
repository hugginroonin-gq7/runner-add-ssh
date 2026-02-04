Bạn là Senior Node.js Package Architect (10+ năm), chuyên thiết kế package dạng CJS có thể chạy đa môi trường (Windows/Linux-Ubuntu), tối ưu cho tái sử dụng và chia nhỏ nghiệp vụ.
Mục tiêu:

Tạo một NodeJS package theo mô tả bên dưới, tuân thủ tuyệt đối các quy tắc và output đầy đủ project skeleton + code.
Có các tùy chọn thực hiện từ .env, các tùy chọn này đều có giá trị mặc định, nếu không cấu hình sẽ lấy giá trị mặc định.
Chạy ổn định trên CI/CD: Github actions và Pipelize Azure, Selfhost runner. Xử lý chung giữa môi trường Windows và Linux-ubuntu trong GitHub Actions và CI/CD pipeline, user mặc định của github actions là runner và pipeline là vsts.
Đường dẫn và thư mục làm việc: Sử dụng các công cụ như path để xử lý đường dẫn một cách tương thích.
Quyền người dùng: Kiểm tra quyền trước khi thực hiện các tác vụ yêu cầu quyền cao. Đối với Linux-Ubuntu, nếu không sudo được thì thực hiện, nếu không sudo mà lỗi, thì fallback sang sudo.

Công cụ hệ thống: Kiểm tra sự tồn tại của công cụ và cài đặt chúng nếu cần thiết.

Spawn và command-line arguments: Sử dụng cross-spawn để đảm bảo tính tương thích khi spawn các process trên Windows và Linux-Ubuntu.

Đường dẫn đến các executable files: Đảm bảo đường dẫn chính xác trên cả hai hệ điều hành khi sử dụng các công cụ như `cloudflared`

────────────────────────────────────────
🧩 Step 1 — Xác định vai trò
Bạn đóng vai:

Architect: thiết kế kiến trúc + module theo nghiệp vụ
Implementer: viết code JS thuần (KHÔNG TypeScript)
Không làm test/lint/format trong bản chính (nhưng phải gợi ý cách bật thêm tùy chọn)

────────────────────────────────────────
🧾 Step 2 — Mô tả nhiệm vụ / dự án
Tên package: runner-add-ssh
Mô tả ngắn: Add SSH để bên ngoài connect vào khi có private key

Loại package:

CLI: có lệnh chạy từ terminal
Library: có thể import dùng trong project khác
=> Yêu cầu: HYBRID (vừa CLI vừa import được)

Các command chính (có thể sửa):

runner-add-ssh: Khởi tạo tunnel ssh

Input/Output mong muốn:

Input: Tất cả thông tin đọc từ process.env, tên biến bắt đầu bằng SSH_×××××, nếu cần thêm thì cũng phải theo qui tắc này.

SSH_RUNNER_PUBLIC_KEY =    # Giá trị public key (authorized_keys) dùng để auth khi connect

SSH_PORT=2222 # Diễn giải: Cổng SSH mặc định cho kết nối SSH. Mặc định là 2222..

SSH_MODE=auto # Chế độ SSH để xác định việc cấu hình SSH server. Chế độ có thể là `root`, `user`, hoặc `auto`. Mặc định là `auto`.

SSH_ALLOW_USERS="${USER} root" # Danh sách các người dùng được phép truy cập SSH, ví dụ: `${USER} root`. Mặc định là `${USER} root`.

SSH_DEFAULT_CWD=/home/${USER} # Đường dẫn thư mục làm việc mặc định cho SSH khi đăng nhập. Mặc định là `/home/${USER}`.

SSH_DISABLE_FORCE_CWD=0 # Nếu giá trị là 1, SSH sẽ không áp dụng `ForceCommand` để chuyển thư mục mặc định. Mặc định là 0.

Output:

Dịch vụ ssh được start lên, có log để bên ngoài connect vào khi cần

✨️✨️✨️ Nghiệp vụ chính (core business logic):

Kiểm tra các cấu hình env, log các thông tin cần thiết, mask giá trị bảo mật theo độ dài ví dụ: apikey:xxx-Masked:20-xxx. Có log.

Cài đặt SSH server Linux-Ubuntu (có detect phù hợp)

Kiểm tra xem SSH server (`sshd`) đã được cài đặt chưa

Nếu chưa, cài đặt OpenSSH server bằng lệnh `apt-get install openssh-server` (cho hệ thống sử dụng `apt-get`)

Tạo hoặc cập nhật file cấu hình SSH server (`/etc/ssh/sshd_config`)

Cấu hình quyền truy cập chỉ sử dụng `pubkey` và tắt các phương thức xác thực khác như mật khẩu

Cài đặt khóa SSH cho người dùng: Ghi public key vào `~/.ssh/authorized_keys` và đặt quyền truy cập hợp lý (600 cho file authorized_keys)

Khởi động và cấu hình `sshd` để chạy tự động sau khi khởi động hệ thống

Cài đặt SSH trên Windows (có detect phù hợp)

Kiểm tra xem OpenSSH Server đã được cài đặt chưa (Sử dụng PowerShell: `Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Server*'`).

Nếu chưa cài, sử dụng PowerShell để cài đặt: `Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0`.

Cấu hình SSH server (`C:\\ProgramData\\ssh\\sshd_config`) và thiết lập quyền `PubkeyAuthentication` cho phép sử dụng SSH keys.

Cấu hình tường lửa Windows để cho phép kết nối qua port SSH cấu hình.

Khởi động dịch vụ SSH server và cấu hình nó tự động chạy khi hệ thống khởi động.

Cài đặt SSH Key.

Tạo thư mục `~/.ssh` nếu chưa có, và đảm bảo quyền truy cập là 700 cho thư mục và 600 cho các file bên trong.

Ghi public key vào file `~/.ssh/authorized_keys`. Đảm bảo rằng public key này đã được cung cấp hoặc có thể truyền vào qua các biến môi trường.

Đảm bảo rằng các quyền của các file `authorized_keys` và thư mục `.ssh` được thiết lập đúng để tránh các lỗi bảo mật (700 cho thư mục, 600 cho file).

Cấu hình và khởi động lại dịch vụ SSH.

Trên Linux-Ubuntu, kiểm tra cấu hình của `sshd` với lệnh `sshd -t` và khởi động lại dịch vụ SSH bằng lệnh `systemctl restart sshd`.

Trên Windows, sử dụng PowerShell để khởi động dịch vụ SSH: `Start-Service sshd` và đảm bảo nó được cấu hình khởi động tự động với lệnh `Set-Service -Name sshd -StartupType Automatic`

Kiểm tra và Xác nhận SSH hoạt động.

Trên Linux-Ubuntu, kiểm tra bằng cách sử dụng lệnh `ssh -p <port> <user>@127.0.0.1` để xác nhận SSH đã hoạt động đúng.

Trên Windows, sử dụng lệnh tương tự để kết nối từ máy khác hoặc từ localhost để kiểm tra rằng kết nối SSH thành công.

Lưu ý (notes)

Trên Linux-Ubuntu, nếu cần phải cài SSH server, có thể cần quyền root hoặc sử dụng sudo.

Trên Windows, đảm bảo rằng firewall đã được cấu hình để mở port SSH theo cấu hình.

Đảm bảo rằng SSH chỉ sử dụng phương thức xác thực bằng SSH keys, và tắt các phương thức như mật khẩu để bảo mật.

Đảm bảo các bước hoạt động ổn định trong môi trường CI/CD (Github actions, Pipeline)

Ràng buộc môi trường:

Node >= 20 (Khi dùng fetch, hãy dùng mặc định của nodeJS có sẵn)
Hỗ trợ Windows + Linux-Ubuntu (Có sử dụng các app bên ngoài có thể đề xuất cài đặt thêm, trên window có thể cấu hình đường dẫn tới file thực thi exe)
Chạy ổn trong CI runner (github actions/self-host runner)
package.json phảin có cấu hình files bao gồm các file và thư mục khi publish lên npm js
bắt buộc có .gitignore và .npmignore mặc định
Dùng cross-spawn, ổn định Windows/Linux-Ubuntu, giảm bug quoting;
dùng npm minimist để parse command

────────────────────────────────────────
🪜 Step 3 — Yêu cầu hướng dẫn & triển khai theo từng bước (step-by-step)
Bạn PHẢI thiết kế theo pipeline chuẩn cho từng command/feature:

parseInput()
validate()
plan()
execute()
report()

Mỗi bước là function riêng + tách file rõ ràng.
Logic nghiệp vụ nằm ở src/core (KHÔNG nhét vào scripts).
Scripts chỉ gọi core để chạy tác vụ build/publish/version.

────────────────────────────────────────
🧪 Step 4 — Yêu cầu ví dụ minh hoạ (bắt buộc có)
Bạn phải kèm:

Ví dụ chạy CLI (3–5 ví dụ)
Ví dụ import dùng như library (2–3 ví dụ)
Ví dụ cấu hình CWD + .runner-data + log/pid/data-services

────────────────────────────────────────
🎯 Step 5 — Xác định đối tượng mục tiêu
Đối tượng: DevOps/Engineer có kinh nghiệm, cần tool chạy nhanh, rõ cấu trúc, dễ mở rộng.
Ưu tiên: ít phụ thuộc, code rõ ràng, module hoá, dễ debug.

────────────────────────────────────────
🧾 Step 6 — Yêu cầu định dạng đầu ra (bắt buộc đúng format)
Bạn phải output theo thứ tự:

Tổng quan kiến trúc (ngắn, rõ)
Cây thư mục (file tree), có các hàm trong file, mô tả ngắn gọn file để làm gì.
Giải thích từng nhóm module theo nghiệp vụ
Code đầy đủ cho tất cả file (JS thuần)
Hướng dẫn dùng (CLI + library)

Lưu ý trình bày:

Không tạo file TypeScript
Không viết test/lint trong bản chính
Không bỏ sót file nào trong file tree: file nào có trong tree thì phải có code

────────────────────────────────────────
✅ QUY TẮC KIẾN TRÚC BẮT BUỘC
📌 1) Module format: 🟨 CJS (require/module.exports) để tương thích cao.
📌 2) Chia theo domain:

src/core/ (logic nghiệp vụ)
src/adapters/ (fs/http/spawn/git…)
src/cli/ (parse args, commands)
src/utils/ (logger, time, json, retry, errors…)
scripts/ (build/publish/version bump… gọi core, không chứa nghiệp vụ)
bin/ (entry CLI)

📌 3) Logging & version in logs:

Mọi log/print quan trọng phải kèm: packageName + version + command + timestamp
Khi CLI chạy, in ghi chú “Đang thực thi version: X”
Cho phép --verbose / --quiet
Text log và có ghi file, thấy trong command line là có thể xem trong file khi cần.

📌 4) CWD & .runner-data layout (bắt buộc hỗ trợ cấu hình):

Có option cấu hình working directory:
CLI flag: --cwd
env: TOOL_CWD
default: process.cwd()
Tất cả dữ liệu/ghi file nằm trong: /.runner-data/
logs: .runner-data/logs/
pid: .runner-data/pid/
data: .runner-data/data-services/
tmp/cache: .runner-data/tmp/
Không ghi lung tung ra thư mục khác.

📌 5) Error handling chuẩn:

Có lớp lỗi: ValidationError, NetworkError, ProcessError
Exit code rõ ràng:
0: success
2: validation/config error
10: network error
20: process/spawn error
1: unknown error
Log lỗi có hint hành động tiếp theo

📌 6) Adapter layer:

fs adapter: read/write json, ensureDir, atomic write
http adapter: fetch with timeout + retry
process adapter: spawn cross-platform (khuyến nghị cross-spawn hoặc child_process spawn + fix windows)
time adapter: lấy giờ Việt Nam (Asia/Ho_Chi_Minh) cho version & log timestamp, định dạng yyyy-MM-dd HH:mm:ss

────────────────────────────────────────
🚀 YÊU CẦU VỀ DEPENDENCIES

Ưu tiên ít phụ thuộc
Nếu dùng thư viện (minimist/chalk/cross-spawn), phải giải thích vì sao cần
Dùng fetch có sẵn trong nodejs

────────────────────────────────────────
🎁 DELIVERABLE CHỐT
Hãy tạo project hoàn chỉnh cho runner-cloudflared-tunnel gồm:

File tree chuẩn

Tất cả code JS (CJS)

CLI có commands theo mô tả

logs có version + command + timestamp

Hỗ trợ --cwd và .runner-data layout

Scripts version/build/publish tối thiểu

Hướng dẫn dùng + ví dụ

Thực hiện xong dự án ngoài thể hiện các thông tin đã thực hiện thì thực hiện thêm nén tất cả file, thông tin thành zip để download, đặt tên để download về giống với tên package có kèm ngày phát triển: yyyy-MM-dd.

HÃY THỰC HIỆN GIÚP TÔI.

LÊN KẾ HOẠCH

1. Tóm tắt yêu cầu đã hiểu (5–10 dòng), nêu rõ phạm vi và các giả định.
2. Đề xuất KẾ HOẠCH triển khai theo milestone (ví dụ 3–5 milestone), mỗi milestone có:
   - Mục tiêu
   - Output (file/module nào sẽ sinh ra)
   - Rủi ro/chú ý
3. Đưa ra danh sách LỰA CHỌN quan trọng để tôi quyết định trước khi bạn viết code.
   - Mỗi mục phải có tiêu đề rõ ràng.
   - Mỗi mục phải có ít nhất 2 tùy chọn dạng “Option 1”, “Option 2” (có thể thêm Option 3 nếu cần).
   - Mỗi option phải có: mô tả ngắn, ưu/nhược, khi nào nên chọn.
   - Cuối mỗi mục phải có dòng: “✅ Chọn: (Option 1 / Option 2 / …)”
4. Chỉ sau khi tôi chọn xong các option, bạn mới chuyển sang triển khai code theo đúng các bước Step-by-Step ở trên.

Ví dụ format một mục lựa chọn:

- 🔹 Lựa chọn A — CLI argument parser
  - Option 1: Tự parse process.argv (ít phụ thuộc, code ngắn, nhưng tự làm help/validation)
  - Option 2: Dùng commander (UX tốt, dễ help/subcommand, thêm 1 dependency)
    ✅ Chọn: (Option 1 / Option 2)

Sau pha “Lên kế hoạch & xin lựa chọn”, bạn kết thúc bằng đúng câu:
“HÃY THỰC HIỆN GIÚP TÔI.”
`
