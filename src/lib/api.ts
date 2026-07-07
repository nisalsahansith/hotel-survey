const BASE_URL = "https://script.google.com/macros/s/AKfycbzdXdLrZhsfAC7lDbBok7J9Xyf3cXAcVPmwmjfyFWwlzZqpd2zigzP7WQabRPIJMo7d/exec";

// Start Survey
export async function startSurvey(
  name: string,
  phone: string,
  email: string
) {
  try {

    const res = await fetch("/api/survey/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "startSurvey",
        name,
        phone,
        email
      })
    });

    const text = await res.text();

    console.log("RAW RESPONSE:", text);

    if (!text) {
      throw new Error("Empty response from server");
    }

    return JSON.parse(text);

  } catch (err) {
    console.error("API ERROR:", err);
    throw err;
  }
}

export async function submitSurvey(userId: number, answers: any[]) {

  const res = await fetch("/api/survey/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action: "submitSurvey",
      userId,
      answers
    })
  });

  const text = await res.text();

  console.log("RAW RESPONSE:", text);

  return JSON.parse(text);

}

export async function getAdminStats() {

  const res = await fetch(BASE_URL, {
    method: "GET"
  });

  return res.json();

}