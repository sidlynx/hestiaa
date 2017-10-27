/**
 * Catch errors of asynchronous function calls. IE: Controller methods
 *
 * @example
 *   router.get('/resource', catchError(ResourceController.index))
 *
 * @param  {Function} fn Function to have it's error catchd during execution
 * @return {Function} Function that will execute fn and catch it's erros.
 */
function catchError (fn) {
  return (req, res, next) => {
    const routePromise = fn(req, res, next)
    if (routePromise && typeof routePromise.catch === 'function') {
      routePromise.catch(err => next(err))
    }
  }
}

module.exports = catchError
