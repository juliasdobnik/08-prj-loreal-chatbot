// Updated system prompt for the chatbot
const systemPrompt =
  "You are a helpful assistant specialized in answering questions about L’Oréal products, routines, recommendations, and beauty-related topics. If a question is unrelated to these areas, politely refuse to answer and guide the user back to relevant topics.";

/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Function to set the introductory message at the top of the chat box
function setInitialMessage() {
  let introMessage = document.getElementById("introMessage");

  // Create the introductory message if it doesn't exist
  if (!introMessage) {
    introMessage = document.createElement("div");
    introMessage.id = "introMessage";
    introMessage.classList.add("msg", "intro");
    introMessage.textContent = "👋 Hello! How can I help you today?";
    chatWindow.insertBefore(introMessage, chatWindow.firstChild);
  }
}

// Call the function to set the initial message
setInitialMessage();

// Function to append messages to the chat window
function appendMessage(sender, message) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("msg", sender);
  messageElement.textContent = message;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll to the latest message
}

// Array to store conversation history
let conversationHistory = [
  { role: "system", content: systemPrompt }, // Start with the system prompt
];

// Function to send a request to OpenAI's Chat Completions API
async function sendMessageToOpenAI(userMessage) {
  const workerUrl = "https://loreal-chatbot.jsdobnik.workers.dev/";

  // Add the user's message to the conversation history
  conversationHistory.push({ role: "user", content: userMessage });

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: conversationHistory, // Send the entire conversation history
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch response from worker");
    }

    const data = await response.json();

    // Add the AI's response to the conversation history
    const botMessage = data.choices[0].message.content;
    conversationHistory.push({ role: "assistant", content: botMessage });

    return botMessage;
  } catch (error) {
    console.error("Error communicating with worker:", error);
    return "Sorry, I couldn't process your request. Please try again.";
  }
}

// Function to display the user's latest question
function displayLatestQuestion(question) {
  // Remove the introductory message if it exists
  const introMessage = chatWindow.querySelector(":scope > .msg");
  if (introMessage && introMessage.textContent.includes("👋 Hello!")) {
    introMessage.remove();
  }

  // Remove the previous question if it exists
  let latestQuestionElement = document.getElementById("latestQuestion");
  if (latestQuestionElement) {
    latestQuestionElement.remove();
  }

  // Create a new element for the latest question
  latestQuestionElement = document.createElement("div");
  latestQuestionElement.id = "latestQuestion";
  latestQuestionElement.classList.add("latest-question");
  latestQuestionElement.textContent = `${question}`;
  chatWindow.insertBefore(latestQuestionElement, chatWindow.firstChild);
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return; // Do nothing if input is empty

  // Ensure the introductory message stays at the top
  setInitialMessage();

  // Display the user's latest question
  displayLatestQuestion(userMessage);

  // Clear the input field
  userInput.value = "";

  // Get chatbot response and display it
  appendMessage("ai", "Typing..."); // Temporary message while waiting for response
  const botResponse = await sendMessageToOpenAI(userMessage);

  // Replace the temporary message with the actual response
  const typingMessage = chatWindow.querySelector(".msg.ai:last-child");
  if (typingMessage) typingMessage.textContent = botResponse;
});
