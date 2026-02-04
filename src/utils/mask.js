/**
 * Mask Utility
 * 
 * Masks sensitive data in logs for security.
 */

/**
 * Mask sensitive value
 * 
 * Format: xxx-Masked:{length}-xxx
 * Shows first 3 and last 3 characters, masks the middle
 * 
 * @param {string} value - Sensitive value
 * @param {number} [showChars=3] - Number of chars to show at start/end
 * @returns {string} Masked value
 */
function maskSensitive(value, showChars = 3) {
  if (!value || typeof value !== 'string') {
    return '***';
  }

  const trimmed = value.trim();
  const length = trimmed.length;

  if (length <= showChars * 2) {
    // Too short, mask completely
    return '***-Masked-***';
  }

  const start = trimmed.substring(0, showChars);
  const end = trimmed.substring(length - showChars);
  const maskedLength = length - (showChars * 2);

  return `${start}-Masked:${maskedLength}-${end}`;
}

/**
 * Mask email address
 * 
 * @param {string} email - Email address
 * @returns {string} Masked email
 */
function maskEmail(email) {
  if (!email || !email.includes('@')) {
    return '***@***.***';
  }

  const [local, domain] = email.split('@');
  const maskedLocal = maskSensitive(local, 2);
  
  return `${maskedLocal}@${domain}`;
}

/**
 * Mask API key or token
 * 
 * @param {string} apiKey - API key or token
 * @returns {string} Masked key
 */
function maskApiKey(apiKey) {
  return maskSensitive(apiKey, 4);
}

/**
 * Mask SSH public key
 * 
 * @param {string} publicKey - SSH public key
 * @returns {string} Masked key
 */
function maskPublicKey(publicKey) {
  if (!publicKey) {
    return '***';
  }

  const parts = publicKey.trim().split(' ');
  if (parts.length < 2) {
    return maskSensitive(publicKey, 10);
  }

  const keyType = parts[0]; // ssh-rsa, ssh-ed25519, etc.
  const keyData = parts[1];
  const comment = parts[2] || '';

  const maskedData = maskSensitive(keyData, 10);
  
  return `${keyType} ${maskedData}${comment ? ' ' + comment : ''}`;
}

module.exports = {
  maskSensitive,
  maskEmail,
  maskApiKey,
  maskPublicKey
};
