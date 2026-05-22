import { Circle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import API from "../api/axios.js";
import ErrorBanner from "../Components/ErrorBanner.jsx";
import { getErrorMessage } from "../utils/getErrorMessage.js";

const AiChat = ({
  setWebsiteCode,
  id,
  prompt,
  setPrompt,
  conversation,
  setConversation,
  loading,
  setLoading,
  setChanges,
  setChangesCount,
}) => {
  const [err, setErr] = useState("");
  const thinking = [
    "Analayzing request...",
    "Analayzing current code...",
    "Planning new code...",
    "Applying Changes...",
    "Improving responsiveness",
    "Almost done...",
    "Finalizing changes...",
  ];
  const [idx, setIdx] = useState(0)

  const updateWebsite = async () => {
    if (!prompt) return;
    let newPrompt = prompt;
    setLoading(true);
    setConversation((prev) => [...prev, { role: "user", content: prompt }]);
    setPrompt("");
    try {
      const res = await API.post(
        `/api/website/update/${id}`,
        {
          prompt: newPrompt,
        },
        {
          withCredentials: true,
        },
      );
      setLoading(false);
      setConversation((prev) => [
        ...prev,
        { role: "ai", content: res.data.message },
      ]);
      setChanges((prev) => [...prev, { code: res.data.code }]);
      setChangesCount(prev => prev + 1);
      setWebsiteCode(res.data.code);
    } catch (error) {
      setLoading(false);
      const errorMessage = getErrorMessage(error);
      setErr(errorMessage);
      console.error("Update Error:", errorMessage);
    }
  };

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % thinking.length);
    }, 20000);

    return () => clearInterval(timer);
  }, [loading, thinking.length]);

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {err && <ErrorBanner message={err} />}
        {conversation.map((message, key) => {
          return (
            <div
              key={key}
              className={`max-w-[85%] ${message.role === "user" ? "ml-auto" : "mr-auto"}`}
            >
              <div
                className={`px-4 py-2.5 rounded-2xl  text-sm leading-relaxed ${message.role === "user" ? "bg-white text-black" : "bg-white/5 border border-white/10 text-zinc-200"}`}
              >
                {message.content}
              </div>
            </div>
          );
        })}

        {loading && <div className="max-w-[85%] mr-auto">
          <div className="px-4 py-2.5 rounded-2xl  text-sm leading-relaxed bg-white/5 border border-white/10 text-zinc-200 italic">
            {thinking[idx]}
          </div>
        </div>}


      </div>

      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <input
            placeholder="Describe Changes..."
            className="flex-1 rounded-2xl p-4 bg-white/5 border border-white/10 outline-none text-sm"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateWebsite();
              }
            }}
            disabled={loading}
          />
          <button
            className='p-4 rounded-2xl bg-white text-black hover:scale-105 transition-all'
            disabled={!prompt || loading}
            onClick={updateWebsite}
          >
            {loading? <Circle/> : <Send />}
          </button>
        </div>
      </div>
    </>
  );
};

export default AiChat;
