// ROCKETUP: безопасный клиентский каталог. Используйте только публичный publishable/anon key.
const SUPABASE_URL = "https://lataxcgzomhyxttmuwkm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2gXn2a2YC4Nb0F_cBISf4A_40P8hWgn";

const fallbackItems = [
  {name:"Ледяная звезда",rarity:"rare",description:"Сияющий символ холодной галактики.",icon:"✦"},
  {name:"Синий кристалл",rarity:"epic",description:"Редкий кристалл с голубым свечением.",icon:"💎"},
  {name:"Космический кот",rarity:"legendary",description:"Любопытный исследователь космоса.",icon:"🐱"},
  {name:"Неоновая комета",rarity:"rare",description:"Яркий след далёкой кометы.",icon:"☄️"},
  {name:"Облачный талисман",rarity:"epic",description:"Лёгкий талисман из облачной долины.",icon:"☁️"},
  {name:"Золотой спутник",rarity:"legendary",description:"Спутник, сияющий золотым светом.",icon:"🪐"}
];
const icons = ["✦","💎","🐱","☄️","☁️","🪐","🌟","🔷"];
const grid = document.getElementById("catalog-grid");
const collectionGrid = document.getElementById("collection-grid");
const statusBox = document.getElementById("catalog-status");
const collection = JSON.parse(localStorage.getItem("rocketup_collection") || "[]");

function safeText(value, fallback="") { return (typeof value === "string" && value.trim()) ? value.trim() : fallback; }
function normalize(row, i) {
  return {
    id: row.id ?? row.uuid ?? i,
    name: safeText(row.name || row.title || row.item_name, "Предмет " + (i+1)),
    rarity: safeText(row.rarity || row.grade, "обычный"),
    description: safeText(row.description || row.details, "Коллекционный виртуальный предмет."),
    icon: safeText(row.icon || row.emoji, icons[i % icons.length])
  };
}
function card(item, owned=false) {
  const el = document.createElement("article"); el.className = "item-card";
  const art = document.createElement("div"); art.className = "item-art"; art.textContent = item.icon || "✦";
  const name = document.createElement("div"); name.className = "item-name"; name.textContent = item.name;
  const rarity = document.createElement("div"); rarity.className = "item-rarity"; rarity.textContent = item.rarity;
  const desc = document.createElement("div"); desc.className = "item-desc"; desc.textContent = item.description;
  el.append(art,name,rarity,desc);
  if (!owned) {
    const btn = document.createElement("button"); btn.className = "item-action"; btn.textContent = "В коллекцию";
    btn.addEventListener("click", () => addToCollection(item)); el.append(btn);
  }
  return el;
}
function renderCatalog(items) {
  grid.replaceChildren(); items.forEach(item => grid.append(card(item)));
  document.getElementById("catalog-count").textContent = items.length + " предметов";
  const stat = document.querySelector(".stats .stat:nth-child(2) strong");
  if (stat) stat.textContent = items.length;
}
function renderCollection() {
  collectionGrid.replaceChildren();
  document.getElementById("collection-empty").hidden = collection.length > 0;
  collection.forEach(item => collectionGrid.append(card(item,true)));
  document.getElementById("item-count").textContent = collection.length;
}
function addToCollection(item) {
  if (collection.some(x => String(x.id) === String(item.id))) return toast("Этот предмет уже в коллекции");
  collection.push(item); localStorage.setItem("rocketup_collection", JSON.stringify(collection));
  renderCollection(); toast("Добавлено в коллекцию");
}
function toast(message) {
  const el=document.getElementById("toast"); el.textContent=message; el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),1900);
}
async function loadCatalog() {
  if (SUPABASE_URL === "SUPABASE_URL_HERE" || SUPABASE_PUBLISHABLE_KEY === "SUPABASE_PUBLISHABLE_KEY_HERE") {
    renderCatalog(fallbackItems); statusBox.textContent="Показан демонстрационный каталог. Добавьте Project URL и Publishable key в app.js, чтобы загрузить данные Supabase.";
    return;
  }
  try {
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const {data,error} = await client.from("collectible_items").select("*");
    if (error) throw error;
    const items=(data || []).map(normalize);
    renderCatalog(items);
    statusBox.textContent = items.length ? "Каталог загружен из Supabase." : "В таблице пока нет предметов.";
  } catch (error) {
    console.error("Supabase catalog error:",error);
    renderCatalog(fallbackItems);
    statusBox.textContent="Не удалось загрузить Supabase. Проверьте URL, публичный ключ, доступ к таблице и RLS. Сейчас показан демо-каталог.";
  }
}
document.querySelectorAll("[data-target]").forEach(btn=>btn.addEventListener("click",()=>{
  const target=btn.dataset.target; document.getElementById(target)?.scrollIntoView({behavior:"smooth"});
  document.querySelectorAll(".nav-btn").forEach(x=>x.classList.toggle("active",x.dataset.target===target));
}));
const tg=window.Telegram?.WebApp;
if(tg){tg.ready();tg.expand();const user=tg.initDataUnsafe?.user;if(user){document.getElementById("user-name").textContent=user.first_name || "Пользователь";document.getElementById("avatar").textContent=(user.first_name||"R").slice(0,1).toUpperCase();}}
renderCollection(); loadCatalog();
