const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const readingRoomController = require('../controllers/readingRoomController');
const upload = require('../middleware/upload');

router.post('/registerReadingRoom', authenticate, upload.single('photo'),readingRoomController.registerReadingRoom);
router.patch('/editReadingRoom/:readingRoomId', authenticate, readingRoomController.editReadingRoom);
router.get('/allReadingRooms',authenticate,readingRoomController.getAllReadingRooms);
router.get('/vacantSeats/:readingRoomId', authenticate, readingRoomController.getVacantSeats);
router.get('/getAllReservedSeats/:readingRoomId', authenticate, readingRoomController.getAllReservedSeats);
router.patch('/reserveSeat/:seatId', authenticate, readingRoomController.reserveSeat);
router.patch('/unreserveSeat/:seatId', authenticate, readingRoomController.unreserveSeat);
router.get('/paymentPendingSeats/:readingRoomId', authenticate, readingRoomController.getPaymentPendingSeats);

module.exports = router;
