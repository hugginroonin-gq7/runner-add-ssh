/**
 * Process Adapter
 * 
 * Provides cross-platform process spawning with sudo fallback support.
 */

const spawn = require('cross-spawn');
const { ProcessError } = require('../utils/errors');

/**
 * Spawn a process asynchronously
 * 
 * @param {string} command - Command to run
 * @param {Array<string>} args - Command arguments
 * @param {Object} options - Spawn options
 * @param {Logger} [options.logger] - Logger instance
 * @param {boolean} [options.captureOutput=true] - Capture stdout/stderr
 * @param {boolean} [options.warnOnStderr=true] - Log stderr output as warning on success
 * @returns {Promise<Object>} Result with stdout, stderr, code
 */
async function spawnAsync(command, args = [], options = {}) {
  const { logger, captureOutput = true, warnOnStderr = true } = options;

  return new Promise((resolve, reject) => {
    if (logger) {
      logger.debug(`Spawning: ${command} ${args.join(' ')}`);
    }

    let stdout = '';
    let stderr = '';

    const child = spawn(command, args, {
      stdio: captureOutput ? 'pipe' : 'inherit',
      ...options
    });

    if (captureOutput && child.stdout) {
      child.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        if (logger && options.verbose) {
          logger.debug(`[stdout] ${text.trim()}`);
        }
      });
    }

    if (captureOutput && child.stderr) {
      child.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        if (logger && options.verbose) {
          logger.debug(`[stderr] ${text.trim()}`);
        }
      });
    }

    child.on('error', (error) => {
      reject(new ProcessError(`Failed to spawn ${command}: ${error.message}`));
    });

    child.on('close', (code) => {
      if (code === 0) {
        if (warnOnStderr && stderr.trim() && logger) {
          logger.warn(`Command produced stderr output: ${stderr.trim()}`);
        }
        resolve({ stdout, stderr, code });
      } else {
        reject(new ProcessError(
          `Command failed: ${command} ${args.join(' ')}\nExit code: ${code}\nStderr: ${stderr}`
        ));
      }
    });
  });
}

/**
 * Execute command with sudo fallback
 * 
 * Strategy: Try with sudo first (when available). If sudo fails, fallback to non-sudo.
 * 
 * @param {Array<string>} args - Command and arguments (e.g., ['apt-get', 'update'])
 * @param {Logger} logger - Logger instance
 * @returns {Promise<Object>} Result
 */
async function execSudo(args, logger) {
  const [command, ...cmdArgs] = args;
  const commandLabel = `${command} ${cmdArgs.join(' ')}`.trim();
  let sudoError;

  const isWindows = process.platform === 'win32';

  if (!isWindows) {
    const sudoAvailable = await checkCommand('sudo', logger);
    if (sudoAvailable) {
      try {
        logger.debug(`Executing with sudo: ${commandLabel}`);
        return await spawnAsync('sudo', ['-n', ...args], { logger });
      } catch (error) {
        sudoError = error;
        logger.warn(`Sudo execution failed for "${commandLabel}". Falling back to non-sudo. Reason: ${error.message}`);
      }
    } else if (!canSudo()) {
      logger.warn(`Sudo is not available; executing "${commandLabel}" without sudo.`);
    }
  }

  try {
    logger.debug(`Executing: ${commandLabel}`);
    return await spawnAsync(command, cmdArgs, { logger });
  } catch (error) {
    if (sudoError) {
      throw new ProcessError(
        `Command failed with sudo and without sudo: ${commandLabel}\n` +
        `Sudo error: ${sudoError.message}\n` +
        `Non-sudo error: ${error.message}\n` +
        'Hint: Ensure you have sufficient privileges or run with passwordless sudo.'
      );
    }

    throw error;
  }
}

/**
 * Check if a command exists in PATH
 * 
 * @param {string} command - Command name
 * @param {Logger} logger - Logger instance
 * @returns {Promise<boolean>} True if command exists
 */
async function checkCommand(command, logger) {
  const checkCmd = process.platform === 'win32' ? 'where' : 'which';
  
  try {
    await spawnAsync(checkCmd, [command], { logger });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if current process has sudo privileges (Linux only)
 * 
 * @returns {boolean} True if running as root or can sudo
 */
function canSudo() {
  if (process.platform === 'win32') {
    return false;
  }

  // Check if running as root
  if (process.getuid && process.getuid() === 0) {
    return true;
  }

  return false;
}

/**
 * Check if current process can use sudo without interaction.
 *
 * @param {Logger} logger - Logger instance
 * @returns {Promise<boolean>} True if sudo is available and non-interactive access works
 */
async function hasSudoAccess(logger) {
  if (process.platform === 'win32') {
    return false;
  }

  if (canSudo()) {
    return true;
  }

  const sudoAvailable = await checkCommand('sudo', logger);
  if (!sudoAvailable) {
    return false;
  }

  try {
    await spawnAsync('sudo', ['-n', '-v'], { logger });
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  spawnAsync,
  execSudo,
  checkCommand,
  canSudo,
  hasSudoAccess
};
