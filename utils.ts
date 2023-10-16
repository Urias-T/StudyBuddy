import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAI } from "langchain/llms/openai";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";
import { timeout } from "./config";

export const createPineconeIndex = async (
    client,
    indexName,
    vectorDimension
) => {

    const existingIndexes = await client.listIndexes();

    // check if the index exists on Pinecone before creating it or not
    if (!existingIndexes.some(index => index.name === indexName)) {

        await client.createIndex({
            name: indexName,
            dimension: vectorDimension,
            metric: "cosine"
        });

        // wait for index creation to be complete on Pinecone before proceeding
        await new Promise((resolve) => setTimeout(resolve, timeout));
    }
};

export const updatePinecone = async (
    client,
    indexName,
    docs
) => {

    const index = client.Index(indexName);

    for (const doc of docs) {
        const txtPath = doc.metadata.source;
        const text = doc.pageContent;

        const textSplitter  = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
        });

        const chunks = await textSplitter.createDocuments([text]);

        const embeddingsArray = await new OpenAIEmbeddings().embedDocuments(
            chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
        );

        // create and upsert vectors in batches of 100
        const batchSize = 100;
        let batch:any = [];
        for (let idx = 0 ; idx < chunks.length; idx++) {
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
            if (batch.length === batchSize || idx === chunks.length -1) {
                await index.upsert(batch);
                // empty the batch
                batch = [];
            }
        }
    }
};

export const getRelevantDocumentsAndQueryLLM = async (
    client,
    indexName,
    query
) => {

    const index = client.Index(indexName);

    const queryEmbedding = await new OpenAIEmbeddings().embedQuery(query);

    let relevantDocuments = await index.query({
        topK: 10,
        vector: queryEmbedding, 
        includeMetadata: true,
        includeValues: true,
        },
    );

    // check that relevant documents were retrieved before calling LLM or not
    if (relevantDocuments.matches.length) {
        
        const llm = new OpenAI({});
        const chain = loadQAStuffChain(llm);

        const fullContext = relevantDocuments.matches
            .map((match) => match.metadata.pageContent)
            .join(" ");

        const result = await chain.call({
            input_documents: [new Document({ pageContent: fullContext })],
            question: query,
        });

        return result.text;
    } else {
        console.log(`No relevant documents were found so no call to LLM.`)
    }
};