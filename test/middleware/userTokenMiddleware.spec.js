const expect = require('expect.js')
const sinon = require('sinon').createSandbox()
const ForbiddenError = require('../../lib/errors/forbiddenError')
const UserTokenMiddleware = require('../../lib/middleware/userTokenMiddleware')

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
      let req = {tokenPayload: {roles: ['expected', 'other']}}
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

      let req = {tokenPayload: {roles: [role]}}
      let next = sinon.stub()

      UserTokenMiddleware.hasRole([role])(req, null, next)

      expect(next.called).to.be(true)
    })
  })
})
