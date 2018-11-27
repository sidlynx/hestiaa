const PaginatedResult = require('./paginatedResult')

/**
 * Executes a find query on the model and paginates the result
 *
 * This function aims to avoid reaching maximum request size and/or overloading backend.
 * Therefore, when an actual paginator will be built on client side, the initial load time
 * will be reduced.
 *
 * For example, retrieving 10 articles will be quicker then retrieving 1000 articles. This
 * is more relevant because what we want is the first results and not all of them.
 *
 * @param {Model} model the model on which we want to execute the query
 * @param {Request} requestQuery {@link express~Request#query}
 * @param {object} query the query to execute on the modeol
 * @see mongorito~Model.find
 * @see paginatedResult
 * @returns {PaginatedResult} An instance of paginated result
 */
async function findPaginated (model, requestQuery, query) {
  let count = requestQuery.count || process.env.PAGINATION_COUNT || '20'
  count = parseInt(count, 10)
  if (count < 0) {
    throw new RangeError('"count" parameter must be positive')
  }

  let offset = requestQuery.offset || '0'
  offset = parseInt(offset, 10)
  if (offset < 0) {
    throw new RangeError('"offset" parameter must be positive')
  }

  let result = await model
    .sort({ _id: 1 })
    .skip(offset)
    .limit(count) // pagination
    .find(query)

  let collection = await model.getCollection()
  let totalItems = await collection.count(query)
  return new PaginatedResult(result, Math.ceil(offset / count), Math.ceil(totalItems / count))
}

module.exports = {
  findPaginated
}
