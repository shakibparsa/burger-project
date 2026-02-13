console.log("SERVER FILE LOADED");

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const getDelivery = require("./utils/getDelivery");

const app = express();
const PORT = 3001;

/* ================== MIDDLEWARE ================== */
app.use(cors());
app.use(express.json());

/* ================== IN MEMORY DB ================== */
const orders = [];

/* ================== TEST ROUTE ================== */
app.get("/", (req, res) => {
  res.send("Backend is alive 🚀");
});

/* ================== ORDERS ================== */

// GET all orders (Admin uses this)
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// CREATE order (Frontend checkout uses this)
app.post("/api/orders", (req, res) => {
  console.log("NEW ORDER:", req.body);

  const order = {
    ...req.body,
    id: Date.now(),
    status: "new",
    createdAt: new Date().toISOString(),
    readyAt: null
  };

  orders.push(order);

  res.json({
    ok: true,
    orderId: order.id
  });
});

// UPDATE order (READY or DONE)
app.patch("/api/orders/:id", (req, res) => {
  const id = Number(req.params.id);
  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ ok: false });
  }

  if (req.body.status) {
    order.status = req.body.status;
  }

  if (req.body.readyAt) {
    order.readyAt = req.body.readyAt;
  }

  res.json({ ok: true, order });
});

// DELETE order
app.delete("/api/orders/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = orders.findIndex(o => o.id === id);

  if (index === -1) {
    return res.status(404).json({ ok: false });
  }

  orders.splice(index, 1);
  res.json({ ok: true });
});

/* ================== DELIVERY ================== */

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

/* ================== ADMIN LOGIN ================== */

app.post("/api/admin/login", (req, res) => {
  const { pin } = req.body;

  if (pin === process.env.ADMIN_PIN) {
    return res.json({ ok: true });
  }

  res.json({ ok: false });
});

/* ================== START SERVER ================== */

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});