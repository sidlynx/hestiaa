const expect = require('expect.js')
const sinon = require('sinon').createSandbox()

const { respond } = require('../../lib/http/httpResponseBuilder')
const PaginatedResult = require('../../lib/http/paginatedResult')

describe('http/httpResonseBuilder', () => {
  describe('respond', () => {
    context('With simple json', () => {
      it('Should not wrap twice response', () => {
        let input = {
          'foo': 'bar'
        }

        let res = {
          json: sinon.stub()
        }

        respond(input, null, res)

        let expectedOutput = {
          status: 'success',
          data: input,
          errors: []
        }

        expect(res.json.withArgs(expectedOutput).called).to.be(true)
      })

      it('Should support "undefined" input', () => {
        let input

        let res = {
          json: sinon.stub()
        }

        respond(input, null, res)

        let expectedOutput = {
          status: 'success',
          data: null,
          errors: []
        }

        expect(res.json.withArgs(expectedOutput).called).to.be(true)
      })

      let inputs = [false, 0, false, '']
      inputs.forEach(input =>
        it(`Should support "${input}" inputs who are considered as "false"`, () => {
          let res = {
            json: sinon.stub()
          }

          respond(input, null, res)

          let expectedOutput = {
            status: 'success',
            data: input,
            errors: []
          }

          expect(res.json.withArgs(expectedOutput).called).to.be(true)
        })
      )
    })

    context('With paginated result', () => {
      it('Should append _meta attributes', () => {
        let items = {
          'foo': 'bar'
        }

        let input = new PaginatedResult(items, 0, 1)

        let res = {
          json: sinon.stub()
        }

        respond(input, null, res)

        let expectedOutput = {
          status: 'success',
          data: items,
          errors: [],
          _meta: {
            currentPage: 0,
            totalPages: 1
          }
        }

        expect(res.json.withArgs(expectedOutput).called).to.be(true)
      })
    })
  })
})
