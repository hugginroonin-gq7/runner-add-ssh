/**
 * Report Module
 * 
 * Generates summary report and connection information.
 */

const os = require('os');

/**
 * Generate and log report
 * 
 * @param {Object} result - Execution result
 * @param {Object} config - Configuration
 * @param {Logger} logger - Logger instance
 * @returns {Object} Report data
 */
function report(result, config, logger) {
  logger.info('');
  logger.info('═══════════════════════════════════════════════════════════');
  logger.info('🎉 SSH Server Setup Complete!');
  logger.info('═══════════════════════════════════════════════════════════');
  logger.info('');

  // Connection info
  const hostname = os.hostname();
  const networkInterfaces = os.networkInterfaces();
  const ipAddresses = [];

  // Collect IP addresses
  Object.keys(networkInterfaces).forEach(ifaceName => {
    const iface = networkInterfaces[ifaceName];
    iface.forEach(addr => {
      if (addr.family === 'IPv4' && !addr.internal) {
        ipAddresses.push(addr.address);
      }
    });
  });

  logger.info('📡 Connection Information:');
  logger.info(`   Hostname: ${hostname}`);
  logger.info(`   SSH Port: ${config.port}`);
  logger.info(`   Allowed Users: ${config.allowUsers}`);
  logger.info('');

  if (ipAddresses.length > 0) {
    logger.info('🌐 IP Addresses:');
    ipAddresses.forEach(ip => {
      logger.info(`   - ${ip}`);
    });
    logger.info('');
  }

  logger.info('🔑 Connection Command Examples:');
  const users = config.allowUsers.split(' ').filter(u => u.trim());
  users.forEach(user => {
    if (ipAddresses.length > 0) {
      logger.info(`   ssh -p ${config.port} ${user}@${ipAddresses[0]}`);
    } else {
      logger.info(`   ssh -p ${config.port} ${user}@<your-ip-address>`);
    }
  });
  logger.info('');

  logger.info('📂 Default Working Directory: ' + config.defaultCwd);
  if (!config.disableForceCwd) {
    logger.info('   (SSH sessions will start in this directory)');
  }
  logger.info('');

  logger.info('═══════════════════════════════════════════════════════════');
  logger.info('');

  const reportData = {
    success: true,
    hostname,
    port: config.port,
    ipAddresses,
    allowUsers: config.allowUsers,
    defaultCwd: config.defaultCwd,
    timestamp: new Date().toISOString(),
    ...result
  };

  return reportData;
}

module.exports = report;
