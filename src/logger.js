const winston = require('winston');
const Transport = require('winston-transport');
const net = require('net');


class LogstashTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.client = new net.Socket();
    this.client.on('connect', () => {
      console.log('Connected to Logstash server on port 5000');
    });

    // Add a listener for the 'error' event to catch any connection issues
    this.client.on('error', (err) => {
      console.error('Error connecting to Logstash:', err.message);
    });
    this.client.connect(5000, 'localhost');  // Port 5000 pour Logstash
  }

  log(info, callback) {
    setImmediate(() => this.emit('logged', info));
    this.client.write(JSON.stringify(info) + '\n');  // Send logs as JSON
    callback();
  }
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new LogstashTransport(),  // Envoyer les journaux vers Logstash
  ],
});

//logger.info('This is a test log message the Authentication microservice');

module.exports = logger; 



