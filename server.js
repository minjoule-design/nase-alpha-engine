import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

/************************************************************
 * 🔐 CONFIG
 ************************************************************/
const WHATSAPP_TOKEN = "YOUR_META_TOKEN";
const PHONE_NUMBER_ID = "YOUR_PHONE_ID";

/************************************************************
 * 📡 SEND WHATSAPP MESSAGE
 ************************************************************/
async function sendWhatsApp(to, message) {
  const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;

  try {
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
    console.log("WhatsApp API Response:", data);

  } catch (error) {
    console.error("WhatsApp Send Error:", error);
  }
}

/************************************************************
 * 🧠 ANALYSIS ENGINE (SMART VERSION)
 ************************************************************/
function generateAnalysis(ticker) {

  // 🔥 MOCK DATA (replace with API later)
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
This stock shows ${momentum.toLowerCase()} momentum, suggesting possible upward movement.

⚖️ *S.W.O.T Analysis*

🟢 *Strengths*
• Strong market positioning  
• Institutional accumulation  

🟡 *Weaknesses*
• Market volatility  

🔵 *Opportunities*
• Growth expansion  
• Increased investor interest  

🔴 *Threats*
• Competition & regulation  

📰 *Market Insight*
• Rising volume suggests smart money activity  

🧭 *Verdict*
✅ *${verdict}*  

⚠️ *Risk Tip*
Invest gradually. Avoid going all-in.

✨ _Powered by Setrise Alpha Engine_`;
}

/************************************************************
 * 🚀 MAIN ANALYSIS ENDPOINT
 ************************************************************/
app.post("/analyze", async (req, res) => {
  try {
    const { from, text } = req.body;

    // Simulate heavy processing
    const result = generateAnalysis(text);

    await sendWhatsApp(from, result);

    res.send("DONE");

  } catch (err) {
    console.error(err);
    res.status(500).send("ERROR");
  }
});

/************************************************************
 * 🌍 HEALTH CHECK
 ************************************************************/
app.get("/", (req, res) => {
  res.send("NASE Alpha Engine Running 🚀");
});

/************************************************************
 * 🚀 START SERVER
 ************************************************************/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
