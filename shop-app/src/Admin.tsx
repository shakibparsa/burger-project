import { useEffect, useRef, useState } from "react";

/* ================== TYPES ================== */

type Customer = {
  id?: number;
  firstName: string;
  lastName: string;
  phone: string;
  street?: string;
  zip?: string;
  city?: string;
};

type OrderItem = {
  name: string;
  price: number;
  qty: number;
  category?: string;
};

type Order = {
  id: number;
  invoice?: number;
  customer: Customer;
  items: OrderItem[] | string;
  total: number;
  status: "new" | "done";
  type: "pickup" | "delivery";
  createdAt: string;
  readyAt?: string | null;
};

/* ================== NORMALIZE ITEMS ================== */

const normalizeItems = (order: Order): OrderItem[] => {
  if (Array.isArray(order.items)) return order.items;

  if (typeof order.items === "string") {
    return order.items.split("\n").map(line => {
      const priceMatch = line.match(/€([\d.]+)/);
      const price = priceMatch ? Number(priceMatch[1]) : 0;
      return {
        name: line,
        price,
        qty: 1,
        category: "food"
      };
    });
  }

  return [];
};

/* ================== TAX HELPER ================== */

const calcTaxes = (order: Order) => {
  let tax7 = 0;
  let tax19 = 0;

  const itemsArray = normalizeItems(order);

  itemsArray.forEach(i => {
    const qty = i.qty ?? 1;
    const price = Number(i.price) || 0;
    const gross = price * qty;

    const name = (i.name || "").toLowerCase();

    if (name.includes("kola") || name.includes("cola")) {
      tax19 += (gross * 19) / 119;
    } else {
      tax7 += (gross * 7) / 107;
    }
  });

  return { tax7, tax19 };
};

/* =============================================== */

