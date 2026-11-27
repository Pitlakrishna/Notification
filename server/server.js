import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import smsRoutes from "./Routes/smsRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/v1/notification", smsRoutes);

app.get("/", (req, res) => {
    res.json({
        status: "Server running .... Hello we are in Home page."
    });
});

app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});
