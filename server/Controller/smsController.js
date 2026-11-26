export const smsController = async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ error: "phoneNumber is required!" })
        }

        if (!message) {
            return res.status(400).json({ error: "Content is required!" })
        }

        let smsText = message
        const apiKey = process.env.TEXTBEE_API_KEY;
        const deviceId = process.env.TEXTBEE_DEVICE_ID;

        if (!apiKey || !deviceId) {
            return res.status(500).json({
                error: "TEXTBEE_API_KEY or TEXTBEE_DEVICE_ID is missing in .env",
            })
        }

        const response = await fetch(`https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`,
            {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    "x-type-api": apiKey,
                },
                body: JSON.stringify({
                    recipients: [phoneNumber],
                    message: smsText,
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({
                error: `SMS provider error ; ${errorText}`
            });
        }

        const data = await response.json()
        return res.status(200).json({
            success: true,
            message: `Sent "${smsText}" to ${phoneNumber}`,
            providerResponse: data
        })


    } catch (error) {
        res.status(500).json({
            status: "Internal server error!"
        })
    }
}