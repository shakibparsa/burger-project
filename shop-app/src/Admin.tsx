import { useEffect, useRef, useState } from "react";

/* ================== TYPES ================== */

type Customer = {
  id?: number; // فقط اگر مشتری اکانت دارد
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
  category: string;
};

type Order = {
  id: number;
  invoice: number;

  customer: Customer;

  items: OrderItem[];

  total: number;
  status: "new" | "done";

  type: "pickup" | "delivery";
  createdAt: string;
  readyAt?: string | null;
};

/* =========================================== */

export default function Admin() {
  const [locked, setLocked] = useState(true);
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

  useEffect(() => {
    dingRef.current = new Audio("/ding.mp3");
    document.documentElement.requestFullscreen?.();
    if ("Notification" in window) Notification.requestPermission();
    setInterval(() => forceTick(t => t + 1), 1000);
  }, []);

  const loadOrders = async () => {
    const res = await fetch("http://localhost:3001/api/orders");
    const data: Order[] = await res.json();

    data.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());

    const ids=data.map(o=>o.id);
    const hasNew=ids.some(id=>!prevIdsRef.current.includes(id));

    if(hasNew && prevIdsRef.current.length){
      dingRef.current?.play().catch(()=>{});
      topRef.current?.scrollIntoView({behavior:"smooth"});
      if(Notification.permission==="granted") new Notification("Neue Bestellung!");
    }

    prevIdsRef.current=ids;
    setOrders(data);
  };

  useEffect(()=>{
    loadOrders();
    const t=setInterval(loadOrders,5000);
    return ()=>clearInterval(t);
  },[]);

  const markDone=async(id:number)=>{
    await fetch(`http://localhost:3001/api/orders/${id}`,{
      method:"PATCH",
      headers:{ "Content-Type":"application/json"},
      body:JSON.stringify({status:"done"})
    });
    loadOrders();
  };

  const deleteOrder=async(id:number)=>{
    await fetch(`http://localhost:3001/api/orders/${id}`,{method:"DELETE"});
    loadOrders();
  };

  const setReady=async(id:number)=>{
    const mins=minutesMap[id]||20;
    const readyAt=new Date(Date.now()+mins*60000).toISOString();
    await fetch(`http://localhost:3001/api/orders/${id}`,{
      method:"PATCH",
      headers:{ "Content-Type":"application/json"},
      body:JSON.stringify({readyAt})
    });
    loadOrders();
  };

  const getColor=(o:Order)=>{
    if(!o.readyAt) return "#fff";
    const d=new Date(o.readyAt).getTime()-Date.now();
    if(d<0) return "#ffcccc";
    if(d<10*60000) return "#fff3cd";
    return "#e6ffe6";
  };

  const getTimer=(o:Order)=>{
    if(!o.readyAt) return "";
    const d=new Date(o.readyAt).getTime()-Date.now();
    const m=Math.floor(d/60000);
    const s=Math.floor((d%60000)/1000);
    return `${m}:${s.toString().padStart(2,"0")}`;
  };

  const today=new Date().toDateString();
  const month=new Date().getMonth();

  const todayOrders=orders.filter(o=>new Date(o.createdAt).toDateString()===today);
  const monthOrders=orders.filter(o=>new Date(o.createdAt).getMonth()===month);

  const todayTotal=todayOrders.reduce((s,o)=>s+Number(o.total||0),0);
  const monthTotal=monthOrders.reduce((s,o)=>s+Number(o.total||0),0);

  const downloadJSON=(list:Order[],name:string)=>{
    const blob=new Blob([JSON.stringify(list,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=name;a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV=()=>{
    const rows=todayOrders.map(o=>`${o.id},${o.total},${o.type},${o.createdAt}`);
    const csv="id,total,type,createdAt\n"+rows.join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download="today.csv";a.click();
    URL.revokeObjectURL(url);
  };

  // chart
  useEffect(()=>{
    if(!chartRef.current) return;
    const ctx=chartRef.current.getContext("2d");
    if(!ctx) return;
    ctx.clearRect(0,0,400,150);
    const max=Math.max(...todayOrders.map(o=>Number(o.total)),1);
    todayOrders.forEach((o,i)=>{
      const h=(Number(o.total)/max)*120;
      ctx.fillRect(i*30+10,140-h,20,h);
    });
  },[orders]);

  // LOGIN
  if(locked){
    return(
      <div style={{padding:40}}>
        <h2>Admin Login</h2>
        <input type="password" value={pin} onChange={e=>setPin(e.target.value)}/>
        <br/><br/>
        <button onClick={()=>{
          fetch("http://localhost:3001/api/admin/login",{
            method:"POST",
            headers:{ "Content-Type":"application/json"},
            body:JSON.stringify({pin})
          }).then(r=>r.json()).then(d=>d.ok?setLocked(false):alert("Wrong PIN"))
        }}>Login</button>
      </div>
    );
  }

  const activeOrders=orders.filter(o=>o.status!=="done");
  const doneOrders=orders.filter(o=>o.status==="done");

  const filtered=activeOrders.filter(o=>
    String(o.id).includes(search) ||
    JSON.stringify(o.items).toLowerCase().includes(search.toLowerCase())
  );

  const closeShift=()=>{
    const w=window.open("","_blank");
    if(!w)return;
    w.document.write(`<pre>
SHIFT REPORT
${new Date().toLocaleString()}

Orders: ${todayOrders.length}
Total: €${todayTotal.toFixed(2)}
</pre>`);
    w.print();
  };

  const printReport=(list:Order[],title:string)=>{
    const w=window.open("","_blank");
    if(!w)return;
    w.document.write(`<pre>${title}\n\n`+
      list.map(o=>`#${o.id} €${o.total}`).join("\n")+
      `\n\nTOTAL €${list.reduce((s,o)=>s+Number(o.total||0),0).toFixed(2)}</pre>`);
    w.print();
  };

  return(
    <div style={{padding:20}}>
      <div ref={topRef}/>
      <h1>Admin</h1>
      <h2>Heute €{todayTotal.toFixed(2)}</h2>
      <h3>Monat €{monthTotal.toFixed(2)}</h3>

      <canvas ref={chartRef} width={400} height={150}/>

      <div>
        <button onClick={()=>downloadJSON(orders,"all.json")}>Backup</button>{" "}
        <button onClick={()=>downloadJSON(todayOrders,"today.json")}>Today</button>{" "}
        <button onClick={()=>downloadJSON(monthOrders,"month.json")}>Month</button>{" "}
        <button onClick={exportCSV}>CSV</button>{" "}
        <button onClick={()=>alert(window.location.href)}>📱 Mirror</button>{" "}
        <button onClick={closeShift}>🧾 Close Shift</button>{" "}
        <button onClick={()=>printReport(todayOrders,"DAILY REPORT")}>PDF Day</button>{" "}
        <button onClick={()=>printReport(monthOrders,"MONTH REPORT")}>PDF Month</button>
      </div>

      <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} />

      {filtered.map(o=>(
        <div key={o.id} style={{border:"2px solid black",margin:10,padding:10,background:getColor(o)}}>
          <div style={{fontSize:28,fontWeight:"bold"}}>
            {o.type==="delivery"?"🛵":"🚶"} {getTimer(o)}
          </div>

          <pre>{JSON.stringify(o.items,null,2)}</pre>
          TOTAL €{o.total}<br/>

          <input type="number" style={{width:60}}
            value={minutesMap[o.id]||""}
            onChange={e=>setMinutesMap(m=>({...m,[o.id]:Number(e.target.value)}))}/>

          <button onClick={()=>setReady(o.id)}>Ready</button><br/>

          <button onClick={()=>markDone(o.id)}>Done</button>{" "}
          <button onClick={()=>deleteOrder(o.id)}>Delete</button>{" "}
          <button onClick={()=>{
            const w=window.open("","_blank");
            if(!w)return;
            const items=Array.isArray(o.items)?o.items.map((i:any)=>`• ${i.name||i}`).join("\n"):JSON.stringify(o.items,null,2);
            w.document.write(`<pre>
ORDER ${o.id}
${new Date(o.createdAt).toLocaleString()}
${o.type}

${items}

TOTAL €${o.total}
</pre>`);
            w.print();
          }}>Print</button>
        </div>
      ))}

      <hr/>
      <button onClick={()=>setShowDone(s=>!s)}>Done ({doneOrders.length})</button>
      {showDone && doneOrders.map(o=>(
        <div key={o.id} style={{opacity:.5}}>#{o.id} €{o.total}</div>
      ))}
    </div>
  );
}