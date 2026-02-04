/**
 * Error Utilities
 * 
 * Custom error classes with specific exit codes.
 */

/**
 * Base error class with exit code
 */
class BaseError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.name = this.constructor.name;
    this.exitCode = exitCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * ValidationError - Configuration or input validation failed
 * Exit code: 2
 */
class ValidationError extends BaseError {
  constructor(message) {
    super(message, 2);
  }
}

/**
 * NetworkError - Network-related errors (downloads, API calls)
 * Exit code: 10
 */
class NetworkError extends BaseError {
  constructor(message) {
    super(message, 10);
  }
}

/**
 * ProcessError - Process spawn or execution errors
 * Exit code: 20
 */
class ProcessError extends BaseError {
  constructor(message) {
    super(message, 20);
  }
}

/**
 * Handle error and exit with appropriate code
 * 
 * @param {Error} error - Error object
 * @param {Logger} logger - Logger instance
 */
function handleError(error, logger) {
  logger.error('Operation failed', {
    error: error.message,
    name: error.name,
    stack: error.stack
  });

  const exitCode = error.exitCode || 1;

  // Provide helpful hints based on error type
  if (error instanceof ValidationError) {
    logger.error('');
    logger.error('💡 Hint: Check your configuration (SSH_* environment variables)');
    logger.error('   Run with --verbose for more details');
  } else if (error instanceof ProcessError) {
    logger.error('');
    logger.error('💡 Hint: Check system permissions and required dependencies');
    logger.error('   On Linux: You may need sudo privileges');
    logger.error('   On Windows: Run as Administrator');
  } else if (error instanceof NetworkError) {
    logger.error('');
    logger.error('💡 Hint: Check your network connection and firewall settings');
  }

  logger.error('');
  logger.error(`Exiting with code: ${exitCode}`);
  
  process.exit(exitCode);
}

module.exports = {
  BaseError,
  ValidationError,
  NetworkError,
  ProcessError,
  handleError
};
