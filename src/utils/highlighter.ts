export function highlightCode(code: string, language: string = "javascript"): string {
  const lang = language.toLowerCase();

  // Escape HTML characters to prevent XSS and rendering breakages
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  // Fallback for plain text, markdown, or unstructured output
  if (["txt", "text", "markdown", "md", "plaintext", ""].includes(lang)) {
    return escapeHtml(code);
  }

  // Dedicated High-Fidelity JSON Highlighting
  if (lang === "json") {
    const jsonTokens = /("(?:\\.|[^"\\])*")(\s*:)?|(\btrue\b|\bfalse\b|\bnull\b)|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)/g;
    let lastIdx = 0;
    let result = "";
    let match: RegExpExecArray | null;

    while ((match = jsonTokens.exec(code)) !== null) {
      result += escapeHtml(code.slice(lastIdx, match.index));
      const [, str, colon, boolNull, num] = match;
      if (str) {
        if (colon) {
          result += `<span class="text-sky-400 font-medium">${escapeHtml(str)}</span>${escapeHtml(colon)}`;
        } else {
          result += `<span class="text-emerald-400">${escapeHtml(str)}</span>`;
        }
      } else if (boolNull) {
        result += `<span class="text-violet-400 font-bold">${escapeHtml(boolNull)}</span>`;
      } else if (num) {
        result += `<span class="text-amber-400 font-semibold">${escapeHtml(num)}</span>`;
      } else {
        result += escapeHtml(match[0]);
      }
      lastIdx = jsonTokens.lastIndex;
    }
    result += escapeHtml(code.slice(lastIdx));
    return result;
  }

  // Single-pass scanner regex to prevent nested replacement collisions
  // Group 0 (comment check): comments
  // Group 1: strings
  // Group 2: decorators (@Decorator)
  // Group 3: keywords
  // Group 4: function calls
  // Group 5: numbers
  const TOKEN_REGEX = /(?:\/\/.*|\/\*[\s\S]*?\*\/|#.*|--.*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(@[a-zA-Z_$][a-zA-Z0-9_$]*)|(\b(?:break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|new|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|async|await|let|package|private|protected|public|static|any|string|number|boolean|unknown|never|from|def|elif|print|as|self|nil|undefined|null|true|false|True|False|None|fn|mut|impl|trait|pub|use|mod|match|loop|type|struct|enum|interface|defer|select|chan|range|SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP|BY|ORDER|ASC|DESC|LIMIT|HAVING|AND|OR|NOT|CREATE|TABLE|DROP|ALTER|INDEX|include|define|int|char|float|double|bool|auto|constexpr|virtual|override)\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\())|(\b(?:0x[0-9a-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b)/g;

  let lastIndex = 0;
  let out = "";
  let m: RegExpExecArray | null;

  while ((m = TOKEN_REGEX.exec(code)) !== null) {
    // Escape unstyled text between tokens
    out += escapeHtml(code.slice(lastIndex, m.index));

    const matchedText = m[0];
    const isComment =
      matchedText.startsWith("//") ||
      matchedText.startsWith("/*") ||
      matchedText.startsWith("#") ||
      matchedText.startsWith("--");

    if (isComment) {
      out += `<span class="text-neutral-400/90 dark:text-neutral-500 italic">${escapeHtml(matchedText)}</span>`;
    } else if (m[1]) {
      // String literal
      out += `<span class="text-emerald-400">${escapeHtml(m[1])}</span>`;
    } else if (m[2]) {
      // Decorator
      out += `<span class="text-pink-400 font-semibold">${escapeHtml(m[2])}</span>`;
    } else if (m[3]) {
      // Keyword
      out += `<span class="text-violet-400 font-bold">${escapeHtml(m[3])}</span>`;
    } else if (m[4]) {
      // Function identifier
      out += `<span class="text-sky-400 font-semibold">${escapeHtml(m[4])}</span>`;
    } else if (m[5]) {
      // Number literal
      out += `<span class="text-amber-400 font-semibold">${escapeHtml(m[5])}</span>`;
    } else {
      out += escapeHtml(matchedText);
    }

    lastIndex = TOKEN_REGEX.lastIndex;
  }

  out += escapeHtml(code.slice(lastIndex));
  return out;
}
