const mongoose = require("mongoose");

const readingRoomSchema = new mongoose.Schema(
    {
        readingRoomName: {
            type: String,
            required: true,
            maxLength: 200,
        },
        ownerId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true,
        },
        address: {
            type: String,
            required: true,
            maxLength: 400,
        },
        contact:{
            type: String,
            required: true,
            maxLength: 100,
        },
        totalSeats: {
            type: Number,
            required: true,
            min: 1,
        },
        timings:{
            open:String,
            close:String,
        },
        fees:{
            monthly:Number,
            threeMonths:Number, 
        },
        facilities: {
            type: [String],
            required: true,
        },
        photos:{
            type: [String],
            required: true,
        },
        vacantSeats: {
            type: Number,           
            default: 0,
        },
        location:{
            type:{
            type:String,
            enum:["Point"],
            required: true,
            },
            coordinates:{
                type: [Number],
                required: true,
            }
        },
        city: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

readingRoomSchema.index({ location: "2dsphere" });


module.exports = mongoose.model("ReadingRoom", readingRoomSchema);
