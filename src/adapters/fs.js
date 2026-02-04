/**
 * File System Adapter
 * 
 * Provides file system operations with cross-platform support.
 */

const fs = require('fs').promises;
const path = require('path');
const { execSudo } = require('./process');

/**
 * Ensure directory exists, create if not
 * 
 * @param {string} dirPath - Directory path
 */
async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Read file content
 * 
 * @param {string} filePath - File path
 * @param {string} [encoding='utf8'] - File encoding
 * @returns {Promise<string>} File content
 */
async function readFile(filePath, encoding = 'utf8') {
  return await fs.readFile(filePath, encoding);
}

/**
 * Write file content
 * 
 * @param {string} filePath - File path
 * @param {string} content - File content
 */
async function writeFile(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf8');
}

/**
 * Atomic write - write to temp file then rename
 * 
 * @param {string} filePath - Target file path
 * @param {string} content - File content
 */
async function atomicWrite(filePath, content) {
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  
  try {
    await writeFile(tempPath, content);
    await fs.rename(tempPath, filePath);
  } catch (error) {
    // Cleanup temp file if failed
    try {
      await fs.unlink(tempPath);
    } catch (cleanupError) {
      // Ignore cleanup error
    }
    throw error;
  }
}

/**
 * Read JSON file
 * 
 * @param {string} filePath - File path
 * @returns {Promise<Object>} Parsed JSON
 */
async function readJson(filePath) {
  const content = await readFile(filePath);
  return JSON.parse(content);
}

/**
 * Write JSON file
 * 
 * @param {string} filePath - File path
 * @param {Object} data - Data to write
 * @param {number} [indent=2] - JSON indent
 */
async function writeJson(filePath, data, indent = 2) {
  const content = JSON.stringify(data, null, indent);
  await atomicWrite(filePath, content);
}

/**
 * Check if file or directory exists
 * 
 * @param {string} filePath - File path
 * @returns {Promise<boolean>} True if exists
 */
async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Change file permissions (chmod)
 * 
 * @param {string} filePath - File path
 * @param {string} mode - Permission mode (e.g., '644', '755')
 * @param {Object} config - Configuration (for sudo fallback)
 * @param {Logger} logger - Logger instance
 */
async function chmod(filePath, mode, config, logger) {
  const platform = process.platform;
  
  if (platform === 'win32') {
    // Windows doesn't have chmod, skip
    logger.debug(`Skipping chmod on Windows: ${filePath}`);
    return;
  }

  try {
    // Try without sudo first
    await fs.chmod(filePath, parseInt(mode, 8));
    logger.debug(`chmod ${mode} ${filePath} (no sudo)`);
  } catch (error) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      // Permission denied, try with sudo
      logger.debug(`chmod failed, retrying with sudo: ${error.message}`);
      await execSudo(['chmod', mode, filePath], logger);
      logger.debug(`chmod ${mode} ${filePath} (with sudo)`);
    } else {
      throw error;
    }
  }
}

/**
 * Delete file
 * 
 * @param {string} filePath - File path
 */
async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

module.exports = {
  ensureDir,
  readFile,
  writeFile,
  atomicWrite,
  readJson,
  writeJson,
  exists,
  chmod,
  deleteFile
};
