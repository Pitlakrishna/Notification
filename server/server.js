import express from express
import cors from cors
import dotenv from dotenvn

dotenv.config();

const app = express()
const PORT = process.env.PORT || 4000

app.use(
    cors({
        orign: process.env.FRONTEND_URL || "http://localhost:3000",
    })
)
app.use(express.json())

app.use("/api/v1/notification")

app.listen(PORT, (req, res) => {
    console.log(`Server is listening on port: $PORT}`)
})

app.get("/", (req, res) => {
    res.json({
        status: "Server running .... Hello we are in Home page."
    })
})


