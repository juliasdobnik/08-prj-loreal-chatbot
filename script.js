// Updated system prompt for the chatbot
const systemPrompt =
  "You are a helpful assistant specialized in answering questions about L’Oréal products, routines, recommendations, and beauty-related topics. If a question is unrelated to these areas, politely refuse to answer and guide the user back to relevant topics.";

/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Function to append messages to the chat window
function appendMessage(sender, message) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("msg", sender);
  messageElement.textContent = message;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll to the latest message
}

// Function to send a request to OpenAI's Chat Completions API
async function sendMessageToOpenAI(userMessage) {
  const workerUrl = 'https://loreal-chatbot.jsdobnik.workers.dev/';
  
  try {
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ]
      })
    });

    if (!response.ok) {
      throw new Error("Failed to fetch response from worker");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error communicating with worker:", error);
    return "Sorry, I couldn't process your request. Please try again.";
  }
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return; // Do nothing if input is empty

  // Display user message in the chat window
  appendMessage("user", userMessage);

  // Clear the input field
  userInput.value = "";

  // Get chatbot response and display it
  appendMessage("ai", "Typing..."); // Temporary message while waiting for response
  const botResponse = await sendMessageToOpenAI(userMessage);

  // Replace the temporary message with the actual response
  const typingMessage = chatWindow.querySelector(".msg.ai:last-child");
  if (typingMessage) typingMessage.textContent = botResponse;
});
