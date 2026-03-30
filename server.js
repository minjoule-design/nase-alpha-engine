import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

/************************************************************
 * 🔐 CONFIG
 ************************************************************/
const WHATSAPP_TOKEN = "EAAXBHBczDWgBRMcBdcC5BDo6FBYilC8k7NpW5MavOQcZCNt2ZCeehRYp9B42sSjEdkgmo6fsJxcvtsCJ3RVVIHmhjaZCF8tNjoaEbKTdM6QSYimsLA70ZAhdqtstBN7axs2NFHLdfkuI4b6m2rVXR5OkGZCrBsNGZChyvCXESSw5XXLhGf2faxqxmOql84prcYoqbAhJzxHKNlSeUZA46hoJ4jFfhJd4oZB7HXclrRCNaaRkA61BZBg40Rmh9m7NQGjzy5e3kRPhFsERUEyuTY2Hj1ZBG17osZD";
const PHONE_NUMBER_ID = "995087710361384";

const BASE_API = "https://script.google.com/macros/s/AKfycbzBdZgV-JiaaWizSz86s78g9PJOVeNCEWwGT1Ow3TWj5Av8qt400FGGFSS8Xc9YvI0Rdw/exec";
const ALL_DATA_URL = `${BASE_API}?type=all`;

/************************************************************
 * 📡 SEND WHATSAPP
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
 * 📊 FETCH DATA
 ************************************************************/
async function fetchSheetData() {
  try {
    console.log("🌐 Fetching:", ALL_DATA_URL);

    const res = await fetch(ALL_DATA_URL);
    const text = await res.text();

    console.log("📦 RAW:", text.slice(0, 200));

    if (!text || text.startsWith("<")) {
      return { liveData: [], predData: [] };
    }

    const data = JSON.parse(text);

    return {
      liveData: data.live || [],
      predData: data.predictor || []
    };

  } catch (err) {
    console.error("❌ API ERROR:", err);
    return { liveData: [], predData: [] };
  }
}

/************************************************************
 * 🧠 ANALYSIS
 ************************************************************/
function buildAnalysis(ticker, live, pred) {
  if (!live) return `❌ ${ticker} not found`;

  const price = live["Price"] || "N/A";
  const signal = pred ? pred["Signal"] : "Neutral";

  return `📊 *${ticker} Analysis*

💰 Price: ${price}
🎯 Signal: ${signal}

🧭 Verdict: ${signal.includes("BUY") ? "BUY" : "HOLD"}`;
}

/************************************************************
 * 🚀 MAIN ENDPOINT (FIXED)
 ************************************************************/
app.post("/analyze", (req, res) => {
  try {
    console.log("🔥 Incoming:", req.body);

    const { from, text } = req.body;

    if (!from || !text) {
      return res.send("OK");
    }

    // ✅ Instant response (fix timeout)
    res.send("PROCESSING");

    // ✅ Background execution
    (async () => {
      const { liveData, predData } = await fetchSheetData();

      if (!liveData.length) {
        await sendWhatsApp(from, "⚠️ Data unavailable.");
        return;
      }

      const input = text.toUpperCase().trim();

      const live = liveData.find(r => r["Ticker"] === input);
      const pred = predData.find(r => r["Ticker"] === input);

      const result = buildAnalysis(input, live, pred);

      await sendWhatsApp(from, result);
    })();

  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
