const amqp = require('amqplib')
const logger = require('../logging/logger')('AMQP_Client')

const retryUntilSuccess = async function retryUntilSuccess (asyncFunction, args, delay) {
  const timeoutDelay = delay || 5000
  try {
    return await asyncFunction(args)
  } catch (e) {
    logger.error(e)
    await new Promise(resolve => setTimeout(resolve, timeoutDelay))
    return retryUntilSuccess(asyncFunction, args, timeoutDelay + 5000)
  }
}
class AmqpAbstractClient {
  constructor (brokerUrl) {
    if (this.constructor === AmqpAbstractClient) {
      throw new TypeError('Abstract class "AmqpAbstractClient" cannot be instantiated directly')
    }
    this.brokerUrl = brokerUrl
    process.once('exit', async () => this.close())
    process.once('SIGINT', async () => this.close())
  }

  async connect () {
    this.exchanges = {}
    logger.info(`Connecting to ${this.brokerUrl}`)
    this.connection = await retryUntilSuccess(amqp.connect, this.brokerUrl)

    this.connection.on('close', async reason => {
      if (!this.disableAutoReconnect) {
        logger.error('Disconnected: retry connection until success', reason)
        this.reconnect()
      }
    })

    logger.info(`Connected to ${this.brokerUrl}`)
  }

  async reconnect () {
    throw new Error('You must implement this function')
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
}

module.exports = AmqpAbstractClient
