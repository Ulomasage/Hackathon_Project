require('./config/dbConfig.js')
const express = require('express')
require("dotenv").config()
const cors = require('cors')
const morgan = require('morgan')
const router = require('./routers/userRouter.js')
const PORT=process.env.PORT || 5050


const app = express();
app.use(cors({origin: "*"}))

app.use(morgan("dev"))
app.use(express.json())

app.use("/api/v1/user",router)


app.listen(PORT, () => {
    console.log(`server running on PORT: ${PORT}`);
})