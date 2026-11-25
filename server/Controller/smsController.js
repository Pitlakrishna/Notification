export const smsController = async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ error: "phoneNumber is required!" })
        }

        if (!message) {
            return res.status(400).json({ error: "Content is required!" })
        }

        let sendText = message

    } catch (error) {
        res.json({
            status: "Internal server error!"
        })
    }
}