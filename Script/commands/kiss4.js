const request = require("request");
const fs = require("fs");
const axios = require("axios");

module.exports.config = {
  name: "kiss4",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
  description: "Kiss the person you tag",
  commandCategory: "🩵love🩵",
  usages: "[@mention/reply/UID/link/name]",
  cooldowns: 5,
  dependencies: {
    "request": "",
    "fs": "",
    "axios": ""
  }
};

// ===== Helper: Full Name Mention Detection =====
async function getUIDByFullName(api, threadID, body) {
  if (!body.includes("@")) return null;
  
  const match = body.match(/@(.+)/);
  if (!match) return null;
  
  const targetName = match[1].trim().toLowerCase().replace(/\s+/g, " ");
  const threadInfo = await api.getThreadInfo(threadID);
  const users = threadInfo.userInfo || [];
  
  const user = users.find(u => {
    if (!u.name) return false;
    const fullName = u.name.trim().toLowerCase().replace(/\s+/g, " ");
    return fullName === targetName;
  });
  
  return user ? user.id : null;
}

module.exports.run = async ({ api, event, args, client, Users, Threads, __GLOBAL, Currencies }) => {
  const request = require('request');
  const fs = require('fs');
  const { threadID, messageID, senderID } = event;
  
  // ===== Determine targetID in three ways =====
  let targetID;
  let tagName = "";
  
  if (event.type === "message_reply") {
    // Way 1: Reply to a message
    targetID = event.messageReply.senderID;
    try {
      const userInfo = await api.getUserInfo(targetID);
      tagName = userInfo[targetID]?.name || "Friend";
    } catch (e) {
      tagName = "Friend";
    }
  } else if (args[0]) {
    if (args[0].indexOf(".com/") !== -1) {
      // Way 2: Facebook profile link
      try {
        targetID = await api.getUID(args[0]);
        const userInfo = await api.getUserInfo(targetID);
        tagName = userInfo[targetID]?.name || "Friend";
      } catch (e) {
        console.error("Error getting UID from link:", e);
        return api.sendMessage("❌ Facebook লিঙ্ক থেকে আইডি পাওয়া যায়নি!", threadID, messageID);
      }
    } else if (args.join().includes("@")) {
      // Way 3: Mention or full name
      // 3a: Direct Facebook mention
      targetID = Object.keys(event.mentions || {})[0];
      if (targetID) {
        tagName = event.mentions[targetID] || "Friend";
        // Remove @ symbol if present
        tagName = tagName.replace("@", "");
      } else {
        // 3b: Full name detection
        targetID = await getUIDByFullName(api, threadID, args.join(" "));
        if (targetID) {
          const userInfo = await api.getUserInfo(targetID);
          tagName = userInfo[targetID]?.name || "Friend";
        }
      }
    } else {
      // Direct UID
      targetID = args[0];
      try {
        const userInfo = await api.getUserInfo(targetID);
        tagName = userInfo[targetID]?.name || "Friend";
      } catch (e) {
        tagName = "Friend";
      }
    }
  } else {
    // No target specified
    return api.sendMessage("❌যাকে kiss করতে চাও তাকে ম্যানশন করো😻", threadID, messageID);
  }
  
  if (!targetID) {
    return api.sendMessage("🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰", threadID, messageID);
  }
  
  // Check if trying to kiss oneself
  if (targetID === senderID) {
    return api.sendMessage("💋নিজেকে চুমু??🤣", threadID, messageID);
  }
  
  // Random kiss GIFs
  var link = [
    "https://i.postimg.cc/G37G3WDd/574fcc7979b6f-1533876767756310501023.gif",
    "https://i.postimg.cc/XqzC25Wp/574fcc797b21e-1533876813029926506824.gif",
    "https://i.postimg.cc/DZ5sXDYQ/574fcc92e98c3-1533876840028170363441.gif",
    "https://i.postimg.cc/yYD9DLh9/Crafty-Live-Junco-size-restricted.gif",
    "https://i.postimg.cc/NFJ1WV6G/dedac9ceaace3856b6fe85522579fb88.gif",
    "https://i.giphy.com/media/G3va31oEEnIkM/giphy.gif",
    "https://i.giphy.com/media/QGc8RgRvMonFm/giphy.gif",
    "https://i.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif"
  ];
  
  // Randomly select a GIF
  var randomLink = link[Math.floor(Math.random() * link.length)];
  
  // List of kiss messages
  const kissMessages = [
    `${tagName} 🤍,বউকে জড়িয়ে ধরে কিস খাওয়ার মজাই আলাদা😅💖`,
    `${tagName},কাছে এসো! 🤗 তোমাকে শক্ত করে জড়িয়ে ধরে কিস করি❤️`,
    `${tagName}ভার্চুয়াল জগতে জড়িয়ে ধরে তোমাকে কিস করতে চাই🥹`,
    `${tagName},এই চুমু শুধু তোমার জন্য💕`,
    `${tagName},তোমাকে জড়িয়ে ধরে কিস করার পরে হার্ট অ্যাটাক হয়ে গেল🥹`,
    `${tagName} কে শক্ত করে জড়িয়ে ধরে কিস করলাম🥰💞`,
    `${tagName} একটা না, দুইটা না—হাজার-হাজার বার তোমাকে চুমু দিবো❤️‍🔥`,
    `কারণ ছাড়াই ${tagName} কে একটা জড়িয়ে ধরে কিস করলাম🥰😔`,
    `${tagName}, এই চুমু তোমার দিনটা সুন্দর করে দিক! 💝🤗`,
    `${tagName} কে চোখ বন্ধ করে শক্ত করে জড়িয়ে ধরে কিস করতে চাই🥺🤍`,
];
  
  const randomMessage = kissMessages[Math.floor(Math.random() * kissMessages.length)];
  
  // Send message after downloading GIF
  var callback = () => api.sendMessage({
    body: randomMessage,
    mentions: [{
      tag: tagName,
      id: targetID
    }],
    attachment: fs.createReadStream(__dirname + "/cache/kiss.gif")
  }, threadID, () => fs.unlinkSync(__dirname + "/cache/kiss.gif"), messageID);

  // Download random GIF
  return request(encodeURI(randomLink))
    .pipe(fs.createWriteStream(__dirname + "/cache/kiss.gif"))
    .on("close", () => callback())
    .on("error", (err) => {
      console.error("Error downloading GIF:", err);
      api.sendMessage("❢❢━━━━━•『🚫』•━━━━━❢❢\n\n❌ GIF ডাউনলোড করতে সমস্যা হচ্ছে!\n\n❢❢━━━━━•『🚫』•━━━━━❢❢", threadID, messageID);
    });
};
