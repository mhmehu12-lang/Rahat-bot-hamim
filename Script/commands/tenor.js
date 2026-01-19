/* 
  This code official owner is rX Abdullah
  ============= (Maria × rX Chatbot) ==========
  Command: tenor
  Description: Search or show trending GIFs from Tenor and send to GC
*/

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_KEY = "AIzaSyDB5FyCegbX6g0Be01R189Kwa_W0nMKRsg"; // Tenor API key
const SEARCH_URL = "https://g.tenor.com/v1/search";
const TRENDING_URL = "https://g.tenor.com/v1/trending";
const CACHE_DIR = path.join(__dirname, "cache"); // cache folder same dir

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

module.exports.config = {
  name: "gif",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "rX Abdullah + ChatGPT",
  description: "Search or show trending GIFs from Tenor",
  commandCategory: "media",
  usages: "[keyword] [-limit]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  if (!args[0]) args[0] = ""; // prevent crash
  const query = args.filter(a => !a.startsWith("-")).join(" ");
  const limitArg = args.find(a => a.startsWith("-"));
  const limit = limitArg ? parseInt(limitArg.replace("-", "")) : 5; // default 5
  const isTrending = !query; // no query → trending

  const waitMsg = await api.sendMessage(
    isTrending
      ? "🔥 Fetching trending GIFs..."
      : `🔍 Searching Tenor for “${query}” (${limit} results)...`,
    event.threadID,
    event.messageID
  );

  try {
    const url = isTrending ? TRENDING_URL : SEARCH_URL;
    const res = await axios.get(url, {
      params: {
        key: API_KEY,
        limit: Math.min(limit, 15), // limit up to 15 max
        q: query || undefined,
        media_filter: "minimal",
        contentfilter: "medium"
      }
    });

    const results = res.data.results;
    if (!results || results.length === 0) {
      api.unsendMessage(waitMsg.messageID);
      return api.sendMessage("😢 কোনো GIF পাওয়া যায়নি!", event.threadID);
    }

    const attachments = [];

    for (let i = 0; i < results.length; i++) {
      const item = results[i];
      const media = item.media[0];
      const gifUrl =
        media.gif?.url ||
        media.mediumgif?.url ||
        media.tinygif?.url ||
        media.mp4?.url;

      if (!gifUrl) continue;

      const fileName = `tenor_${Date.now()}_${i}.gif`;
      const filePath = path.join(CACHE_DIR, fileName);
      const writer = fs.createWriteStream(filePath);
      const gifRes = await axios.get(gifUrl, { responseType: "stream" });
      gifRes.data.pipe(writer);

      await new Promise(resolve => writer.on("finish", resolve));
      attachments.push(fs.createReadStream(filePath));
    }

    api.unsendMessage(waitMsg.messageID);
    await api.sendMessage(
      {
        body: isTrending
          ? "🔥 Trending GIFs from Tenor:"
          : `🎬 Top ${results.length} results for “${query}”:`,
        attachment: attachments
      },
      event.threadID,
      () => {
        // cleanup cache
        attachments.forEach(stream => {
          try {
            fs.unlinkSync(stream.path);
          } catch {}
        });
      }
    );
  } catch (err) {
    console.error("Tenor Error:", err);
    api.unsendMessage(waitMsg.messageID);
    api.sendMessage("❌ কিছু সমস্যা হয়েছে, পরে চেষ্টা করুন!", event.threadID);
  }
};
