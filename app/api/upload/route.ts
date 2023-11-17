import { writeFile, mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { dirname } from "path";

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const files = body.getAll("files[]") as unknown as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ success: false });
  }

  try {
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const path = `./documents/${file.name}`;
      const directory = dirname(path);

      try {
        await mkdir(directory, { recursive: true });
      } catch (error) {
        console.log("Error creating directory:", error);
        return NextResponse.json({
          success: false,
          error: "Directory creation failed.",
        });
      }
      await writeFile(path, buffer);
      console.log(`open ${path} to access the uploaded document.`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing files:", error);
    return NextResponse.json({
      success: false,
      error: "File processign failed.",
    });
  }
}
