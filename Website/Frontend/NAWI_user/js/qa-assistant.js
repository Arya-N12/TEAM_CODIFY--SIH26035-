(() => {
  const scriptUrl = document.currentScript.src;
  const dataUrl = new URL('../Docs/qa.json', scriptUrl);
  let questionsPromise;
  const stopWords = new Set([
    'a', 'about', 'an', 'and', 'are', 'can', 'do', 'does', 'for', 'how', 'i',
    'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'please', 'should', 'the',
    'this', 'to', 'what', 'when', 'where', 'which', 'who', 'why', 'with', 'you'
  ]);

  function loadQuestions() {
    if (!questionsPromise) {
      questionsPromise = fetch(dataUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Could not load the R-76 answer library (${response.status}).`);
          }
          return response.json();
        })
        .then(data => {
          if (!Array.isArray(data)) {
            throw new Error('The R-76 answer library must contain a list of questions.');
          }
          return data;
        });
    }
    return questionsPromise;
  }

  function normalize(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  async function answer(question) {
    const trimmedQuestion = typeof question === 'string' ? question.trim() : '';
    if (!trimmedQuestion) {
      return { found: false, message: 'Please enter a question.' };
    }

    const qaData = await loadQuestions();
    const words = normalize(trimmedQuestion);
    const normalizedQuestion = words.join(' ');
    let bestMatch;
    let bestScore = 0;

    for (const item of qaData) {
      const questionWords = normalize(item.question);
      if (questionWords.join(' ') === normalizedQuestion) {
        return createResult(item, questionWords.length * 5);
      }

      const questionWordSet = new Set(questionWords);
      const keywordWords = new Set((item.keywords || []).flatMap(normalize));
      const score = words.reduce((total, word) => {
        if (questionWordSet.has(word)) return total + 3;
        return total + (keywordWords.has(word) ? 2 : 0);
      }, 0);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }

    if (!bestMatch || bestScore < 2) {
      return {
        found: false,
        message: 'I could not find a close match in the predefined R-76 answer library. Try asking about a specific instrument characteristic or test procedure.'
      };
    }

    return createResult(bestMatch, bestScore);
  }

  function createResult(item, score) {
    return {
      found: true,
      id: item.id,
      question: item.question,
      answer: item.answer,
      source: item.source,
      score
    };
  }

  window.NawiQuestionAssistant = { answer };
})();
