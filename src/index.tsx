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

// Shiki initialization (using JS engine without WASM)
const highlighterPromise = createHighlighterCore({
	langs: [htmlLang],
	themes: [githubDark],
	engine: createJavaScriptRegexEngine(),
});

// 1) Root: Return form page with JSX
const Page: FC = () => (
	<html lang="en">
		<head>
			<meta charSet="UTF-8" />
			<meta name="viewport" content="width=device-width,initial-scale=1" />
			<title>View Source</title>
			{/* Tailwind CSS CDN */}
			<script src="https://cdn.tailwindcss.com"></script>
		</head>
		<body className="min-h-screen flex items-center justify-center bg-gray-100">
			<form method="get" action="/preview" className="bg-white p-6 rounded shadow-md space-y-4 w-full max-w-md md:max-w-lg lg:max-w-xl">
				<Input name="url" type="url" placeholder="Enter URL" required className="w-full" />
				<div className="flex items-center justify-between">
					<label className="inline-flex items-center">
						<input
							type="checkbox"
							name="reload"
							value="1"
							className="h-5 w-5 text-blue-500 bg-gray-100 rounded border border-gray-400 shadow-sm 
							focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
							hover:bg-blue-50 checked:bg-blue-500 transition duration-200"
						/>
						<span className="ml-2 text-sm">Force Reload</span>
					</label>
					<Button type="submit">Preview</Button>
				</div>
			</form>
		</body>
	</html>
);
app.get('/', (c) => c.html(<Page />));

// 2) /preview: Return full page with highlighted HTML
app.get('/preview', async (c) => {
	const url = c.req.query('url');
	const reload = c.req.query('reload');
	if (!url) return c.text('Missing URL', 400);

	// Cache control (return Edge cache if reload is not specified)
	const cacheKey = new Request(c.req.raw.url);
	if (!reload) {
		const cached = await caches.default.match(cacheKey);
		if (cached) return cached;
	}

	try {
		const res = await fetch(url);
		if (!res.ok) throw new Error(res.statusText);
		const code = await res.text();
		const highlighter = await highlighterPromise;

		const htmlPrefix = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Preview: ${url}</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  /* Wrap <pre> */
  pre {
    white-space: pre-wrap;    /* Enable text wrapping */
    word-break: break-word;   /* Break within words if needed */
  }
</style>
</head>
<body>`;

		const htmlSuffix = `</body>
</html>`;

		const highlighted = highlighter.codeToHtml(code, {
			lang: 'html',
			theme: 'github-dark',
		});

		const html = `${htmlPrefix}${highlighted}${htmlSuffix}`;

		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				const chunkSize = 1024;
				for (let i = 0; i < html.length; i += chunkSize) {
					const chunk = html.substring(i, i + chunkSize);
					controller.enqueue(encoder.encode(chunk));
				}
				controller.close();
			}
		});
		
		const streamResponse = new Response(stream, {
			headers: { 'Content-Type': 'text/html; charset=utf-8' },
		});
		
		streamResponse.headers.set('Cache-Control', 'public, max-age=300'); // TTL 5 minutes
		
		const cacheResponse = new Response(html, {
			headers: { 'Content-Type': 'text/html; charset=utf-8' },
		});
		cacheResponse.headers.set('Cache-Control', 'public, max-age=300');
		
		await caches.default.put(cacheKey, cacheResponse.clone());
		
		return streamResponse;
	} catch (e: any) {
		return c.text(`Error: ${e.message}`, 502);
	}
});

export default app;
