const ReadingRoom = require('../models/ReadingRoom.js');
const Seat = require('../models/Seat.js');
const User = require('../models/User.js');
const mongoose = require('mongoose');
const s3 = require('../utils/s3.js');
const {
  validateReadingRoomUpdateData,
  validateReadingRoomRegistrationData
} = require('../utils/validator');
const {uploadToS3} = require('../utils/s3.js');

const registerReadingRoom = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // destructure fields from req.body
    let {
      readingRoomName,
      address,
      contact,
      totalSeats,
      timings,
      fees,
      facilities,
      location,
      city,
    } = req.body;

    const user = req.user;

    // Parse JSON strings
    if (typeof timings === "string") {
      timings = JSON.parse(timings);
    }
    if (typeof fees === "string") {
      fees = JSON.parse(fees);
    }
    if (typeof location === "string") {
      location = JSON.parse(location);
    }

    if (!Array.isArray(facilities)) {
      facilities = facilities ? [facilities] : [];
    }

    // Validate
    validateReadingRoomRegistrationData({
      readingRoomName,
      address,
      contact,
      totalSeats,
      timings,
      fees,
      facilities,
      location,
      city,
      user
    });

    let photoUrl = "";
    if (req.file) {
      const timestamp = Date.now();
      const filename = `reading-rooms/${timestamp}_${readingRoomName.replace(/\s+/g, "_")}.png`;
      photoUrl = await uploadToS3(req.file.buffer, filename, req.file.mimetype);
      console.log("Uploaded photo URL:", photoUrl);
    }

    const readingRoom = new ReadingRoom({
      readingRoomName,
      address,
      contact,
      totalSeats: parseInt(totalSeats),
      timings,
      fees,
      facilities,
      photos: photoUrl ? [photoUrl] : [],
      location,
      vacantSeats: parseInt(totalSeats),
      ownerId: user._id,
      city: city.toLowerCase(),
    });

    await readingRoom.save({ session });

    // Create seats
    const seatDocuments = [];
    for (let i = 1; i <= totalSeats; i++) {
      seatDocuments.push({
        readingRoomId: readingRoom._id,
        seatNumber: i,
        status: "vacant",
        ownerId: user._id,
      });
    }
    if (seatDocuments.length > 0) {
      await Seat.insertMany(seatDocuments, { session });
    }

    await session.commitTransaction();
    res.status(201).json({
      success: true,
      message: "Reading room registered successfully",
      readingRoom,
      owner: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};


const editReadingRoom = async (req, res) => {
  try {
    const {
      readingRoomId
    } = req.params;

    if (!readingRoomId) {
      return res.status(400).json({
        success: false,
        message: "Reading room ID is required"
      });
    }

    const readingRoom = await ReadingRoom.findById(readingRoomId);
    if (!readingRoom) {
      return res.status(404).json({
        success: false,
        message: "Reading room not found"
      });
    }

    if (readingRoom.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this reading room"
      });
    }

    validateReadingRoomUpdateData(req);

    const allowedFields = [
      "readingRoomName",
      "address",
      "contact",
      "timings",
      "fees",
      "facilities",
      "photos",
      "location",
      "city"
    ];

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        readingRoom[key] = req.body[key];
      }
    });

    await readingRoom.save();

    res.status(200).json({
      success: true,
      message: "Reading room updated successfully",
      readingRoom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

const getAllReadingRooms = async (req, res) => {
  try {
    const userLocation = req.user.location;
    const userCity = req.user.city;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const {
      search
    } = req.query;
    const skip = (page - 1) * limit;

    if (
      !userLocation ||
      !userLocation.type ||
      !Array.isArray(userLocation.coordinates) ||
      userLocation.coordinates.length != 2) {
      return res.status(400).json({
        success: false,
        message: "user location is invalid"
      });
    }
    const pipeline = [];

    pipeline.push({
      $geoNear: {
        near: {
          type: "Point",
          coordinates: userLocation.coordinates,
        },
        distanceField: "distance",
        spherical: true,
        query: {
          city: userCity
        }
      },
    });

    if (search) {
      pipeline.push({
        $match: {
          readingRoomName: {
            $regex: search,
            $options: "i"
          },
        },
      });
    }

    pipeline.push({
      $facet: {
        metadata: [{
          $count: "total"
        }],
        data: [{
            $skip: skip
          },
          {
            $limit: limit
          }
        ]
      }
    });

    const result = await ReadingRoom.aggregate(pipeline);

    const total = result[0].metadata[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      readingRooms: result[0].data,
      pagination: {
        totalResults: total,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getVacantSeats = async (req, res) => {
  try {
    const readingRoomId = req.params.readingRoomId;
    if (!readingRoomId) {
      return res.status(400).json({
        success: false,
        message: "Reading Room ID is required"
      });
    }

    const readingRoom = await ReadingRoom.findById(readingRoomId);
    if (!readingRoom) {
      return res.status(404).json({
        success: false,
        message: "Reading Room not found"
      });
    }

    const vacantSeats = readingRoom.vacantSeats || 0;

    const vacantSeatsList = await Seat.find({
      readingRoomId,
      status: 'vacant'
    }, "_id readingRoomId seatNumber");

    res.status(200).json({
      success: true,
      data: {
        vacantSeatsCount: vacantSeats,
        vacantSeatsList
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const reserveSeat = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const seatId = req.params.seatId;
    const {
      studentPhone,
      feePaymentDate,
      feeAmount,
      plan
    } = req.body;
    if (!seatId) {
      return res.status(400).json({
        success: false,
        message: "Seat ID is required"
      });
    }
    if (!studentPhone || !feePaymentDate || !feeAmount || !plan) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }
    if (!["monthly", "quarterly"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan type provided"
      });
    }
    if (isNaN(Date.parse(feePaymentDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid date"
      });
    }

    const student = await User.findOne({phone: studentPhone, role: 'student'}).session(session);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }


    const seat = await Seat.findById(seatId).session(session);
    if (!seat) {
      return res.status(404).json({
        success: false,
        message: "Seat not found"
      });
    }

    if (seat.status !== 'vacant') {
      return res.status(400).json({
        success: false,
        message: "Seat is already reserved"
      });
    }
    const paymentDate = new Date(feePaymentDate);
    seat.nextDueDate =
      plan === "monthly" ?
      new Date(paymentDate.setMonth(paymentDate.getMonth() + 1)) :
      new Date(paymentDate.setMonth(paymentDate.getMonth() + 3));

    seat.status = 'reserved';
    seat.studentId = student._id;
    seat.feePaymentDate = feePaymentDate;
    seat.feeAmount = feeAmount;
    seat.plan = plan;
    await seat.save({
      session
    });

    await ReadingRoom.findByIdAndUpdate(
      seat.readingRoomId, {
        $inc: {
          vacantSeats: -1
        }
      }, {
        session
      }
    );

    await session.commitTransaction();
    res.status(200).json({
      success: true,
      message: "Seat reserved successfully",
      seat
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

const getAllReservedSeats = async (req, res) => {
  try {
    const readingRoomId = req.params.readingRoomId;
    if (!readingRoomId) {
      return res.status(400).json({
        success: false,
        message: "Reading Room ID is required"
      });
    }

    const reservedSeats = await Seat.find({
      readingRoomId,
      status: 'reserved'
    },'seatNumber nextDueDate feePaymentDate feeAmount plan').populate({
      path: 'studentId',
      select: 'name phone'
    });
   console.log(reservedSeats);
    res.status(200).json({
      success: true,
      data: reservedSeats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const unreserveSeat = async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const seatId = req.params.seatId;
    if (!seatId) {
      return res.status(400).json({
        success: false,
        message: "Seat ID is required"
      });
    }

    const seat = await Seat.findById(seatId).session(session);
    if (!seat) {
      return res.status(404).json({
        success: false,
        message: "Seat not found"
      });
    }

    if (seat.status !== 'reserved') {
      return res.status(400).json({
        success: false,
        message: "Seat is not reserved"
      });
    }

    seat.status = 'vacant';
    seat.studentId = null;
    seat.feePaymentDate = null;
    seat.nextDueDate = null;
    seat.feeAmount = null;
    seat.plan = null;

    await seat.save({
      session
    });

    await ReadingRoom.findByIdAndUpdate(
      seat.readingRoomId, {
        $inc: {
          vacantSeats: 1
        }
      }, {
        session 
      }
    );
    await session.commitTransaction();
    await session.endSession();
    res.status(200).json({
      success: true,
      message: "Seat unreserved successfully",
      seat
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getPaymentPendingSeats = async (req, res) => {
  try {
    const readingRoomId = req.params.readingRoomId;
    if (!readingRoomId) {
      return res.status(400).json({
        success: false,
        message: "Reading Room ID is required"
      });
    }

    const paymentPendingSeats = await Seat.find({
      readingRoomId,
      status: 'reserved',
      nextDueDate: { $lte: new Date() }
    }, 'seatNumber nextDueDate feePaymentDate feeAmount plan').populate({
      path: 'studentId',
      select: 'name phone'
    });

    res.status(200).json({
      success: true,
      data: paymentPendingSeats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


module.exports = {
  registerReadingRoom,
  editReadingRoom,
  getAllReadingRooms,
  getVacantSeats,
  reserveSeat,
  getAllReservedSeats,
  unreserveSeat,
  getPaymentPendingSeats
}