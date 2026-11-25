import express from express


const routes = express.Router()

routes.post("/send-sms" , smsController )