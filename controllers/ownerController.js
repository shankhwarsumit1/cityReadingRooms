const ReadingRoom = require('../models/ReadingRoom');

const readingRoomOpen = async(req,res)=>{
    try{
        const readingRoomId = req.params.readingRoomId;
        if(!readingRoomId){
            return res.status(400).json({success: false, message: "Reading Room ID is required"});
        }   


        const readingRoom = await ReadingRoom.findById(readingRoomId).populate('ownerId', 'name email phone');
        if(!readingRoom){
            return res.status(404).json({success: false, message: "Reading Room not found"});
        }

        res.status(200).json({success: true, readingRoom});
    }catch(err){
        res.status(500).json({success: false, ERROR: err.message});
    }
}


const listMyRooms = async (req, res) => {
  try {
    const ownerId = req.user._id;
    if (req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const readingRooms = await ReadingRoom.find({ ownerId });
    if (!readingRooms || readingRooms.length === 0) {
      return res.status(404).json({ success: false, message: "No reading rooms found" });
    }

    res.status(200).json({ success: true, readingRooms, owner: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
    }});
  } catch (err) {
    res.status(500).json({ success: false, ERROR: err.message });
  }
}

module.exports = {
 readingRoomOpen,
 listMyRooms
}