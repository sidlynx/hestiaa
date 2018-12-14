const amqp = require('amqplib')
const logger = require('../logging/logger')('AMQP_Producer')
const cryptographer = require('../utils/cryptographer')
const helper = require('./helper')

class AmqpProducer {
  constructor (brokerUrl) {
    this.brokerUrl = brokerUrl
    process.once('exit', async () => this.close())
    process.once('SIGINT', async () => this.close())
  }

  async connect () {
    this.exchanges = {}
    logger.info(`Connecting to ${this.brokerUrl}`)
    this.connection = await helper.retryUntilSuccess(amqp.connect, this.brokerUrl)

    this.connection.on('close', async reason => {
      if (!this.disableAutoReconnect) {
        logger.error('Disconnected: retry connection until success', reason)
        this.connect()
      }
    })

    logger.info(`Connected to ${this.brokerUrl}`)
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

    let payload = await cryptographer.encrypt(JSON.stringify(message), process.env.AMQP_CRYPTOGRAPHIC_KEY)

    await channel.publish(exchangeName, topic, Buffer.from(payload))

    logger.info(`Published message ${message} on topic ${topic} to ${exchangeName}:${channelName}`)
  }
}

module.exports = AmqpProducer
