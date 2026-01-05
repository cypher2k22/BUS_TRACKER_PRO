const express = require('express');
require('dotenv').config();
const cors = require('cors');
const authRoutes = require("./routes/authRoutes");
const passengerRoutes = require("./routes/passengerRoutes");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const port =process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/passenger", passengerRoutes);

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});

module.exports = app;