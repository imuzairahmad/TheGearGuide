export function safeJSONParse(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("Invalid JSON output");
    }

    let sliced = content.slice(start, end + 1);

    // Remove trailing commas
    sliced = sliced.replace(/,\s*([}\]])/g, "$1");

    return JSON.parse(sliced);
  }
}
