import { NextResponse } from "next/server";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { createPineconeIndex, updatePinecone, client } from "../../../utils";
import { indexName } from "../../../config";
// import { client } from "@/utils"
import { DocxLoader } from "langchain/document_loaders/fs/docx";

export async function POST() {
  const loader = new DirectoryLoader("./documents", {
    ".txt": (path) => new TextLoader(path),
    ".md": (path) => new TextLoader(path),
    ".docx": (path) => new DocxLoader(path),
    ".pdf": (path) =>
      new PDFLoader(path, {
        splitPages: false,
      }),
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
    data: "Successfully created index and loaded data into Pinecone.",
  });
}
