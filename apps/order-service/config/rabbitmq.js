const amqp = require('amqplib');

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'foodshare_events';
const EXCHANGE_TYPE = 'topic';

async function connectRabbitMQ() {
  try {
    const rabbitURL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    
    connection = await amqp.connect(rabbitURL);
    channel = await connection.createChannel();
    
    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
      durable: true
    });
    
    console.log('✅ RabbitMQ channel created and exchange asserted');
    
    connection.on('error', (err) => {
      console.error('❌ RabbitMQ connection error:', err);
    });
    
    connection.on('close', () => {
      console.warn('⚠️  RabbitMQ connection closed, reconnecting...');
      setTimeout(connectRabbitMQ, 5000);
    });
    
    return { connection, channel };
  } catch (error) {
    console.error('❌ Failed to connect to RabbitMQ:', error);
    setTimeout(connectRabbitMQ, 5000);
  }
}

async function publishEvent(eventType, payload) {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    
    const message = {
      eventType,
      timestamp: new Date().toISOString(),
      payload
    };
    
    const routingKey = eventType;
    
    const published = channel.publish(
      EXCHANGE_NAME,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { 
        persistent: true,
        contentType: 'application/json'
      }
    );
    
    if (published) {
      console.log(`📤 Event published: ${eventType}`, payload);
    } else {
      console.warn(`⚠️  Event buffer full for: ${eventType}`);
    }
    
    return published;
  } catch (error) {
    console.error('❌ Failed to publish event:', error);
    throw error;
  }
}

async function closeConnection() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('RabbitMQ connection closed');
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error);
  }
}

module.exports = {
  connectRabbitMQ,
  publishEvent,
  closeConnection
};