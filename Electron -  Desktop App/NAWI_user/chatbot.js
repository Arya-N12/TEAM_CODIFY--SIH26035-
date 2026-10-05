import { searchQuestion } from "./search.js";

/**
 * Main chatbot function.
 * The UI calls this function with the user's question.
 */
export function askChatbot(question) {

    if (!question || !question.trim()) {
        return {
            found: false,
            message: "Please enter a question."
        };
    }

    return searchQuestion(question.trim());
}