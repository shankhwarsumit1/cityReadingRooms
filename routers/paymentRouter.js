const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const paymentController = require('../controllers/paymentController');

router.post('/payment/create',authenticate,paymentController.createOrder);
router.post('/webhook',paymentController.verifyPayment);


module.exports = router;