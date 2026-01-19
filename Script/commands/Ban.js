module.exports.config = {
    name: "ban",
    version: "8.0.0",
    hasPermssion: 2,
    credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
    description: "Global + Manual Ban System",
    commandCategory: "system",
    usages: "-ban on/off | -ban [@mention/reply/UID/link/name] | -ban list",
    cooldowns: 0
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

// ===== Helper: Get Target User =====
async function getTargetUser(api, event, args, Users) {
    let targetID;
    let targetName;

    // ===== Determine targetID in three ways =====
    if (event.type === "message_reply") {
        // Way 1: Reply to a message
        targetID = event.messageReply.senderID;
    } else if (args[0]) {
        if (args[0].indexOf(".com/") !== -1) {
            // Way 2: Facebook profile link
            targetID = await api.getUID(args[0]);
        } else if (args.join().includes("@")) {
            // Way 3: Mention or full name
            // 3a: Direct Facebook mention
            targetID = Object.keys(event.mentions || {})[0];
            if (!targetID) {
                // 3b: Full name detection
                targetID = await getUIDByFullName(api, event.threadID, args.join(" "));
            }
        } else {
            // Direct UID
            targetID = args[0];
        }
    }

    if (targetID) {
        targetName = await Users.getNameUser(targetID);
    }

    return { targetID, targetName };
}

module.exports.run = async ({ event, api, Users, args }) => {
    const { threadID, messageID } = event;

    // ================= GLOBAL BAN ON =================
    if (args[0] === "on") {
        global.data.globalBan = true;
        return api.sendMessage(
            "🚫 GLOBAL BAN ON\nসব UID এখন ব্যান!",
            threadID,
            messageID
        );
    }

    // ================= GLOBAL BAN OFF =================
    if (args[0] === "off" && !args[1]) {
        global.data.globalBan = false;
        return api.sendMessage(
            "✅ GLOBAL BAN OFF\nসব UID এখন আনব্যান!",
            threadID,
            messageID
        );
    }

    // ================= UNBAN SPECIFIC UID =================
    if (args[0] === "off" && args[1]) {
        // Use the three-way mention detection system for unban
        const { targetID, targetName } = await getTargetUser(api, event, [args[1]], Users);
        
        if (!targetID) {
            return api.sendMessage("❌রাহাদ বসকে ডাক দে🫩\nকীভাবে কমান্ড ব্যবহার করতে হয় শিখায় দিবো🥴", threadID, messageID);
        }

        let data = (await Users.getData(targetID)).data || {};
        data.banned = 0;

        await Users.setData(targetID, { data });
        global.data.userBanned.delete(targetID);

        const name = targetName || await Users.getNameUser(targetID);

        return api.sendMessage(
            `🔓𝗨𝗦𝗘𝗥 𝗨𝗡𝗕𝗔𝗡𝗡𝗘𝗗\n👤 ${name}\n🆔 ${targetID}`,
            threadID,
            messageID
        );
    }

    // ================= BAN LIST =================
    if (args[0] === "list") {
        const banned = Array.from(global.data.userBanned.entries());

        if (banned.length === 0)
            return api.sendMessage("❎ কোনো ban নাই!", threadID, messageID);

        let msg = "📌𝑴𝑨𝑵𝑼𝑨𝑳 𝑩𝑨𝑵𝑵𝑬𝑫 𝑼𝑺𝑬𝑹𝑺\n\n";
        let i = 1;

        for (const [uid] of banned) {
            const name = await Users.getNameUser(uid);
            msg += `${i}. 👤 ${name}\n🆔 ${uid}\n\n`;
            i++;
        }

        msg += "👉 Unban করতে চাইলে এই মেসেজে রিপ্লাই দিয়ে নাম্বার লেখো";

        return api.sendMessage(msg, threadID, (err, info) => {
            global.client.handleReply.push({
                name: "ban",
                messageID: info.messageID,
                author: event.senderID,
                banned
            });
        });
    }

    // ================= MANUAL BAN =================
    // Use the three-way mention detection system
    const { targetID, targetName } = await getTargetUser(api, event, args, Users);

    if (!targetID) {
        return api.sendMessage(
            "❌রাহাদ বসকে ডাক দে🫩\nকীভাবে কমান্ড ব্যবহার করতে হয় শিখায় দিবো🥴",
            threadID,
            messageID
        );
    }

    // Check if already banned
    if (global.data.userBanned.has(targetID)) {
        return api.sendMessage(`❌ ${targetName || targetID} is already banned!`, threadID, messageID);
    }

    let data = (await Users.getData(targetID)).data || {};

    data.banned = 1;
    data.reason = "Manual BAN";
    data.dateAdded = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka"
    });

    await Users.setData(targetID, { data });

    global.data.userBanned.set(targetID, {
        reason: data.reason,
        dateAdded: data.dateAdded
    });

    const name = targetName || await Users.getNameUser(targetID);

    return api.sendMessage(
        `🚫𝑼𝑺𝑬𝑹 𝑩𝑨𝑵𝑵𝑬𝑫\n👤 ${name}\n🆔 ${targetID}`,
        threadID,
        messageID
    );
};

// ================= HANDLE REPLY (UNBAN FROM LIST) =================
module.exports.handleReply = async ({ event, api, Users, handleReply }) => {
    if (event.senderID != handleReply.author) return;

    const index = parseInt(event.body);
    if (isNaN(index)) return;

    const user = handleReply.banned[index - 1];
    if (!user)
        return api.sendMessage("❌ ভুল নাম্বার!", event.threadID);

    const uid = user[0];

    let data = (await Users.getData(uid)).data || {};
    data.banned = 0;

    await Users.setData(uid, { data });
    global.data.userBanned.delete(uid);

    const name = await Users.getNameUser(uid);

    return api.sendMessage(
        `🔓𝗨𝗦𝗘𝗥 𝗨𝗡𝗕𝗔𝗡𝗡𝗘𝗗\n👤 ${name}\n🆔 ${uid}`,
        event.threadID
    );
};
