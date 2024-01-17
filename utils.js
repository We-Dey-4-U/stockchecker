// utils.js
const crypto = require('crypto');
const { isPrivate, toBuffer } = require('ip');

function anonymizeIP(ip) {
  // Check if the IP is private
  const isPrivateIP = isPrivate(ip);

  // Convert the IP address to a buffer
  const ipBuffer = toBuffer(ip);

  // Truncate the buffer to get a partial IP address
  const truncatedIPBuffer = ipBuffer.slice(0, isPrivateIP ? 2 : 4);

  // Hash the truncated IP address
  const hashedIP = crypto.createHash('sha256').update(truncatedIPBuffer).digest('hex');

  return hashedIP;
}

module.exports = {
  anonymizeIP,
};