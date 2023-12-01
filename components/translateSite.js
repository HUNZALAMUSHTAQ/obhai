const { PromptTemplate } = require('langchain/prompts');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { OpenAI } = require('langchain/llms/openai');
const { gptCompletion } = require('./core.js');

const openAIApiKey = process.env.OPENAI_API_KEY;

async function getChunkWiseTranslationTemplate(chunk, targetLang) {
  const template = `
I am translating a legal case document to {targetLang}. However I cannot do it at once due to token limit issue.
Therefore, I am doing it in chunks. This is the chunk that I am currently dealing with:

CHUNK:
{chunk}

The {targetLang} translation of this chunk with exact same formatting and structure is here:

{targetLang} TRANSLATION:`;

  const prompt = new PromptTemplate({
    template,
    inputVariables: ['chunk', 'targetLang'],
  });

  const pr = await prompt.formatPromptValue({
    chunk,
    targetLang: targetLang.toUpperCase(),
  });
  return pr.value;
}

async function getChunkWiseTranslation(chunk, targetLang) {
  const template = await getChunkWiseTranslationTemplate(chunk, targetLang);
  const res = await gptCompletion(template, 1800, 0.3);
  return Promise.resolve(res.trim());
}

async function getTranslation({ docText, targetLang }) {
  // Initialize the OpenAI model and text splitter
  const model = new OpenAI({ temperature: 0, openAIApiKey });
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 5000 });

  // Create a document from the text content
  const docs = await textSplitter.createDocuments([String(docText)]);

  docs.forEach((chunk) => {
    console.log(chunk);
  });

  const translatedChunksPromises = docs.map((chunk, index) =>
    getChunkWiseTranslation(chunk.pageContent, String(targetLang))
  );

  const translatedChunks = await Promise.all(translatedChunksPromises);

  return translatedChunks.join('\n').trim();
}

module.exports.getTranslation = getTranslation;
