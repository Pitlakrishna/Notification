import { smsController } from "../Controller/smsController"
import express from express


const routes = express.Router()

routes.post("/send", smsController)