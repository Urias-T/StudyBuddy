import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { 
    createPineconeIndex, 
    updatePinecone 
} from "../../../utils";
import { indexName } from "../../../config";

export async function POST() {
    const loader = new DirectoryLoader("./documents", {
        ".pdf": (path) => new PDFLoader(path, {
            splitPages: false
        })
    });

    const docs = await loader.load();
    const vectorDimension = 1536;

    const client = new Pinecone ({
        apiKey: process.env.PINECONE_API_KEY || "",
        environment: process.env.PINECONE_ENVIRONMENT || ""
    })

    try {
        await createPineconeIndex(client, indexName, vectorDimension);
        await updatePinecone(client, indexName, docs);
    } catch (err) {
        console.log("An error occured: ", err);
    }

    return NextResponse.json({
        "data": "Successfully created index and loaded data into Pinecone."
    })
}