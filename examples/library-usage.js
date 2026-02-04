/**
 * runner-add-ssh Library Usage Examples
 */

const { setupSSH } = require('runner-add-ssh');

// ═══════════════════════════════════════════════════════════
// Example 1: Basic programmatic usage
// ═══════════════════════════════════════════════════════════

async function example1_basic() {
  try {
    const result = await setupSSH({
      publicKey: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... user@example.com',
      port: 2222,
      allowUsers: 'runner root',
      verbose: true
    });

    console.log('SSH setup successful:', result);
    console.log('Connect with:', `ssh -p ${result.port} runner@${result.ipAddresses[0]}`);
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════
// Example 2: Read public key from file
// ═══════════════════════════════════════════════════════════

const fs = require('fs').promises;
const path = require('path');

async function example2_fromFile() {
  try {
    // Read public key from file
    const publicKeyPath = path.join(process.env.HOME, '.ssh', 'id_rsa.pub');
    const publicKey = await fs.readFile(publicKeyPath, 'utf8');

    const result = await setupSSH({
      publicKey: publicKey.trim(),
      port: 2222,
      mode: 'auto',
      defaultCwd: '/workspace'
    });

    console.log('✅ SSH configured successfully');
    console.log('Connection info:', result);
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════
// Example 3: CI/CD automation script
// ═══════════════════════════════════════════════════════════

async function example3_cicd() {
  // This would be used in a CI/CD script
  const publicKey = process.env.CI_SSH_PUBLIC_KEY;
  
  if (!publicKey) {
    console.error('CI_SSH_PUBLIC_KEY environment variable not set');
    process.exit(1);
  }

  try {
    console.log('🔧 Setting up SSH for CI/CD debugging...');

    const result = await setupSSH({
      publicKey,
      port: parseInt(process.env.SSH_PORT || '2222', 10),
      allowUsers: process.env.CI_USER || 'runner',
      defaultCwd: process.env.GITHUB_WORKSPACE || process.cwd(),
      verbose: process.env.VERBOSE === 'true'
    });

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 SSH Access Enabled');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('Connect using:');
    
    result.ipAddresses.forEach(ip => {
      console.log(`  ssh -p ${result.port} ${result.allowUsers.split(' ')[0]}@${ip}`);
    });
    
    console.log('');
    console.log('Working directory:', result.defaultCwd);
    console.log('');
    console.log('⏳ Keeping runner alive for 1 hour...');
    console.log('   (Cancel manually or let it timeout)');
    console.log('');

    // Keep process alive for debugging
    await new Promise(resolve => setTimeout(resolve, 3600000)); // 1 hour

  } catch (error) {
    console.error('❌ SSH setup failed:', error.message);
    process.exit(error.exitCode || 1);
  }
}

// ═══════════════════════════════════════════════════════════
// Example 4: Integration with custom deployment script
// ═══════════════════════════════════════════════════════════

async function example4_deployment() {
  console.log('📦 Running deployment with SSH access...');

  try {
    // Setup SSH for debugging if needed
    if (process.env.ENABLE_SSH_DEBUG === 'true') {
      console.log('🔑 Enabling SSH debug access...');
      
      await setupSSH({
        publicKey: process.env.ADMIN_SSH_KEY,
        port: 2222,
        allowUsers: 'deploy admin',
        mode: 'user',
        quiet: true // Don't pollute deployment logs
      });

      console.log('✅ SSH debug access enabled on port 2222');
    }

    // Continue with deployment tasks
    console.log('🚀 Starting deployment...');
    // ... deployment logic ...

  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// Example 5: Error handling and retry logic
// ═══════════════════════════════════════════════════════════

async function example5_errorHandling() {
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      console.log(`Attempt ${attempt}/${MAX_RETRIES}...`);

      const result = await setupSSH({
        publicKey: process.env.SSH_RUNNER_PUBLIC_KEY,
        port: 2222,
        verbose: attempt > 1 // Enable verbose on retry
      });

      console.log('✅ Success on attempt', attempt);
      return result;

    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);

      if (error.exitCode === 2) {
        // ValidationError - don't retry
        console.error('Configuration error - fix and try again');
        throw error;
      }

      if (attempt >= MAX_RETRIES) {
        console.error('Max retries reached');
        throw error;
      }

      // Wait before retry
      console.log(`Waiting 5 seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Run examples
// ═══════════════════════════════════════════════════════════

// Uncomment the example you want to run:

// example1_basic();
// example2_fromFile();
// example3_cicd();
// example4_deployment();
// example5_errorHandling();

module.exports = {
  example1_basic,
  example2_fromFile,
  example3_cicd,
  example4_deployment,
  example5_errorHandling
};
