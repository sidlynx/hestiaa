const logger = require('../logging/logger')('AMQP_Producer')
const cryptographer = require('../utils/cryptographer')
const AmqpAbstractClient = require('./amqpAbstractClient')
class AmqpProducer extends AmqpAbstractClient {
  async reconnect () {
    return this.connect()
  }

  async sendMessage (message, exchangeName, channelName, topic) {
    if (topic.includes('*') || topic.includes('#')) {
      throw Error('topic cannot contain wildcards (*, #) when producing messages')
    }

    const channel = await this.getOrCreateChannel(exchangeName, channelName)

    let payload = await cryptographer.encrypt(JSON.stringify(message), process.env.AMQP_CRYPTOGRAPHIC_KEY)

    await channel.publish(exchangeName, topic, Buffer.from(payload))

    logger.info(`Published a message ${message} on topic '${topic}' to the exchange '${exchangeName}' via the channel '${channelName}'`)
  }
}

module.exports = AmqpProducer
