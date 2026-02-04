/**
 * Plan Module
 * 
 * Detects OS, checks SSH installation, and creates execution plan.
 */

const { checkCommand } = require('../adapters/process');
const { ValidationError } = require('../utils/errors');

/**
 * Create execution plan based on OS and current state
 * 
 * @param {Object} config - Validated configuration
 * @param {Logger} logger - Logger instance
 * @returns {Promise<Object>} Execution plan
 */
async function plan(config, logger) {
  const platform = process.platform;
  
  logger.debug(`Detecting OS: ${platform}`);

  let os;
  let sshdInstalled = false;
  let sshdPath = '';
  let needsInstall = false;

  if (platform === 'linux') {
    os = 'linux';
    
    // Check if sshd is installed
    sshdInstalled = await checkCommand('sshd', logger);
    
    if (sshdInstalled) {
      sshdPath = '/usr/sbin/sshd';
      logger.info('✅ OpenSSH Server already installed');
    } else {
      needsInstall = true;
      logger.warn('⚠️  OpenSSH Server not found, will install');
    }

  } else if (platform === 'win32') {
    os = 'windows';
    
    // Check if sshd service exists (PowerShell check will be done in execute)
    sshdInstalled = await checkCommand('sshd', logger);
    
    if (sshdInstalled) {
      logger.info('✅ OpenSSH Server already installed');
    } else {
      needsInstall = true;
      logger.warn('⚠️  OpenSSH Server not found, will install');
    }

  } else {
    throw new ValidationError(`Unsupported platform: ${platform}. Only Linux and Windows are supported.`);
  }

  const executionPlan = {
    os,
    platform,
    sshdInstalled,
    sshdPath,
    needsInstall,
    steps: needsInstall 
      ? ['install', 'configure', 'setup-keys', 'start']
      : ['configure', 'setup-keys', 'restart']
  };

  logger.debug('Execution plan created', executionPlan);

  return executionPlan;
}

module.exports = plan;
