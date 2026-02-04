/**
 * Validate Module
 * 
 * Validates the parsed configuration before execution.
 */

const { ValidationError } = require('../utils/errors');

/**
 * Validate configuration
 * 
 * @param {Object} config - Parsed configuration
 * @throws {ValidationError} If validation fails
 */
function validate(config) {
  const errors = [];

  // Validate public key
  if (!config.publicKey || config.publicKey.trim() === '') {
    errors.push('SSH_RUNNER_PUBLIC_KEY is required but not provided');
  } else {
    // Basic SSH public key format check
    const keyPattern = /^(ssh-rsa|ssh-ed25519|ecdsa-sha2-nistp256|ecdsa-sha2-nistp384|ecdsa-sha2-nistp521)\s+[A-Za-z0-9+/=]+(\s+.*)?$/;
    if (!keyPattern.test(config.publicKey.trim())) {
      errors.push('SSH_RUNNER_PUBLIC_KEY has invalid format. Expected format: "ssh-rsa AAAA..." or "ssh-ed25519 AAAA..."');
    }
  }

  // Validate port
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
    errors.push(`SSH_PORT must be a valid port number (1-65535), got: ${config.port}`);
  }

  // Validate mode
  const validModes = ['root', 'user', 'auto'];
  if (!validModes.includes(config.mode)) {
    errors.push(`SSH_MODE must be one of: ${validModes.join(', ')}, got: ${config.mode}`);
  }

  // Validate allowUsers (not empty)
  if (!config.allowUsers || config.allowUsers.trim() === '') {
    errors.push('SSH_ALLOW_USERS cannot be empty');
  }

  // Validate defaultCwd (should be absolute path)
  if (!config.defaultCwd || !require('path').isAbsolute(config.defaultCwd)) {
    errors.push(`SSH_DEFAULT_CWD must be an absolute path, got: ${config.defaultCwd}`);
  }

  // Throw if any errors
  if (errors.length > 0) {
    throw new ValidationError(
      `Configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
}

module.exports = validate;
