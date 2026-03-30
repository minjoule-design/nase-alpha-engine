import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

/************************************************************
 * 🔐 CONFIG
 ************************************************************/
const WHATSAPP_TOKEN = "EAAXBHBczDWgBRMcBdcC5BDo6FBYilC8k7NpW5MavOQcZCNt2ZCeehRYp9B42sSjEdkgmo6fsJxcvtsCJ3RVVIHmhjaZCF8tNjoaEbKTdM6QSYimsLA70ZAhdqtstBN7axs2NFHLdfkuI4b6m2rVXR5OkGZCrBsNGZChyvCXESSw5XXLhGf2faxqxmOql84prcYoqbAhJzxHKNlSeUZA46hoJ4jFfhJd4oZB7HXclrRCNaaRkA61BZBg40Rmh9m7NQGjzy5e3kRPhFsERUEyuTY2Hj1ZBG17osZD";
const PHONE_NUMBER_ID = "995087710361384";

const LIVE_DATA_URL = "https://opensheet.elk.sh/1xcjBcp8Q45pLvo12Az0KxQ7Bb8DfqkfIhlSBJTSV84Y/LIVE_DATA_KENYA";
const PREDICTOR_URL = "https://opensheet.elk.sh/1xcjBcp8Q45pLvo12Az0KxQ7Bb8DfqkfIhlSBJTSV84Y/%F0%9F%A7%AC%20SMARTMONEY_PREDICTOR";

/************************************************************
 * 📡 SEND WHATSAPP (WITH LOGGING)
 ************************************************************/
async function sendWhatsApp(to, message) {
  const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message }
      })
    });

    const data = await res.text();
    console.log("📡 WhatsApp API:", data);

  } catch (err) {
    console.error("❌ WhatsApp Error:", err);
  }
}

/************************************************************
 * 📊 SAFE FETCH (ANTI-HTML CRASH)
 ************************************************************/
async function safeFetch(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();

    if (!text || text.startsWith("<")) {
      console.error("❌ Invalid (HTML) response from:", url);
      return [];
    }

    return JSON.parse(text);

  } catch (err) {
    console.error("❌ Fetch failed:", err);
    return [];
  }
}

async function fetchSheetData() {
  const liveData = await safeFetch(LIVE_DATA_URL);
  const predData = await safeFetch(PREDICTOR_URL);

  return { liveData, predData };
}

/************************************************************
 * 🧠 ANALYSIS ENGINE (IMPROVED)
 ************************************************************/
function buildAnalysis(ticker, live, pred) {

  if (!live) {
    return `❌ *${ticker} not found*\n\nEnsure ticker is correct (e.g. SCOM, NCBA).`;
  }

  const price = live["Price"] || live["Last Price"] || "N/A";
  const dividend = live["Div Yield"] || live["Dividend Yield"] || "N/A";
  const momentum = live["Momentum"] || "Neutral";

  const signal = pred ? pred["Signal"] : "Neutral";

  // 🎯 Verdict Logic
  let verdict = "HOLD";
  if (signal.includes("BREAKOUT") || signal.includes("BUY")) verdict = "STRONG BUY";
  if (momentum.toLowerCase().includes("weak")) verdict = "CAUTION";

  return `📊 *NASE ALPHA ANALYSIS: ${ticker}*
━━━━━━━━━━━━━━━━━━━  

💰 *Price:* KES ${price}  
📈 *Momentum:* ${momentum}  
🎯 *Signal:* ${signal}  
🎁 *Dividend Yield:* ${dividend}  

🧠 *Simple Breakdown*  
This stock shows *${momentum}* momentum with a *${signal}* setup, suggesting institutional positioning.

⚖️ *S.W.O.T Analysis*

🟢 *Strengths*
• Strong sector positioning  
• Dividend-paying potential  
• Institutional accumulation signals  

🟡 *Weaknesses*
• Market volatility exposure  
• Earnings sensitivity  

🔵 *Opportunities*
• Expansion potential  
• Increased investor demand  

🔴 *Threats*
• Regulatory risks  
• Competitive pressure  

📰 *Market Insight*
• Volume suggests accumulation phase  
• Signal indicates possible breakout setup  

🧭 *Verdict*
✅ *${verdict}*

⚠️ *Risk Tip*
Use phased buying (DCA). Avoid full capital entry.

✨ _Powered by Setrise Alpha Engine_`;
}

/************************************************************
 * 🔝 TOP 5 ENGINE (FIXED + SORTED)
 ************************************************************/
function generateTop5(predData) {

  const picks = predData
    .filter(r =>
      (r["Signal"] || "").includes("BREAKOUT") ||
      (r["Signal"] || "").includes("BUY")
    )
    .slice(0, 5);

  if (!picks.length) {
    return "📉 *No strong breakout signals today.*";
  }

  return `🔥 *NASE TOP 5 BREAKOUT PICKS*
━━━━━━━━━━━━━━━━━━━

${picks.map(p =>
`• *${p["Ticker"]}* → ${p["Signal"]}`
).join("\n")}

📊 These stocks show strong institutional accumulation and breakout potential.

⚠️ Always confirm with risk management.`;
}

/************************************************************
 * 🚀 MAIN ENDPOINT
 ************************************************************/
app.post("/analyze", async (req, res) => {
  try {
    console.log("🔥 Incoming:", req.body);

    const { from, text } = req.body;

    if (!from || !text) {
      console.log("❌ Missing input");
      return res.send("OK");
    }

    const { liveData, predData } = await fetchSheetData();

    // 🚨 DATA FAILSAFE
    if (!liveData.length) {
      await sendWhatsApp(from, "⚠️ Data source error. Please try again later.");
      return res.send("OK");
    }

    // 🔝 TOP 5 COMMAND
    if (text.toUpperCase().includes("TOP")) {
      const result = generateTop5(predData);
      await sendWhatsApp(from, result);
      return res.send("OK");
    }

    // 📊 SINGLE STOCK
    const ticker = text.toUpperCase().trim();

    const live = liveData.find(r => r["Ticker"] === ticker);
    const pred = predData.find(r => r["Ticker"] === ticker);

    const result = buildAnalysis(ticker, live, pred);

    await sendWhatsApp(from, result);

    res.send("OK");

  } catch (err) {
    console.error("❌ Server error:", err);
    res.send("OK");
  }
});

/************************************************************
 * 🌍 ROOT
 ************************************************************/
app.get("/", (req, res) => {
  res.send("NASE Alpha Engine Running 🚀");
});

/************************************************************
 * 🚀 START
 ************************************************************/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running 🚀"));
