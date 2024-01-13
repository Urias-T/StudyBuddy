import { PromptTemplate } from "langchain/prompts";

export const CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT = `Given the following conversation and a follow up question, return the conversation history excerpt that includes any relevant context to the question if it exists and rephrase the follow up question to be a standalone question.
Chat History:
{chat_history}
Follow Up Input: {question}
Your answer should follow the following format:
\`\`\`
<Relevant chat history excerpt as context here>
Standalone question: <Rephrased question here>
\`\`\`
Your answer:`;

const template = `You're a helpful study assistant. Use only the following pieces of context as well as the chat history to answer the user's question.
If you can't get the answer from the provided context or the chat history, just say "Neither the study material you provided nor the conversation we've had so far contain sufficient information for me to answer your question.".
----------------
{question}
{context}
\`\`\`
Your answer:`;

export const QA_CHAIN_PROMPT = PromptTemplate.fromTemplate(template);

const retrieval_template = `You are a helpful study assistant. Your users are asking quesions about their lecture notes and textbooks. Suggest up to three
additional related questions to help them find the information they need, for the provided question. By generating multiple perspectives on the user's question,
your goal is to help them overcome some of the limitations of the distance-based similarity search. 
Provide these alternative quesions separated by newlines. Include the original quesion as part of your output. 
Original question: {question}`

export const RETRIEVAL_PROMPT = PromptTemplate.fromTemplate(retrieval_template)
