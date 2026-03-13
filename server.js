require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Switched to Google Gemini

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.JSON2VIDEO_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest"
});

if (!API_KEY) {
    console.error("FATAL ERROR: JSON2VIDEO_API_KEY is not defined in .env file");
    process.exit(1);
}

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main application on root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

// Simple keyword extractor mapping Malay motivational words to English search terms for Pixabay
function getKeywordsFromText(text) {
    const lowerText = text.toLowerCase();
    
    // Map of common Malay motivational themes to English video search terms
    const themeMap = {
        'rezeki': 'money finance',
        'pendapatan': 'cash business',
        'duit': 'money coins',
        'pandai': 'reading book studying',
        'berani': 'cliff jumping extreme',
        'sabar': 'nature calm slow',
        'usaha': 'working hard typing',
        'berjaya': 'success abstract',
        'kejayaan': 'success mountain',
        'penat': 'rest sunset',
        'jatuh': 'rain sad',
        'bangkit': 'sunrise abstract',
        'kuat': 'gym fitness',
        'takut': 'dark abstract',
        'masa': 'clock timelapse',
        'mula': 'starting line running',
        'renungkan': 'thinking slow abstract' // Added keyword for outro
    };

    let keywords = 'beautiful background'; // default
    
    // Check if any keyword matches
    for (const [key, value] of Object.entries(themeMap)) {
        if (lowerText.includes(key)) {
            keywords = value;
            break;
        }
    }

    return keywords;
}

