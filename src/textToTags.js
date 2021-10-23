export const textToTags = (text, wordsToTag) => {
    const tags = []
    if (text === undefined) {
        return tags;
    }
    const words = text.split(/[\s,]+/)
    words.map(w => {
        wordsToTag.map(wordToTagWord => {
            for (const [key, value] of Object.entries(wordToTagWord)) {
                key.split(" ").forEach(wordInPlayerName => {
                    if (w.toLowerCase() === wordInPlayerName.toLowerCase() && value && !tags.includes(value)) {
                        tags.push(value)
                    }
                });
            }
        });
    });
    return tags;
}


