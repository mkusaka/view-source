// src/worker/index.ts
import { Hono } from "hono";

// core 部分
import { createHighlighterCore } from "shiki/core";

// JavaScript RegExp エンジン（WASM を一切使わない）
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

// 言語・テーマモジュール（.mjs を直接インポート）
import htmlLang from "shiki/langs/html.mjs";
import githubLight from "shiki/themes/github-light.mjs";

// Shiki のハイライターを初期化（WASM をロードしない）
const highlighterPromise = createHighlighterCore({
  langs: [htmlLang],
  themes: [githubLight],
  engine: createJavaScriptRegexEngine(), // ← ここがポイント
});

const app = new Hono();

app.get("/api/source", async (c) => {
  const url = c.req.query("url");
  if (!url) return c.text("Missing URL", 400);

  let code: string;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    code = await res.text();
  } catch (e: any) {
    return c.text(`Fetch error: ${e.message}`, 502);
  }

  const highlighter = await highlighterPromise;
  const highlighted = highlighter.codeToHtml(code, {
    lang: "html",
    theme: "github-light",
  });

  return c.html(`
    <div class="p-4 bg-gray-50 dark:bg-gray-800 overflow-auto">
      ${highlighted}
    </div>
  `);
});

export default app;
