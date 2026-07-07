import { NextResponse } from "next/server";

const BASE_URL =
  "https://script.google.com/macros/s/AKfycbzdXdLrZhsfAC7lDbBok7J9Xyf3cXAcVPmwmjfyFWwlzZqpd2zigzP7WQabRPIJMo7d/exec";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...body,
        action: "submitSurvey"
      })
    });

    const text = await res.text();

    if (!text) {
      return NextResponse.json({
        success: false,
        message: "Empty response from Apps Script"
      });
    }

    const data = JSON.parse(text);

    return NextResponse.json(data);

  } catch (err: any) {

    return NextResponse.json({
      success: false,
      message: "Submit API failed",
      error: err.message
    });

  }
}