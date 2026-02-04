/**
 * Setup Command
 * 
 * Executes the SSH setup pipeline.
 */

const parseInput = require('../../core/parseInput');
const validate = require('../../core/validate');
const plan = require('../../core/plan');
const execute = require('../../core/execute');
const report = require('../../core/report');
const Logger = require('../../utils/logger');
const { handleError } = require('../../utils/errors');

/**
 * Setup command handler
 * 
 * @param {Object} options - Commander options
 * @param {Object} command - Commander command object
 */
async function setupCommand(options, command) {
  // Get global options
  const globalOpts = command.parent.opts();
  
  const logger = new Logger({
    cwd: globalOpts.cwd || process.cwd(),
    verbose: globalOpts.verbose || false,
    quiet: globalOpts.quiet || false
  });

  try {
    logger.info('🚀 runner-add-ssh - Starting SSH setup...');
    
    // Merge CLI options with global options
    const cliOptions = {
      publicKey: options.publicKey,
      port: options.port,
      mode: options.mode,
      allowUsers: options.allowUsers,
      defaultCwd: options.defaultCwd,
      disableForceCwd: options.disableForceCwd,
      cwd: globalOpts.cwd,
      verbose: globalOpts.verbose,
      quiet: globalOpts.quiet
    };

    // Parse input (merge CLI options with env)
    const config = parseInput(cliOptions);
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
    report(result, config, logger);

    process.exit(0);

  } catch (error) {
    handleError(error, logger);
  }
}

module.exports = setupCommand;
