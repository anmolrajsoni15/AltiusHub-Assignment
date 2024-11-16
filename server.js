import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import bodyParser from 'body-parser'
import cors from 'cors'

import invoiceRouter from './backend/routes/invoice.routes.js'

//create an express server 
const app = express();

app.use(cors())
app.use(bodyParser.json({
  limit: '50mb'
}))
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api', invoiceRouter);

app.listen(process.env.PORT, ()=>{
  console.log(`Server is running on Port ${process.env.PORT}`);
})


