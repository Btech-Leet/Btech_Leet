import { FormData, fetch } from "undici";

async function main() {
  const form = new FormData();
  form.append("file", new Blob(["hello world"], { type: "application/pdf" }), "test.pdf");
  form.append("metadata", JSON.stringify({
    title: "Test Math",
    type: "NOTES",
    semester: 3,
    price: 0,
    active: true
  }));

  try {
    const res = await fetch("http://localhost:3000/api/resources", {
      method: "POST",
      body: form,
    });

    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", text);
  } catch (err) {
    console.error("FETCH ERROR:", err);
  }
}

main().catch(console.error);
