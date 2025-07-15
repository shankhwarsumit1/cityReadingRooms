const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const authenticate = require('../middleware/authenticate');

router.get('/openReadingRoom/:readingRoomId', authenticate, ownerController.readingRoomOpen);
router.get('/listMyReadingRooms', authenticate, ownerController.listMyRooms);
module.exports = router;