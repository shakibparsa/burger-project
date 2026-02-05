const getDelivery = require("./utils/getDelivery");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Backend is alive 🚀");
});
app.get("/api/delivery/:zip", (req, res) => {
  const zip = req.params.zip;
  const delivery = getDelivery(zip);

  if (!delivery) {
    return res.status(404).json({
      error: "Delivery not available for this ZIP"
    });
  }

  res.json(delivery);
});



app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});

async function fetchDelivery(z: string) {
  try {
    const res = await fetch(`http://localhost:3001/api/delivery/${z}`);
    if (!res.ok) throw new Error();

    const data = await res.json();
    setDelivery(data);
    setDeliveryError("");
  } catch {
    setDelivery(null);
    setDeliveryError("Lieferung nicht verfügbar");
  }
}

