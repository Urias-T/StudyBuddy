import { NextResponse } from "next/server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { 
    createPineconeIndex, 
    updatePinecone 
} from "../../../utils";
import { indexName } from "../../../config";
import { client } from "@/utils"


export async function POST() {
    const loader = new DirectoryLoader("./documents", {
        ".pdf": (path) => new PDFLoader(path, {
            splitPages: false
        })
    });

    const docs = await loader.load();
    const vectorDimension = 1536;

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