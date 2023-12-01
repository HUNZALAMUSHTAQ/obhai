const { OpenAI } = require('langchain/llms/openai');
const { ChatOpenAI } = require('langchain/chat_models/openai');
const { HumanMessage } = require('langchain/schema');
const { SystemMessage } = require('langchain/schema');

// Rest of your code goes here

// const openAIApiKey = process.env.OPENAI_API_KEY;
// const openAIApiTemperature = process.env.OPENAI_API_TEMPERATURE;
// const openAIChatModel = process.env.OPENAI_CHAT_MODEL;
// const openAICompletionModel = process.env.OPENAI_COMPLETION_MODEL;
const useGPT4 = process.env.GPT_4_COMPLETION;

async function gptCompletion(template, maxTokens = 1350, temperature = 0.5) {
  if (useGPT4.toLowerCase() === 'true') {
    // console.log("Utilizing GPT-4 for completion.")
    const chat = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature,
      maxTokens,
      modelName: process.env.OPENAI_CHAT_MODEL,
    });
    const response = await chat.call([
      new SystemMessage(
        `You are a helpful assistant who works similarly to the GPT completion model. Just complete the content written by the user and stop. Don't write extra.`
      ),
      new HumanMessage(template),
    ]);

    return response.content.trim();
  }
  // console.log("Utilizing GPT-3 for completion.")
  const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature,
    maxTokens,
    modelName: process.env.OPENAI_CHAT_MODEL,
  });
  const res = await model.call(template);
  return res.trim();
}

module.exports.gptCompletion = gptCompletion;
