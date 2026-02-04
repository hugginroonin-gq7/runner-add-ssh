/**
 * Time Adapter
 * 
 * Provides time utilities with Vietnam timezone support.
 */

/**
 * Get current timestamp formatted for Vietnam timezone
 * 
 * @param {Date} [date=new Date()] - Date object
 * @returns {string} Formatted timestamp (yyyy-MM-dd HH:mm:ss)
 */
function getVNTimestamp(date = new Date()) {
  // Format: yyyy-MM-dd HH:mm:ss
  // Use Asia/Ho_Chi_Minh timezone
  
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

/**
 * Get current date in Vietnam timezone (yyyy-MM-dd)
 * 
 * @returns {string} Date string
 */
function getVNDate() {
  const timestamp = getVNTimestamp();
  return timestamp.split(' ')[0];
}

/**
 * Get current time in Vietnam timezone (HH:mm:ss)
 * 
 * @returns {string} Time string
 */
function getVNTime() {
  const timestamp = getVNTimestamp();
  return timestamp.split(' ')[1];
}

/**
 * Format duration in milliseconds to human readable
 * 
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

module.exports = {
  getVNTimestamp,
  getVNDate,
  getVNTime,
  formatDuration
};
