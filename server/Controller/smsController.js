export const smsController = async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ error: "phoneNumber is required!" });
        }

        if (!message) {
            return res.status(400).json({ error: "Content/message is required!" });
        }

        let smsText = message;
        const apiKey = process.env.TEXTBEE_API_KEY;
        const deviceId = process.env.TEXTBEE_DEVICE_ID;

        if (!apiKey) {
            return res.status(500).json({
                error: "TEXTBEE_API_KEY is missing in .env",
            });
        }

        // Format phone number with country code if not present
        const formattedPhone = phoneNumber.startsWith("+")
            ? phoneNumber
            : `+91${phoneNumber}`;

        // Build payload. If TEXTBEE_DEVICE_ID is set in .env, pass it as deviceId
        const payload = {
            recipients: [formattedPhone],
            message: smsText,
        };

        if (deviceId && deviceId !== "your_android_device_id") {
            payload.deviceId = deviceId;
        }

        const response = await fetch("https://api.textbee.dev/api/v1/gateway/send-sms", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey.trim(),
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({
                error: `SMS provider error: ${errorText}`,
            });
        }

        const data = await response.json();
        return res.status(200).json({
            success: true,
            message: `Sent "${smsText}" to ${formattedPhone}`,
            providerResponse: data,
        });

    } catch (error) {
        console.error("SMS controller error:", error);
        return res.status(500).json({
            status: "Internal server error!",
        });
    }
};
