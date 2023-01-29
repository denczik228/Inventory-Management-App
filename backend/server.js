const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

const PORT = process.env.PORT||5000;

//connection do mongodb - start server
mongoose
    .set("strictQuery", false)
    .connect(process.env.MONGO_URL)
    .then(() => {
        app.listen(PORT, () => {
                console.log(`running on port = ${PORT}`)
            })
    })
    .catch((err) => {
        console.log(err);
        })