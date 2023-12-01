const { PromptTemplate } = require('langchain/prompts');
const { gptCompletion } = require('./core');

// const openAIApiKey = process.env.OPENAI_API_KEY;

async function getAiRecommendationTemplate(userQuery, matchingDocs) {
  const template = `
I am a legal advisor. My client has reached out to me with his case. He has provided me with
a bit of his case's background and asked a query based on that. Here's what he wrote to me:

USER QUERY:
{userQuery}

I have to answer his query based on only the similar cases which I have dealt in the past, and in the language
he has asked an answer for (use English by default). These are the matching text excerpts I have found from
my legal documents dump. 

MATHING CASES EXCERPTS:
{matchingDocs}

I need to answer his query based on only these excerpts. If I don't find enough information which completely
answers his query, I'll tell him that I haven't found enough matching cases from the past, but I'll still
answer his query based on my professional experience, because afterall, I am a legal advisor.

MY ANSWER:`;

  const prompt = new PromptTemplate({
    template,
    inputVariables: ['userQuery', 'matchingDocs'],
  });

  const pr = await prompt.formatPromptValue({
    userQuery,
    matchingDocs,
  });
  return pr.value;
}

async function getAiRecommendation(userQuery, matchingDocs) {
  const template = await getAiRecommendationTemplate(userQuery, matchingDocs);
  const res = await gptCompletion(template);

  return Promise.resolve({
    aiRecommendation: res.trim(),
  });
}

module.exports.getAiRecommendation = getAiRecommendation;
