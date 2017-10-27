const request = require('request')

function getBaseUrl () {
  return 'http://' + process.env.HOST + ':' + process.env.PORT
}

function apiRequest (uri, options, callback) {
  return request(getBaseUrl() + uri, options, callback)
};

function wrapRequestMethod (method) {
  return function (uri, options, callback) {
    return request[method](getBaseUrl() + uri, options, callback)
  }
}

var verbs = ['get', 'head', 'post', 'put', 'patch', 'del', 'delete']
verbs.forEach(function (verb) {
  apiRequest[verb] = wrapRequestMethod(verb)
})

module.exports = apiRequest
