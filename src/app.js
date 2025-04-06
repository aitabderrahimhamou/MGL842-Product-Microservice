const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const MessageBroker = require("./utils/messageBroker");
const productsRouter = require("./routes/productRoutes");
require("dotenv").config();
const startMetricsServer = require("./metrics");
const client = require("prom-client")
const logger = require('./logger');


class App {
  constructor() {
    this.app = express();
    this.connectDB();
    this.setMiddlewares();
    this.setRoutes();
    this.setupMessageBroker();
  }

  async connectDB() {
    //logger.info("PRODUCT SERVICE - connecting to db from service product")
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    //logger.info("PRODUCT SERVICE - service product connected to db")
    console.log("MongoDB connected");
  }

  async disconnectDB() {
    logger.info("PRODUCT SERVICE - disconnecting from db in service product")
    await mongoose.disconnect();
    console.log("service product disconnected from db");
    logger.error("service product disconnected from db")
  }

  setMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.setMetrics();
  }

  setMetrics() {

    // Latence
    const latencyHistogram = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'La durée des requêtes HTTP en secondes',
      labelNames: ['method', 'route'],
      buckets: [1, 2, 3, 4]
    });

    // Traffic
    const requestCounter = new client.Counter({
      name: 'http_requests_total',
      help: 'Nombre total des requêtes HTTP',
      labelNames: ['method', 'route', 'status']
    });

    // Taux d'erreur
    const errorCounter = new client.Counter({
      name: 'http_requests_errors_total',
      help: 'Nombre total des requêtes HTTP avec erreur',
      labelNames: ['method', 'route']
    });

    // Middleware de collecte de métriques
    this.app.use((req, res, next) => {  
      const end = latencyHistogram.startTimer();
      res.on('finish', () => {
        const latency = end();
        //logger.info(`Request completed: ${req.method} ${req.path} - ${latency} seconds`);
        console//.log(`Request completed: ${req.method} ${req.path} - ${latency} seconds`);
        
        // enregistrer la latence
        latencyHistogram.observe({ method: req.method, route: req.path }, latency);

        // Incrementer le nombre de requete pour le trafic
        requestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });

        // Incrémenter le compteur des requêtes avec erreurs si le code status est supérieur
        // egal a 400
        if (res.statusCode >= 400) {
            errorCounter.inc({ method: req.method, route: req.path });
        }
      });
      next();
    });
  }

  setRoutes() {
    this.app.use("/api/products", productsRouter);
  }

  setupMessageBroker() {
    //logger.info(`executing method setupMesageBroker from service product`);
    MessageBroker.connect();
  }

  start() {
    this.server = this.app.listen(3001, () =>{
      //logger.info(`executing method start from service product`);
      console.log("Server started on port 3001")
    }
    );
    startMetricsServer();
  }

  async stop() {
    await mongoose.disconnect();
    this.server.close();
    console.log("Server stopped");
  }
}

module.exports = App;
