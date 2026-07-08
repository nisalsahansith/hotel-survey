import { NextResponse } from "next/server";

const BASE_URL =
  "https://script.google.com/macros/s/AKfycbzdXdLrZhsfAC7lDbBok7J9Xyf3cXAcVPmwmjfyFWwlzZqpd2zigzP7WQabRPIJMo7d/exec";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();

    console.log("Apps Script:", text);

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message: "Apps Script returned empty response",
        },
        { status: 500 }
      );
    }

    return new NextResponse(text, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}