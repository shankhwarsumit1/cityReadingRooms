const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRouter = require("./routers/authRouter");
const readingRoomRouter = require("./routers/readingRoomRouter");
const studentRouter = require("./routers/studentRouter");
const ownerRouter = require("./routers/ownerRouter");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.json({limit:'50mb'}));
app.use("/", authRouter);
app.use("/", readingRoomRouter);
app.use("/student", studentRouter);
app.use("/", ownerRouter);
mongoose.connect(process.env.DBURL)
  .then(()=>{
    console.log("db connected");
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
  })
  .catch((err)=>{
    console.log(err);
  })