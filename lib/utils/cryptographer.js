const crypto = require('crypto')
const bcrypt = require('bcryptjs')

/**
 * Facade to handle encryption and decryption of strings based upon Node's
 * crypto to encrypt and decrypt values with a SALT. By default all values are
 * encrypted using aes-256-cbc algorithm.
 *
 * It uses the APP_KEY environment variable as the encryption key
 *
 * It also takes care that the same string will not be encrypted twice and also
 * throws an human readable error when trying to decrypt a non encrypted string
 */
class Cryptographer {
  /**
   * Encrypt the given string
   *
   * @param  {string} input
   * @param  {string} [key] Encryption key. Default: process.env.APP_KEY
   * @return {string}
   */
  static encrypt (input, key = process.env.APP_KEY) {
    if (Cryptographer.isEncrypted(input)) {
      return input
    }

    const cipher = crypto.createCipheriv('aes-256-cbc', key)
    let crypted = cipher.update(input, 'utf8', 'hex')
    crypted += cipher.final('hex')
    return crypted
  }

  /**
   * @param {string} input
   * @return {boolean}
   */
  static isEncrypted (input) {
    return /^[0-9a-f]{32,}$/g.test(input)
  }

  /**
   * Decript the given string
   *
   * @param  {string} input Encrypted string
   * @param  {string} [key] Encryption key. Default: process.env.APP_KEY
   * @return {string}
   */
  static decrypt (input, key = process.env.APP_KEY) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key)
    let decrypted = decipher.update(input, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  /**
   * Hashes the given string into a non-reversable string for safety reasons
   * @see https://en.wikipedia.org/wiki/Cryptographic_hash_function
   * @param {string} input
   * @return {string} Hashed string
   */
  static hash (input) {
    return crypto.createHash('sha512').update(_applySalt(input)).digest('hex')
  }

  /**
   * Tests if the given input matches with a previous generated hash
   * @param {string} input
   * @param {string} hash Hash generated previously
   * @return {bool}
   */
  static matchWithHash (input, hash) {
    return Cryptographer.hash(input) === hash
  }

  /**
   * Hashes the given string into a non-reversable string for safety reasons using Bcrypt
   * @param {string} input
   * @return {string} generated bcrypt hash
   */
  static bcrypt (input) {
    // Prevent a Bcrypt hash to be re-hashed
    if (/^\$2[aby]?\$[\d]+\$[./A-Za-z0-9]{53}$/.test(input)) {
      return input
    }
    // Generate the hash with a level of 10, the greater the better but the slower
    const salt = bcrypt.genSaltSync(10)
    // Encrypt the given input with the previously generated hash
    return bcrypt.hashSync(input, salt)
  }

  /**
   * Tests if the given input matches with a previous generated  Bcrypt hash
   * @param {string} input
   * @param {string} Previously generated Bcrypt hash
   * @param {bool}
   */
  static matchWithBcrypt (input, hash) {
    return bcrypt.compareSync(input, hash)
  }
}

/**
 * In order to defend agains dictionary and rainbow table attacks.
 * @see https://en.wikipedia.org/wiki/Salt_(cryptography)
 * @param {string} input
 * @return {string} Salted input
 */
function _applySalt (input) {
  let salt = process.env.APP_KEY.substring(0, input.length + 1) + input.charCodeAt(2).toString() + input.charCodeAt(4).toString()
  return input + salt
}

module.exports = Cryptographer
