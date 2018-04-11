/**
 * Creates a paginated result, that is to say a result
 * that is split into multiple pages.
 *
 * The relevant informations on a PaginatedResult are
 * the actual content, the current page and the total pages.
 *
 * For example, if a database has 100 articles and we want to retrieve
 * them 10 by 10, then the totalPages will be 10, the currentPage
 * will be 0 and the content will be an array containing the first 10 results
 *
 */
class PaginatedResult {
  /**
   * Constructs the PaginatedResult
   *
   * @see mongorito~Model.find
   * @param {[object]} items an array of objects
   * @param {*} currentPage the current page
   * @param {*} totalPages the number of total pages returned
   */
  constructor (items, currentPage, totalPages) {
    this.items = items
    this.currentPage = currentPage
    this.totalPages = totalPages
  }
}

module.exports = PaginatedResult
