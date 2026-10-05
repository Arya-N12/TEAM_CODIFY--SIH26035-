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

  if (!chatInput || !btnSend || !chatMessages || !btnClearChat || !window.NawiQuestionAssistant) {
    console.error('R-76 Assistant could not start because required chat elements or the answer library are missing.');
    return;
  }
  const welcomeMessage = chatMessages.querySelector('.chat-message.bot');

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
      const suggestion = e.target.closest('.suggestion-chip');
      if (suggestion) {
        chatInput.value = suggestion.textContent;
        sendMessage();
      }
    });
  }

  // Clear Chat
  btnClearChat.addEventListener('click', () => {
    if(confirm('Are you sure you want to clear the conversation history?')) {
      // Keep only the first welcome message
      chatMessages.replaceChildren();
      if (welcomeMessage) chatMessages.appendChild(welcomeMessage);
      if (quickSuggestions) {
        quickSuggestions.style.display = '';
        chatMessages.appendChild(quickSuggestions);
      }
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

    // 4. Look up the question in the predefined R-76 answer library
    showTypingIndicator();

    window.NawiQuestionAssistant.answer(text)
      .then(result => {
        removeTypingIndicator();
        appendMessage(result.answer || result.message, 'bot', result);
      })
      .catch(error => {
        console.error('R-76 Assistant could not answer the question.', error);
        removeTypingIndicator();
        appendMessage('The predefined R-76 answer library could not be loaded. Please run the project through a local web server and try again.', 'bot');
      });
  }

  function appendMessage(text, sender, result) {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isUser = sender === 'user';
    const senderName = isUser ? 'Dr. Sharma' : 'System';
    const avatarClass = isUser ? 'user-avatar' : 'bot-avatar';
    const message = document.createElement('div');
    message.className = `chat-message ${sender}`;
    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${avatarClass}`;
    if (isUser) {
      avatar.textContent = 'AS';
    } else {
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-robot';
      avatar.appendChild(icon);
    }
    const content = document.createElement('div');
    content.className = 'message-content-wrapper';
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    bubble.appendChild(paragraph);
    content.appendChild(bubble);

    if (result && result.question) {
      appendDetail(content, `Matched question: ${result.question}`);
    }
    if (result && result.source) {
      appendDetail(content, `Source: ${result.source}`);
    }

    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = `${senderName} • ${timeString}`;
    content.appendChild(time);
    message.append(avatar, content);
    chatMessages.appendChild(message);
    scrollToBottom();
  }

  function appendDetail(parent, text) {
    const detail = document.createElement('span');
    detail.className = 'message-source';
    detail.textContent = text;
    parent.appendChild(detail);
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

});