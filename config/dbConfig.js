const mongoose = require("mongoose")
require("dotenv").config()

const url = process.env.databaseUrl
mongoose.connect(url)
.then(()=>{
    console.log("connection to database established succesfully");
})
.catch((error)=>{
    console.log(`connection to database failed due to: `, error.message);
})