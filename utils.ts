import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { timeout, indexName } from "./config";
import { ConversationalRetrievalQAChain, LLMChain } from "langchain/chains";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT,
  QA_CHAIN_PROMPT, RETRIEVAL_PROMPT
} from "./prompts";
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";
import { BaseOutputParser } from "langchain/schema/output_parser";

type LineList = {
  lines: string[];
};

class LineListOutputParser extends BaseOutputParser<LineList> {
  static lc_name() {
    return "LineListOutputParser";
  }

  lc_namespace = ["langchain", "retrievers", "multiquery"];

  async parse(text: string): Promise<LineList> {
    const startKeyIndex = text.indexOf("<questions>");
    const endKeyIndex = text.indexOf("</questions>");
    const questionsStartIndex =
      startKeyIndex === -1 ? 0 : startKeyIndex + "<questions>".length;
    const questionsEndIndex = endKeyIndex === -1 ? text.length : endKeyIndex;
    const lines = text
      .slice(questionsStartIndex, questionsEndIndex)
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "");
    return { lines };
  }

  getFormatInstructions(): string {
    throw new Error("Not implemented.");
  }
}

export const client = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
  environment: process.env.PINECONE_ENVIRONMENT || "",
});

export const createPineconeIndex = async (
  client,
  indexName,
  vectorDimension
) => {
  const existingIndexes = await client.listIndexes();

  // check if the index exists on Pinecone before creating it or not
  if (!existingIndexes.some((index) => index.name === indexName)) {
    await client.createIndex({
      name: indexName,
      dimension: vectorDimension,
      metric: "cosine",
    });

    // wait for index creation to be complete on Pinecone before proceeding
    await new Promise((resolve) => setTimeout(resolve, timeout));
  }
};

export const updatePinecone = async (client, indexName, docs) => {
  const index = client.Index(indexName);

  for (const doc of docs) {
    const txtPath = doc.metadata.source;
    const text = doc.pageContent;

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });

    const chunks = await textSplitter.createDocuments([text]);

    const embeddingsArray = await new OpenAIEmbeddings().embedDocuments(
      chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
    );

    // create and upsert vectors in batches of 100
    const batchSize = 100;
    let batch: any = [];
    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];
      const vector = {
        id: `${txtPath}_${idx}`,
        values: embeddingsArray[idx],
        metadata: {
          ...chunk.metadata,
          loc: JSON.stringify(chunk.metadata.loc),
          pageContent: chunk.pageContent,
          txtPath: txtPath,
        },
      };
      batch = [...batch, vector];

      // when batch is full or it's the last item, upsert the vectors
      if (batch.length === batchSize || idx === chunks.length - 1) {
        await index.upsert(batch);
        // empty the batch
        batch = [];
      }
    }
  }
};

async function initChain() {
  const llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo-16k" });

  const index = client.Index(indexName);

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({}),
    {
      pineconeIndex: index,
      textKey: "pageContent",
    }
  );

  const llmChain = new LLMChain({
    llm: llm,
    prompt: RETRIEVAL_PROMPT,
    outputParser: new LineListOutputParser()
  })

  const retriever = new MultiQueryRetriever({
    retriever: vectorStore.asRetriever(),
    llmChain,
    // verbose: true
  })

  return ConversationalRetrievalQAChain.fromLLM(
    llm,
    retriever,
    {
      returnSourceDocuments: true,
      questionGeneratorChainOptions: {
        template: CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT,
      },
      qaChainOptions: {
        type: "stuff",
        prompt: QA_CHAIN_PROMPT
      },
    // verbose: true
    }
  );
}

export const chain = await initChain();
