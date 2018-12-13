const amqp = require('amqplib')
const logger = require('../logging/logger')('AMQP_Producer')

class AmqpProducer {
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
    this.connection = await amqp.connect(this.brokerUrl)
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

  async createChannel (exchangeName, channelName) {
    logger.info(`Creating channel ${channelName} to ${exchangeName}`)

    if (!this.exchanges[exchangeName]) {
      this.exchanges[exchangeName] = { channels: {} }
    }

    if (!this.exchanges[exchangeName].channels[channelName]) {
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

    const channel = await this.createChannel(exchangeName, channelName)
    if (!channel) {
      throw Error(`Channel  ${channelName} does not exists`)
    }

    const payload = Buffer.from(JSON.stringify(message))

    channel.publish(exchangeName, topic, payload)

    logger.info(`Published message ${message} on topic ${topic} to ${exchangeName}:${channelName}`)
  }
}

module.exports = AmqpProducer
