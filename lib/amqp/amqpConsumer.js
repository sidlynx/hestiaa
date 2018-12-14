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
