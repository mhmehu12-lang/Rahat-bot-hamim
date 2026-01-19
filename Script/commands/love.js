module.exports.config = {
  name: "love",
  version: "1.0.4",
  hasPermssion: 0,
  credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
  description: "Match yourself with a tagged or replied user",
  commandCategory: "🩵love🩵",
  usages: "[@mention/reply/UID/link/name]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "jimp": "",
    "path": ""
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

module.exports.onLoad = async () => {
  const lockedCredit = Buffer.from("clggQWRkdWxsYWg=", "base64").toString("utf-8"); 
  if (module.exports.config.credits !== lockedCredit) {
    module.exports.config.credits = lockedCredit;
    global.creditChanged = true;
  }
  
  // Load image for matching
  const { resolve } = global.nodemodule["path"];
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { downloadFile } = global.utils;
  const dirMaterial = __dirname + `/cache/canvas/`;
  const path = resolve(__dirname, 'cache/canvas', 'maria.png');
  if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
  if (!existsSync(path)) await downloadFile("https://i.imgur.com/example.png", path); // Replace with actual image URL
};

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  let pairing_img = await jimp.read(__root + "/maria.png");
  let pathImg = __root + `/pairing_${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  let getAvatarOne = (await axios.get(
    `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
    { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

  let getAvatarTwo = (await axios.get(
    `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
    { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));
  pairing_img
    .composite(circleOne.resize(145, 145), 159, 167)
    .composite(circleTwo.resize(145, 145), 442, 172);

  let raw = await pairing_img.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, raw);

  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return pathImg;
}

async function circle(image) {
  const jimp = require("jimp");
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ api, event, args }) {
  const fs = require("fs-extra");
  const { threadID, messageID, senderID } = event;

  if (global.creditChanged) {
    api.sendMessage("", threadID);
    global.creditChanged = false;
  }

  // ===== Determine partnerID in three ways =====
  let partnerID;
  
  if (event.type === "message_reply") {
    // Way 1: Reply to a message
    partnerID = event.messageReply.senderID;
  } else if (args[0]) {
    if (args[0].indexOf(".com/") !== -1) {
      // Way 2: Facebook profile link
      try {
        partnerID = await api.getUID(args[0]);
      } catch (e) {
        console.error("Error getting UID from link:", e);
        partnerID = null;
      }
    } else if (args.join().includes("@")) {
      // Way 3: Mention or full name
      // 3a: Direct Facebook mention
      partnerID = Object.keys(event.mentions || {})[0];
      if (!partnerID) {
        // 3b: Full name detection
        partnerID = await getUIDByFullName(api, event.threadID, args.join(" "));
      }
    } else {
      // Direct UID
      partnerID = args[0];
    }
  } else {
    // No target specified - check traditional mentions
    const mentions = event.mentions || {};
    if (Object.keys(mentions).length > 0) {
      partnerID = Object.keys(mentions)[0];
    } else {
      return api.sendMessage("❌কাউকে মেনশন বা রিপ্লাই করো নাই", threadID, messageID);
    }
  }
  
  if (!partnerID) {
    return api.sendMessage("❌রাহাদ বসকে ডাক দে🫩\nকীভাবে কমান্ড ব্যবহার করতে হয় শিখায় দিবো🥴", threadID, messageID);
  }
  
  // Check if trying to match with oneself
  if (partnerID === senderID) {
    return api.sendMessage("💖নিজের মেসেজ এর রিপ্লাই দিলি কেন বলদ🙄🐸\nঅন্য জনকে ম্যানশন দে", threadID, messageID);
  }
  
  let partnerName, senderName;
  
  try {
    const userInfo = await api.getUserInfo([senderID, partnerID]);
    senderName = userInfo[senderID]?.name || "You";
    partnerName = userInfo[partnerID]?.name || "Your Partner";
  } catch (e) {
    senderName = "You";
    partnerName = "Your Partner";
  }
  
  const percentages = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', '0%', '48%'];
  const matchRate = percentages[Math.floor(Math.random() * percentages.length)];
  
  const matchMessages = [
    `💞 ${senderName} ও ${partnerName} এর ম্যাচিং রেজাল্ট!`,
    `❤️‍🔥 ${senderName} এবং ${partnerName} এর প্রেমের মাত্রা!`,
    `💘 ${senderName} ❤️ ${partnerName} ম্যাচ রেজাল্ট`,
    `💑 ${senderName} + ${partnerName} = লাভ ক্যালকুলেশন`,
    `✨ ${senderName} ও ${partnerName} এর সম্পর্কের সম্ভাবনা`
  ];
  
  const randomTitle = matchMessages[Math.floor(Math.random() * matchMessages.length)];
  
  const matchComments = {
    '100%': '💯 পারফেক্ট ম্যাচ! তোমরা জন্ম থেকে একে অপরের জন্য!',
    '99%': '😍 প্রায় পারফেক্ট! একটু ছাড়াই সম্পর্ক গড়ে উঠবে!',
    '96%': '❤️‍🔥 অসাধারণ মিল! তোমরা একে অপরের আত্মার সাথী!',
    '83%': '💖 দারুণ ম্যাচ! তোমাদের সম্পর্ক খুব সুন্দর হবে!',
    '76%': '💕 ভালো মিল! একটু প্রচেষ্টায় সম্পর্ক সুন্দর হবে!',
    '67%': '😊 ভালো সম্ভাবনা! একটু বুঝতে চেষ্টা করো!',
    '62%': '🙂 মোটামুটি মিল! আরও সময় দাও একে অপরকে!',
    '52%': '😐 ৫০-৫০ সম্ভাবনা! তোমাদের উপর নির্ভর করছে!',
    '48%': '🤔 একটু কঠিন! বেশি প্রচেষ্টা লাগবে!',
    '37%': '😅 কম সম্ভাবনা! একটু ভেবে দেখো!',
    '21%': '😬 খুবই কম! হয়তো অন্য কাউকে চেষ্টা করো!',
    '19%': '😕 প্রায় নেই বললেই চলে!',
    '17%': '😔 খুবই খারাপ ম্যাচ!',
    '0%': '😭 কোন মিলই নেই! ভুলে যাও একে অপরকে!'
  };
  
  const matchComment = matchComments[matchRate] || "তোমাদের সম্পর্কের সম্ভাবনা!";
  
  let mentionArr = [
    { id: senderID, tag: senderName },
    { id: partnerID, tag: partnerName }
  ];

  let one = senderID, two = partnerID;
  return makeImage({ one, two }).then(path => {
    api.sendMessage({
      body: `${randomTitle}\n\n` +
            `👤 ${senderName}\n` +
            `❤️ ${partnerName}\n` +
            `📊 ম্যাচিং শতাংশ: ${matchRate}\n` +
            `💬 ${matchComment}`,
      mentions: mentionArr,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);
  }).catch(error => {
    console.error("Error creating match image:", error);
    api.sendMessage("❌ ছবি তৈরি করতে সমস্যা হয়েছে!", threadID, messageID);
  });
};
