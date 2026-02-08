import { useState, useEffect } from "react";

function splitTax(brutto: number, tax: number) {
  const divisor = 100 + tax;
  const taxAmount = brutto * tax / divisor;
  const net = brutto - taxAmount;

  return {
    net: Number(net.toFixed(2)),
    tax: Number(taxAmount.toFixed(2))
  };
}

type Customer = {
  firstName: string;
  lastName: string;
  phone: string;

  zip?: string;
  city?: string;

  street?: string;
  houseNumber?: string;

  isGuest: boolean;
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




type Option = { name: string; price: number };

type Drink = {
  name: string;
  price: number;
  pfand: number;
}

type Product = {
  id: number;
  name: string;
  price: number;
  pfand: number;
  meat?: string;
  bun?: string;
  side?: string;
  extras?: string[];
  sauce?: string;
};

type Category = {
  name: string;
  img: string;
  tax:number;
  items: Product[];
};


/* BASE */



/* OPTIONS */

const deliveryZones = [
  {
    zip: ["85521"],
    fee: 1.5,
    min: 15
  },
  {
    zip: ["85579","85662"],
    fee: 2,
    min: 20
  },
  {
    zip: ["82008","82024","81739","85640"],
    fee: 3,
    min: 30
  },
  {
    zip: ["81737","81735"],
    fee: 4,
    min: 40
  },
  {
    zip: ["85635","85649","85630"],
    fee: 4,
    min: 35
  },
  {
    zip: ["82041"],
    fee: 4,
    min: 45
  }
];


const saladDressings = [
{ name: "Ohne Dressing" },
{ name: "Balsamico Dressing" },
{ name: "Thousand Island Dressing" },
{ name: "Honig-Senf Dressing" },
{ name: "Italien Dressing" },
{ name: "Joghurt Dressing" }
];

const meats: Option[] = [
  { name: "Falafel Patty", price: 0 },
  { name: "Angus Dry Aged", price: 5 },
  { name: "Gourmet Lachs", price: 6 },
  { name: "Hähnchenfilet", price: 2 },
  { name: "Bio Beef", price: 3 },
  { name: "Pulled Beef", price: 7 },
  { name: "Veggie Schnitzel", price: 0 },
  { name: "Crunchy Chicken", price: 3 }
];

const buns: Option[] = [
  { name: "Mehrkorn Bun", price: 0 },
  { name: "Sauerteig Bun", price: 0 },
  { name: "Brioche Bun", price: 0 },
  { name: "Glutenfrei Bun", price: 0 }
];

const burgerSides: Option[] = [
  { name: "Ohne Beilage", price: 0 },
  { name: "Wedges", price: 3 },
  { name: "Twister", price: 3 },
  { name: "Pommes mit Schale", price: 3 },
  { name: "Süßkartoffel Pommes", price: 4 }
];

const germanySides: Option[] = [
{ name:"Ohne Beilage", price:0 },
{ name:"Pommes", price:0 },
{ name:"Wedges", price:0 },
{ name:"Süßkartoffel", price:1.9 }
];
const extrasList: Option[] = [
  { name: "Halloumi", price: 2.5 },
  { name: "Beef Bacon", price: 3.95 },
  { name: "Emmentaler", price: 1.2 },
  { name: "Bio Lachsfilet", price: 6.95 },
  { name: "Gouda", price: 1.2 },
  { name: "Cheddar", price: 1.2 },
  { name: "Falafel 2 Stück", price: 2.5 },
  { name: "Hähnchenfilet", price: 3.95 },
  { name: "Pulled 80g", price: 5.95 },
  { name: "Angus Patty", price: 5 },
  { name: "Bio Beef Patty", price: 3.95 },
  { name: "Spiegelei", price: 1.5 }
];

const sauces: Option[] = [
  { name: "Ketchup", price: 0 },
  { name: "Mayonnaise", price: 0 },
  { name: "Burger Sauce", price: 0 },
  { name: "BBQ", price: 0 },
  { name: "Honig Senf", price: 0 },
  { name: "Knoblauch", price: 0 },
  { name: "Sweet Chili", price: 0 },
  { name: "Honig Chili", price: 0 },
  { name: "Sauer Creme", price: 0 },
  { name: "Chili Cheese Sauce", price: 1 },
  { name: "Guacamole", price: 1 }
];

const desserts: Option[] = [
  { name: "Miss Chocoholic Muffin", weight: "130g", price: 3 },
  { name: "Muffin Premium Berry Berrylady", weight: "130g", price: 3 },

  { name: "Ben & Jerry’s Cookie Dough", weight: "465ml", price: 8.95 },
  { name: "Ben & Jerry’s Chocolate Fudge Brownie", weight: "465ml", price: 8.95 },
  { name: "Ben & Jerry’s Half Baked", weight: "465ml", price: 8.95 },
  { name: "Ben & Jerry’s Karamel Sutra", weight: "465ml", price: 8.95 },

  { name: "Ben & Jerry’s Brookies", weight: "100g", price: 3.95 },
  { name: "Ben & Jerry’s Cookie Dough", weight: "100g", price: 3.95 },
];






const drinks: Drink[] = [


  { name: "fritz-kola Original 0,33l", price: 2.95, pfand: 0.15 },
  { name: "fritz-kola Light 0,33l", price: 2.95, pfand: 0.15 },
  { name: "fritz-kola Super Zero 0,33l", price: 2.95, pfand: 0.15 },

  { name: "fritz-limo Orange", price: 2.95, pfand: 0.15 },
  { name: "fritz-limo Honigmelone", price: 2.95, pfand: 0.15 },
  { name: "fritz Apfel-Kirsch-Holunder", price: 2.8, pfand: 0.15 },

  { name: "fritz bio Apfelschorle", price: 2.95, pfand: 0.15 },
  { name: "fritz Rhabarber", price: 2.95, pfand: 0.15 },

  { name: "Paulaner Spezi 0,5l", price: 2.95, pfand: 0.15 },

  { name: "Red Bull", price: 2.75, pfand: 0.25 },
  { name: "Red Bull Summer", price: 2.75, pfand: 0.25 },

  { name: "Adelholzener Naturell", price: 2.4, pfand: 0.25 },
  { name: "Adelholzener Classic", price: 2.4, pfand: 0.25 },

  { name: "Durstlöscher Pfirsich", price: 1.5, pfand: 0 },
  { name: "Durstlöscher Multivitamin", price: 1.5, pfand: 0 },
  { name: "Durstlöscher Wassermelone", price: 1.5, pfand: 0 },
  { name: "Durstlöscher Mango", price: 1.5, pfand: 0 },

  { name: "Seven Dates", price: 2.5, pfand: 0 }

];
const mittagDrinks = drinks.map(d => ({
  name: d.name,
  price: d.name.toLowerCase().includes("red bull") ? 1 : 0
}));
/* HELPERS */

const priceOf = (arr: Option[], v: string) => arr.find(x => x.name === v)?.price || 0;

/* CATEGORIES */

const categories: any[] = [

{
  name: "Burger",
  img: "/burger.png",
  tax:7,
  items: [
    {
      id: 1,
      name: "Bürgermeister",
      price: 8.5,
      desc: "Cheddarkäse, Tomate, Gurke, Zwiebeln und feine Snacksoße nach Art des Hauses"
    },
    {
      id: 2,
      name: "Goldstück",
      price: 8.5,
      desc: "Cheddarkäse, Tomate, Gurke, Zwiebel und Honig-Senfsoße, scharf"
    },
    {
      id: 3,
      name: "Zickaria",
      price: 8.5,
      desc: "Gegrillter Halloumi, Tomaten, Gurken, Zwiebeln und Honigchilli-Senfsoße"
    },
    {
      id: 4,
      name: "Bergsteiger",
      price: 8.5,
      desc: "Feta, Walnuss, Rucola, Tomaten, Gurken und Zwiebeln in Honigsenf Soße"
    },
    {
      id: 5,
      name: "Streuner",
      price: 8.5,
      desc: "Cheddarkäse, Jalapenos, Gurke, Tomate, Zwiebeln in würzig-pikanter BBQ Soße"
    },
    {
      id: 6,
      name: "Mediterran",
      price: 8.5,
      desc: "Parmesan, Rucola, Oliven, Tomaten, Gurken, Zwiebeln mit Pesto Avocadocreme"
    },
    {
      id: 7,
      name: "Dreikäsehoch",
      price: 8.5,
      desc: "Cheddarkäse, Emmentaler, Gouda, Tomate, Gurke, Zwiebeln in feiner Snacksoße"
    },
    {
      id: 8,
      name: "Hochstapler",
      price: 8.5,
      desc: "Cheddarkäse, Champignon, Zwiebeln, Tomaten und Gurken in Pfeffersteak Soße"
    },
    {
      id: 9,
      name: "Holzfäller",
      price: 8.5,
      desc: "Cheddarkäse, Mais, Tomaten, Gurken, Röstzwiebeln in würziger BBQ Soße"
    }
  ]
},


  {
    name: "Mittagsangebote",
    img: "/mittag.jpg",
    tax:7,
    items: [{ id: 20, name: "Burger Menü", price: 11 }]
  },

{
name: "Made in Germany",
img: "/burger.jpg",
tax:7,
items: [
{
id: 201,
name: "Brandenburger Burger",
price: 15.65,
desc: "100% Angus-Rindfleisch, Gouda, Zwiebelringe, Jalapenos, Salat, Currysauce (inkl. Salat, Zwiebel, Gurke, Essiggurke)"
},
{
id: 202,
name: "Augsburger Burger",
price: 15.99,
desc: "Pulled Beef, Gouda, Tomaten, Schnittlauch, Chilli-Cheese Sauce (inkl. Salat, Zwiebel, Gurke, Essiggurke)"
},
{
id: 203,
name: "Defftiger",
price: 16.95,
desc: "Bio Beef, Ei, Rinderbacon, Cheddar, BBQ Sauce (inkl. Salat, Zwiebel, Gurke, Essiggurke)"
},
{
id: 204,
name: "Würzburger",
price: 15.95,
desc: "Angus Rindfleisch, Gouda, Zwiebel, Jalapenos, Curry Sauce (inkl. Salat, Zwiebel, Gurke, Essiggurke)"
}
]
},

  {
name: "Salate",
img: "/salat.jpg",
tax:7,
items: [
{
id: 21,
name: "Benissimo Salat",
price: 9.95,
desc: "Rucola, Baby-Mozzarella, Parmesan + eine Zutat nach Wahl (ohne Saisonsalat, Sprossen, Cherrytomaten)"
},
{
id: 22,
name: "Hahn im Korb Salat",
price: 12.95,
desc: "Gebratene Hähnchenstreifen, Gurken, Goji-Beeren, Chiasamen"
},
{
id: 23,
name: "Theresenwiese Salat",
price: 10.95,
desc: "Klassischer Salat mit Standardzutaten"
},
{
id: 24,
name: "Dirndlschmaus Salat",
price: 11.95,
desc: "Knusprige Hähnchenstreifen, Mango, Avocado"
},
{
id: 25,
name: "Reef n Beef Salat",
price: 14.95,
desc: "Rindfleisch, Garnelen, grüner Spargel, Parmesan, Schnittlauch"
},
{
id: 26,
name: "Moby Schick Salat",
price: 15.95,
desc: "Gegrillter Lachs, Avocadostreifen"
}
]
},


  {
    name: "Finger Food",
    img: "/finger.jpg",
    tax:7,
    items: [
      { id: 30, name: "Twister", price: 6.95 },
      { id: 31, name: "Pommes mit Schale", price: 5.95 },
      { id: 32, name: "Wedges Kartoffelecken", price: 6.65 },
      { id: 33, name: "Süßkartoffel Pommes", price: 6.95 },
      { id: 34, name: "Mozzarella Sticks", price: 6.95 },
      { id: 35, name: "Chili Cheese Nuggets", price: 6.95 },
      { id: 36, name: "Chicken Wings 6er", price: 8.95 },
      { id: 37, name: "Chicken Wings 9er", price: 10.95 },
      { id: 38, name: "Chicken Wings 12er", price: 12.95 },
      { id: 39, name: "Chicken Drips 6er", price: 9.95 },
      { id: 40, name: "Chicken Drips 9er", price: 11.95 },
      { id: 41, name: "Chicken Drips 12er", price: 13.95 }
    ]
  },

 {
  name: "Dessert",
  img: "/dessert.jpg",
  tax:7,
  items: desserts.map((d, i) => ({
    id: 500 + i,
    name: d.name,
    price: d.price,
    weight: d.weight
  }))
},


  {
    name: "Getränke",
    img: "/drink.jpg",
    tax:19,
    items: drinks.map((d, i) => ({
      id: 100 + i,
      name: d.name,
      price: d.price,
      pfand: d.pfand,
      extras: []
    }))
  },



];

export default function App() {

  const [user, setUser] = useState<null | {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
}>(null);


const [guest, setGuest] = useState({
  firstName: "",
  lastName: "",
  phone: "",
  zip: "",
  city: "",
  street: "",
  houseNumber: "",
});

const [zip, setZip] = useState("");
const [delivery, setDelivery] = useState<any>(null);

// فقط یکی! (تکراری حذف شد)
const [deliveryZone, setDeliveryZone] = useState<any>(null);

const [deliveryError, setDeliveryError] = useState("");
const [active, setActive] = useState(0);

console.log("APP RENDERED");

const [cart, setCart] = useState<any[]>([]);
const [type, setType] = useState<"pickup" | "delivery">("pickup");
const [minutes, setMinutes] = useState(20);

const [state, setState] = useState<any>({});


function upd(id: number, k: string, v: any) {
  setState((p: any) => ({ ...p, [id]: { ...p[id], [k]: v } }));
}

function toggle(id: number, e: string) {
  const arr = state[id]?.extras || [];
  upd(
    id,
    "extras",
    arr.includes(e)
      ? arr.filter((x: string) => x !== e)
      : [...arr, e]
  );
}

function checkZip(z: string) {
  console.log("CHECKZIP CALLED:", z);

  const clean = z.trim();
  setZip(clean);

  if (clean.length < 5) {
    setDeliveryZone(null);
    setDeliveryError("");
    return;
  }

  const found = deliveryZones.find(d =>
    d.zip.map(String).includes(clean)
  );

  if (!found) {
    setDeliveryZone(null);
    setDeliveryError("Lieferung nicht verfügbar");
    return;
  }

  setDeliveryZone(found);
  setDeliveryError("");
}

function remove(i: number) {
  setCart(prev => prev.filter((_, idx) => idx !== i));
}


  
  // ...existing code...

  function add(p: Product) {
  const s = state[p.id] || {};
  let price = p.price;
  const basePrice = p.price;

  // Getränke Pfand
  if (categories[active]?.name === "Getränke") {
    const d = drinks.find(x => x.name === p.name);
    if (d) price += d.pfand;
  }
  
  
  if (categories[active]?.name === "Mittagsangebote") {

    if (!s.burger) {
      alert("Bitte Burger wählen");
      return;
    }

    if (!s.drink) {
      alert("Bitte Getränk wählen");
      return;
    }

    // فقط Red Bull = +1€
    const d = drinks.find(x => x.name === s.drink);
    if (d && d.name.toLowerCase().includes("red bull")) price += 1;
  }

  // Burger + Mittag
  if (["Burger", "Mittagsangebote","Made in Germany"].includes(categories[active]?.name)) {

    if (
["Burger","Mittagsangebote"].includes(categories[active]?.name) &&
(!s.meat || !s.bun)
){
 alert("Patty & Bun wählen");
 return;
}
    price += priceOf(meats, s.meat);
    price += priceOf(buns, s.bun);

  if (s.side) {
  const isGermany = categories[active]?.name === "Made in Germany";
  const sideList = isGermany ? germanySides : burgerSides;

  if (s.side) {
  const isGermany = categories[active]?.name === "Made in Germany";
  price += priceOf(isGermany ? germanySides : burgerSides, s.side);
};
}



if (s.sauce) price += priceOf(sauces, s.sauce);

(s.extras || []).forEach((e: string) => {
  if (e !== s.side) {
    price += priceOf(extrasList, e);
  }
});
  }

  // Finger Food
  if (categories[active]?.name === "Finger Food") {
    if (s.sauce) price += priceOf(sauces, s.sauce);
  }

  const finalName =
categories[active].name==="Mittagsangebote" && s.burger
? `Burger Menü (${s.burger})`
: p.name;

if(categories[active]?.name==="Salate"){
if(!s.dressing){
alert("Bitte Dressing wählen");
return;
}
}


setCart(c=>[
  ...c,
  {
    ...p,
    ...s,
    drink: s.drink,
    name: finalName,
    price: Number(price.toFixed(2)),
    tax: categories[active].tax
  }
]);

}

  const products: Product[] = categories[active]?.items ;
  const burgerList = categories.find(c=>c.name==="Burger")?.items || [];
  const netTotal = cart.reduce((sum, item) => sum + item.price, 0);

const taxSummary = cart.reduce((acc, item) => {
  const divisor = 100 + item.tax;
  const taxAmount = (item.price * item.tax) / divisor;
  acc[item.tax] = (acc[item.tax] || 0) + taxAmount;
  return acc;
}, {} as Record<number, number>);

const totalTax = Object.values(taxSummary)
  .reduce((sum, val) => sum + val, 0);

const grossTotal = cart .reduce((sum, item) => sum + item.price, 0 );


  return (

    <div style={{ padding: 16 }}>
      <h1>Burger Buben</h1>
    

{delivery && (
  <div>
    <p>Liefergebühr: €{delivery.fee}</p>
    <p>Mindestbestellung: €{delivery.min}</p>
  </div>
)}

{type === "delivery" && deliveryError && (
  <p style={{ color: "red" }}>{deliveryError}</p>
)}

      <div style={{ display: "flex", marginBottom: 32 }}>
        {categories.map((c, i) => (
          <div key={c.name} style={{ marginRight: 16 }}>
            <img src={c.img} alt={c.name} style={{ width: 100, height: 100, objectFit: "cover" }} />
            <button type="button" onClick={() => setActive(i)} style={{ display: "block", marginTop: 8 }}>
              {c.name}
            </button>
          </div>
        ))}
      </div>


{categories[active]?.name==="Salate" && (
<div style={{fontSize:13,opacity:0.6,marginBottom:16}}>
Alle Salate werden mit Saisonsalat, gemischten Sprossen, Cherrytomaten,
roten Zwiebeln, Karottenstreifen, Sonnenblumenkernen
und einem Dressing nach Wahl zubereitet.
</div>
)}

      {products.map(p => (
<div key={p.id} style={{marginBottom:24}}>

<h4>
  
{p.name} €{p.price}
{categories[active]?.name==="Getränke" && ` +€${p.pfand} Pfand`}
</h4>
{["Burger","Made in Germany"].includes(categories[active]?.name) && (
<div style={{fontSize:12,opacity:0.6,marginBottom:8}}>
{p.desc}
</div>
)}

{categories[active]?.name==="Salate" && (
<select onChange={e=>upd(p.id,"dressing",e.target.value)}>
<option value="">Dressing wählen</option>

{saladDressings.map(d=>(
<option key={d.name} value={d.name}>{d.name}</option>
))}

</select>
)}
{/* description normal products */}

{/* ===== MITTAG BURGER ===== */}
{categories[active]?.name==="Mittagsangebote" && (
<>
<select onChange={e=>upd(p.id,"burger",e.target.value)}>
<option value="">Burger wählen</option>

{burgerList.map(b=>(
<option key={b.id} value={b.name}>{b.name}</option>
))}

</select>

{state[p.id]?.burger && (
<div style={{fontSize:12,opacity:0.6,marginBottom:8}}>
{burgerList.find(b=>b.name===state[p.id]?.burger)?.desc}
</div>
)}

<select onChange={e=>upd(p.id,"drink",e.target.value)}>
<option value="">Getränk wählen</option>

{mittagDrinks.map(d=>(
<option key={d.name} value={d.name}>
{d.name}{d.price>0 && " +€1"}
</option>
))}

</select>
</>
)}

{/* ===== BURGER + MITTAG OPTIONS ===== */}
{["Burger","Mittagsangebote","Made in Germany"].includes(categories[active]?.name) && (
<>

{["Burger","Mittagsangebote"].includes(categories[active]?.name) && (
<select onChange={e=>upd(p.id,"meat",e.target.value)}>
<option value="">Patty wählen</option>
{meats.map(m=>(
<option key={m.name} value={m.name}>
{m.name}{m.price>0 && ` +€${m.price}`}
</option>
))}
</select>
)}

<select onChange={e=>upd(p.id,"bun",e.target.value)}>
<option value="">Bun wählen</option>
{buns.map(m=>(
<option key={m.name} value={m.name}>{m.name}</option>
))}
</select>

<select onChange={e=>{
upd(p.id,"side",e.target.value);
if(e.target.value==="" || e.target.value==="Ohne Beilage"){
upd(p.id,"sauce","");
}
}}>
<option value="">Beilage wählen</option>

{(categories[active]?.name==="Made in Germany"
? germanySides
: burgerSides).map(m=>(
<option key={m.name} value={m.name}>
{m.name}{m.price>0 && ` +€${m.price}`}
</option>
))}

</select>
{state[p.id]?.side && state[p.id]?.side!=="Ohne Beilage" && (
<select onChange={e=>upd(p.id,"sauce",e.target.value)}>
<option value="">Sauce wählen</option>

{sauces.map(m=>(
<option key={m.name} value={m.name}>
{m.name}{m.price>0 && ` +€${m.price}`}
</option>
))}

</select>
)}

<div style={{ marginTop: 10, fontWeight: 600 }}>
  Extras ( mehrfach auswählbar )
</div>



{extrasList.map(e=>(
<label key={e.name} style={{display:"block"}}>
<input type="checkbox" onChange={()=>toggle(p.id,e.name)}/>
{e.name} +€{e.price}
</label>
))}

</>
)}

{/* ===== FINGER FOOD ===== */}
{categories[active]?.name==="Finger Food" && (
<select onChange={e=>upd(p.id,"sauce",e.target.value)}>
<option value="">Sauce wählen</option>
{sauces.map(m=>(
<option key={m.name} value={m.name}>
{m.name}{m.price>0 && ` +€${m.price}`}
</option>
))}
</select>
)}

<button onClick={()=>add(p)}>Add

</button>

</div>
))}
      



     <h3>Warenkorb</h3>

{cart.length === 0 ? (
  <div>Warenkorb ist leer</div>
) : (
  <ul>
    {cart.map((item, idx) => (
      <li key={idx} style={{ marginBottom: 12 }}>

        <b>{item.name}</b> — €{item.price.toFixed(2)}
        {item.pfand && (
          <span> (inkl. €{item.pfand.toFixed(2)} Pfand)</span>
        )}

        {(item.bun || item.side || item.sauce || item.meat) && (
          <div style={{ fontSize: 12, opacity: 0.7 }}>

            {item.meat && <div>Patty: {item.meat}</div>}
            {item.bun && <div>Bun: {item.bun}</div>}

            {item.side && item.side !== "Ohne Beilage" && (
              <div>Side: {item.side}</div>
            )}

            {item.sauce && <div>Sauce: {item.sauce}</div>}

            {item.extras?.length > 0 && (
              <div>Extras: {item.extras.join(", ")}</div>
            )}

          </div>
        )}

        {item.tax !== undefined && (
          <div style={{ fontSize: 12, opacity: 0.6 }}>
            MwSt: {item.tax}%
          </div>
        )}

        <button type="button" onClick={() => remove(idx)}>
  Remove
</button>
      </li>
    ))}
  </ul>
)}

<hr />

<div style={{ marginBottom: 10 }}>
 <button type="button" onClick={() => setType("pickup")}>
  🚶 Abholen
</button>

  <button
  type="button"
  onClick={() => setType("delivery")}
  style={{ marginLeft: 10 }}
>
  🚚 Lieferung
</button>
</div>


<hr />

<div style={{ fontSize: 14 }}>
  <div>
    Netto: €{netTotal.toFixed(2)}
  </div>

  {Object.entries(taxSummary).map(([rate, value]) => (
    <div key={rate}>
      MwSt {rate}%: €{value.toFixed(2)}
    </div>
  ))}

  <b>Gesamt: €{grossTotal.toFixed(2)}</b>
</div>

<br />

<button
  type="button"
  onClick={() => {

    // 🛑 سبد خالی
    if (cart.length === 0) {
      alert("Warenkorb ist leer");
      return;
    }

    // مشتری جاری (user یا guest)
    const c = user ? user : guest;

    // =========================
    // 🛍️ ABHOLEN
    // =========================
    if (type === "pickup") {
      if (!c.firstName || !c.phone) {
        alert("Bitte Name und Telefon eingeben");
        return;
      }
    }

    // =========================
    // 🚚 LIEFERUNG
    // =========================
    if (type === "delivery") {
  if (
    !guest.firstName ||
    !guest.phone ||
    !guest.zip ||
    !guest.city ||
    !guest.street ||
    !guest.houseNumber
  ) {
    alert("Bitte alle Lieferdaten vollständig eingeben");
    return;
  }

  if (!deliveryZone) {
    alert("Lieferung in dieser PLZ nicht möglich");
    return;
  }

  const min = deliveryZone?.min ?? 0;

if (grossTotal < min) {
  alert(`Mindestbestellwert für diese PLZ: €${min.toFixed(2)}`);
  return;
}
}

    // =========================
    // 📦 Items
    // =========================
    const items = cart
      .map(i => `${i.name} €${i.price.toFixed(2)}`)
      .join("\n");

    // =========================
    // 🧾 WhatsApp Nachricht
    // =========================
    const addressText =
      type === "delivery"
        ? `Adresse:
${c.street} ${c.houseNumber}
${c.zip} ${c.city}

`
        : "";

    const msg = `
Neue Bestellung:

${items}

Typ: ${type}
Bereit in: ${minutes} min

${addressText}
Netto: €${netTotal.toFixed(2)}
MwSt: €${totalTax.toFixed(2)}
Gesamt: €${grossTotal.toFixed(2)}
`;

    // =========================
    // 👤 Customer Objekt
    // =========================
    const customer = user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          zip: user.zip,
          city: user.city,
          street: user.street,
          houseNumber: user.houseNumber,
          isGuest: false,
        }
      : {
          ...guest,
          isGuest: true,
        };

    // =========================
    // 🚀 SEND
    // =========================
    fetch("http://localhost:3001/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoice: Date.now(),
        customer,
        items,
        net: netTotal,
        tax: totalTax,
        total: grossTotal,
        type,
        status: "new",
        createdAt: new Date().toISOString(),
      }),
    })
      .then(res => res.json())
      .then(() => {
        window.open(
          `https://wa.me/491787266694?text=${encodeURIComponent(msg)}`
        );

        setCart([]);
        setActive(0);
        window.scrollTo({ top: 0, behavior: "smooth" });
        alert("Bestellung erfolgreich gesendet ✅");
      })
      .catch(err => console.error(err));
  }}
