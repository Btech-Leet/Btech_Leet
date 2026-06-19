import { marked } from "marked";

export function parseMarkdown(content: string): string {
  if (!content) return "";
  try {
    // Synchronously parse markdown to HTML
    return marked.parse(content, { gfm: true, breaks: true, async: false }) as string;
  } catch (err) {
    console.error("Failed to parse markdown:", err);
    return content;
  }
}
