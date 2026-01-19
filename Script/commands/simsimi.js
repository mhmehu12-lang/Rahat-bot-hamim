const axios = require("axios");

module.exports.config = {
  name: "simsimi",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Mirai bot module using Simisimi API with answer→question search and error handling",
  commandCategory: "Fun",
  cooldowns: 3,
  dependencies: []
};

const API_URL = 'https://rx-simisimi-api-tllc.onrender.com';

module.exports.run = async ({ event, api, args }) => {
  const input = args.join(" ").trim();
  if (!input) return api.sendMessage("❌ Please type something!", event.threadID);

  // ========================
  // Step 1: Answer → Question search
  // ========================
  try {
    const response = await axios.post(`${API_URL}/findQuestion`, { answer: input });

    if (response.data.question) {
      return api.sendMessage(
        `✅ Question found for your answer:\n${response.data.question}\nAnswer used: ${input}`,
        event.threadID
      );
    } else if (response.data.message) {
      return api.sendMessage(`❌ ${response.data.message}`, event.threadID);
    } else {
      return api.sendMessage("❌ No question found for this answer.", event.threadID);
    }
  } catch (err) {
    console.error("Error in /findQuestion API:", err.message);
    return api.sendMessage("⚠️ API Error occurred while searching question.", event.threadID);
  }

  // ========================
  // Step 2: Normal chat reply (fallback)
  // ========================
  try {
    const res = await axios.get(`${API_URL}/simsimi`, { params: { text: input } });
    const reply = res.data.response || "🤖 No reply found.";
    return api.sendMessage(reply, event.threadID);
  } catch (err) {
    console.error("Error in /simsimi API:", err.message);
    return api.sendMessage("⚠️ API Error occurred while getting chat reply.", event.threadID);
  }
};
