const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// JSON with Renz API URLs
const noobcore = "https://raw.githubusercontent.com/noobcore404/NC-STORE/main/NCApiUrl.json";

// Fetch Renz API base URL
async function getRenzApi() {
 const res = await axios.get(noobcore, { timeout: 10000 });
 if (!res.data?.renz) throw new Error("Renz API not found in JSON");
 return res.data.renz;
}

module.exports = {
 config: {
 name: "flux",
 aliases: ["gpt", "gptimage"],
 version: "1.0",
 credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
 premium: true,
 countDown: 5,
 hasPermssion: 0,
 shortDescription: "Generate or edit images using text prompts",
 longDescription:
 "Generate a new image from a text prompt or edit an existing image by replying to it.",
 commandCategory: "image",
 usages:
 "Reply to an image with your prompt or type: !gptgen <prompt>\nExamples:\n!gptgen a cyberpunk city\n!gptgen make me anime (reply to an image)"
 },

 run: async function({ api, event, args }) {
 const { threadID, messageID, messageReply } = event;

 const repliedImage = messageReply?.attachments?.[0];
 const prompt = args.join(" ").trim();

 if (!prompt) {
 return api.sendMessage(
 "❌ Please provide a prompt.\n\nExamples:\n!gptgen a cyberpunk city\n!gptgen make me anime (reply to an image)",
 threadID
 );
 }

 const processingMsg = await api.sendMessage("⏳Please Wait 1 minute...", threadID);

 // Temporary path for downloaded/generated image
 const imgPath = path.join(__dirname, "cache", `${Date.now()}_gptgen.png`);

 try {
 const BASE_URL = await getRenzApi();

 // Construct API URL (GET request)
 let apiURL = `${BASE_URL}/api/gptimage?prompt=${encodeURIComponent(prompt)}`;

 if (repliedImage && repliedImage.type === "photo") {
 apiURL += `&ref=${encodeURIComponent(repliedImage.url)}`;

 if (repliedImage.width && repliedImage.height) {
 apiURL += `&width=${repliedImage.width}&height=${repliedImage.height}`;
 }
 } else {
 apiURL += `&width=512&height=512`;
 }

 // GET request to Renz API
 const res = await axios.get(apiURL, {
 responseType: "arraybuffer",
 timeout: 180000
 });

 // Ensure cache directory exists
 await fs.ensureDir(path.dirname(imgPath));
 await fs.writeFile(imgPath, Buffer.from(res.data));

 // Remove processing message
 await api.unsendMessage(processingMsg.messageID);

 // Send generated/edited image
 await api.sendMessage(
 {
 body: repliedImage
 ? `🖌 Image edited successfully.\nPrompt: ${prompt}`
 : `🖼 Image generated successfully.\nPrompt: ${prompt}`,
 attachment: fs.createReadStream(imgPath)
 },
 threadID
 );
 } catch (error) {
 console.error("GPTGEN Error:", error?.response?.data || error.message);
 await api.unsendMessage(processingMsg.messageID);
 api.sendMessage("❌ Failed to process the image. Please try again later.", threadID);
 } finally {
 // Cleanup temporary file
 if (fs.existsSync(imgPath)) await fs.remove(imgPath);
 }
 }
};