"use client";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<{ role: string; content: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<{ loc: string; txtPath: string }[]>(
    []
  );
  const [files, setFiles] = useState<File[]>([]);

  async function createIndexAndEmbeddings() {
    try {
      const result = await fetch("/api/setup", {
        method: "POST",
      });

      const json = await result.json();
      console.log("result: ", json);
    } catch (err) {
      console.log("error: ", err);
    }
  }

  async function sendQuery() {
    if (!query) return;
    setSources([]);
    setResult("");
    setLoading(true);
    setHistory((oldHistory) => [
      ...oldHistory,
      { role: "user", content: query },
    ]);

    try {
      const result = await fetch("/api/read", {
        method: "POST",
        body: JSON.stringify({ query: query, history: history }),
      });
      const json = await result.json();
      setSources(json.sources);

      delete json.sources; // delete the sources array from teh result to be added to the state
      setHistory((oldHistory) => [...oldHistory, json]);

      setResult(json.content);
      setLoading(false);
    } catch (err) {
      console.log("error: ", err);
      setLoading(false);
    }
  }

  const uploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files) return;

    try {
      const data = new FormData();
      for (let i = 0; i < files.length; i++) {
        data.append("files[]", files[i]);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error(await res.text());
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    setFiles([...files, ...selectedFiles]);
  };

  return (
    <main className="flex flex-col items-center justify-between p-24">
      <form onSubmit={uploadFile}>
        <input type="file" name="file" onChange={handleFileChange} multiple />
        <input type="submit" value="Upload" />
      </form>

      <br></br>
      <br></br>
      <br></br>
      <br></br>

      <input
        className="text-black px-2 py-1"
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        className="px-7 py-1 rounded-2x1 bg-white text-black mt-2 mb-2"
        onClick={sendQuery}
      >
        Ask AI
      </button>
      {loading && <p>Thinking...</p>}
      {result && (
        <>
          <p>{result}</p>
          <>
            <br></br>
          </>
          <p>Source Documents:</p>
        </>
      )}
      {sources && (
        <ul>
          {sources.map((source, index) => (
            <li key={index}>
              Location: {source.loc}, Path: {source.txtPath}
            </li>
          ))}
        </ul>
      )}
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <button onClick={createIndexAndEmbeddings}>
        Create Index and Embeddings
      </button>
    </main>
  );
}
