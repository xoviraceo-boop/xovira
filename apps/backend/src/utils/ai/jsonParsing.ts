/**
 * Utility to safely parse JSON from LLM responses which might be wrapped in markdown code blocks.
 */
export function extractJson(content: string): any {
    if (!content) return null;

    // Try parsing directly first
    try {
        return JSON.parse(content.trim());
    } catch (e) {
        // If it fails, try to extract from markdown blocks
        const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonBlockMatch && jsonBlockMatch[1]) {
            try {
                return JSON.parse(jsonBlockMatch[1].trim());
            } catch (innerError) {
                // Fall through to other attempts
            }
        }

        // Try finding the first '{' and last '}'
        const startIdx = content.indexOf('{');
        const endIdx = content.lastIndexOf('}');

        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const potentialJson = content.substring(startIdx, endIdx + 1);
            try {
                return JSON.parse(potentialJson.trim());
            } catch (innerError) {
                // Fall through
            }
        }

        // Re-throw original error if all attempts fail
        throw e;
    }
}
