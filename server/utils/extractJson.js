const extractJson = (content) => {
  if (!content) return;

    content = content.replace(/```json|```/g, "").trim();

    // Find the first { and last } to ensure valid JSON extraction
    const first = content.indexOf("{");
    const last = content.lastIndexOf("}");
    if (first !== -1 && last !== -1) {
      content = content.substring(first, last + 1);
    }

    return JSON.parse(content);
};

export default extractJson;