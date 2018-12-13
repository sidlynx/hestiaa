const amqp = require('amqplib')
const logger = require('../logging/logger')('AMQP_Producer')
const cryptographer = require('../utils/cryptographer')
const helper = require('./helper')

class AmqpProducer {
  constructor (brokerUrl) {
    this.brokerUrl = brokerUrl
    this.initialize()
  }

  initialize () {
    this.exchanges = {}
  }

  async connect () {
    logger.info(`Connecting to ${this.brokerUrl}`)
    this.connection = await helper.retryUntilSuccess(amqp.connect, this.brokerUrl)

    this.connection.on('close', async reason => {
      if (!this.disableAutoReconnect) {
        logger.error('Disconnected: retry connection until success', reason)
        this.connection = await helper.retryUntilSuccess(amqp.connect, this.brokerUrl)
        logger.info(`Connected to ${this.brokerUrl}`)
      }
    })

    process.once('exit', async () => this.close())
    process.once('SIGINT', async () => this.close())

    logger.info(`Connected to ${this.brokerUrl}`)
  }

  async close () {
    logger.info(`Disconnecting`)
    this.disableAutoReconnect = true

    const channels = []
    Object.values(this.exchanges).forEach(exchange => {
      Object.values(exchange.channels).forEach(channel => {
        channels.push(channel.close())
      })
    })
    await Promise.all(channels)
    await this.connection.close()

    this.disableAutoReconnect = false
    logger.info(`Disconnected`)
  }

  async getOrCreateChannel (exchangeName, channelName) {
    if (!this.exchanges[exchangeName]) {
      this.exchanges[exchangeName] = { channels: {} }
    }

    if (!this.exchanges[exchangeName].channels[channelName]) {
      logger.info(`Creating channel ${channelName} to ${exchangeName}`)
      const channel = await this.connection.createChannel()
      logger.info(`Channel ${channelName} created`)

      await channel.assertExchange(exchangeName, 'topic', { durable: true })
      logger.info(`Channel ${channelName} plugged to exchange ${exchangeName}`)

      this.exchanges[exchangeName].channels[channelName] = channel
    }

    return this.exchanges[exchangeName].channels[channelName]
  }

  async sendMessage (message, exchangeName, channelName, topic) {
    if (topic.includes('*') || topic.includes('#')) {
      throw Error('topic cannot contain wildcards (*, #) when producing messages')
    }

    const channel = await this.getOrCreateChannel(exchangeName, channelName)
    if (!channel) {
      throw Error(`Channel  ${channelName} does not exists`)
    }

    let payload = await cryptographer.encrypt(JSON.stringify(message), process.env.AMQP_CRYPTOGRAPHIC_KEY)

    await channel.publish(exchangeName, topic, Buffer.from(payload))

    logger.info(`Published message ${message} on topic ${topic} to ${exchangeName}:${channelName}`)
  }
}

module.exports = AmqpProducer
