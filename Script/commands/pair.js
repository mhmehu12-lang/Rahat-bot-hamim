module.exports.config = {
  name: "pair",
  version: "1.0.4",
  hasPermssion: 0,
  credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
  description: "দুইজন ইউজারকে মজার কম্প্যাটিবিলিটি স্কোরসহ পেয়ার করে",
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
  const { resolve } = global.nodemodule["path"];
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { downloadFile } = global.utils;

  const dirMaterial = __dirname + `/cache/canvas/`;
  const path = resolve(__dirname, 'cache/canvas', 'rx.png');

  if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
  if (!existsSync(path))
    await downloadFile(
      "https://i.postimg.cc/K82GdJjf/r07qxo-R-Download.jpg",
      path
    );

  const lockedCredit = Buffer.from("clggQWRkdWxsYWg=", "base64").toString("utf-8");
  if (module.exports.config.credits !== lockedCredit) {
    module.exports.config.credits = lockedCredit;
    global.creditChanged = true;
  }
};

// ===== ছবি বানানোর ফাংশন =====
async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  let pairing_img = await jimp.read(__root + "/rx.png");
  let pathImg = __root + `/pair_${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  let avt1 = (await axios.get(
    `https://graph.facebook.com/${one}/picture?width=512&height=512`,
    { responseType: "arraybuffer" }
  )).data;
  fs.writeFileSync(avatarOne, avt1);

  let avt2 = (await axios.get(
    `https://graph.facebook.com/${two}/picture?width=512&height=512`,
    { responseType: "arraybuffer" }
  )).data;
  fs.writeFileSync(avatarTwo, avt2);

  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));

  pairing_img
    .composite(circleOne.resize(137, 137), 95, 57)
    .composite(circleTwo.resize(137, 137), 505, 205);

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
    api.sendMessage("c̸r̸e̸d̸i̸t̸ b̸y̸ R̸a̸h̸a̸t̸ I̸s̸l̸a̸m̸", threadID);
    global.creditChanged = false;
  }

  let partnerID, partnerName;

  if (event.type === "message_reply") {
    partnerID = event.messageReply.senderID;
  } else if (args[0]) {
    if (args[0].includes(".com/")) {
      partnerID = await api.getUID(args[0]);
    } else if (args.join(" ").includes("@")) {
      partnerID = Object.keys(event.mentions || {})[0]
        || await getUIDByFullName(api, threadID, args.join(" "));
    } else {
      partnerID = args[0];
    }
  } else {
    const threadInfo = await api.getThreadInfo(threadID);
    const list = threadInfo.participantIDs.filter(id => id !== senderID);
    partnerID = list[Math.floor(Math.random() * list.length)];
  }

  if (!partnerID)
    return api.sendMessage("❌কাউকে ম্যানশন করো নাই", threadID, messageID);

  if (partnerID === senderID)
    return api.sendMessage("❌নিজের ম্যাসেজ এ রিপ্লাই দিলে হবে না আবাল😐\nঅন্য জনের মেসেজ রিপ্লাই দাও", threadID, messageID);

  const senderInfo = await api.getUserInfo(senderID);
  const partnerInfo = await api.getUserInfo(partnerID);

  const senderName = senderInfo[senderID]?.name || "তুমি";
  partnerName = partnerInfo[partnerID]?.name || "সে";

  const percentages = ['0%','17%','19%','21%','37%','48%','52%','62%','67%','76%','83%','96%','99%','100%'];
  const matchRate = percentages[Math.floor(Math.random() * percentages.length)];

  const titles = [
    "🥰 সফল পেয়ারিং!",
    "💖 একদম পারফেক্ট ম্যাচ!",
    "💘 ভালোবাসার সংযোগ!",
    "💞 মিলের ফলাফল!",
    "✨ সম্পর্কের সম্ভাবনা!"
  ];

  const comments = {
    '100%': '💯 একদম পারফেক্ট ম্যাচ! আত্মার সঙ্গী!',
    '99%': '😍 প্রায় নিখুঁত!',
    '96%': '❤️‍🔥 দারুণ কেমিস্ট্রি!',
    '83%': '💖 খুব ভালো ম্যাচ!',
    '76%': '💕 ভালো মিল!',
    '67%': '😊 ভালো সম্ভাবনা!',
    '62%': '🙂 মোটামুটি মিল!',
    '52%': '😐 ৫০-৫০ চান্স!',
    '48%': '🤔 একটু কঠিন!',
    '37%': '😅 কম মিল!',
    '21%': '😬 খুব কম মিল!',
    '19%': '😕 প্রায় নেই!',
    '17%': '😔 ভালো না!',
    '0%': '😭 একদমই মিল নেই!'
  };

  const title = titles[Math.floor(Math.random() * titles.length)];
  const comment = comments[matchRate];

  const imgPath = await makeImage({ one: senderID, two: partnerID });

  return api.sendMessage({
    body:
`${title}

💌 তোমাদের দুজনের জন্য সুন্দর ভবিষ্যৎ কামনা করি!
📊 মিলের হার: ${matchRate}
💬 ${comment}

👤 ${senderName} + 👤 ${partnerName} = ❤️‍🔥`,
    attachment: fs.createReadStream(imgPath),
    mentions: [
      { id: senderID, tag: senderName },
      { id: partnerID, tag: partnerName }
    ]
  }, threadID, () => fs.unlinkSync(imgPath), messageID);
};
