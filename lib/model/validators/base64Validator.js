const regex = /^(?:[a-zA-Z0-9+/]{4})*(?:|(?:[a-zA-Z0-9+/]{3}=)|(?:[a-zA-Z0-9+/]{2}==)|(?:[a-zA-Z0-9+/]{1}===))$/

class Base64Validator {
  static validate (fieldValue, message, resolve, reject) {
    if (fieldValue.match(regex)) {
      resolve('Value is a valid Base64 string')
    } else {
      reject(message)
    }
  }
}

module.exports = Base64Validator
