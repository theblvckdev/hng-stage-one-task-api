const express = require("express");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

// important if app is behind a proxy
app.set("trust proxy", true);

app.get("/api/hello", async (req, res) => {
  const visitorName = req.query.visitor_name || "Guest";

  // Get client's IP address
  const clientIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    // Fetch location based on IP address
    const locationResponse = await axios.get(
      `https://ipapi.co/${clientIp}/json/`
    );
    const location = locationResponse.data.city || "Unknown location";

    // Fetch weather information
    const weatherResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${locationResponse.data.latitude}&longitude=${locationResponse.data.longitude}&current_weather=true`
    );
    const temperature = weatherResponse.data.current_weather.temperature;

    const greeting = `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celcius in ${location}`;

    res.json({
      client_ip: clientIp,
      location: location,
      greeting: greeting,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Unable to fetch location or weather information" });
  }
});

app.listen(port, () => {
  console.log(`Server running on Port: ${port}`);
});
