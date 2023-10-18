import { NextRequest, NextResponse } from "next/server";
import {
    chain
} from "../../../utils";

export async function POST(req: NextRequest) {
    const body = await req.json()

    console.log("body: ", body)

    const query = body.query;
    const history = body.history

    const fullHistory = history.map(h => h.content).join(" ");
    console.log("fullHistory: ", fullHistory)

    const response = await chain.invoke({
        question: query,
        chat_history: fullHistory,
    });

    return NextResponse.json({
        role: "assistant",
        content: response.text
    })
}