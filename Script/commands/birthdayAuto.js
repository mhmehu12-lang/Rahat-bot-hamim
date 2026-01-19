const fs = require("fs-extra");

module.exports.config = {
  name: "birthdayAuto",
  version: "1.1.0",
  hasPermssion: 2,
  credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
  description: "Auto birthday reminder & wish using Birthday.js data",
  commandCategory: "system",
  cooldowns: 5
};

module.exports.run = async function ({ api }) {
  const threads = await api.getThreadList(100, null, ["INBOX"]);

  const now = new Date();

  // 🎂 Birthday info (from birthday.js)
  const birthMonth = 1; // February (0 = January)
  const birthDate = 6;
  let targetYear = now.getFullYear();

  let birthday = new Date(targetYear, birthMonth, birthDate, 0, 0, 0);
  if (now > birthday) birthday.setFullYear(targetYear + 1);

  const diffDays = Math.ceil(
    (birthday - now) / (1000 * 60 * 60 * 24)
  );

  const link = "\n\n🔗 m.me/61582708907708";
  let message = "";

  // ⏳ 12 days countdown
  if (diffDays <= 12 && diffDays > 0) {
    message =
      `📢 Rahat boss এর জন্মদিন আসছে!\n\n` +
      `⏳ বাকি ${diffDays} দিন 🎂\n` +
      `🥳 সবাই প্রস্তুত থাকো উইশ করার জন্য 💙` +
      link;
  }
  // 🎉 Birthday day
  else if (diffDays === 0) {
    message =
      `🎉 আজ Rahat boss এর জন্মদিন!\n\n` +
      `🥳 সবাই উইশ করো 💙\n` +
      `🎂 6 February 2009` +
      link;
  } else {
    return;
  }

  // 📤 Send to all inbox threads
  for (const thread of threads) {
    api.sendMessage(message, thread.threadID);
  }
};
