#!/bin/bash

# ═══════════════════════════════════════════════════════════
# runner-add-ssh CLI Usage Examples
# ═══════════════════════════════════════════════════════════

# Example 1: Basic usage with environment variables
# Set public key and run with defaults
export SSH_RUNNER_PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... user@example.com"
runner-add-ssh

# Example 2: Custom SSH port
# Run on custom port 2222
export SSH_RUNNER_PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... user@example.com"
export SSH_PORT=2222
runner-add-ssh

# Example 3: Specify allowed users
# Allow only specific users to connect
export SSH_RUNNER_PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... user@example.com"
export SSH_ALLOW_USERS="runner deploy"
runner-add-ssh

# Example 4: Override with CLI arguments
# CLI arguments take precedence over env vars
runner-add-ssh \
  --public-key "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILq... user@example.com" \
  --port 2222 \
  --allow-users "runner root" \
  --mode auto

# Example 5: Verbose logging for debugging
# Enable detailed logs to troubleshoot issues
export SSH_RUNNER_PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... user@example.com"
runner-add-ssh --verbose

# Example 6: Custom working directory
# Use different working directory for .runner-data
export SSH_RUNNER_PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... user@example.com"
runner-add-ssh --cwd /opt/my-project

# Example 7: Disable ForceCommand (don't force default CWD)
# SSH sessions won't be forced to change directory
export SSH_RUNNER_PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... user@example.com"
export SSH_DISABLE_FORCE_CWD=1
runner-add-ssh

# Example 8: CI/CD GitHub Actions usage
# Typical usage in GitHub Actions workflow
# .github/workflows/enable-ssh.yml
cat << 'EOF'
name: Enable SSH Access
on: workflow_dispatch

jobs:
  setup-ssh:
    runs-on: ubuntu-latest
    steps:
      - name: Setup SSH
        env:
          SSH_RUNNER_PUBLIC_KEY: ${{ secrets.SSH_PUBLIC_KEY }}
          SSH_PORT: 2222
        run: |
          npx runner-add-ssh --verbose
          
      - name: Keep runner alive
        run: |
          echo "SSH server is running"
          echo "Connect with: ssh -p 2222 runner@<runner-ip>"
          sleep 3600  # Keep alive for 1 hour
EOF

# Example 9: Azure Pipelines usage
# azure-pipelines.yml
cat << 'EOF'
trigger: none

pool:
  vmImage: 'ubuntu-latest'

steps:
- script: |
    export SSH_RUNNER_PUBLIC_KEY="$(SSH_PUBLIC_KEY)"
    export SSH_PORT=2222
    npx runner-add-ssh --verbose
  displayName: 'Setup SSH Access'
  
- script: |
    echo "SSH server is running"
    echo "Connect with: ssh -p 2222 vsts@<agent-ip>"
    sleep 3600
  displayName: 'Keep agent alive'
EOF

# Example 10: Self-hosted runner with custom SSH key path
# Read public key from file
export SSH_RUNNER_PUBLIC_KEY=$(cat ~/.ssh/id_rsa.pub)
export SSH_PORT=22000
export SSH_DEFAULT_CWD="/home/runner/workspace"
runner-add-ssh --verbose
