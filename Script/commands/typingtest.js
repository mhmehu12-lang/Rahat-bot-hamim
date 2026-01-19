module.exports.config = {
  name: "typingtest",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "rX Abdullah",
  description: "Typing animation test (10 seconds)",
  commandCategory: "system",
  usages: "",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;

  try {
    // Typing শুরু
    await api.sendTypingIndicatorV2(true, threadID);

    // 10 সেকেন্ড ধরে typing animation দেখাবে
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Typing বন্ধ
    await api.sendTypingIndicatorV2(false, threadID);

    // তারপর মেসেজ পাঠাবে
    api.sendMessage("𝐭𝐮𝐦𝐚𝐤𝐞 𝐚𝐦𝐢 𝐫𝐚𝐢𝐭𝐞 𝐯𝐚𝐥𝐨𝐩𝐚𝐬𝐢 ✨", threadID);
  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Typing indicator error: " + err.message, threadID);
  }
};
