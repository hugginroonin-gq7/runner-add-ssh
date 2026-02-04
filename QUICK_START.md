# 🚀 runner-add-ssh - Quick Start

## 📦 Files trong package này

- **runner-add-ssh/** - Toàn bộ source code
- **runner-add-ssh-2025-02-04.zip** - File nén để download

## ⚡ Cài đặt nhanh

### 1. Extract và install dependencies

```bash
unzip runner-add-ssh-2025-02-04.zip
cd runner-add-ssh
npm install
```

### 2. Test CLI

```bash
# Xem help
node bin/runner-add-ssh.js --help

# Test với mock public key (sẽ fail validation nhưng kiểm tra được CLI)
node bin/runner-add-ssh.js --help
```

### 3. Sử dụng thực tế

```bash
# Set public key
export SSH_RUNNER_PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAA... your-email@example.com"

# Run
node bin/runner-add-ssh.js --verbose
```

### 4. Publish lên npm (nếu muốn)

```bash
# Login npm
npm login

# Bump version
node scripts/version.js patch

# Publish
node scripts/publish.js
```

## 📚 Documentation

- **README.md** - Hướng dẫn chi tiết
- **PROJECT_SUMMARY.md** - Tổng kết project
- **examples/** - Ví dụ sử dụng CLI và Library

## 🎯 Use Cases chính

1. **GitHub Actions** - Debug runner với SSH
2. **Azure Pipelines** - Access vào agent
3. **Self-hosted runner** - Remote management
4. **CI/CD script** - Programmatic SSH setup

## 🔧 Dependencies cần cài

```bash
npm install commander cross-spawn
```

Hoặc chỉ cần:

```bash
npm install
```

## ✅ Checklist trước khi dùng

- [ ] Node >= 20.0.0
- [ ] Có SSH public key hợp lệ
- [ ] (Linux) User có quyền sudo
- [ ] (Windows) PowerShell với quyền admin

## 📮 Support

- Issues: GitHub Issues
- Email: huggin@example.com

---

**Made with ❤️ by Huggin - 2025-02-04**
