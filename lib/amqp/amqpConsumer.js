const amqp = require('amqplib')
const logger = require('../logging/logger')('AMQP_Consumer')
const cryptographer = require('../utils/cryptographer')
const helper = require('./helper')

class AmqpConsumer {
  constructor (brokerUrl) {
    this.brokerUrl = brokerUrl
    process.once('exit', async () => this.close())
    process.once('SIGINT', async () => this.close())
    this.handlers = []
  }

  async connect () {
    logger.info(`Connecting to ${this.brokerUrl}`)
    this.exchanges = {}
    this.connection = await helper.retryUntilSuccess(amqp.connect, this.brokerUrl)

    this.connection.on('close', async reason => {
      if (!this.disableAutoReconnect) {
        logger.error('Disconnected: retry connection until success', reason)
        await this.connect()
        this.reconnectHandlers()
      }
    })
    logger.info(`Connected to ${this.brokerUrl}`)
  }

  async reconnectHandlers () {
    const oldHandler = [...this.handlers]
    this.handler = []
    oldHandler.forEach(handler => {
      this.addHandler(handler.exchangeName, handler.channelName, handler.topic, handler.messageHandler)
    })
  }

  async close () {
    if (!this.connection) return

    logger.info(`Disconnecting`)
    this.disableAutoReconnect = true

    await this.closeChannels()
    await this.connection.close()

    this.disableAutoReconnect = false
    logger.info(`Disconnected`)
  }

  async closeChannels () {
    const channels = []
    Object.values(this.exchanges).forEach(exchange => {
      Object.values(exchange.channels).forEach(channel => {
        channels.push(channel.close())
      })
    })
    await Promise.all(channels)
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
    this.handlers.push({ exchangeName, channelName, topic, messageHandler })

    const channel = await this.getOrCreateChannel(exchangeName, channelName, topic)

    const queueName = topic.replace('.', '_')

    channel.consume(
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
