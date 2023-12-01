const { OpenAI } = require('langchain/llms/openai');
const { loadSummarizationChain } = require('langchain/chains');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
// const fs = require('fs');

const openAIApiKey = process.env.OPENAI_API_KEY;

async function getSummary({ docText }) {
  // const inputFile = "scraped_data.txt";
  // const outputFile = "summarized_result.txt";

  // Read the content from the input text file
  // const text = fs.readFileSync(inputFile, "utf8");

  // Initialize the OpenAI model and text splitter
  const model = new OpenAI({ temperature: 0, openAIApiKey });
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 10000, chunkOverlap: 500 });

  // Create a document from the text content
  const docs = await textSplitter.createDocuments([docText]);

  // for (const ch in docs) {
  //   console.log(docs[ch].metadata);
  // }

  // Load the summarization chain
  const chain = loadSummarizationChain(model, { type: 'map_reduce' });

  // Call the summarization chain with the input documents
  const res = await chain.call({
    input_documents: docs,
  });

  // Extract the summarized text from the result
  const summarizedText = res.text;

  // Write the summarized text to the output text file
  // fs.writeFileSync(outputFile, summarizedText);

  // console.log("Summarization complete. The result has been saved to", outputFile);

  return summarizedText;
}

module.exports.getSummary = getSummary;
