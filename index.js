const express = require("express");
const app = express();
app.use(express.json());

// Endpoint para enviar notificación push via Expo
app.post("/send-notification", async (req, res) => {
  const { token, title, body, data } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token requerido" });
  }

  try {
    const message = {
      to: token,
      sound: "default",
      title: title || "BYJA Transportes",
      body: body || "Tienes un nuevo servicio",
      data: data || {},
      channelId: "servicios",
      priority: "high",
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    res.json({ success: true, result });
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/", (req, res) => res.json({ status: "BYJA Notification Server running" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));