// ============ CONFIG ============
const WEBHOOK_URL = "https://divyanshuser.app.n8n.cloud/webhook/422e480f-069e-4696-b2c9-a90c8a4cb834";

// ============ STATE ============
let userDetails = { name: "", email: "" };

// ============ HELPERS ============
function addMessage(text, sender = "bot") {
  const chatBox = document.getElementById("chatBox");
  const div = document.createElement("div");
  div.className = `message ${sender}`; // ✅ fixed template literal
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function postToWebhook(payload) {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
      mode: "cors"
    })
    .then(res => res.json())
    .then(data => {
      console.log(data)
      addMessage(data[0].output, "bot");
    });

    if (!res.ok) {
      console.error("Webhook error:", res.status, res.statusText);
      return null;
    }
  } catch (err) {
    console.error("Webhook fetch failed:", err);
    return null;
  }
}

// ============ EVENT HANDLERS ============
async function handleStartChat(e) {
  e.preventDefault(); // stop page refresh
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !email) {
    alert("Please enter both Name and Email.");
    return;
  }
  userDetails = { name, email };

  // UI switch
  document.getElementById("overlay").style.display = "none";
  document.getElementById("chatContainer").style.display = "flex";
  addMessage(`Hello ${name}! How can I help you today?`, "bot"); // ✅ fixed template literal
}

async function handleSendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (!text) return;

  // Show user message in UI
  addMessage(text, "user");
  input.value = "";

  // Send to webhook
  await postToWebhook({
    event: "user_message",
    user: userDetails,
    message: text,
    timestamp: new Date().toISOString()
  });
}

// ============ INIT ============
document.addEventListener("DOMContentLoaded", () => {
  // form submit
  const userForm = document.getElementById("userForm");
  userForm.addEventListener("submit", handleStartChat);

  // send button
  const sendBtn = document.getElementById("sendBtn");
  sendBtn.addEventListener("click", handleSendMessage);

  // Enter key to send
  const userInput = document.getElementById("userInput");
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSendMessage();
  });
});
