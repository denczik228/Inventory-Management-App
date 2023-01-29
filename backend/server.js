const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const userRoute = require("./routes/userRoute.js"); 
const errorHandler = require("./middleWare/errorMiddleware.js");

const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

//routes middleware
app.use("/api/users", userRoute);

//routes
app.get("/", (req, res) => {
    res.send("Home Page");
});

//error middleware
app.use(errorHandler);

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