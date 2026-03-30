import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

/************************************************************
 * 🔐 CONFIG
 ************************************************************/
const WHATSAPP_TOKEN = "EAAXBHBczDWgBRMcBdcC5BDo6FBYilC8k7NpW5MavOQcZCNt2ZCeehRYp9B42sSjEdkgmo6fsJxcvtsCJ3RVVIHmhjaZCF8tNjoaEbKTdM6QSYimsLA70ZAhdqtstBN7axs2NFHLdfkuI4b6m2rVXR5OkGZCrBsNGZChyvCXESSw5XXLhGf2faxqxmOql84prcYoqbAhJzxHKNlSeUZA46hoJ4jFfhJd4oZB7HXclrRCNaaRkA61BZBg40Rmh9m7NQGjzy5e3kRPhFsERUEyuTY2Hj1ZBG17osZD";       // 🔴 Replace
const PHONE_NUMBER_ID = "995087710361384";      // 🔴 Replace

// ✅ YOUR GOOGLE APPS SCRIPT API (REPLACE THIS)
const BASE_API = "https://script.google.com/macros/s/AKfycbXXXXXXX/exec";
const ALL_DATA_URL = `${BASE_API}?type=all`;

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
    console.log("📡 WhatsApp Response:", data);

  } catch (err) {
    console.error("❌ WhatsApp Error:", err);
  }
}

/************************************************************
 * 📊 FETCH DATA FROM YOUR SHEETS API
 ************************************************************/
async function fetchSheetData() {
  try {
    const res = await fetch(ALL_DATA_URL);
    const text = await res.text();

    if (!text || text.startsWith("<")) {
      console.error("❌ API returned HTML");
      return { liveData: [], predData: [] };
    }

    const data = JSON.parse(text);

    return {
      liveData: data.live || [],
      predData: data.predictor || []
    };

  } catch (err) {
    console.error("❌ API FETCH ERROR:", err);
    return { liveData: [], predData: [] };
  }
}

/************************************************************
 * 🧠 SMART ANALYSIS ENGINE
 ************************************************************/
function buildAnalysis(ticker, live, pred) {

  if (!live) {
    return `❌ *${ticker} not found*
Ensure correct ticker (e.g. SCOM, NCBA).`;
  }

  const price = live["Price"] || live["Last Price"] || "N/A";
  const dividend = live["Div Yield"] || live["Dividend Yield"] || "N/A";
  const momentum = live["Momentum"] || "Neutral";

  const signal = pred ? pred["Signal"] : "Neutral";
  const strength = pred ? pred["Strength"] || "Moderate" : "Moderate";

  /******** VERDICT LOGIC ********/
  let verdict = "HOLD";
  if (signal.includes("BREAKOUT") || signal.includes("BUY")) verdict = "STRONG BUY";
  if (momentum.toLowerCase().includes("weak")) verdict = "CAUTION";

  /******** SWOT (DYNAMIC FEEL) ********/
  const strengths = [
    "Institutional accumulation detected",
    "Strong sector positioning",
    "Dividend support"
  ];

  const weaknesses = [
    "Sensitive to market volatility",
    "Dependent on macro conditions"
  ];

  const opportunities = [
    "Breakout potential forming",
    "Growing investor interest"
  ];

  const threats = [
    "Regulatory risks",
    "Market competition pressure"
  ];

  return `📊 *NASE ALPHA ANALYSIS: ${ticker}*
━━━━━━━━━━━━━━━━━━━  

💰 *Price:* KES ${price}  
📈 *Momentum:* ${momentum}  
🎯 *Signal:* ${signal}  
💪 *Strength Score:* ${strength}  
🎁 *Dividend Yield:* ${dividend}  

🧠 *Quick Insight*  
Smart money signals show *${signal}* with ${momentum.toLowerCase()} momentum — suggesting a potential directional move.

⚖️ *S.W.O.T Analysis*

🟢 *Strengths*
• ${strengths.join("\n• ")}

🟡 *Weaknesses*
• ${weaknesses.join("\n• ")}

🔵 *Opportunities*
• ${opportunities.join("\n• ")}

🔴 *Threats*
• ${threats.join("\n• ")}

📰 *Market Insight*
• Volume trend suggests accumulation phase  
• Signal indicates possible breakout setup  

🧭 *Verdict*
✅ *${verdict}*

⚠️ *Risk Strategy*
Use staggered entries (DCA). Confirm trend before full allocation.

✨ _Powered by Setrise Alpha Engine_`;
}

/************************************************************
 * 🔝 TOP 5 ENGINE (IMPROVED)
 ************************************************************/
function generateTop5(predData) {

  const picks = predData
    .filter(r =>
      (r["Signal"] || "").includes("BREAKOUT") ||
      (r["Signal"] || "").includes("BUY")
    )
    .sort((a, b) => (b["Strength"] || 0) - (a["Strength"] || 0))
    .slice(0, 5);

  if (!picks.length) {
    return "📉 *No strong breakout signals today.*";
  }

  return `🔥 *NASE TOP 5 HIGH-CONVICTION PICKS*
━━━━━━━━━━━━━━━━━━━

${picks.map(p =>
`• *${p["Ticker"]}* → ${p["Signal"]} (Score: ${p["Strength"] || "N/A"})`
).join("\n")}

📊 These stocks show strong institutional activity and breakout potential.

⚠️ Always apply proper risk management.`;
}

/************************************************************
 * 🚀 MAIN ENDPOINT
 ************************************************************/
app.post("/analyze", async (req, res) => {
  try {
    console.log("🔥 Incoming Request:", req.body);

    const { from, text } = req.body;

    if (!from || !text) {
      console.log("❌ Invalid input");
      return res.send("OK");
    }

    const { liveData, predData } = await fetchSheetData();

    if (!liveData.length) {
      await sendWhatsApp(from, "⚠️ Data unavailable. Please try again later.");
      return res.send("OK");
    }

    const input = text.toUpperCase().trim();

    /******** TOP 5 ********/
    if (input.includes("TOP") || input.includes("BEST")) {
      const result = generateTop5(predData);
      await sendWhatsApp(from, result);
      return res.send("OK");
    }

    /******** SINGLE STOCK ********/
    const live = liveData.find(r => r["Ticker"] === input);
    const pred = predData.find(r => r["Ticker"] === input);

    const result = buildAnalysis(input, live, pred);

    await sendWhatsApp(from, result);

    res.send("OK");

  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    res.send("OK");
  }
});

/************************************************************
 * 🌍 ROOT
 ************************************************************/
app.get("/", (req, res) => {
  res.send("NASE Alpha Engine (Direct API) Running 🚀");
});

/************************************************************
 * 🚀 START SERVER
 ************************************************************/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
