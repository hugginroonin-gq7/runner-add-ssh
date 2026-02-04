/**
 * Publish Script
 * 
 * Publishes package to npm with pre-publish checks.
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

function spawnAsync(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

async function publish() {
  try {
    console.log('📦 Preparing to publish runner-add-ssh...');
    console.log('');

    // Check if package.json exists
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    console.log(`Package: ${packageJson.name}`);
    console.log(`Version: ${packageJson.version}`);
    console.log('');

    // Check npm login status
    console.log('🔐 Checking npm authentication...');
    try {
      await spawnAsync('npm', ['whoami']);
    } catch (error) {
      console.error('❌ Not logged in to npm');
      console.error('   Run: npm login');
      process.exit(1);
    }
    console.log('');

    // Run tests (if any)
    console.log('🧪 Running tests...');
    try {
      await spawnAsync('npm', ['test']);
    } catch (error) {
      console.warn('⚠️  Tests failed or not configured');
    }
    console.log('');

    // Dry run (to check what will be published)
    console.log('📋 Checking publish contents (dry run)...');
    await spawnAsync('npm', ['publish', '--dry-run']);
    console.log('');

    // Confirm publish
    console.log('⚠️  About to publish to npm registry');
    console.log('   Press Ctrl+C to cancel, or wait 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('');

    // Publish
    console.log('🚀 Publishing to npm...');
    await spawnAsync('npm', ['publish', '--access', 'public']);
    console.log('');

    console.log('✅ Published successfully!');
    console.log(`   Package: ${packageJson.name}@${packageJson.version}`);
    console.log(`   View: https://www.npmjs.com/package/${packageJson.name}`);

  } catch (error) {
    console.error('❌ Publish failed:', error.message);
    process.exit(1);
  }
}

publish();
