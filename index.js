const API_KEY = "FShlTPVk0Mu9f3cecQgsGlqGLjdc3EgZpwAyqIFF";
const API_URL = "https://api.json2video.com/v2/movies";

async function createBasicVideo() {
  console.log("Initiating basic video render via JSON2Video API...");

  const payload = {
    resolution: "sd",
    quality: "low",
    scenes: [
      {
        duration: 5,
        elements: [
          {
            type: "audio",
            src: "https://www.w3schools.com/html/horse.mp3",
            volume: 0.2
          },
          {
            type: "video",
            src: "https://www.w3schools.com/html/mov_bbb.mp4"
          },
          {
            type: "voice",
            model: "azure",
            voice: "ms-MY-YasminNeural",
            text: "Kini video anda mempunyai latar belakang gerak dan suara kecerdasan buatan dalam Bahasa Melayu."
          },
          {
            type: "text",
            text: "Video Ujian JSON2Video",
            settings: {
              font_family: "Arial",
              font_size: 60,
              font_color: "#ffffff",
              background_color: "#000000a0"
            }
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Successfully created rendering request!");
    console.log("Response:", JSON.stringify(data, null, 2));
    console.log(`To check the status, you can make a GET request to: ${API_URL}?project=${data.project}`);
    
  } catch (error) {
    console.error("Failed to render video:", error.message);
  }
}

createBasicVideo();
