import { writeFile, mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server"; 
import { dirname } from "path";

export async function POST(req: NextRequest) {
    const body = await req.formData()
    const file: File | null = body.get("file") as unknown as File

    if (!file) {
        return NextResponse.json({ success: false})
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const path = `./documents/${file.name}`;
    const directory = dirname(path);

    try{
        await mkdir(directory, { recursive: true });
    } catch(error) {
        console.log("Error creating directory:", error)
        return NextResponse.json({ success: false, error: "Directory creation failed."})

    }
    await writeFile(path, buffer)
    console.log(`open ${path} to access the uploaded document.`)

    return NextResponse.json({ success: true })
}
