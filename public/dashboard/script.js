document.addEventListener("DOMContentLoaded", function () {
    const chatArea = document.getElementById("chat-area");
    const typeArea = document.getElementById("type-area");
    const sendBtn = document.querySelector(".send-btn");
  
    // Function to add a message to chat area
    function addMessage(text, sender = "self") {
      if (!text.trim()) return; // Prevent empty messages
  
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message", sender);
  
      messageDiv.innerHTML = `<p>${text}</p>`;
      chatArea.appendChild(messageDiv);
  
      chatArea.scrollTop = chatArea.scrollHeight; // Auto-scroll to latest message
    }
  
    // Send button event
    sendBtn.addEventListener("click", function () {
      const messageText = typeArea.value;
      addMessage(messageText, "self");
      typeArea.value = ""; // Clear input field
    });
  
    // Send message on Enter key press
    typeArea.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        sendBtn.click();
      }
    });
  });
  