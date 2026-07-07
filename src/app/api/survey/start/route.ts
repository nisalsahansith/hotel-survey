import { NextResponse } from "next/server";

const BASE_URL = "https://script.google.com/macros/s/AKfycbzdXdLrZhsfAC7lDbBok7J9Xyf3cXAcVPmwmjfyFWwlzZqpd2zigzP7WQabRPIJMo7d/exec";

export async function POST(req: Request) {

  const body = await req.json();

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();

  return NextResponse.json(JSON.parse(text));

}