const amqp = require("amqplib");
const logger = require('../logger');
const axios = require("axios")

class MessageBroker {
  constructor() {
    this.channel = null;
  }

  async connect() {
    console.log("Connecting to RabbitMQ...");

    setTimeout(async () => {
      try {
        const connection = await amqp.connect("amqp://3.133.99.248:5672/");
        this.channel = await connection.createChannel();
        await this.channel.assertQueue("products");
        console.log("RabbitMQ connected");
      } catch (err) {
        logger.error("failed to connect to rabbitmq from service product")
        console.error("Failed to connect to RabbitMQ:", err.message);
      }
    }, 10000); // delay 10 seconds to wait for RabbitMQ to start
  }

  async publishMessage(queue, message) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available.");
      logger.error("No rabbitmq channel available.")
      return;
    }

    try {
      await this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message))
      );
      logger.info("RABBITMQ - message published to rabbitmq queue " + queue + " in MessageBroker. <E6>")
    } catch (err) {
      console.log(err);
    }
  }

  async consumeMessage(queue, callback) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available.");
      return;
    }

    try {
      await this.channel.consume(queue, (message) => {
        const content = message.content.toString();
        const parsedContent = JSON.parse(content);
        callback(parsedContent);
        this.channel.ack(message);
        //logger.info("PRODUCT SERVICE - new order consumed from queue " + queue + " in service product")
      });
      //logger.info("PRODUCT SERVICE - consuming from rabbitmq queue " + queue + " in MessageBroker")
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = new MessageBroker();
