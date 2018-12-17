const logger = require('../logging/logger')('AMQP_Consumer')
const cryptographer = require('../utils/cryptographer')
const AmqpAbstractClient = require('./amqpAbstractClient')

class AmqpConsumer extends AmqpAbstractClient {
  constructor (brokerUrl) {
    super(brokerUrl)
    this.handlers = []
  }

  async reconnectHandlers () {
    const oldHandler = [...this.handlers]
    this.handler = []
    oldHandler.forEach(handler => {
      this.addHandler(handler.exchangeName, handler.channelName, handler.topic, handler.messageHandler)
    })
  }

  async reconnect () {
    await this.connect()
    return this.reconnectHandlers()
  }

  async initQueue (exchangeName, channel, topic) {
    const queueName = topic.replace('.', '_')

    logger.info(`Assert queue ${queueName}`)
    await channel.assertQueue(queueName)

    logger.info(`Bind queue ${queueName} to exechange ${exchangeName}`)
    await channel.bindQueue(queueName, exchangeName, topic)

    return queueName
  }

  async addHandler (exchangeName, channelName, topic, messageHandler) {
    this.handlers.push({ exchangeName, channelName, topic, messageHandler })

    const channel = await this.getOrCreateChannel(exchangeName, channelName)

    const queueName = await this.initQueue(exchangeName, channel, topic)

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
