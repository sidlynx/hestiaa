const expect = require('expect.js')
const sinon = require('sinon').createSandbox()

const { findPaginated } = require('../../lib/http/paginator')
const PaginatedResult = require('../../lib/http/paginatedResult')

const Model = require('mongorito').Model

class ModelMock extends Model {}

describe('http/paginator', () => {
  afterEach(() => sinon.restore())

  describe('findPaginated', () => {
    it('"count" parameter must be a positive number', async () => {
      let err = await findPaginated(ModelMock, { count: -1, offset: 99 }, {})
        .then((x) => expect().fail(x)).catch(e => e) // must fail
      expect(err).to.be.a(RangeError)
    })

    it('"offset" parameter must be a positive number', async () => {
      let err = await findPaginated(ModelMock, { count: 99, offset: -1 }, {})
        .then((x) => expect().fail(x)).catch(e => e) // must fail
      expect(err).to.be.a(RangeError)
    })

    it('Should execute correct MongoDB request and returns paginated results', async () => {
      let items = [new ModelMock(), new ModelMock()]

      let mqueryStub = {
        sort: sinon.stub(),
        skip: sinon.stub(),
        limit: sinon.stub(),
        find: sinon.stub()
      }

      mqueryStub.sort = sinon.stub(ModelMock, 'sort').returns(mqueryStub)
      mqueryStub.sort.returns(mqueryStub)
      mqueryStub.skip.returns(mqueryStub)
      mqueryStub.limit.returns(mqueryStub)
      mqueryStub.find.resolves(items)

      let getCollectionStub = sinon.stub(ModelMock, 'getCollection')
      let collectionStub = {
        count: sinon.stub().resolves(30)
      }
      getCollectionStub.resolves(collectionStub)
      let result = await (findPaginated(ModelMock, { count: 5, offset: 10 }, { userId: 'search' }))

      expect(mqueryStub.sort.withArgs({ _id: 1 }).called).to.be(true)
      expect(mqueryStub.skip.withArgs(10).called).to.be(true)
      expect(mqueryStub.limit.withArgs(5).called).to.be(true)
      expect(mqueryStub.find.withArgs({ userId: 'search' }).called).to.be(true)
      expect(result.constructor).to.be(PaginatedResult)
      expect(result.currentPage).to.be.a('number')
      expect(result.totalPages).to.be.a('number')
      expect(result.items).to.eql(items)
    })
  })
})
