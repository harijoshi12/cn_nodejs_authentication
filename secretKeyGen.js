/**
 * Cryptographic utility functions for generating various types of secrets and keys.
 * @module cryptoUtils
 */

import crypto from "crypto";

/**
 * Generates a random secret key.
 * @param {number} [bytes=32] - The number of bytes for the secret key.
 * @returns {string} A hexadecimal string representation of the secret key.
 */
function generateSecretKey(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

// Generate and log a secret key
const secretKey = generateSecretKey();
console.log("Secret Key:", secretKey);

/**
 * Generates a random JWT secret.
 * @param {number} [bytes=64] - The number of bytes for the JWT secret.
 * @returns {string} A hexadecimal string representation of the JWT secret.
 */
function generateJWTSecret(bytes = 64) {
  return crypto.randomBytes(bytes).toString("hex");
}

// Generate and log a JWT secret
const jwtSecret = generateJWTSecret();
console.log("JWT Secret:", jwtSecret);

/**
 * Generates a random session secret.
 * @param {number} [bytes=32] - The number of bytes for the session secret.
 * @returns {string} A base64 string representation of the session secret.
 */
function generateSessionSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64");
}

// Generate and log a session secret
const sessionSecret = generateSessionSecret();
console.log("Session Secret:", sessionSecret);

/**
 * Generates a symmetric encryption key for AES.
 * @returns {crypto.KeyObject} A KeyObject containing the generated key.
 */
function generateEncryptionKey() {
  return crypto.generateKeySync("aes", { length: 256 });
}

// Generate and log an encryption key
const encryptionKey = generateEncryptionKey();
console.log("Encryption Key:", encryptionKey.export().toString("hex"));

/**
 * Generates a random API key with an optional prefix.
 * @param {string} [prefix='API'] - The prefix to use for the API key.
 * @returns {string} A string in the format "PREFIX_HEXSTRING".
 */
function generateAPIKey(prefix = "API") {
  const bytes = crypto.randomBytes(16);
  const hex = bytes.toString("hex");
  return `${prefix}_${hex}`;
}

// Generate and log an API key
const apiKey = generateAPIKey();
console.log("API Key:", apiKey);
