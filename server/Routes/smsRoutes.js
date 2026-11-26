import express from "express";
import { smsController } from "../Controller/smsController.js";

const routes = express.Router();

routes.post("/send", smsController);

export default routes;