"use client"
import {
  useState
} from "react"

export default function Home() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState("")
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false)

  async function createIndexAndEmbeddings() {
    try {
      const result = await fetch("/api/setup", {
        method: "POST"
      })

      const json = await result.json()
      console.log("result: ", json)
    } catch (err) {
      console.log("error: ", err)
    }
  }

  async function sendQuery() {
    if (!query) return
    setResult("")
    setLoading(true)
    setHistory((oldHistory) => [
      ...oldHistory,
      { role: "user", content: query },
    ]);

    console.log("history1: ", history)
    try {
      const result = await fetch("/api/read", {
        method: "POST",
        body: JSON.stringify({ query: query, history: history})
      })
      const json = await result.json()
      setHistory((oldHistory) => [...oldHistory, json])

      setResult(json.content)
      setLoading(false)
    } catch (err) {
      console.log("error: ", err)
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col items-center justify-between p-24">
      <input className="text-black px-2 py-1" onChange={e => setQuery(e.target.value)}/>
      <button className="px-7 py-1 rounded-2x1 bg-white text-black mt-2 mb-2" onClick={sendQuery}>Ask AI</button>
      {
        loading && <p>Thinking...</p>
      }
      {
        result && <p>{result}</p>
      }
      <button onClick={createIndexAndEmbeddings}>Create Index and Embeddings</button>
    </main>
  )
}
