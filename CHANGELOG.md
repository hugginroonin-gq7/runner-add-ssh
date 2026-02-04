# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-02-04

### Added
- ✨ Initial release
- 🚀 Hybrid package (CLI + Library)
- 🌍 Cross-platform support (Windows/Linux-Ubuntu)
- 🔐 SSH key-based authentication only
- ⚙️ Auto-detect OS and install OpenSSH Server if needed
- 📝 Console + file logging with Vietnam timezone
- 🎯 CI/CD optimized (GitHub Actions, Azure Pipelines)
- 🔧 Configurable via environment variables (SSH_*)
- 🛠️ CLI with Commander for better UX
- 📦 Sudo fallback strategy for Linux
- 🔒 Secure: masks sensitive data in logs
- 📁 `.runner-data/` layout for organized file management
- 🚦 Exit codes: 0 (success), 2 (validation), 10 (network), 20 (process)

### Features
- Parse input from ENV variables and CLI args
- Validate SSH public key format
- Install OpenSSH Server on both platforms
- Configure `sshd_config` with security best practices
- Setup `authorized_keys` with proper permissions
- Start and enable SSH service
- Report connection information with IP addresses
- Comprehensive logging to file and console

### Documentation
- Complete README with examples
- CLI usage examples (10 scenarios)
- Library usage examples (5 scenarios)
- Troubleshooting guide
- CI/CD integration guides

---

## [Unreleased]

### Planned
- Add tests (unit + integration)
- Add support for more Linux distributions (CentOS, Debian)
- Add option to generate SSH keys if not provided
- Add health check endpoint
- Add metrics collection
