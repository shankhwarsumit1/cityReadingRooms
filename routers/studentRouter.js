const express = require('express');
const router = express.Router();        
const studentController = require('../controllers/studentController');
const authenticate = require('../middleware/authenticate');

router.get('/profile',authenticate,studentController.getprofile);
router.get('/myReadingRoom',authenticate, studentController.myReadingRoom);

module.exports = router;