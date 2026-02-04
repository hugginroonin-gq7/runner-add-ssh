# Contributing to runner-add-ssh

🎉 Cảm ơn bạn đã quan tâm đến việc đóng góp cho runner-add-ssh!

## 🚀 Cách đóng góp

### 1. Báo cáo Bug

- Mở issue mới trên GitHub Issues
- Mô tả chi tiết: OS, Node version, error message, steps to reproduce
- Attach logs từ `.runner-data/logs/` nếu có

### 2. Đề xuất Feature

- Mở issue với label `enhancement`
- Giải thích use case và lợi ích
- Có thể tham khảo implementation approach

### 3. Submit Pull Request

#### Setup Development Environment

```bash
# Fork và clone repo
git clone https://github.com/hugginroonin-gq7/runner-add-ssh.git
cd runner-add-ssh

# Install dependencies
npm install

# Create branch
git checkout -b feature/your-feature-name
```

#### Code Guidelines

1. **Module Format**: CJS (require/module.exports)
2. **Code Style**: 
   - 2 spaces indent
   - No trailing whitespace
   - LF line endings
3. **Structure**:
   - Business logic trong `src/core/`
   - Adapters trong `src/adapters/`
   - Utilities trong `src/utils/`
   - CLI trong `src/cli/`
4. **Logging**:
   - Dùng logger instance
   - Mask sensitive data
   - Include timestamp và version
5. **Error Handling**:
   - Dùng custom error classes
   - Exit codes theo spec

#### Testing

```bash
# Run tests (khi có)
npm test

# Test CLI locally
node bin/runner-add-ssh.js --help

# Test library
node -e "require('./src/index').setupSSH({...})"
```

#### Commit Messages

Follow conventional commits:

```
feat: add support for CentOS
fix: resolve sudo permission issue on Ubuntu 22.04
docs: update README with Azure DevOps example
refactor: simplify error handling in execute module
```

#### Pull Request Process

1. Update README.md nếu thay đổi API
2. Update CHANGELOG.md
3. Đảm bảo code chạy được trên cả Windows và Linux
4. Request review từ maintainer
5. Merge sau khi approved

## 📋 Development Checklist

- [ ] Code tuân thủ style guide
- [ ] Đã test trên cả Windows và Linux
- [ ] Logs rõ ràng, mask sensitive data
- [ ] Error handling đầy đủ
- [ ] Updated documentation
- [ ] Updated CHANGELOG.md

## 🐛 Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug.

**To Reproduce**
Steps to reproduce:
1. Run command: `runner-add-ssh ...`
2. See error: ...

**Expected behavior**
What you expected to happen.

**Environment:**
- OS: [Ubuntu 22.04 / Windows 11]
- Node version: [20.x]
- Package version: [1.0.0]

**Logs**
Attach logs from `.runner-data/logs/`

**Additional context**
Any other context about the problem.
```

## 💡 Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
How should it work?

**Describe alternatives you've considered**
Other approaches you've thought about.

**Use case**
Real-world scenario where this would be useful.

**Additional context**
Mockups, examples, etc.
```

## 📝 Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Focus on what's best for the project
- No harassment or trolling

## ❓ Questions?

- Open a discussion on GitHub Discussions
- Contact maintainer: your-email@example.com

---

Thank you for contributing! 🙏
