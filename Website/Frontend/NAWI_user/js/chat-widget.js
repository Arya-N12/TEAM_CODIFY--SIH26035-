document.addEventListener('DOMContentLoaded', () => {
  const launcher = document.querySelector('.floating-chatbot-btn');
  if (!launcher) return;
  if (!window.NawiQuestionAssistant) {
    console.error('NAWI assistant could not start because the predefined answer library is unavailable.');
    return;
  }

  const panel = document.createElement('section');
  panel.id = 'chatbotPanel';
  panel.className = 'chatbot-panel';
  panel.setAttribute('aria-label', 'NAWI assistant chat');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.hidden = true;
  panel.innerHTML = `
    <header class="chatbot-panel-header">
      <div class="chatbot-panel-title"><i class="fa-solid fa-robot" aria-hidden="true"></i><span>NAWI Assistant</span></div>
      <div class="chatbot-panel-actions">
        <button type="button" data-chat-action="clear" aria-label="Clear conversation" title="Clear conversation"><i class="fa-solid fa-eraser" aria-hidden="true"></i></button>
        <button type="button" data-chat-action="close" aria-label="Close chat" title="Close chat"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </div>
    </header>
    <div class="chatbot-panel-messages" role="log" aria-live="polite" aria-relevant="additions text"></div>
    <form class="chatbot-compose">
      <textarea rows="1" aria-label="Message" placeholder="Ask about NAWI testing or OIML R-76" required></textarea>
      <button type="submit" aria-label="Send message" title="Send message"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></button>
    </form>
  `;
  document.body.append(panel);

  const messages = panel.querySelector('.chatbot-panel-messages');
  const input = panel.querySelector('textarea');
  const form = panel.querySelector('form');
  appendMessage('Hello! Ask me about NAWI instruments, OIML R-76, or test procedures. I will match your question to the predefined answer library and show its source.', 'bot');

  launcher.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    launcher.setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) input.focus();
  });

  panel.addEventListener('click', event => {
    const action = event.target.closest('[data-chat-action]')?.dataset.chatAction;
    if (action === 'close') {
      panel.hidden = true;
      launcher.setAttribute('aria-expanded', 'false');
      launcher.focus();
    } else if (action === 'clear') {
      messages.replaceChildren();
      appendMessage('Conversation cleared. What would you like to know?', 'bot');
    }
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 100)}px`;
  });

  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    appendMessage(question, 'user');
    input.value = '';
    input.style.height = 'auto';

    try {
      const result = await window.NawiQuestionAssistant.answer(question);
      appendMessage(result.answer || result.message, 'bot', result.source, result.question);
    } catch (error) {
      console.error('NAWI assistant could not answer the question.', error);
      appendMessage('The predefined R-76 answer library could not be loaded. Please run the project through a local web server and try again.', 'bot');
    }
  });

  function appendMessage(text, sender, sourceId, question) {
    const message = document.createElement('div');
    message.className = `chatbot-message ${sender}`;
    message.textContent = text;
    if (sourceId !== undefined) {
      const sourceLabel = document.createElement('span');
      sourceLabel.className = 'chatbot-source';
      sourceLabel.textContent = `Source ID: ${sourceId}`;
      message.append(sourceLabel);
    }
    if (question) {
      const questionLabel = document.createElement('span');
      questionLabel.className = 'chatbot-source';
      questionLabel.textContent = `Matched question: ${question}`;
      message.append(questionLabel);
    }
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
  }

});