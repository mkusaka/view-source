// src/react-app/App.tsx
import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

function App() {
  const [url, setUrl] = useState("");
  const [sourceHtml, setSourceHtml] = useState<string>();
  const [error, setError] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setSourceHtml(undefined);

    if (!url) {
      setError("URL を入力してください");
      return;
    }

    try {
      const resp = await fetch(`/api/source?url=${encodeURIComponent(url)}`);
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || resp.statusText);
      }
      const html = await resp.text();
      setSourceHtml(html);
    } catch (e: unknown) {
      setError(`取得エラー: ${e instanceof Error ? e.message : '不明なエラー'}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="url"
          placeholder="表示したいページの URL を入力"
          value={url}
          onChange={(e) => setUrl(e.currentTarget.value)}
          className="flex-1"
        />
        <Button type="submit">表示</Button>
      </form>

      {error && <div className="text-red-600">{error}</div>}

      {sourceHtml && (
        <div
          className="prose max-w-full overflow-auto rounded-md border p-4 bg-gray-50 dark:bg-gray-800"
          dangerouslySetInnerHTML={{ __html: sourceHtml }}
        />
      )}
    </div>
  );
}

export default App;
