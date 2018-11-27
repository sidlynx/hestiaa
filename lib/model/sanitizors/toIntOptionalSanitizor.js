class ToIntOptionalSanitizor {
  /**
   * Custom sanitizor to support not-required value,
   * in order to avoid `NaN` result.
   * @param args {Object[]}
   * @return `undefined` if `value=undefined`, otherwise the default value of `indicative.sanitizor.toInt`.
   */
  static toIntOptional (value, args) {
    // undefined support
    if (!value) {
      return value
    }

    let radix = typeof args[0] === 'number' ? args[0] : 10
    return parseInt(value, radix)
  }
}

module.exports = ToIntOptionalSanitizor
