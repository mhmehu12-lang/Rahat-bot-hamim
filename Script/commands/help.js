const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
	name: "help",
	version: "3.1.0",
	hasPermssion: 0,
	credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
	description: "Tree style help menu with fixed categories",
	commandCategory: "system",
	usages: "[command name]",
	cooldowns: 5,
	envConfig: {
		autoUnsend: true,
		delayUnsend: 60
	}
};

module.exports.languages = {
	en: {
		moduleInfo: `╭━━━━━━━━━━━━━━━━╮
┃ ✨ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐈𝐍𝐅𝐎 ✨
┣━━━━━━━━━━━┫
┃ 🔖 Name: %1
┃ 📄 Usage: %2
┃ 📜 Description: %3
┃ 🔑 Permission: %4
┃ 👨‍💻 Credit:Rahat Islam
┃ 📂 Category: %6
┃ ⏳ Cooldown: %7s
┣━━━━━━━━━━━━━━━━┫
┃ ⚙ Prefix: %8
┃ 🤖 Bot: %9
╰━━━━━━━━━━━━━━━━╯`
	}
};

// =========================
// 🔹 LOCAL VIDEO ATTACHMENT FUNCTION
// =========================
function getVideoAttachment() {
	const videoPath = path.resolve("help.gif");
	console.log("[HELP] Checking for local video at:", videoPath);

	if (fs.existsSync(videoPath)) {
		console.log("[HELP] Local video found, creating stream...");
		return [fs.createReadStream(videoPath)];
	} else {
		console.log("[HELP] help.mp4 file not found in root directory");
		return [];
	}
}

// =========================
// 🔰🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰
// =========================
module.exports.run = async function ({ api, event, args, getText }) {
	const { commands } = global.client;
	const { threadID, messageID } = event;

	const threadSetting = global.data.threadData.get(threadID) || {};
	const prefix = threadSetting.PREFIX || global.config.PREFIX;

	if (args[0] && commands.has(args[0].toLowerCase())) {
		const cmd = commands.get(args[0].toLowerCase());
		const msg = getText(
			"moduleInfo",
			cmd.config.name,
			cmd.config.usages || "Not Provided",
			cmd.config.description || "Not Provided",
			cmd.config.hasPermssion,
			cmd.config.credits || "Unknown",
			cmd.config.commandCategory || "OTHER",
			cmd.config.cooldowns || 0,
			prefix,
			global.config.BOTNAME || "Rahat_Bot"
		);

		try {
			const attachments = getVideoAttachment();

			return api.sendMessage({
				body: msg,
				attachment: attachments
			}, threadID, (err, info) => {
				if (!err && module.exports.config.envConfig.autoUnsend) {
					setTimeout(
						() => api.unsendMessage(info.messageID),
						module.exports.config.envConfig.delayUnsend * 1000
					);
				}
			}, messageID);

		} catch (error) {
			console.error("[HELP] মেসেজ পাঠাতে সমস্যা:", error);
			return api.sendMessage(msg, threadID, messageID);
		}
	}

	const groups = {
		"ADMIN": [],
		"GAME": [],
		"SYSTEM": [],
		"🤣FUNNY🤣": [],
		"🩵LOVE🩵": [],
		"OTHER": []
	};

	for (const [name, cmd] of commands) {
		const cat = (cmd.config.commandCategory || "").toLowerCase();

		if (cat === "admin") {
			groups["ADMIN"].push(name);
		}
		else if (cat === "game") {
			groups["GAME"].push(name);
		}
		else if (cat === "system") {
			groups["SYSTEM"].push(name);
		}
		else if (cat === "fun" || cat === "🤣Funny🤣") {
			groups["🤣FUNNY🤣"].push(name);
		}
		else if (cat === "🩵love🩵") {
			groups["🩵LOVE🩵"].push(name);
		}
		else {
			groups["OTHER"].push(name);
		}
	}

	Object.keys(groups).forEach(key => groups[key].sort());

	// =========================
	// 🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰
	// =========================
	let body = `╭━━━━━━━━━━━━━━━━╮
┃ 🔰${global.config.BOTNAME || "𝐑𝐀𝐇𝐀𝐓 𝐁𝐎𝐓"}
┃ 📂𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐒𝐓𝐎𝐑𝐄
┣━━━━━━━━━━━━━━━━┫`;

	for (const cat of Object.keys(groups)) {
		if (groups[cat].length === 0) continue;

		body += `\n┃📁 ${cat}\n`;
		groups[cat].forEach(cmd => {
			body += `┃➪${cmd}\n`;
		});
	}

	body += `┣━━━━━━━━━━━━━━━━┫
┃➪𝐏𝐫𝐞𝐟𝐢𝐱: ${prefix}
┃➪𝗧𝗼𝘁𝗮𝗹 𝗖𝗺𝗱: ${commands.size}
┃➪𝙊𝙬𝙣𝙚𝙧: 𝙍𝙖𝙝𝙖𝙩 𝙄𝙨𝙡𝙖𝙢
╰━━━━━━━━━━━━━━━━╯`;
	try {
		const attachments = getVideoAttachment();

		api.sendMessage({
			body: body,
			attachment: attachments
		}, threadID, (err, info) => {
			if (!err && module.exports.config.envConfig.autoUnsend) {
				setTimeout(
					() => api.unsendMessage(info.messageID),
					module.exports.config.envConfig.delayUnsend * 1000
				);
			}
		}, messageID);

	} catch (error) {
		console.error("[HELP] হেল্প মেনু পাঠাতে সমস্যা:", error);
		// Video ছাড়া শুধু টেক্সট পাঠান
		api.sendMessage(body, threadID, messageID);
	}
};
