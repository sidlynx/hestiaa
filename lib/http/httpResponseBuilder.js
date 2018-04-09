/**
 * Build a response based in the return of fn, where fn can be an async
 * function. The idea behind having a HttpResponseBuilder is to improve code
 * reusability when preparing the responses from the controller.
 *
 * @example
 *   expressApp.get('/resource', HttpResponseBuilder.buildResponse(ResourceController.index))
 *
 * @param  {Function} fn Function to have it's error catched and it's response prepared
 * @return {Function} Function that will execute fn, prepare it's response and catch errors
 */
class HttpResponseBuilder {
  /**
   * Wraps the route handler (controller action) in a way that if the controller
   * action simply returns any content it will automatically be taken care and
   * redirect to 'res' object.
   *
   * @param  {Function} fn [description]
   * @return {[type]}      [description]
   */
  static buildResponse (fn) {
    return (req, res, next) => {
      const routePromise = fn(req)

      if (routePromise && typeof routePromise.catch === 'function') {
        routePromise.then((result) => {
          this.respond(result, req, res)
        }).catch(err => next(err))
        return
      }
      this.respond(routePromise, req, res)
    }
  }

  /**
   * Will respond to 'res' with the given content. This method will make sure
   * that the common 'status', 'data', 'error' pattern of the responses are
   * met.
   *
   * This is a common place to threat the responses before sending it to the
   * Users.
   */
  static respond (content, req, res) {
    if (!content || content.status === undefined) {
      content = {
        status: 'success',
        data: content || null,
        errors: [],
      }
    }
    res.json(content)
  }
}

module.exports = HttpResponseBuilder
