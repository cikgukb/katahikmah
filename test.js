const apiKey = "FShlTPVk0Mu9f3cecQgsGlqGLjdc3EgZpwAyqIFF";
const url = "https://api.json2video.com/v2/movies";

async function testSchema(type) {
  const payload = {
    scenes: [{
      duration: 5,
      elements: [{ type: type, voice: "ms-MY", text: "testing" }]
    }]
  };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      console.log(`Type ${type}: HTTP ${res.status}`);
      console.log(await res.text());
    } else {
      console.log(`Type ${type}: SUCCESS`);
      console.log(await res.json());
    }
  } catch(e) { console.error(e); }
}

async function run() {
  await testSchema("audio");
  await testSchema("voiceover");
  await testSchema("voice");
  await testSchema("tts");
}

run();
