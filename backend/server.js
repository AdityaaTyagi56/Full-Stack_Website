import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Configure CORS to allow requests from your frontend
app.use(cors({
  origin: '*', // Allow all origins for development (including file://)
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://adityatyagii455_db_user:Aditya56at@website-it.bt24fnq.mongodb.net/nss_gallery?appName=Website-IT";
const OLLAMA_URI = process.env.OLLAMA_URI || "http://127.0.0.1:11434";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  })
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.log("⚠️ MongoDB Atlas connection failed:", err));

// Root endpoint to check server status
app.get("/", (req, res) => {
    res.send("NSS Backend is running! AI features are active.");
});

const photoSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  imageUrl: String,
  uploadedAt: { type: Date, default: Date.now },
});

const Photo = mongoose.model("Photo", photoSchema);

// --- New Schemas for Dynamic Content ---

// 1. Hall of Fame (Awards)
const awardSchema = new mongoose.Schema({
  year: String,
  title: String,
  description: String
});
const Award = mongoose.model("Award", awardSchema);

// 2. Ticker (Breaking News)
const tickerSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now }
});
const Ticker = mongoose.model("Ticker", tickerSchema);

// 3. Upcoming Events
const eventSchema = new mongoose.Schema({
  title: String,
  date: String,
  location: String,
  description: String
});
const Event = mongoose.model("Event", eventSchema);

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\\s/g, "_")),
});
const upload = multer({ storage });

// --- API Endpoints ---

// Photos & Initiatives
app.post("/api/upload", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const { title = "Untitled", description = "", category = "general" } = req.body;
    const photo = new Photo({
      title,
      description,
      category,
      imageUrl: `/uploads/${req.file.filename}`,
    });
    await photo.save();
    res.json({ success: true, photo });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

app.get("/api/photos", async (req, res) => {
  const photos = await Photo.find().sort({ uploadedAt: -1 });
  res.json(photos);
});

// Awards Endpoints
app.get("/api/awards", async (req, res) => {
  const awards = await Award.find().sort({ year: -1 });
  res.json(awards);
});

app.post("/api/awards", async (req, res) => {
  try {
    const { year, title, description } = req.body;
    const award = new Award({ year, title, description });
    await award.save();
    res.json({ success: true, award });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add award" });
  }
});

app.delete("/api/awards/:id", async (req, res) => {
  try {
    await Award.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete award" });
  }
});

// Ticker Endpoints
app.get("/api/ticker", async (req, res) => {
  const items = await Ticker.find().sort({ createdAt: -1 });
  res.json(items);
});

app.post("/api/ticker", async (req, res) => {
  try {
    const { text } = req.body;
    const item = new Ticker({ text });
    await item.save();
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add ticker item" });
  }
});

app.delete("/api/ticker/:id", async (req, res) => {
  try {
    await Ticker.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete ticker item" });
  }
});

// Events Endpoints
app.get("/api/events", async (req, res) => {
  const events = await Event.find().sort({ _id: -1 }); // Simple sort
  res.json(events);
});

app.post("/api/events", async (req, res) => {
  try {
    const { title, date, location, description } = req.body;
    const event = new Event({ title, date, location, description });
    await event.save();
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add event" });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete event" });
  }
});

// Helper to get the first available Ollama model
const getOllamaModel = async () => {
    try {
        const response = await fetch(`${OLLAMA_URI}/api/tags`);
        if (!response.ok) return "llama3"; // Fallback
        const data = await response.json();
        // Return the first model found, or default to llama3
        return data.models?.[0]?.name || "llama3";
    } catch (e) {
        console.error("Failed to fetch Ollama models, defaulting to llama3");
        return "llama3";
    }
};

// AI chat endpoint (Ollama). Assumes Ollama is running on port 11434.
app.post("/api/ai-chat", async (req, res) => {
  try {
    const { message = "", history = [] } = req.body || {};
    const siteSystemPrompt = `You are the helpful AI assistant for the NSS IIIT–Naya Raipur website.
Answer concisely and accurately about: slideshow uploads (category 'gallery'), header logo uploads (category 'logo'), photo gallery categories (education, health, environment, community), admin login/upload/delete flow, events/initiatives/about/contact sections.
If the user asks for steps, give short, numbered steps. If you don't know, say so.`;

    const messages = [
      { role: "system", content: siteSystemPrompt },
      ...history.slice(-6), // keep last few turns if provided
      { role: "user", content: String(message).slice(0, 2000) },
    ];

    const modelName = await getOllamaModel();
    console.log(`Using Ollama model: ${modelName}`);

    const response = await fetch(`${OLLAMA_URI}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: modelName,
            messages,
            stream: false,
        }),
    });

    if (!response.ok) {
        console.warn(`Ollama error: ${response.statusText}. Returning fallback.`);
        return res.json({ success: true, answer: "The AI Editor is currently offline. Please check the 'Initiatives' section for the latest updates." });
    }

    const data = await response.json();
    const answer = data?.message?.content || "Sorry, I couldn't generate a response.";
    res.json({ success: true, answer });
  } catch (err) {
    console.error("AI chat error:", err.message);
    // Return a friendly response instead of an error
    res.json({ success: true, answer: "The AI Editor is currently offline. Please check the 'Initiatives' section for the latest updates." });
  }
});

// Generate Story Endpoint (Ollama)
app.post("/api/generate-story", async (req, res) => {
    try {
        const { topic, context } = req.body;
        const prompt = `Write a clean, concise, and engaging news story (approx 150-200 words) about the following NSS initiative: "${topic}". 
        Context: ${context}. 
        Focus on the impact, student involvement, and community benefit. Write it in a journalistic tone suitable for a college newspaper. Do not include any preamble, just the story.`;

        const modelName = await getOllamaModel();
        console.log(`Generating story with Ollama model: ${modelName}`);

        const response = await fetch(`${OLLAMA_URI}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: modelName,
                prompt: prompt,
                stream: false
            }),
        });

        if (!response.ok) {
             console.warn(`Ollama error: ${response.statusText}. Returning fallback.`);
             return res.json({ success: true, story: "Our editorial team is currently compiling the full report for this story. Please check back later for the detailed article." });
        }

        const data = await response.json();
        res.json({ success: true, story: data.response });

    } catch (err) {
        console.error("Story generation error:", err.message);
        res.json({ success: true, story: "Our editorial team is currently compiling the full report for this story. Please check back later for the detailed article." });
    }
});

// Delete photo by id (removes DB record and file)
app.delete("/api/photos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    const photo = await Photo.findById(id);
    if (!photo) return res.status(404).json({ success: false, message: "Not found" });
    // Remove file from disk
    if (photo.imageUrl) {
      const diskPath = path.join(__dirname, photo.imageUrl.replace(/^\//, ""));
      try {
        await fs.promises.unlink(diskPath);
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.warn("Could not remove file:", diskPath, err.message);
        }
      }
    }
    await Photo.deleteOne({ _id: photo._id });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

const PORT = process.env.PORT || 5003;
const server = app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// Global error handling to prevent server crashes
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Keep the server running, but log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep the server running, but log the error
});

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error('⚠️ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});