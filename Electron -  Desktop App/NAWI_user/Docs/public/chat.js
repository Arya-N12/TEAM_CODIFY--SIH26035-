/**
 * NAWI Test Management — AI Assistant Logic
 * Handles message rendering, automated responses, and input management.
 */

document.addEventListener('DOMContentLoaded', () => {
  const chatInput = document.getElementById('chatInput');
  const btnSend = document.getElementById('btnSend');
  const chatMessages = document.getElementById('chatMessages');
  const quickSuggestions = document.getElementById('quickSuggestions');
  const btnClearChat = document.getElementById('btnClearChat');

  // Auto-resize textarea
  chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight < 120 ? this.scrollHeight : 120) + 'px';
  });

  // Handle Enter key (Send on Enter, New Line on Shift+Enter)
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  btnSend.addEventListener('click', sendMessage);

  // Handle Quick Suggestions Click
  if (quickSuggestions) {
    quickSuggestions.addEventListener('click', (e) => {
      if (e.target.classList.contains('suggestion-chip')) {
        chatInput.value = e.target.textContent;
        sendMessage();
      }
    });
  }

  // Clear Chat
  btnClearChat.addEventListener('click', () => {
    if(confirm('Are you sure you want to clear the conversation history?')) {
      // Keep only the first welcome message
      const welcomeMsg = chatMessages.firstElementChild;
      chatMessages.innerHTML = '';
      chatMessages.appendChild(welcomeMsg);
      // Re-append suggestions if desired, or leave them out
    }
  });

  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // 1. Hide suggestions on first message
    if (quickSuggestions) {
      quickSuggestions.style.display = 'none';
    }

    // 2. Append User Message
    appendMessage(text, 'user');
    
    // 3. Clear Input
    chatInput.value = '';
    chatInput.style.height = 'auto';

    // 4. Simulate Bot Processing
    showTypingIndicator();
    
    setTimeout(() => {
      removeTypingIndicator();
      const botResponse = generateBotResponse(text);
      appendMessage(botResponse, 'bot');
    }, 1200 + Math.random() * 1000); // Random delay between 1.2s and 2.2s
  }

  function appendMessage(text, sender) {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isUser = sender === 'user';
    const avatarContent = isUser ? 'AS' : '<i class="fa-solid fa-robot"></i>';
    const senderName = isUser ? 'Dr. Sharma' : 'System';
    const avatarClass = isUser ? 'user-avatar' : 'bot-avatar';

    const msgHTML = `
      <div class="chat-message ${sender}">
        <div class="message-avatar ${avatarClass}">
          ${avatarContent}
        </div>
        <div class="message-content-wrapper">
          <div class="message-bubble">
            <p>${text.replace(/\n/g, '<br>')}</p>
          </div>
          <span class="message-time">${senderName} • ${timeString}</span>
        </div>
      </div>
    `;

    chatMessages.insertAdjacentHTML('beforeend', msgHTML);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const typingHTML = `
      <div class="chat-message bot" id="typingIndicator">
        <div class="message-avatar bot-avatar">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div class="message-content-wrapper">
          <div class="message-bubble" style="padding: 10px 18px;">
            <div class="typing-indicator">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    chatMessages.insertAdjacentHTML('beforeend', typingHTML);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
      indicator.remove();
    }
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Simple hardcoded responses for demo purposes
  function generateBotResponse(userInput) {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('mpe') || lowerInput.includes('permissible error')) {
      return "For a **Class III** instrument with **Max = 300kg** and **e = 100g**, the Maximum Permissible Errors (MPE) on initial verification are:\n\n• 0 ≤ m ≤ 50 kg (500e): **± 0.5e (50g)**\n• 50 kg < m ≤ 200 kg (2000e): **± 1.0e (100g)**\n• 200 kg < m ≤ 300 kg (3000e): **± 1.5e (150g)**";
    } 
    else if (lowerInput.includes('environment') || lowerInput.includes('temperature')) {
      return "According to OIML R-76, unless otherwise specified by the manufacturer, the standard temperature limits for Non-Automatic Weighing Instruments are **-10 °C to +40 °C**.\n\nRelative humidity limits typically require testing at **85% RH** at the upper temperature limit without condensation.";
    }
    else if (lowerInput.includes('repeatability')) {
      return "To perform the **Repeatability Test** (OIML R-76 Clause A.4.10):\n\n1. Apply the same load (usually ~50% Max and Max) to the receptor several times (e.g., 3 to 6 times depending on class).\n2. Bring the instrument to zero before each application.\n3. The difference between the maximum and minimum results for the same load must not exceed the absolute value of the MPE for that load.";
    }
    else {
      return "I can assist you with OIML R-76 guidelines, test procedures, or checking calculations for your current evaluation. Could you provide a bit more detail about the specific instrument class or test parameter you are working with?";
    }
  }
});