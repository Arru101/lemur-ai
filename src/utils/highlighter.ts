export function highlightCode(code: string, language: string = "javascript"): string {
  const lang = language.toLowerCase();

  // Escape HTML characters to prevent XSS and rendering breakages
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  const escapedCode = escapeHtml(code);

  // Fallback for simple/unsupported formats
  if (["txt", "text", "markdown", "md", "json"].includes(lang)) {
    return escapedCode;
  }

  // Token regex patterns
  const tokens = {
    comment: /(\/\/.*|\/\*[\s\S]*?\*\/|#.*)/g,
    string: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g,
    number: /\b(0x[0-9a-fA-F]+|\d+(?:\.\d+)?)\b/g,
    keyword: /\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|new|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|async|await|let|package|private|protected|public|static|any|string|number|boolean|unknown|never|from|def|elif|import|print|as|class|self|nil|undefined|null|true|false)\b/g,
    function: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\()/g,
    operator: /([+\-*/%&|^!~=<>?:;.,[\]{}()])/g,
  };

  // We tokenize by separating comments and strings first, so we don't highlight keywords inside them.
  // We'll replace strings/comments with placeholders, highlight the rest, then put them back.
  let tempCode = escapedCode;
  const placeholders: { type: string; val: string }[] = [];

  // 1. Extract comments and strings
  const combinedRegex = new RegExp(`(${tokens.comment.source})|(${tokens.string.source})`, "g");
  
  tempCode = tempCode.replace(combinedRegex, (match) => {
    const isComment = match.startsWith("//") || match.startsWith("/*") || match.startsWith("#");
    const type = isComment ? "comment" : "string";
    const placeholder = `___PLACEHOLDER_${placeholders.length}___`;
    placeholders.push({ type, val: match });
    return placeholder;
  });

  // 2. Highlight functions, keywords, numbers, operators in the remaining code
  // Function calls
  tempCode = tempCode.replace(tokens.function, '<span class="text-sky-400 font-semibold">$1</span>');

  // Keywords
  tempCode = tempCode.replace(tokens.keyword, '<span class="text-violet-400 font-bold">$1</span>');

  // Numbers
  tempCode = tempCode.replace(tokens.number, '<span class="text-amber-400">$1</span>');

  // 3. Restore strings and comments with proper styling
  placeholders.forEach((placeholder, idx) => {
    const key = `___PLACEHOLDER_${idx}___`;
    let styledVal = "";
    if (placeholder.type === "comment") {
      styledVal = `<span class="text-neutral-500 italic">${placeholder.val}</span>`;
    } else {
      styledVal = `<span class="text-emerald-400">${placeholder.val}</span>`;
    }
    tempCode = tempCode.replace(key, styledVal);
  });

  return tempCode;
}
