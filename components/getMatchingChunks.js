const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { PineconeClient } = require('@pinecone-database/pinecone');

const openAIApiKey = process.env.OPENAI_API_KEY;
const pineconeApiKey = process.env.PINECONE_API_KEY;
const pineconeApiEnv = process.env.PINECONE_API_ENVIRONMENT;
const pineconeIndexName = process.env.PINECONE_INDEX_NAME;
const pineconeNamspaceName = process.env.PINECONE_NAMESPACE_NAME;

async function getRelevantChunksFromPinecone({ query, fetchTopK }) {
  /* Create instance */
  const embeddings = new OpenAIEmbeddings({ openAIApiKey });
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: pineconeApiEnv,
    apiKey: pineconeApiKey,
  });

  const pineconeIndex = pinecone.Index(pineconeIndexName);

  /* create vectorstore */
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: pineconeNamspaceName, // namespace comes from your config folder
  });

  const matchingChunks = await vectorStore.similaritySearchWithScore(query, fetchTopK); // 4 is actually the number of top k results to pick from the pinecone. Currently it picks top 4 results

  return matchingChunks;
}

module.exports.getRelevantChunksFromPinecone = getRelevantChunksFromPinecone;
