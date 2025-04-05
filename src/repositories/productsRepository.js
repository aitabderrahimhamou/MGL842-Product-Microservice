const mongoose = require("mongoose");
const logger = require('../logger')

/**
 * Class that contains the business logic for the product repository interacting with the product model
 */
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
});

const Product = mongoose.model("Product", productSchema);

class ProductsRepository {
  async create(product) {
    //logger.info("executing method create in repository ProductRepository of the service product")
    const createdProduct = await Product.create(product);
    return createdProduct.toObject();
  }

  async findById(productId) {
    //logger.info("executing method findById in repository ProductRepository of the service product")
    const product = await Product.findById(productId).lean();
    return product;
  }

  async findAll() {
    //logger.info("executing method findAll in repository ProductRepository of the service product")
    const products = await Product.find().lean();
    return products;
  }
}

module.exports = ProductsRepository;
