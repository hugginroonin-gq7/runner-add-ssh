/**
 * Version Bump Script
 * 
 * Bumps package version with Vietnam timestamp.
 * Usage: node scripts/version.js [patch|minor|major]
 */

const fs = require('fs').promises;
const path = require('path');

// Get Vietnam timestamp
function getVNTimestamp() {
  const date = new Date();
  const options = {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  const formatter = new Intl.DateTimeFormat('en-CA', options);
  const parts = formatter.formatToParts(date);
  
  const partsMap = {};
  parts.forEach(part => {
    partsMap[part.type] = part.value;
  });

  return `${partsMap.year}-${partsMap.month}-${partsMap.day} ${partsMap.hour}:${partsMap.minute}:${partsMap.second}`;
}

async function bumpVersion() {
  const bumpType = process.argv[2] || 'patch'; // patch, minor, major
  
  if (!['patch', 'minor', 'major'].includes(bumpType)) {
    console.error('Usage: node scripts/version.js [patch|minor|major]');
    process.exit(1);
  }

  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  try {
    // Read package.json
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;
    
    console.log(`Current version: ${currentVersion}`);
    
    // Parse version
    const versionParts = currentVersion.split('.').map(Number);
    if (versionParts.length !== 3) {
      throw new Error(`Invalid version format: ${currentVersion}`);
    }
    
    let [major, minor, patch] = versionParts;
    
    // Bump version
    switch (bumpType) {
      case 'major':
        major += 1;
        minor = 0;
        patch = 0;
        break;
      case 'minor':
        minor += 1;
        patch = 0;
        break;
      case 'patch':
        patch += 1;
        break;
    }
    
    const newVersion = `${major}.${minor}.${patch}`;
    packageJson.version = newVersion;
    
    // Add timestamp comment (not in standard package.json, but useful for tracking)
    const timestamp = getVNTimestamp();
    console.log(`New version: ${newVersion}`);
    console.log(`Timestamp: ${timestamp}`);
    
    // Write package.json
    await fs.writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + '\n',
      'utf8'
    );
    
    console.log('✅ Version bumped successfully');
    console.log(`   ${currentVersion} → ${newVersion}`);
    
  } catch (error) {
    console.error('❌ Version bump failed:', error.message);
    process.exit(1);
  }
}

bumpVersion();
