/**
 * Common Executor
 * 
 * Handles SSH key setup that is common across platforms.
 */

const path = require('path');
const os = require('os');
const { ensureDir, writeFile, chmod } = require('../../adapters/fs');
const { spawnAsync, execSudo } = require('../../adapters/process');
const { ProcessError } = require('../../utils/errors');

/**
 * Setup authorized_keys for SSH authentication
 * 
 * @param {Object} config - Configuration
 * @param {Logger} logger - Logger instance
 */
async function setupAuthorizedKeys(config, logger) {
  const platform = process.platform;
  const homeDir = config.homeDir;
  const sshDir = path.join(homeDir, '.ssh');
  const authorizedKeysPath = path.join(sshDir, 'authorized_keys');

  try {
    logger.debug(`Setting up SSH keys in ${sshDir}...`);

    // Create .ssh directory if it doesn't exist
    logger.debug(`Ensuring .ssh directory exists: ${sshDir}`);
    await ensureDir(sshDir);

    // Write authorized_keys
    logger.debug(`Writing public key to ${authorizedKeysPath}`);
    const publicKeyContent = config.publicKey.trim() + '\n';
    await writeFile(authorizedKeysPath, publicKeyContent);

    // Set permissions based on platform
    if (platform === 'linux') {
      await setupPermissionsLinux(sshDir, authorizedKeysPath, config, logger);
    } else if (platform === 'win32') {
      await setupPermissionsWindows(sshDir, authorizedKeysPath, config, logger);
    }

    logger.debug('SSH keys setup complete');
  } catch (error) {
    throw new ProcessError(`Failed to setup SSH keys: ${error.message}`);
  }
}

/**
 * Setup permissions on Linux
 * 
 * @param {string} sshDir - .ssh directory path
 * @param {string} authorizedKeysPath - authorized_keys file path
 * @param {Object} config - Configuration
 * @param {Logger} logger - Logger instance
 */
async function setupPermissionsLinux(sshDir, authorizedKeysPath, config, logger) {
  try {
    logger.debug('Setting permissions (Linux)...');

    // chmod 700 ~/.ssh
    await chmod(sshDir, '700', config, logger);

    // chmod 600 ~/.ssh/authorized_keys
    await chmod(authorizedKeysPath, '600', config, logger);

    // Ensure ownership (for sudo case)
    const currentUser = config.currentUser;
    try {
      await execSudo(['chown', '-R', `${currentUser}:${currentUser}`, sshDir], logger);
    } catch (err) {
      logger.debug('chown failed (might not need sudo):', err.message);
    }

    logger.debug('Permissions set successfully (Linux)');
  } catch (error) {
    throw new ProcessError(`Failed to set permissions (Linux): ${error.message}`);
  }
}

/**
 * Setup permissions on Windows
 * 
 * @param {string} sshDir - .ssh directory path
 * @param {string} authorizedKeysPath - authorized_keys file path
 * @param {Object} config - Configuration
 * @param {Logger} logger - Logger instance
 */
async function setupPermissionsWindows(sshDir, authorizedKeysPath, config, logger) {
  try {
    logger.debug('Setting permissions (Windows)...');

    // On Windows, set ACLs for authorized_keys
    // Remove inheritance and grant full control to current user only
    const currentUser = config.currentUser;
    
    const aclCommands = [
      // Disable inheritance
      `icacls "${authorizedKeysPath}" /inheritance:r`,
      // Grant full control to current user
      `icacls "${authorizedKeysPath}" /grant "${currentUser}:F"`,
      // Grant read to SYSTEM (required for sshd)
      `icacls "${authorizedKeysPath}" /grant "SYSTEM:F"`
    ];

    for (const cmd of aclCommands) {
      try {
        await spawnAsync('cmd', ['/c', cmd], { logger });
      } catch (err) {
        logger.debug(`ACL command warning: ${err.message}`);
      }
    }

    logger.debug('Permissions set successfully (Windows)');
  } catch (error) {
    // Windows permissions are tricky, log warning but don't fail
    logger.warn(`Warning: Could not set Windows ACLs: ${error.message}`);
  }
}

module.exports = {
  setupAuthorizedKeys
};
