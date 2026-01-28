const fs = require('fs');

module.exports.config = {
    name: "loading",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Original",
    description: "Loading effect without links",
    commandCategory: "other",
    usages: "",
    cooldowns: 0
};

module.exports.run = async function({ api, event }) {
    // শুরুর মেসেজ
    api.sendMessage("▒▒▒▒▒▒▒▒▒▒ 0% ✨", event.threadID, (err, info) => {
        if (err) return console.error(err);

        let messageID = info.messageID;
        let count = 0;
        const total = 10;

        // লোডিং এনিমেশন ইন্টারভাল
        const interval = setInterval(() => {
            count += 1;

            if (count > total) {
                clearInterval(interval);
                // লোডিং শেষ হওয়ার পর মেসেজটি ডিলিট করে দেওয়া বা পরিবর্তন করা
                setTimeout(() => {
                    api.unsendMessage(messageID);
                    api.sendMessage("✅ Loading Complete!", event.threadID);
                }, 500);
                return;
            }

            // প্রোগ্রেস বার তৈরি
            const bar = "█".repeat(count);
            const empty = "▒".repeat(total - count);
            const emoji = count % 2 === 0 ? "✨" : "💎";
            const percentage = count * 10;

            // মেসেজ আপডেট
            api.editMessage(`${bar}${empty} ${percentage}% ${emoji}`, messageID, event.threadID);
        }, 600);
    });
};
