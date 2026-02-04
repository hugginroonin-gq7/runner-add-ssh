/**
 * Parse Input Module
 * 
 * Reads SSH_* environment variables and merges with provided options.
 * Sets default values for missing configurations.
 */

const os = require('os');

/**
 * Parse input configuration
 * 
 * Priority: CLI options > ENV variables > Defaults
 * 
 * @param {Object} options - CLI/Library options
 * @returns {Object} Parsed configuration
 */
function parseInput(options = {}) {
  const env = process.env;
  const currentUser = env.USER || env.USERNAME || 'runner';
  const homeDir = os.homedir();

  const config = {
    // SSH Public Key (required)
    publicKey: options.publicKey || env.SSH_RUNNER_PUBLIC_KEY || '',

    // SSH Port
    port: options.port || parseInt(env.SSH_PORT || '2222', 10),

    // SSH Mode: 'root', 'user', 'auto'
    mode: options.mode || env.SSH_MODE || 'auto',

    // Allowed users (space-separated)
    allowUsers: options.allowUsers || env.SSH_ALLOW_USERS || `${currentUser} root`,

    // Default working directory for SSH login
    defaultCwd: options.defaultCwd || env.SSH_DEFAULT_CWD || `${homeDir}`,

    // Disable ForceCommand (0 = enabled, 1 = disabled)
    disableForceCwd: options.disableForceCwd !== undefined 
      ? options.disableForceCwd 
      : parseInt(env.SSH_DISABLE_FORCE_CWD || '0', 10) === 1,

    // Runtime options
    cwd: options.cwd || env.TOOL_CWD || process.cwd(),
    verbose: options.verbose || false,
    quiet: options.quiet || false,

    // System info
    currentUser,
    homeDir,
    platform: process.platform,
    arch: process.arch
  };

  return config;
}

module.exports = parseInput;
