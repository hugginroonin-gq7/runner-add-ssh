/**
 * runner-add-ssh Library Export
 * 
 * Provides a programmatic API to setup SSH server.
 */

const parseInput = require('./core/parseInput');
const validate = require('./core/validate');
const plan = require('./core/plan');
const execute = require('./core/execute');
const report = require('./core/report');
const Logger = require('./utils/logger');
const { handleError } = require('./utils/errors');

/**
 * Setup SSH server programmatically
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.publicKey] - SSH public key (overrides SSH_RUNNER_PUBLIC_KEY)
 * @param {number} [options.port] - SSH port (overrides SSH_PORT)
 * @param {string} [options.mode] - SSH mode: 'root', 'user', 'auto' (overrides SSH_MODE)
 * @param {string} [options.allowUsers] - Allowed users (overrides SSH_ALLOW_USERS)
 * @param {string} [options.defaultCwd] - Default working directory (overrides SSH_DEFAULT_CWD)
 * @param {boolean} [options.disableForceCwd] - Disable ForceCommand (overrides SSH_DISABLE_FORCE_CWD)
 * @param {string} [options.cwd] - Working directory for .runner-data
 * @param {boolean} [options.verbose] - Enable verbose logging
 * @param {boolean} [options.quiet] - Suppress output
 * @returns {Promise<Object>} Result object with connection info
 */
async function setupSSH(options = {}) {
  const logger = new Logger({
    cwd: options.cwd || process.cwd(),
    verbose: options.verbose || false,
    quiet: options.quiet || false
  });

  try {
    logger.info('🚀 runner-add-ssh - Starting SSH setup...');
    
    // Parse input (merge options with env)
    const config = parseInput(options);
    logger.debug('Parsed configuration', config);

    // Validate configuration
    validate(config);
    logger.info('✅ Configuration validated');

    // Create execution plan
    const executionPlan = await plan(config, logger);
    logger.info(`📋 Execution plan created for OS: ${executionPlan.os}`);

    // Execute the plan
    const result = await execute(executionPlan, config, logger);
    logger.info('✅ SSH setup completed successfully');

    // Report result
    const reportData = report(result, config, logger);

    return reportData;

  } catch (error) {
    handleError(error, logger);
    throw error;
  }
}

module.exports = {
  setupSSH
};
