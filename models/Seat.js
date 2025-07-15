const mongoose = require('mongoose');   

const seatSchema = new mongoose.Schema({
    studentId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    readingRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ReadingRoom",
        required: true,
    },
    seatNumber: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["reserved", "vacant"],
        default: "vacant",
    },
    feePaymentDate: {
        type: Date,
    },
    nextDueDate: {
        type: Date,
    },
    feeAmount: {
        type: Number,
    },
    plan: {
        type: String,
        enum: ["monthly", "quarterly"],
    }
}, { timestamps: true });

seatSchema.index(
  { readingRoomId: 1, seatNumber: 1 },
  { unique: true,
    partialFilterExpression: { studentId: { $type: "objectId" } }
  }
);


module.exports = mongoose.model("Seat", seatSchema);
