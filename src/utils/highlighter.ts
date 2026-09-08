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

  // Fallback for plain text or markdown
  if (["txt", "text", "markdown", "md", "plaintext"].includes(lang)) {
    return escapedCode;
  }

  // Dedicated JSON Highlighting
  if (lang === "json") {
    return escapedCode.replace(
      /("(?:\\.|[^"\\])*")(\s*:)?|(\btrue\b|\bfalse\b|\bnull\b)|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)/g,
      (_match, keyOrString, isColon, boolOrNull, num) => {
        if (keyOrString) {
          if (isColon) {
            // JSON Property Key
            return `<span class="text-sky-400 font-medium">${keyOrString}</span>:`;
          }
          // JSON String Value
          return `<span class="text-emerald-400">${keyOrString}</span>`;
        }
        if (boolOrNull) {
          return `<span class="text-violet-400 font-bold">${boolOrNull}</span>`;
        }
        if (num) {
          return `<span class="text-amber-400 font-semibold">${num}</span>`;
        }
        return _match;
      }
    );
  }

  // Token regex patterns for multi-language syntax
  const tokens = {
    comment: /(\/\/.*|\/\*[\s\S]*?\*\/|#.*|--.*)/g,
    string: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g,
    number: /\b(0x[0-9a-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g,
    keyword: /\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|new|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|async|await|let|package|private|protected|public|static|any|string|number|boolean|unknown|never|from|def|elif|print|as|self|nil|undefined|null|true|false|True|False|None|fn|mut|impl|trait|pub|use|mod|match|loop|type|struct|enum|interface|defer|select|chan|range|SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP|BY|ORDER|ASC|DESC|LIMIT|HAVING|AND|OR|NOT|CREATE|TABLE|DROP|ALTER|INDEX|include|define|int|char|float|double|bool|auto|constexpr|virtual|override)\b/g,
    function: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g,
    decorator: /(@[a-zA-Z_$][a-zA-Z0-9_$]*)/g,
  };

  // We tokenize by separating comments and strings first, so we don't highlight keywords inside them.
  let tempCode = escapedCode;
  const placeholders: { type: "comment" | "string"; val: string }[] = [];

  const combinedRegex = new RegExp(`(${tokens.comment.source})|(${tokens.string.source})`, "g");

  tempCode = tempCode.replace(combinedRegex, (match) => {
    const isComment = match.startsWith("//") || match.startsWith("/*") || match.startsWith("#") || match.startsWith("--");
    const type = isComment ? "comment" : "string";
    const placeholder = `___HL_TOKEN_${placeholders.length}___`;
    placeholders.push({ type, val: match });
    return placeholder;
  });

  // Decorators / Annotations (e.g. @Component, @override)
  tempCode = tempCode.replace(tokens.decorator, '<span class="text-pink-400 font-semibold">$1</span>');

  // Function calls
  tempCode = tempCode.replace(tokens.function, '<span class="text-sky-400 font-semibold">$1</span>');

  // Keywords
  tempCode = tempCode.replace(tokens.keyword, '<span class="text-violet-400 font-bold">$1</span>');

  // Numbers
  tempCode = tempCode.replace(tokens.number, '<span class="text-amber-400 font-semibold">$1</span>');

  // Restore strings and comments with proper syntax styling
  placeholders.forEach((placeholder, idx) => {
    const key = `___HL_TOKEN_${idx}___`;
    let styledVal = "";
    if (placeholder.type === "comment") {
      styledVal = `<span class="text-neutral-400/90 dark:text-neutral-500 italic">${placeholder.val}</span>`;
    } else {
      styledVal = `<span class="text-emerald-400">${placeholder.val}</span>`;
    }
    tempCode = tempCode.replace(key, styledVal);
  });

  return tempCode;
}
