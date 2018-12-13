const amqp = require('amqplib')
const logger = require('../logging/logger')('AMQP_Consumer')
const cryptographer = require('../utils/cryptographer')

/** Retry pattern */
async function retryUntilSuccess (asyncFunction, args) {
  try {
    return await asyncFunction(args)
  } catch (e) {
    logger.error(e)
    await new Promise(resolve => setTimeout(resolve, 5000))
    return retryUntilSuccess(asyncFunction, args)
  }
}

class AmqpConsumer {
  constructor (brokerUrl) {
    this.brokerUrl = brokerUrl
    this.initialize()
  }

  initialize () {
    this.exchanges = {}
    process.on('exit', async () => this.close())
    process.on('SIGINT', async () => this.close())
  }

  async connect () {
    logger.info(`Connecting to ${this.brokerUrl}`)
    this.connection = await retryUntilSuccess(amqp.connect, this.brokerUrl)

    this.connection.on('close', async reason => {
      logger.error('Disconnected: retry connection until success', reason)
      this.connection = await retryUntilSuccess(amqp.connect, this.brokerUrl)
      logger.info(`Connected to ${this.brokerUrl}`)
    })
    logger.info(`Connected to ${this.brokerUrl}`)
  }

  async close () {
    logger.info(`Disconnecting`)

    const channels = []
    Object.values(this.exchanges).forEach(exchange => {
      Object.values(exchange.channels).forEach(channel => {
        channels.push(channel.close())
      })
    })
    await Promise.all(channels)
    await this.connection.close()

    logger.info(`Disconnected`)
  }

  async getOrCreateChannel (exchangeName, channelName, topic) {
    if (!this.exchanges[exchangeName]) {
      this.exchanges[exchangeName] = { channels: {} }
    }

    if (!this.exchanges[exchangeName].channels[channelName]) {
      logger.info(`Creating channel ${channelName} to ${exchangeName}`)
      const channel = await this.connection.createChannel()
      logger.info(`Channel ${channelName} created`)
      await channel.assertExchange(exchangeName, 'topic', { durable: true })

      const queueName = topic.replace('.', '_')
      channel.assertQueue(queueName, { autoDelete: false })

      channel.bindQueue(queueName, exchangeName, topic)

      this.exchanges[exchangeName].channels[channelName] = channel

      logger.info(`Added the routing path ${topic} from ${exchangeName} to ${channelName}`)
    }

    return this.exchanges[exchangeName].channels[channelName]
  }

  async addHandler (exchangeName, channelName, topic, messageHandler) {
    const channel = await this.getOrCreateChannel(exchangeName, channelName, topic)
    if (!channel) {
      throw Error(`Channel  ${channelName} does not exists`)
    }

    const queueName = topic.replace('.', '_')

    await channel.consume(
      queueName,
      async message => {
        let decryptedMessage = null
        if (message) {
          decryptedMessage = await cryptographer.decrypt(message.content.toString(), process.env.AMQP_CRYPTOGRAPHIC_KEY)
        }
        await messageHandler(decryptedMessage)
        channel.ack(message)
      },
      { noAck: false }
    )
  }
}

module.exports = AmqpConsumer
