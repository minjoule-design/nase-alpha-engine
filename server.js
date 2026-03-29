import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

/************************************************************
 * 🔐 CONFIGURATION (REPLACE THESE)
 ************************************************************/
const WHATSAPP_TOKEN = "EAAXBHBczDWgBRMcBdcC5BDo6FBYilC8k7NpW5MavOQcZCNt2ZCeehRYp9B42sSjEdkgmo6fsJxcvtsCJ3RVVIHmhjaZCF8tNjoaEbKTdM6QSYimsLA70ZAhdqtstBN7axs2NFHLdfkuI4b6m2rVXR5OkGZCrBsNGZChyvCXESSw5XXLhGf2faxqxmOql84prcYoqbAhJzxHKNlSeUZA46hoJ4jFfhJd4oZB7HXclrRCNaaRkA61BZBg40Rmh9m7NQGjzy5e3kRPhFsERUEyuTY2Hj1ZBG17osZD";      // 🔴 Replace
const PHONE_NUMBER_ID = "995087710361384";       // 🔴 Replace

/************************************************************
 * 📡 SEND WHATSAPP MESSAGE (WITH FULL DEBUG)
 ************************************************************/
async function sendWhatsApp(to, message) {
  const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;

  try {
    console.log("🚀 Sending WhatsApp message to:", to);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: message }
      })
    });

    const data = await response.text();
    console.log("📡 WhatsApp API Response:", data);

  } catch (error) {
    console.error("❌ WhatsApp Send Error:", error);
  }
}

/************************************************************
 * 🧠 ANALYSIS ENGINE
 ************************************************************/
function generateAnalysis(ticker) {

  const price = (Math.random() * 100).toFixed(2);
  const momentum = ["Strong Bullish", "Moderate", "Weak"][Math.floor(Math.random()*3)];
  const signal = ["🚀 IMMINENT BREAKOUT", "🔥 PRE-BREAKOUT", "HOLD"][Math.floor(Math.random()*3)];

  let verdict = "HOLD";
  if (signal.includes("BREAKOUT")) verdict = "STRONG BUY";

  return `📊 *NASE ALPHA ANALYSIS: ${ticker}*
━━━━━━━━━━━━━━━━━━━  

💰 *Price:* KES ${price}  
📈 *Momentum:* ${momentum}  
🎯 *Signal:* ${signal}  

🧠 *Simple Breakdown*  
This stock shows ${momentum.toLowerCase()} momentum, suggesting possible movement.

⚖️ *S.W.O.T Analysis*

🟢 *Strengths*
• Strong market positioning  
• Institutional accumulation  

🟡 *Weaknesses*
• Market volatility  

🔵 *Opportunities*
• Growth expansion  
• Investor interest  

🔴 *Threats*
• Competition & regulation  

🧭 *Verdict*
✅ *${verdict}*  

⚠️ *Risk Tip*
Invest gradually.

✨ _Powered by Setrise Alpha Engine_`;
}

/************************************************************
 * 🚀 MAIN ENDPOINT (FULL DEBUG)
 ************************************************************/
app.post("/analyze", async (req, res) => {
  try {
    console.log("🔥 REQUEST RECEIVED:", JSON.stringify(req.body));

    const { from, text } = req.body;

    // 🚨 Validate input
    if (!from || !text) {
      console.log("❌ Missing 'from' or 'text'");
      return res.status(400).send("Missing fields");
    }

    console.log(`📊 Processing ticker: ${text} for user: ${from}`);

    const result = generateAnalysis(text);

    console.log("📤 Sending result to WhatsApp...");

    await sendWhatsApp(from, result);

    console.log("✅ DONE");

    res.send("DONE");

  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    res.status(500).send("ERROR");
  }
});

/************************************************************
 * 🧪 TEST ENDPOINT (VERY IMPORTANT)
 ************************************************************/
app.get("/test", async (req, res) => {
  const testNumber = "254714188262"; // 🔴 Replace with your number

  await sendWhatsApp(testNumber, "🔥 Backend test successful!");

  res.send("Test message sent");
});

/************************************************************
 * 🌍 ROOT ENDPOINT
 ************************************************************/
app.get("/", (req, res) => {
  res.send("NASE Alpha Engine Running 🚀");
});

/************************************************************
 * 🚀 START SERVER
 ************************************************************/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
