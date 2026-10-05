import fs from "fs";

// Load the predefined questions and answers
const qaData = JSON.parse(
    fs.readFileSync("./Docs/qa.json", "utf8")
);


// Convert text into simple searchable words
function normalize(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(word => word.length > 2);
}


// Find the best matching question
export function searchQuestion(userQuestion) {

    const userWords = normalize(userQuestion);

    let bestMatch = null;
    let bestScore = 0;

    for (const item of qaData) {

        let score = 0;

        // Check the original question
        const questionWords = normalize(item.question);

        for (const word of userWords) {
            if (questionWords.includes(word)) {
                score++;
            }
        }

        // Check keywords
        for (const keyword of item.keywords) {

            const keywordWords = normalize(keyword);

            for (const word of userWords) {
                if (keywordWords.includes(word)) {
                    score += 2;
                }
            }
        }

        // Store the best match
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
                "I could not find a relevant answer among the predefined Consumer Affairs questions."
        };
    }


    return {
        found: true,
        id: bestMatch.id,
        question: bestMatch.question,
        answer: bestMatch.answer,
        score: bestScore,
        source: bestMatch.source
    };
}