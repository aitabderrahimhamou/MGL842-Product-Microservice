const Product = require("../models/product");
const messageBroker = require("../utils/messageBroker");
const uuid = require('uuid');
const logger = require('../logger')
const { trace } = require('@opentelemetry/api'); // Import trace API
const functions = require("../utils/functions")
const axios = require("axios")


/**
 * Class to hold the API implementation for the product services
 */
class ProductController {

  constructor() {
    this.createOrder = this.createOrder.bind(this);
    this.getOrderStatus = this.getOrderStatus.bind(this);
    this.getProducts = this.getProducts.bind(this);
    this.longMethodExecution = this.longMethodExecution.bind(this);
    this.ordersMap = new Map();

  }

  longMethodExecution(req, res, next) {
    const tracer = trace.getTracer('product-tracer');

    const span = tracer.startSpan('myCustomMethod');
    try {
      logger.info("PRODUCT SERVICE - Executing longMethodExecution");
        
      functions.sleep(10000);

      logger.info("PRODUCT SERVICE - Finished sleeping for 10 seconds");
    } catch (error) {
        span.setStatus({ code: 2, message: error.message });
    } finally {
        span.end();
    }
    
  }

  async createProduct(req, res, next) {
    
    logger.info("PRODUCT SERVICE - createOrder in controller productController on service products. <E15>")
    try {
      const token = req.headers.authorization;
      if (!token) {
        logger.error("User unauthorized")
        return res.status(401).json({ message: "Unauthorized" });
      }
      const product = new Product(req.body);

      const validationError = product.validateSync();
      if (validationError) {
        logger.error(validationError.message)
        return res.status(400).json({ message: validationError.message });
      }

      await product.save({ timeout: 30000 });

      res.status(201).json(product);
    } catch (error) {
      logger.info("PRODUCT SERVICE - server error in method createProduct in controller ProductController of the service product")
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async createOrder(req, res, next) {
    
    logger.info("PRODUCT SERVICE - createOrder in controller productController on service products. <E3>")
    console.log('Creating the order')
    try {
      const token = req.headers.authorization;
      if (!token) {
        logger.error('Client not authorized for the create order request')
        return res.status(401).json({ message: "Unauthorized" });
      }

      //this.longMethodExecution();
  
      const { ids } = req.body;
      //logger.info("PRODUCT SERVICE - Fetching the products from the database")
      console.log("Fetching the products from the database")
      const products = await Product.find({ _id: { $in: ids } });
      
      logger.info("PRODUCT SERVICE - fetched products from db in controller productController on service products. <E4>")
  
      console.log("Moving the order to the pending state")
      const orderId = uuid.v4(); // Generate a unique order ID
      this.ordersMap.set(orderId, { 
        status: "pending", 
        products, 
        username: req.user.username
      });




      
  
      await messageBroker.publishMessage("orders", {
        products,
        username: req.user.username,
        orderId, // include the order ID in the message to orders queue
      });

      logger.info("PRODUCT SERVICE - publishing products to queue orders in controller productController on service products. <E5>")

      messageBroker.consumeMessage("products", async (data) => {


        logger.info("PRODUCT SERVICE - order consumed from queue products in controller productController on service product. <E13>")
        const orderData = JSON.parse(JSON.stringify(data));
        const { orderId } = orderData;
        const order = this.ordersMap.get(orderId);
        if (order) {
          // update the order in the map
          this.ordersMap.set(orderId, { ...order, ...orderData, status: 'completed' });
          console.log("Updated order:", order);
        } else {
        }
      });
      
      logger.info("PRODUCT SERVICE - consuming order from queue products in controller productController on service products. <E7>")
      // Long polling until order is completed
      let order = this.ordersMap.get(orderId);
      while (order.status !== 'completed') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second before checking status again
        order = this.ordersMap.get(orderId);
      }
      logger.info("PRODUCT SERVICE - successfully created order in controller productController on service products. <E14>")
      // Once the order is marked as completed, return the complete order details
      return res.status(201).json(order);
    } catch (error) {
      logger.error("The following error occured while attempting to create the order", error.message)
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
  

  async getOrderStatus(req, res, next) {
    const { orderId } = req.params;
    const order = this.ordersMap.get(orderId);
    if (!order) {
      logger.error("order not found")
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.status(200).json(order);
  }

  async getProducts(req, res, next) {
    try {
      const token = req.headers.authorization;
      if (!token) {
        logger.error("User unauthorized")
        return res.status(401).json({ message: "Unauthorized" });
      }
      const products = await Product.find({});

      res.status(200).json("what now bb ?");
    } catch (error) {
      logger.error("Server error")
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = ProductController;
