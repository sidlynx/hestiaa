/* istanbul ignore file */

const MongoClient = require('mongodb').MongoClient
const logger = require('../logging/logger')('DbLocker')

/**
 * Some routines should never be done in parallel.
 * This class provides a easy-to-use, database based concurrency
 * controll make sure that, even if the application is scaled
 * horizontally, a given routine is only be executed once.
 *
 * @see https://en.wikipedia.org/wiki/Lock_(computer_science)
 * @example
 *   if (await dbLocker.getLock('migration')) {
 *     // This condition will never be executed in parallel
 *     runDatabaseMigrations()
 *     dbLocker.releaseLock('migration')
 *   }
 */
class DbLocker {
  async initDb () {
    const client = await MongoClient.connect(
      process.env.MONGO_URL,
      { useNewUrlParser: true }
    )
    this.mongo = {
      connection: client,
      db: client.db()
    }
    await this.mongo.db.collection('locks').createIndex({ name: 1 }, { unique: true })
  }

  async getLock (lockname) {
    logger.info(`Getting lock ${lockname} ...`)
    await this.initDb()

    let lockAcquired = false
    try {
      // transactional document insertion as the concurrency lock mechanism ʕ •ᴥ•ʔ
      await this.mongo.db.collection('locks').insertOne({ name: lockname, createdAt: new Date() })
      lockAcquired = true
    } catch (_) {
      logger.info(`Lock ${lockname} already exists`)
    }

    await this.closeDb()

    return lockAcquired
  }

  async releaseLock (lockname) {
    logger.info(`Releasing lock ${lockname} ... `)
    await this.initDb()

    await this.mongo.db.collection('locks').deleteOne({ name: lockname })

    await this.closeDb()
  }

  async closeDb () {
    this.mongo.connection.close()
  }
}

module.exports = DbLocker
