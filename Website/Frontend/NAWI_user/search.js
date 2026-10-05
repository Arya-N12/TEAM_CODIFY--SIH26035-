import fs from "fs";

// Load the predefined questions and answers
const qaData = JSON.parse(
    fs.readFileSync("./Docs/qa.json", "utf8")
);


// Convert text into simple searchable words
const stopWords = new Set([
    "a", "about", "an", "and", "are", "can", "do", "does", "for", "how", "i",
    "in", "is", "it", "me", "my", "of", "on", "or", "please", "should", "the",
    "this", "to", "what", "when", "where", "which", "who", "why", "with", "you"
]);

function normalize(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));
}


// Find the best matching question
export function searchQuestion(userQuestion) {

    const userWords = normalize(userQuestion);
    const normalizedQuestion = userWords.join(" ");

    let bestMatch = null;
    let bestScore = 0;

    for (const item of qaData) {
        const questionWords = normalize(item.question);
        if (questionWords.join(" ") === normalizedQuestion) {
            return createResult(item, questionWords.length * 5);
        }

        const questionWordSet = new Set(questionWords);
        const keywordWords = new Set((item.keywords || []).flatMap(normalize));
        const score = userWords.reduce((total, word) => {
            if (questionWordSet.has(word)) return total + 3;
            return total + (keywordWords.has(word) ? 2 : 0);
        }, 0);

        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    }


    // Minimum score required
    if (bestScore < 2) {
        return {
            found: false,
            message:
                "I could not find a relevant answer among the predefined OIML R-76 questions."
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
        score,
        source: item.source
    };
}