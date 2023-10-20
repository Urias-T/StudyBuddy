import { NextRequest, NextResponse } from "next/server";
import {
    chain
} from "../../../utils";

export async function POST(req: NextRequest) {
    const body = await req.json()

    const query = body.query;
    const history = body.history

    const fullHistory = history.map(h => h.content).join(" ");

    const response = await chain.invoke({
        question: query,
        chat_history: fullHistory,
    });

    return NextResponse.json({
        role: "assistant",
        content: response.text
    })
}