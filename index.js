const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000


// middlewires
app.use(cors())
app.use(express.json())


app.get('/',(req,res)=>{
    res.send('Health and Sanitation Platform is running')
})

app.listen(5000,()=>{
    console.log(`Health and Sanitation Platform is running on ${port} port`)
})
