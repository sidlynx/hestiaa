const nock = require('nock')
const sinon = require('sinon').sandbox.create()
const expect = require('expect.js')
const CircuitBreaker = require('../../lib/utils/circuitBreaker')

describe('utils/CircuitBreaker', () => {
  beforeEach('Reset non-stateless module state', () => {
    sinon.stub(CircuitBreaker, '_failsCounter').value({})
    sinon.stub(CircuitBreaker, '_deactivationDate').value({})
  })

  afterEach(() => nock.cleanAll())
  afterEach(() => sinon.restore())

  const URL = 'http://example.org'
  const REQ = {method: 'GET', url: URL}
  const serviceId = 'any'

  describe('#request()', () => {
    describe('Returned value', () => {
      it('Should return last successful response', async () => {
        let mock1 = nock(URL).get('/').reply(501, 'first')
        let mock2 = nock(URL).get('/').reply(202, 'second')
        let mock3 = nock(URL).get('/').reply(503, 'third')

        let response = await CircuitBreaker.request(REQ)

        expect(mock1.isDone()).to.be(true)
        expect(mock2.isDone()).to.be(true)
        expect(response).to.be('second')
        expect(mock3.isDone()).to.be(false)
      })

      it('Should throw last error', async () => {
        nock(URL).get('/').reply(501, 'first')
        nock(URL).get('/').reply(502, 'second')
        nock(URL).get('/').reply(503, 'third')

        let error
        try {
          await CircuitBreaker.request(REQ)
        } catch (e) {
          error = e
        }

        expect(error.error).to.be('third')
        expect(error.statusCode).to.be(503)
      })
    })

    describe('Retry', () => {
      it('Should process request at most "attemptsCount" time when error', async () => {
        let mock1 = nock(URL).get('/').reply(501, 'first')
        let mock2 = nock(URL).get('/').reply(502, 'second')
        let mock3 = nock(URL).get('/').reply(503, 'third')

        let error
        try {
          await CircuitBreaker.request(REQ, {attemptsCount: 2})
        } catch (e) {
          error = e
        }

        expect(mock1.isDone()).to.be(true)
        expect(mock2.isDone()).to.be(true)
        expect(error).to.not.be(undefined)
        expect(mock3.isDone()).to.be(false)
      })
    })

    describe('Sleep', () => {
      it('Should wait "sleepTime" between each attempt', async () => {
        const sleepTime = 100

        nock(URL).get('/').reply(501, 'first')
        nock(URL).get('/').reply(502, 'second')
        nock(URL).get('/').reply(203, 'third')

        let startDate = Date.now()
        await CircuitBreaker.request(REQ, {sleepTime})
        let endDate = Date.now()

        // max normal process execution time
        // must be VERY lower than "sleepTime" to avoid side effects
        let delta = 30
        expect(endDate - startDate).to.be.greaterThan(2 * sleepTime, 2 * sleepTime + delta)
      })
    })

    describe('Temporary deactivation', () => {
      it('Should be deactivated after "deactivateAfter" fails', async () => {
        nock(URL).get('/').reply(501, 'first')
        nock(URL).get('/').reply(502, 'second')
        nock(URL).get('/').reply(503, 'third')

        expect(CircuitBreaker._deactivationDate).to.not.have.property(serviceId)
        try {
          await CircuitBreaker.request(REQ, {serviceId, deactivateAfter: 2})
        } catch (e) {}

        expect(CircuitBreaker._deactivationDate).to.have.property(serviceId)
      })

      it('Should directly fail when target service is deactivated', async () => {
        // lock service
        expect(CircuitBreaker._deactivationDate).to.not.have.property(serviceId)
        nock(URL).get('/').reply(501, 'first')
        try {
          await CircuitBreaker.request(REQ, {serviceId, attemptsCount: 1, deactivateAfter: 1})
        } catch (e) {}
        expect(CircuitBreaker._deactivationDate).to.have.property(serviceId)

        let nock2 = nock(URL).get('/').reply(202, 'second')

        let error
        try {
          await CircuitBreaker.request(REQ, {serviceId, reactivateAfter: 9999})
        } catch (e) {
          error = e
        }

        expect(nock2.isDone()).to.be(false)
        expect(error).to.be.a(CircuitBreaker.CircuitBreakerError)
      })

      it('Should be reactivated after "reactivateAfter" duration', async () => {
        // lock service
        expect(CircuitBreaker._deactivationDate).to.not.have.property(serviceId)
        let nock1 = nock(URL).get('/').reply(501, 'first')
        try {
          await CircuitBreaker.request(REQ, {serviceId, attemptsCount: 1, deactivateAfter: 1})
        } catch (e) {}
        expect(nock1.isDone()).to.be(true)
        expect(CircuitBreaker._deactivationDate).to.have.property(serviceId)

        const reactivateAfter = 100

        // long time after
        let now = Date.now()
        sinon.stub(Date, 'now').returns(now + reactivateAfter + 9999)

        // now must success
        let nock2 = nock(URL).get('/').reply(202, 'second')
        await CircuitBreaker.request(REQ, {serviceId, reactivateAfter})
        expect(nock2.isDone()).to.be(true)
      })

      it('Should deactivate only for CONSECUTIVE fails', async () => {
        const deactivateAfter = 3

        nock(URL).get('/').reply(501, 'first')
        nock(URL).get('/').reply(502, 'second')
        nock(URL).get('/').reply(203, 'third')
        nock(URL).get('/').reply(504, 'fifth')
        nock(URL).get('/').reply(505, 'fourth')
        nock(URL).get('/').reply(206, 'sixth')

        await CircuitBreaker.request(REQ, {deactivateAfter})
        await CircuitBreaker.request(REQ, {deactivateAfter})
      })

      it('Should deactivate only service who was failed', async () => {
        nock('http://example.org').get('/').reply(501, 'first')
        nock('http://example.org').get('/').reply(202, 'second')
        nock('http://other.io').get('/').reply(201, 'first')

        const deactivateAfter = 1
        try {
          await CircuitBreaker.request({method: 'GET', url: 'http://example.org'}, {deactivateAfter})
        } catch (e) {}
        expect(CircuitBreaker._deactivationDate).to.have.property('http://example.org')
        try {
          await CircuitBreaker.request({method: 'GET', url: 'http://example.org'}, {deactivateAfter})
        } catch (e) {}

        await CircuitBreaker.request({method: 'GET', url: 'http://other.io'})
      })
    })
  })
})