export default function Admin() {
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);

  const [minutesMap, setMinutesMap] = useState<Record<number, number>>({});
  const [showDone, setShowDone] = useState(false);
  const [search, setSearch] = useState("");
  const [, forceTick] = useState(0);

  const prevIdsRef = useRef<number[]>([]);
  const dingRef = useRef<HTMLAudioElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  /* ===== INIT ===== */

  useEffect(() => {
    dingRef.current = new Audio("/ding.mp3");
    document.documentElement.requestFullscreen?.();
    if ("Notification" in window) Notification.requestPermission();
    setInterval(() => forceTick(t => t + 1), 1000);
  }, []);

  /* ===== LOAD ORDERS ===== */

  const loadOrders = async () => {
    const res = await fetch("http://localhost:3001/api/orders");
    const data: Order[] = await res.json();

    data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    const ids = data.map(o => o.id);
    const hasNew = ids.some(id => !prevIdsRef.current.includes(id));

    if (hasNew && prevIdsRef.current.length) {
      dingRef.current?.play().catch(() => {});
      topRef.current?.scrollIntoView({ behavior: "smooth" });
      if (Notification.permission === "granted") {
        new Notification("Neue Bestellung!");
      }
    }

    prevIdsRef.current = ids;
    setOrders(data);
  };

  useEffect(() => {
    loadOrders();
    const t = setInterval(loadOrders, 5000);
    return () => clearInterval(t);
  }, []);

  /* ===== ACTIONS ===== */

  const setReady = async (id: number) => {
    const mins = minutesMap[id] || 20;
    const readyAt = new Date(Date.now() + mins * 60000).toISOString();
    await fetch(`http://localhost:3001/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ readyAt })
    });
    loadOrders();
  };

  const markDone = async (id: number) => {
    await fetch(`http://localhost:3001/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" })
    });
    loadOrders();
  };

  const deleteOrder = async (id: number) => {
    await fetch(`http://localhost:3001/api/orders/${id}`, {
      method: "DELETE"
    });
    loadOrders();
  };

  /* ===== HELPERS ===== */

  const getColor = (o: Order) => {
    if (!o.readyAt) return "#fff";
    const d = new Date(o.readyAt).getTime() - Date.now();
    if (d < 0) return "#ffcccc";
    if (d < 10 * 60000) return "#fff3cd";
    return "#e6ffe6";
  };

  const getTimer = (o: Order) => {
    if (!o.readyAt) return "";
    const d = new Date(o.readyAt).getTime() - Date.now();
    const m = Math.floor(d / 60000);
    const s = Math.floor((d % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* ===== STATS ===== */

  const today = new Date().toDateString();
  const month = new Date().getMonth();

  const todayOrders = orders.filter(
    o => new Date(o.createdAt).toDateString() === today
  );
  const monthOrders = orders.filter(
    o => new Date(o.createdAt).getMonth() === month
  );

  const todayTotal = todayOrders.reduce((s, o) => s + o.total, 0);
  const monthTotal = monthOrders.reduce((s, o) => s + o.total, 0);

  const todayTax7 = todayOrders.reduce((s, o) => s + calcTaxes(o).tax7, 0);
  const todayTax19 = todayOrders.reduce((s, o) => s + calcTaxes(o).tax19, 0);
  const monthTax7 = monthOrders.reduce((s, o) => s + calcTaxes(o).tax7, 0);
  const monthTax19 = monthOrders.reduce((s, o) => s + calcTaxes(o).tax19, 0);

  /* ===== PRINT INVOICE ===== */

  const printInvoice = (order: Order) => {
    const { tax7, tax19 } = calcTaxes(order);
    const itemsArray = normalizeItems(order);

    const w = window.open("", "_blank");
    if (!w) return;

    w.document.write(`
      <html>
        <head>
          <title>Rechnung ${order.id}</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { margin-bottom: 5px; }
            hr { margin: 10px 0; }
          </style>
        </head>
        <body>
          <h2>Rechnung #${order.id}</h2>
          <p>${order.customer.firstName} ${order.customer.lastName}</p>
          <hr/>
          ${itemsArray.map(i => `
            <div>
              ${i.qty}x ${i.name} – €${(i.price * (i.qty ?? 1)).toFixed(2)}
            </div>
          `).join("")}
          <hr/>
          <div><strong>Gesamt: €${order.total.toFixed(2)}</strong></div>
          <div>MwSt 7%: €${tax7.toFixed(2)}</div>
          <div>MwSt 19%: €${tax19.toFixed(2)}</div>
          <small>inkl. MwSt</small>
        </body>
      </html>
    `);

    w.document.close();
    w.focus();
    w.print();
  };

  /* ===== EXPORT TAX ===== */

  const exportTaxReport = () => {
    let totalBrutto = 0;
    let totalTax7 = 0;
    let totalTax19 = 0;

    monthOrders.forEach(order => {
      totalBrutto += Number(order.total) || 0;
      const { tax7, tax19 } = calcTaxes(order);
      totalTax7 += tax7;
      totalTax19 += tax19;
    });

    const csvContent =
      "Monat;Umsatz Brutto;MwSt 7%;MwSt 19%\n" +
      `${month};${totalBrutto.toFixed(2)};${totalTax7.toFixed(2)};${totalTax19.toFixed(2)}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Steuerreport_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDATEV = () => {
  const rows: string[] = [];

  monthOrders.forEach(order => {
    const { tax7, tax19 } = calcTaxes(order);

    const netto7 = tax7 * 100 / 7;
    const netto19 = tax19 * 100 / 19;

    const date = new Date(order.createdAt)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");

    // 7%
    if (netto7 > 0) {
      rows.push(
        `${date};8400;${netto7.toFixed(2)};Erlös 7%`
      );
      rows.push(
        `${date};1771;${tax7.toFixed(2)};MwSt 7%`
      );
    }

    // 19%
    if (netto19 > 0) {
      rows.push(
        `${date};8400;${netto19.toFixed(2)};Erlös 19%`
      );
      rows.push(
        `${date};1776;${tax19.toFixed(2)};MwSt 19%`
      );
    }
  });

  const header = "Datum;Konto;Betrag;Text\n";
  const csvContent = header + rows.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `DATEV_${month}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  /* ===== FILTER ===== */

  const activeOrders = orders.filter(o => o.status !== "done");
  const doneOrders = orders.filter(o => o.status === "done");

  const filtered = activeOrders.filter(
    o =>
      String(o.id).includes(search) ||
      JSON.stringify(o.items).toLowerCase().includes(search.toLowerCase())
  );

  /* ===== RENDER ===== */

  return (
    <div style={{ padding: 20 }}>
      <div ref={topRef} />
      <h1>Admin</h1>

      <h2>Heute €{todayTotal.toFixed(2)}</h2>
      <div>
        <div>MwSt 7%: €{todayTax7.toFixed(2)}</div>
        <div>MwSt 19%: €{todayTax19.toFixed(2)}</div>
      </div>

      <h3>Monat €{monthTotal.toFixed(2)}</h3>
      <div>
        <div>MwSt 7%: €{monthTax7.toFixed(2)}</div>
        <div>MwSt 19%: €{monthTax19.toFixed(2)}</div>
      </div>

      <button onClick={exportTaxReport}>
        Export Steuerbericht
      </button>

      <button onClick={exportDATEV}>
        Export DATEV
      </button>

      <input
        placeholder="Search…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filtered.map(o => {
        const { tax7, tax19 } = calcTaxes(o);

        return (
          <div
            key={o.id}
            style={{
              border: "2px solid black",
              margin: 10,
              padding: 10,
              background: getColor(o)
            }}
          >
            <div style={{ fontSize: 28, fontWeight: "bold" }}>
              {o.type === "delivery" ? "🛵" : "🚶"} {getTimer(o)}
            </div>

            <pre>{JSON.stringify(o.items, null, 2)}</pre>
            TOTAL €{o.total}

            <div style={{ fontSize: 12 }}>
              MwSt 7%: €{tax7.toFixed(2)} <br />
              MwSt 19%: €{tax19.toFixed(2)}
            </div>

            <input
              type="number"
              value={minutesMap[o.id] || ""}
              onChange={e =>
                setMinutesMap(m => ({
                  ...m,
                  [o.id]: Number(e.target.value)
                }))
              }
            />

            <button onClick={() => setReady(o.id)}>Ready</button>
            <button onClick={() => markDone(o.id)}>Done</button>
            <button onClick={() => deleteOrder(o.id)}>Delete</button>
            <button onClick={() => printInvoice(o)}>Print</button>
          </div>
        );
      })}

      <hr />
      <button onClick={() => setShowDone(s => !s)}>
        Done ({doneOrders.length})
      </button>

      {showDone &&
        doneOrders.map(o => (
          <div key={o.id} style={{ opacity: 0.5 }}>
            #{o.id} €{o.total}
          </div>
        ))}
    </div>
  );
}