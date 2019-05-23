const expect = require('expect.js')
const sinon = require('sinon').createSandbox()
const ForbiddenError = require('../../lib/errors/forbiddenError')
const UserTokenMiddleware = require('../../lib/middleware/userTokenMiddleware')
const jwt = require('jsonwebtoken')

describe('middleware/userTokenMiddleware', () => {
  describe('hasRole', () => {
    it('Should throw "Error" if registered after "UserTokenMiddleware"', () => {
      let req = {} // no "tokenPayload"
      let next = sinon.stub()

      let error
      try {
        UserTokenMiddleware.hasRole(['any'])(req, null, next)
      } catch (e) {
        error = e
      }

      expect(error).to.be.a(Error)
      expect(next.called).to.be(false)
    })

    it('Should throw "ForbiddenError" if missing role', () => {
      let req = { tokenPayload: { roles: ['expected', 'other'] } }
      let next = sinon.stub()

      let error
      try {
        UserTokenMiddleware.hasRole(['expected', 'absent'])(req, null, null)
      } catch (e) {
        error = e
      }

      expect(error).to.be.a(ForbiddenError)
      expect(error.message).to.contain('absent')
      expect(next.called).to.be(false)
    })

    it('Should call "next()" if has all roles', () => {
      const role = 'role'

      let req = { tokenPayload: { roles: [role] } }
      let next = sinon.stub()

      UserTokenMiddleware.hasRole([role])(req, null, next)

      expect(next.called).to.be(true)
    })

    it('Should call next if the request has a valid jwt token in the Authorization header, Bearer prefix', () => {
      // Given
      process.env.APP_KEY = 'MY_SECRET_KEY'

      let validJwtToken = jwt.sign({ foo: 'bar' }, process.env.APP_KEY)
      let req = { headers: { authorization: `Bearer ${validJwtToken}` } }
      let next = sinon.stub()

      // When
      UserTokenMiddleware.getHandler()(req, null, next)

      // Then
      sinon.assert.calledWithExactly(next)
      expect(req.tokenPayload.foo).to.be('bar')
    })

    it('Should call next if the request has a valid jwt token in the Authorization header, without Bearer prefix', () => {
      // Given
      process.env.APP_KEY = 'MY_SECRET_KEY'

      let validJwtToken = jwt.sign({ foo: 'bar' }, process.env.APP_KEY)
      let req = { headers: { authorization: `${validJwtToken}` } }
      let next = sinon.stub()

      // When
      UserTokenMiddleware.getHandler()(req, null, next)

      // Then
      sinon.assert.calledWithExactly(next)
      expect(req.tokenPayload.foo).to.be('bar')
    })

    it('Should call next with an error if the request has not a valid jwt token in the Authorization header', () => {
      // Given
      process.env.APP_KEY = 'MY_SECRET_KEY'

      let req = { headers: { authorization: 'an invalid token' } }
      let next = sinon.stub()

      // When
      UserTokenMiddleware.getHandler()(req, null, next)

      // Then
      sinon.assert.calledWithMatch(next, sinon.match.instanceOf(jwt.JsonWebTokenError))
    })

    it('Should call next with an error if the request has no Authorization header', () => {
      // Given

      let req = { headers: { } }
      let next = sinon.stub()

      // When
      UserTokenMiddleware.getHandler()(req, null, next)

      // Then
      sinon.assert.calledWithMatch(next, sinon.match.instanceOf(jwt.JsonWebTokenError))
    })
  })
})
