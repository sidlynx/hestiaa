class PaginatedResult {
  constructor (items, currentPage, totalPages) {
    this.items = items
    this.currentPage = currentPage
    this.totalPages = totalPages
  }
}

module.exports = PaginatedResult
