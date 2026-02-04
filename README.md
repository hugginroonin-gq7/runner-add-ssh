# runner-add-ssh

🔐 Tự động cài đặt và cấu hình SSH server để remote access vào CI/CD runner (Windows/Linux-Ubuntu)

[![npm version](https://img.shields.io/npm/v/runner-add-ssh.svg)](https://www.npmjs.com/package/runner-add-ssh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Tính năng

- 🚀 **Hybrid Package**: Vừa CLI vừa Library
- 🌍 **Cross-platform**: Hỗ trợ Windows và Linux-Ubuntu
- 🔒 **Bảo mật**: Chỉ dùng SSH key authentication, tắt password
- ⚙️ **Tự động**: Detect OS, cài đặt OpenSSH Server nếu thiếu
- 📝 **Logging**: Console + file log với timestamp Vietnam
- 🎯 **CI/CD Ready**: Tối ưu cho GitHub Actions, Azure Pipelines, Self-hosted runners

---

## 📦 Cài đặt

```bash
# Global (để dùng CLI)
npm install -g runner-add-ssh

# Hoặc dùng trong project
npm install runner-add-ssh

# Hoặc chạy trực tiếp với npx
npx runner-add-ssh
```

---

## 🚀 Sử dụng nhanh

### CLI

```bash
# Đơn giản nhất: set env và chạy
export SSH_RUNNER_PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAA... user@example.com"
runner-add-ssh

# Với custom port
export SSH_PORT=2222
runner-add-ssh

# Verbose mode để debug
runner-add-ssh --verbose
```

### Library

```javascript
const { setupSSH } = require("runner-add-ssh");

await setupSSH({
  publicKey: "ssh-rsa AAAAB3NzaC1yc2EAAAA... user@example.com",
  port: 2222,
  allowUsers: "runner root",
});
```

---

## 📋 Cấu hình

### Biến môi trường (SSH\_\*)

Tất cả config đều có giá trị mặc định, chỉ **SSH_RUNNER_PUBLIC_KEY** là bắt buộc.

| Biến                    | Mô tả                                         | Mặc định        |
| ----------------------- | --------------------------------------------- | --------------- |
| `SSH_RUNNER_PUBLIC_KEY` | ⚠️ **Bắt buộc**. SSH public key để auth       | -               |
| `SSH_PORT`              | Port SSH server                               | `2222`          |
| `SSH_MODE`              | Mode: `root`, `user`, `auto`                  | `auto`          |
| `SSH_ALLOW_USERS`       | Users được phép connect (cách nhau bởi space) | `${USER} root`  |
| `SSH_DEFAULT_CWD`       | Thư mục mặc định khi SSH login                | `/home/${USER}` |
| `SSH_DISABLE_FORCE_CWD` | Tắt ForceCommand (1=tắt, 0=bật)               | `0`             |

### CLI Options

```
runner-add-ssh [options]

Options:
  -v, --version              Output version
  --cwd <path>               Working directory cho .runner-data
  --verbose                  Enable verbose logging
  --quiet                    Chỉ show errors
  --public-key <key>         Override SSH_RUNNER_PUBLIC_KEY
  --port <number>            Override SSH_PORT
  --mode <mode>              Override SSH_MODE
  --allow-users <users>      Override SSH_ALLOW_USERS
  --default-cwd <path>       Override SSH_DEFAULT_CWD
  --disable-force-cwd        Override SSH_DISABLE_FORCE_CWD
  -h, --help                 Display help
```

### Library API

```javascript
setupSSH(options);
```

**Options**:

- `publicKey` (string): SSH public key (bắt buộc nếu không có env)
- `port` (number): SSH port
- `mode` (string): 'root', 'user', 'auto'
- `allowUsers` (string): Space-separated users
- `defaultCwd` (string): Default working directory
- `disableForceCwd` (boolean): Disable ForceCommand
- `cwd` (string): Working directory cho .runner-data
- `verbose` (boolean): Verbose logging
- `quiet` (boolean): Suppress output

**Returns**: Promise\<Object\>

```javascript
{
  success: true,
  hostname: 'runner-vm',
  port: 2222,
  ipAddresses: ['192.168.1.100'],
  allowUsers: 'runner root',
  defaultCwd: '/home/runner',
  timestamp: '2025-02-04T10:30:00.000Z'
}
```

---

## 📁 File Layout

Package sử dụng `.runner-data/` trong working directory:

```
<working-directory>/
└── .runner-data/
    ├── logs/
    │   └── ssh-setup-2025-02-04.log
    ├── tmp/
    │   └── sshd_config
    └── data-services/
```

- **logs/**: Log files theo ngày
- **tmp/**: Temporary files (sshd_config template, etc.)
- **data-services/**: Service data (nếu cần mở rộng)

---

## 🎯 Use Cases

### 1. GitHub Actions - Debug Runner

```yaml
# .github/workflows/debug-ssh.yml
name: Debug with SSH
on: workflow_dispatch

jobs:
  debug:
    runs-on: ubuntu-latest
    steps:
      - name: Enable SSH Access
        env:
          SSH_RUNNER_PUBLIC_KEY: ${{ secrets.SSH_PUBLIC_KEY }}
          SSH_PORT: 2222
        run: |
          npx runner-add-ssh --verbose

      - name: Show connection info
        run: |
          echo "SSH is ready!"
          echo "Connect: ssh -p 2222 runner@<runner-ip>"

      - name: Keep alive
        run: sleep 3600 # 1 hour
```

### 2. Azure Pipelines - Debug Agent

```yaml
# azure-pipelines.yml
trigger: none

pool:
  vmImage: "ubuntu-latest"

steps:
  - script: |
      export SSH_RUNNER_PUBLIC_KEY="$(SSH_PUBLIC_KEY)"
      npx runner-add-ssh --verbose
    displayName: "Setup SSH"

  - script: |
      echo "Connect: ssh -p 2222 vsts@<agent-ip>"
      sleep 3600
    displayName: "Keep alive"
```

### 3. Self-hosted Runner - Production Access

```bash
#!/bin/bash
# setup-ssh.sh

# Read key from secure location
export SSH_RUNNER_PUBLIC_KEY=$(cat /secure/keys/admin.pub)
export SSH_PORT=22000
export SSH_ALLOW_USERS="admin deploy"
export SSH_DEFAULT_CWD="/opt/runner/workspace"

# Run with logging
runner-add-ssh --verbose 2>&1 | tee /var/log/ssh-setup.log
```

### 4. Library - CI/CD Script Integration

```javascript
// deploy.js
const { setupSSH } = require("runner-add-ssh");

async function deploy() {
  // Enable SSH debug access if needed
  if (process.env.ENABLE_SSH_DEBUG === "true") {
    await setupSSH({
      publicKey: process.env.ADMIN_SSH_KEY,
      port: 2222,
      quiet: true,
    });
    console.log("✅ SSH debug enabled");
  }

  // Continue with deployment...
}
```

---

## 🔒 Bảo mật

### SSH Key Format

Public key phải theo format chuẩn:

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC... user@host
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG... user@host
```

### Permissions

Linux:

- `~/.ssh/`: 700
- `~/.ssh/authorized_keys`: 600
- `/etc/ssh/sshd_config`: 644

Windows:

- `%USERPROFILE%\.ssh\authorized_keys`: Full control cho user + SYSTEM
- ACLs được set tự động

### Firewall

Windows: Script tự động thêm firewall rule cho SSH port

Linux: Bạn cần tự config firewall nếu có (ufw/iptables)

---

## 🛠️ Development

### Project Structure

```
runner-add-ssh/
├── src/
│   ├── core/              # Business logic (parseInput, validate, plan, execute, report)
│   ├── adapters/          # System adapters (fs, process, time)
│   ├── utils/             # Utilities (logger, errors, mask)
│   └── cli/               # CLI commands
├── scripts/               # Automation (version, publish)
├── examples/              # Usage examples
└── bin/                   # CLI entry
```

### Scripts

```bash
# Bump version
npm run version:bump        # Patch
node scripts/version.js minor
node scripts/version.js major

# Publish to npm
npm run publish:npm
```

---

## ⚠️ Lưu ý

### Linux-Ubuntu

- Cần quyền sudo để cài openssh-server và config sshd
- Script tự động fallback sang sudo nếu cần
- User runner/vsts phải có trong sudoers (GitHub Actions/Azure Pipelines đã config sẵn)

### Windows

- Cần Windows 10 1809+ hoặc Windows Server 2019+
- PowerShell cần quyền admin để cài OpenSSH
- Firewall rule được tạo tự động

### CI/CD

- GitHub Actions: User mặc định là `runner`
- Azure Pipelines: User mặc định là `vsts`
- Self-hosted: Tùy config của bạn

---

## 🐛 Troubleshooting

### SSH service không start được

```bash
# Linux: Check status
sudo systemctl status ssh
sudo journalctl -u ssh -n 50

# Windows: Check status
powershell -Command "Get-Service sshd"
```

### Permission denied

```bash
# Chạy lại với verbose
runner-add-ssh --verbose

# Check log file
cat .runner-data/logs/ssh-setup-*.log
```

### Port already in use

```bash
# Change port
export SSH_PORT=2223
runner-add-ssh
```

---

## 📝 Exit Codes

| Code | Ý nghĩa                 |
| ---- | ----------------------- |
| 0    | Success                 |
| 1    | Unknown error           |
| 2    | Validation/config error |
| 10   | Network error           |
| 20   | Process/spawn error     |

---

## 📄 License

MIT © Huggin

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📮 Support

- 🐛 Issues: [GitHub Issues](https://github.com/hugginroonin-gq7/runner-add-ssh/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/hugginroonin-gq7/runner-add-ssh/discussions)
- 📧 Email: hugginroonin@gmail.com

---

**Made with ❤️ for DevOps Engineers**
