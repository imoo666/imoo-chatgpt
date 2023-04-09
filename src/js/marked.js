import hljs from "highlight.js/lib/common";
import "highlight.js/styles/github.css";
import { marked } from "marked";
import katex from "../module/katex";
import "../module/katex/dist/katex.css";

function inlineKatex(options) {
  return {
    name: "inlineKatex",
    level: "inline",
    start(src) {
      return src.indexOf("$");
    },
    tokenizer(src, tokens) {
      const match = src.match(/^\$+([^$\n]+?)\$+/);
      if (match) {
        return {
          type: "inlineKatex",
          raw: match[0],
          text: match[1].trim(),
        };
      }
    },
    renderer(token) {
      return katex.renderToString(token.text, options);
    },
  };
}
function blockKatex(options) {
  return {
    name: "blockKatex",
    level: "block",
    start(src) {
      return src.indexOf("\n$$");
    },
    tokenizer(src, tokens) {
      const match = src.match(/^\$\$+\n([^$]+?)\n\$\$+\n/);
      if (match) {
        return {
          type: "blockKatex",
          raw: match[0],
          text: match[1].trim(),
        };
      }
    },
    renderer(token) {
      return `<p>${katex.renderToString(token.text, options)}</p>`;
    },
  };
}

const renderer = new marked.Renderer();
marked.use({ extensions: [inlineKatex(), blockKatex()] });
const options = {
  renderer,
  highlight: (code) => hljs.highlightAuto(code).value || code,
};
marked.setOptions(options);

export const markedParse = marked;
