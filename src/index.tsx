/** @jsxImportSource hono/jsx */
import { Hono } from 'hono';
import type { FC } from 'hono/jsx';
import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import htmlLang from 'shiki/langs/html.mjs';
import githubDark from 'shiki/themes/github-dark.mjs';

import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

const app = new Hono();

// Shiki 初期化（WASM 不要の JS エンジン利用）
const highlighterPromise = createHighlighterCore({
	langs: [htmlLang],
	themes: [githubDark],
	engine: createJavaScriptRegexEngine(),
});

// 1) ルート：フォームページを JSX で返す
const Page: FC = () => (
	<html lang="ja">
		<head>
			<meta charSet="UTF-8" />
			<meta name="viewport" content="width=device-width,initial-scale=1" />
			<title>View Source</title>
			{/* Tailwind CSS CDN */}
			<script src="https://cdn.tailwindcss.com"></script>
		</head>
		<body className="min-h-screen flex items-center justify-center bg-gray-100">
			<form method="get" action="/preview" className="bg-white p-6 rounded shadow-md space-y-4">
				<Input name="url" type="url" placeholder="表示したいページの URL" required className="w-full" />
				<div className="flex items-center space-x-2">
					<label className="inline-flex items-center">
						<input type="checkbox" name="reload" value="1" className="form-checkbox" />
						<span className="ml-2 text-sm">強制リロード</span>
					</label>
					<Button type="submit">プレビュー</Button>
				</div>
			</form>
		</body>
	</html>
);
app.get('/', (c) => c.html(<Page />));

// 2) /preview: ハイライト HTML をフルページ返却
app.get('/preview', async (c) => {
	const url = c.req.query('url');
	const reload = c.req.query('reload');
	if (!url) return c.text('Missing URL', 400);

	// キャッシュ制御（reload がなければ Edge キャッシュを返却）
	const cacheKey = new Request(c.req.raw.url);
	if (!reload) {
		const cached = await caches.default.match(cacheKey);
		if (cached) return cached;
	}

	// fetch + highlight
	let snippet: string;
	try {
		const res = await fetch(url);
		if (!res.ok) throw new Error(res.statusText);
		const code = await res.text();
		const highlighter = await highlighterPromise;
		snippet = highlighter.codeToHtml(code, {
			lang: 'html',
			theme: 'github-dark',
		});
	} catch (e: any) {
		return c.text(`Error: ${e.message}`, 502);
	}

	// レスポンス組み立て
	const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Preview: ${url}</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  /* <pre> を折り返す */
  pre {
    white-space: pre-wrap;    /* 折り返しを有効化 */
    word-break: break-word;   /* 単語内でも折り返し */
  }
</style>
</head>
<body>
${snippet}
</body>
</html>`;

	const res = new Response(html, {
		headers: { 'Content-Type': 'text/html; charset=utf-8' },
	});
	res.headers.set('Cache-Control', 'public, max-age=300'); // TTL 5 分
	await caches.default.put(cacheKey, res.clone());

	return res;
});

export default app;
