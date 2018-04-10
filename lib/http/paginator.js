const PaginatedResult = require('./paginatedResult')

/**
 * @param requestQuery {@link express~Request#query}
 * @see mongorito~Model.find
 */
async function findPaginated (model, requestQuery, query) {
  let count = requestQuery.count || process.env.PAGINATION_COUNT || '10'
  count = parseInt(count, 10)
  if (count < 0) {
    throw new RangeError('"count" parameter must be positive')
  }

  let offset = requestQuery.offset || process.env.PAGINATION_OFFSET || '0'
  offset = parseInt(offset, 10)
  if (offset < 0) {
    throw new RangeError('"offset" parameter must be positive')
  }

  let result = await model
    .sort({ _id: 1 })
    .skip(offset).limit(count) // pagination
    .find(query)

  let collection = await model.getCollection()
  let totalItems = await collection.count(query)
  return new PaginatedResult(result, Math.ceil(offset / count), Math.ceil(totalItems / count))
}

module.exports = {
  findPaginated
}
