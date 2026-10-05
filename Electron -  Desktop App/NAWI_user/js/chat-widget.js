const chatWidgetScriptUrl = document.currentScript.src;

document.addEventListener('DOMContentLoaded', () => {
  const launcher = document.querySelector('.floating-chatbot-btn');
  if (!launcher) return;

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
  let qaData = [];
  let dataReady = false;

  appendMessage('Hello! Ask me about NAWI instruments, OIML R-76, test procedures, or the information in the project Q&A.', 'bot');

  const qaDataPromise = fetch(new URL('../Docs/qa.json', chatWidgetScriptUrl))
    .then(response => {
      if (!response.ok) throw new Error('Could not load the Q&A data.');
      return response.json();
    })
    .then(data => {
      qaData = Array.isArray(data) ? data : [];
      dataReady = true;
    })
    .catch(() => {
      dataReady = false;
    });

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

    await qaDataPromise;
    const result = findAnswer(question);
    appendMessage(result.message, 'bot', result.sourceId, result.question);
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

  function findAnswer(question) {
    if (!dataReady) {
      return { message: 'The answer library could not be loaded. Please run the app through a local web server and try again.' };
    }

    const words = normalize(question);
    let bestMatch;
    let bestScore = 0;

    for (const item of qaData) {
      let score = scoreText(item.question, words);
      for (const keyword of item.keywords || []) score += scoreText(keyword, words) * 2;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }

    if (!bestMatch || bestScore < 2) {
      return { message: 'I could not find a close match in the answer library. Try mentioning a specific instrument, OIML topic, or test procedure.' };
    }

    return { message: bestMatch.answer, sourceId: bestMatch.id, question: bestMatch.question };
  }

  function scoreText(text, words) {
    const searchableWords = new Set(normalize(text));
    return words.reduce((score, word) => score + (searchableWords.has(word) ? 1 : 0), 0);
  }

  function normalize(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(word => word.length > 2);
  }
});