>
  {!user && (
    <div style={{ marginBottom: 20 }}>
      <h4>Als Gast bestellen</h4>

      <input
        placeholder="Vorname"
        value={guest.firstName}
        onChange={e => setGuest({ ...guest, firstName: e.target.value })}
      />

      <input
        placeholder="Nachname"
        value={guest.lastName}
        onChange={e => setGuest({ ...guest, lastName: e.target.value })}
      />

      <input
        placeholder="Telefon"
        value={guest.phone}
        onChange={e => setGuest({ ...guest, phone: e.target.value })}
      />

      <input
        placeholder="PLZ"
        value={guest.zip}
        onChange={e => setGuest({ ...guest, zip: e.target.value })}
      />

      <input
        placeholder="Ort"
        value={guest.city}
        onChange={e => setGuest({ ...guest, city: e.target.value })}
      />

      {type === "delivery" && (
        <>
          <input
            placeholder="Straße"
            value={guest.street}
            onChange={e => setGuest({ ...guest, street: e.target.value })}
          />

          <input
            placeholder="Hausnummer"
            value={guest.houseNumber}
            onChange={e =>
              setGuest({ ...guest, houseNumber: e.target.value })
            }
          />
        </>
      )}

      {type === "delivery" && guest.zip && (
        <div style={{ marginTop: 10, fontSize: 14 }}>
          {!deliveryZone && (
            <div style={{ color: "red" }}>
              Lieferung in dieser PLZ nicht möglich
            </div>
          )}

          {deliveryZone && (
            <>
              <div>Liefergebühr: €{deliveryZone.fee.toFixed(2)}</div>
              <div>Mindestbestellung: €{deliveryZone.min.toFixed(2)}</div>
            </>
          )}
        </div>
      )}
    </div>
  )}

  Send Bestellung
</button>


</div>
);
}