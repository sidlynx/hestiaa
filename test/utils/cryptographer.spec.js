const Cryptographer = require('../../lib/utils/cryptographer')
const expect = require('expect.js')
const sinon = require('sinon').sandbox.create()

describe('utils/Cryptographer', () => {
  beforeEach(() => sinon.stub(process, 'env').value({ ...process.env, APP_KEY: 'secret_app_key_123' }))

  describe('encrypt()', () => {
    it('Should encrypt string', () => {
      let input = 'some human readable string'
      let encrypted = Cryptographer.encrypt(input)

      expect(encrypted).not.to.be(input)
    })

    it('Should not encrypt string twice', () => {
      let input = 'some human readable string'
      let encrypted = Cryptographer.encrypt(input)
      let encryptedTwice = Cryptographer.encrypt(encrypted)

      expect(encryptedTwice).to.be.equal(encrypted)
    })
  })

  describe('decrypt()', () => {
    it('Should decrypt encrypted string', () => {
      let expected = 'some human readable string'
      let encrypted = Cryptographer.encrypt(expected)
      let result = Cryptographer.decrypt(encrypted)

      expect(result).to.be(expected)
    })

    it('Should not decrypt non encrypted string', () => {
      let expected = 'some human readable string'
      let error

      try {
        Cryptographer.decrypt(expected)
      } catch (err) {
        error = err
      }

      expect(error).to.be.a(Error)
    })
  })

  describe('hash()', () => {
    it('Should hash string (non reversable)', () => {
      let input = 'user input'
      let hashed = Cryptographer.hash(input)
      let decrypted
      try {
        // This should not work. That's is the point of the hash
        decrypted = Cryptographer.decrypt(hashed)
      } catch (err) {
        decrypted = err
      }

      expect(hashed).to.not.be.equal(input)
      expect(decrypted).to.not.be.equal(hashed)
    })

    it('Should hash with salt to avoid dictionary attacks', () => {
      // The following is the sha512 hash for "password"
      let hashForPassword = 'b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86'

      expect(Cryptographer.hash('password')).to.not.eql(hashForPassword)
    })

    it('Should ensure consistent hash and salt algorithm', () => {
      // To make sure that the salt algorithm will not change. Since it's
      // change would break the matching capabilities off all passwords
      // hashed previously ⚠
      expect(Cryptographer.hash('secret123')).to.eql('767a426b17669278c7bc3461bc93da2a77dbe5f198e9c8e7e85037cb1b595dee83c01c703c4a252de6ff1afe90d8fa563fae2f8e9adfcf614ff8d0f9058bebb6')
      expect(Cryptographer.hash('foobar@_42_2018')).to.eql('6285214d264ce229f02b80bcde83323af496da970eb46b6e19f37a7ef11dff2f5cdc480fbab38818e634549c85d3dd51ca3bc8dfc471de51bbaebc3ad66db9f5')
    })

    it('Should be able to check if hash matches', () => {
      let input = 'user input'
      let badInput = 'non matching input'
      let hash = Cryptographer.hash(input)
      expect(Cryptographer.matchWithHash(input, hash)).to.be(true)
      expect(Cryptographer.matchWithHash(badInput, hash)).to.be(false)
    })
  })

  describe('bcrypt()', () => {
    it('Return of bcrypt should not equal input', () => {
      // const bcryptHash = '$2a$10$VY8w4MCJLbMo/G0jX/Mteu5XXgycs3ymooGDgSPXGLIf4OoqofQGK'
      const userInput = 'doppelganger81'

      let bcryptHash = Cryptographer.bcrypt(userInput)

      expect(bcryptHash).to.not.eql(userInput)
      expect(bcryptHash).to.match(/^\$2.*/)
    })

    it('Bcrypt hash must not be re-hashed', async () => {
      const hash = '$2a$10$HrZDdJMGy6uUUSzKKDipnusc8zuYzrPalhlOyJAcKkZZubzng0de6'
      expect(await Cryptographer.bcrypt(hash)).to.be.equal(hash)
    })
  })

  describe('matchWithBcrypt()', () => {
    it('Should be able to match a password using Bcrypt encryption', () => {
      const bcryptHash = '$2a$10$VY8w4MCJLbMo/G0jX/Mteu5XXgycs3ymooGDgSPXGLIf4OoqofQGK'
      const userInput = 'doppelganger81'
      expect(Cryptographer.matchWithBcrypt(userInput, bcryptHash)).to.be(true)
    })

    it('Should return false if input does not match output of bcrypt encryption', () => {
      const bcryptHash = '$2a$10$VY8w4MCJLbMo/G0jX/Mteu5XXgycs3ymooGDgSPXGLIf4OoqofQGK'
      const userInput = 'doppelganger82'
      expect(Cryptographer.matchWithBcrypt(userInput, bcryptHash)).to.be(false)
    })
  })
})
