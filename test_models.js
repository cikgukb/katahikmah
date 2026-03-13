const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say hello');
    console.log('SUCCESS (' + modelName + '):', result.response.text());
  } catch (e) {
    console.error('FAIL (' + modelName + '):', e.status, e.message.substring(0, 100));
  }
}

async function run() {
  await testModel('gemini-2.5-flash');
  await testModel('gemini-2.0-flash');
  await testModel('gemini-flash-latest');
  await testModel('gemini-pro-latest');
  await testModel('gemini-2.0-flash-lite');
}
run();
