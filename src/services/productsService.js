const ProductsRepository = require(".repositories/productsRepository");
const logger = require('../logger');

/**
 * Class that ties together the business logic and the data access layer
 */
class ProductsService {
  constructor() {
    this.productsRepository = new ProductsRepository();
  }

  async createProduct(product) {
    //logger.info("executing method createProduct in service productsService of the service product")
    const createdProduct = await this.productsRepository.create(product);
    return createdProduct;
  }

  async getProductById(productId) {
    //logger.info("executing method getProductById in service productsService of the service products")
    const product = await this.productsRepository.findById(productId);
    return product;
  }

  async getProducts() {
    //logger.info("executing method getProducts in service productsService of the service products")
    const products = await this.productsRepository.findAll();
    return products;
  }
}

module.exports = ProductsService;