// Function to fetch a video from Pixabay
async function fetchPixabayVideo(keywords) {
    try {
        const url = `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(keywords)}&video_type=film&per_page=20`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.hits && data.hits.length > 0) {
            // Pick a random video from top 3 results
            const randomHit = data.hits[Math.floor(Math.random() * data.hits.length)];
            // Return tiny or small video link
            return randomHit.videos.tiny.url || randomHit.videos.small.url;
        }
    } catch (err) {
        console.error("Pixabay API Error:", err);
    }
    
    // Fallbacks if Pixabay fails or finds nothing
    const fallbacks = [
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// Endpoint to generate video
app.post('/api/render', async (req, res) => {
    try {
        const { text, voice, type } = req.body;
        const quoteType = type || 'hikmah';

        if (!text || !voice) {
            return res.status(400).json({ error: "Missing required fields: text or voice" });
        }

        // 1. Text Splitting Logic
        // Split by lines or double newlines to form logical segments
        // Filter out empty lines
        let segments = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
        
        // If it's a single block with no newlines, fallback to splitting by periods roughly
        if (segments.length === 1 && text.includes('.')) {
            segments = text.split('.').map(s => s.trim() + '.').filter(s => s.length > 2);
        }

        if (segments.length === 0) {
            segments = ["Teks tidak sah."];
        }

        // 2. Generate Scenes Array
        // Create an intro scene, then map the segments to subsequent scenes
        const generatedScenes = [];

        // Intro Scene (Fixed Duration: 3s)
        const introText = quoteType === 'marketing' ? "Tips Pemasaran Digital By Cikgukb" : "Kata Hikmah CikguKb";
        
        generatedScenes.push({
            duration: 3,
            elements: [
                {
                    type: "video",
                    src: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                    duration: -2
                },
                {
                    type: "text",
                    text: introText,
                    settings: {
                        font_family: "Arial",
                        font_weight: "bold",
                        font_size: 90, // Increased from 70
                        font_color: "#ffffff",
                        background_color: "#000000a0"
                    }
                }
            ]
        });

        // Content Scenes
        for (const segment of segments) {
            // Extract keyword and fetch relevant background video
            const keywords = getKeywordsFromText(segment);
            const bgVideoUrl = await fetchPixabayVideo(keywords);

            generatedScenes.push({
                // Duration is intentionally removed to let the voiceover dictate the scene length
                elements: [
                    {
                        type: "video",
                        src: bgVideoUrl,
                        duration: -2 // Matches parent scene duration (dictated by the voice element)
                    },
                    {
                        type: "voice",
                        model: "azure",
                        voice: voice,
                        text: segment,
                        extra_time: 0.5 // adding a little breathing room after the voice ends
                    },
                    {
                        type: "text",
                        text: segment,
                        settings: {
                            font_family: "Arial",
                            font_weight: "bold", // Added bold
                            font_size: 65, // Increased from 40
                            font_color: "#ffffff",
                            background_color: "#00000080",
                            wrap: true // Enable wrapping for long text
                        }
                    }
                ]
            });
        }
        
        // Outro Scene
        const outroVideoUrl = await fetchPixabayVideo("thinking slow abstract");
        
        generatedScenes.push({
            elements: [
                {
                    type: "video",
                    src: outroVideoUrl,
                    duration: -2
                },
                {
                    type: "voice",
                    model: "azure",
                    voice: voice,
                    text: "Renung-Renungkan dan Selamat Beramal ",
                    extra_time: 1.0
                },
                {
                    type: "text",
                    text: "Renung-Renungkan dan Selamat Beramal ",
                    settings: {
                        font_family: "Arial",
                        font_weight: "bold", // Added bold
                        font_size: 65, // Increased from 40
                        font_color: "#ffffff",
                        background_color: "#00000080",
                        wrap: true
                    }
                }
            ]
        });

        // 3. Construct API Payload
        
        // Background Music Selection
        const hikmahBgm = [
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3", // Calm
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3", // Peaceful
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3"  // Relaxing
        ];
        const marketingBgm = [
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",  // Upbeat
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",  // Energetic
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"   // Engaging
        ];
        
        const pool = quoteType === 'marketing' ? marketingBgm : hikmahBgm;
        const selectedBgmUrl = pool[Math.floor(Math.random() * pool.length)];

        const payload = {
            resolution: "sd",
            quality: "low",
            elements: [
                {
                    // Global Background Music (added to movie/root level to persist across scenes)
                    type: "audio",
                    src: selectedBgmUrl,
                    volume: 0.15,
                    loop: -1, // Infinite loop
                    duration: -2 // CRITICAL: This ensures the BGM trims exactly to the length of video scenes
                }
            ],
            scenes: generatedScenes
        };

        const response = await fetch("https://api.json2video.com/v2/movies", {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("JSON2Video API Error:", data);
            return res.status(response.status).json({ error: "Failed to start render", details: data });
        }

        res.json({ success: true, project: data.project, message: "Video rendering started" });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint to check status
app.get('/api/status/:project', async (req, res) => {
    try {
        const { project } = req.params;
        
        const response = await fetch(`https://api.json2video.com/v2/movies?project=${project}`, {
            headers: {
                "x-api-key": API_KEY
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json({ error: "Failed to fetch status", details: data });
        }

        res.json(data);
    } catch (error) {
        console.error("Status Check Error:", error);
        res.status(500).json({ error: "Internal server error during status check" });
    }
});

// Endpoint to generate AI quotes
app.post('/api/generate-quote', async (req, res) => {
    try {
        const { type } = req.body; // 'hikmah' or 'marketing'
        
        let promptStr = "";
        if (type === 'marketing') {
            promptStr = "Berikan satu kata hikmah pendek tentang kesungguhan dalam Pemasaran Digital (Digital Marketing). Mestilah dalam Bahasa Melayu. Maksimum 3-4 baris ayat pendek sahaja. PENTING: Jangan letak sebarang tajuk, kata kunci tunggal, atau perkataan di awal petikan (contohnya JANGAN tulis 'Kejayaan.', 'Redha.', 'Ikhlas.', dll). Mula terus dengan ayat pertama petikan tersebut. Jangan guna bullet point. Berikan hanya teks biasa tanpa sebarang format tebal (bold) atau simbol asterisk (**).";
        } else {
            promptStr = "Berikan satu kata hikmah motivasi kehidupan yang sangat memberi inspirasi dan mendalam maknanya. Mestilah dalam Bahasa Melayu. Maksimum 3-4 baris ayat pendek sahaja. PENTING: Jangan letak sebarang tajuk, kata kunci tunggal, atau perkataan di awal petikan (contohnya JANGAN tulis 'Kejayaan.', 'Redha.', 'Ikhlas.', dll). Mula terus dengan ayat pertama petikan tersebut. Jangan guna bullet point. Berikan hanya teks biasa tanpa sebarang format tebal (bold) atau simbol asterisk (**).";
        }

        const result = await model.generateContent(promptStr);
        const response = await result.response;
        const generatedText = response.text().trim();
        
        res.json({ success: true, text: generatedText });
        
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Gagal menjana teks AI" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
