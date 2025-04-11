const express = require("express");
const ProductController = require("../controllers/productController");
const isAuthenticated = require("../utils/isAuthenticated");
const functions = require('../utils/functions')
const logger = require("../logger")
const axios = require("axios")

const router = express.Router();
const productController = new ProductController();


router.use((err, req, res, next) => {
    console.error('Global error handler:', err.message);
    res.status(500).send(err);
  });
router.post("/", isAuthenticated, (req, res) => {
    logger.info("PRODUCT SERVICE - POST / on service products. <E16>")
    productController.createProduct(req, res)
});
router.post("/buy", isAuthenticated, async (req, res) => {
    try {
        logger.info("PRODUCT SERVICE - POST /buy on service products. <E2>")
        productController.createOrder(req, res)
    } catch (error) {
        logger.error("PRODUCT SERVICE - POST /buy on service products. <E2>")
        return res.status(500).json({error: "Internal server error"})
    }
    
});
router.get("/", isAuthenticated, (req, res) => {
    logger.info("PRODUCT SERVICE - POST / on service products. <E17>")
    return productController.getProducts(req, res)
});

router.get("/one-second", async (req, res) => {
    functions.sleep(1000);
    res.send("Response sent with a delay of 1 second")
})

router.get("/two-seconds", async (req, res) => {
    functions.sleep(2000);
    res.send("Response sent with a delay of 2 seconds")
})

router.get("/three-seconds", async (req, res) => {
    functions.sleep(3000);
    res.send("Response sent with a delay of 3 seconds")
})


module.exports = router;
