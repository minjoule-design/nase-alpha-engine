import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

/************************************************************
 * 🔐 CONFIG
 ************************************************************/
const WHATSAPP_TOKEN = "EAAXBHBczDWgBRMcBdcC5BDo6FBYilC8k7NpW5MavOQcZCNt2ZCeehRYp9B42sSjEdkgmo6fsJxcvtsCJ3RVVIHmhjaZCF8tNjoaEbKTdM6QSYimsLA70ZAhdqtstBN7axs2NFHLdfkuI4b6m2rVXR5OkGZCrBsNGZChyvCXESSw5XXLhGf2faxqxmOql84prcYoqbAhJzxHKNlSeUZA46hoJ4jFfhJd4oZB7HXclrRCNaaRkA61BZBg40Rmh9m7NQGjzy5e3kRPhFsERUEyuTY2Hj1ZBG17osZD";
const PHONE_NUMBER_ID = "995087710361384";

// 🔗 GOOGLE SHEETS API (REPLACE WITH YOUR LINKS)
const LIVE_DATA_URL = "https://opensheet.elk.sh/1xcjBcp8Q45pLvo12Az0KxQ7Bb8DfqkfIhlSBJTSV84Y/LIVE_DATA_KENYA";
const PREDICTOR_URL = "https://opensheet.elk.sh/1xcjBcp8Q45pLvo12Az0KxQ7Bb8DfqkfIhlSBJTSV84Y/%F0%9F%A7%AC%20SMARTMONEY_PREDICTOR";

/************************************************************
 * 📡 SEND WHATSAPP
 ************************************************************/
async function sendWhatsApp(to, message) {
  const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;

  await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message }
    })
  });
}

/************************************************************
 * 📊 FETCH SHEET DATA
 ************************************************************/
async function fetchSheetData() {
  const liveRes = await fetch(LIVE_DATA_URL);
  const predRes = await fetch(PREDICTOR_URL);

  const liveData = await liveRes.json();
  const predData = await predRes.json();

  return { liveData, predData };
}

/************************************************************
 * 🧠 BUILD ADVANCED ANALYSIS
 ************************************************************/
function buildAnalysis(ticker, live, pred) {

  if (!live) return `❌ ${ticker} not found in database`;

  const price = live["Price"] || "N/A";
  const dividend = live["Div Yield"] || "N/A";
  const momentum = live["Momentum"] || "Neutral";

  const signal = pred ? pred["Signal"] : "Neutral";

  // 🎯 Verdict logic
  let verdict = "HOLD";
  if (signal.includes("BREAKOUT") || signal.includes("BUY")) verdict = "STRONG BUY";

  return `📊 *NASE ALPHA ANALYSIS: ${ticker}*
━━━━━━━━━━━━━━━━━━━  

💰 *Price:* KES ${price}  
📈 *Momentum:* ${momentum}  
🎯 *Signal:* ${signal}  
🎁 *Dividend Yield:* ${dividend}

🧠 *Simple Breakdown*  
This stock is showing ${momentum.toLowerCase()} momentum with a *${signal}* setup, indicating potential smart money activity.

⚖️ *S.W.O.T Analysis*

🟢 *Strengths*
• Strong sector positioning  
• Consistent dividend potential  
• Institutional accumulation signals  

🟡 *Weaknesses*
• Market volatility exposure  
• Slower earnings growth  

🔵 *Opportunities*
• Expansion & sector growth  
• Increased investor demand  

🔴 *Threats*
• Regulatory pressure  
• Competition  

📰 *Market Insight*
• Volume patterns suggest accumulation  
• Signal indicates possible breakout setup  

🧭 *Verdict*
✅ *${verdict}*

⚠️ *Risk Tip*
Use phased buying (DCA). Avoid full entry at once.

✨ _Powered by Setrise Alpha Engine_`;
}

/************************************************************
 * 🔝 TOP 5 ENGINE
 ************************************************************/
function generateTop5(predData) {

  const picks = predData
    .filter(r =>
      r["Signal"]?.includes("BREAKOUT") ||
      r["Signal"]?.includes("BUY")
    )
    .slice(0, 5);

  if (picks.length === 0) return "📉 No strong signals today.";

  return `🔥 *NASE TOP 5 BREAKOUT PICKS*

${picks.map(p =>
`• ${p["Ticker"]} → ${p["Signal"]}`
).join("\n")}

📊 These stocks show strong institutional activity and breakout potential.`;
}

/************************************************************
 * 🚀 MAIN ENDPOINT
 ************************************************************/
app.post("/analyze", async (req, res) => {
  try {
    const { from, text } = req.body;

    const { liveData, predData } = await fetchSheetData();

    // 🔍 Handle TOP 5
    if (text.toUpperCase().includes("TOP")) {
      const result = generateTop5(predData);
      await sendWhatsApp(from, result);
      return res.send("DONE");
    }

    const ticker = text.toUpperCase();

    const live = liveData.find(r => r["Ticker"] === ticker);
    const pred = predData.find(r => r["Ticker"] === ticker);

    const result = buildAnalysis(ticker, live, pred);

    await sendWhatsApp(from, result);

    res.send("DONE");

  } catch (err) {
    console.error(err);
    res.status(500).send("ERROR");
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
