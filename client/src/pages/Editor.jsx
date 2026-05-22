import { useEffect, useRef, useState } from "react";
import API from "../api/axios.js";
import ErrorBanner from "../Components/ErrorBanner.jsx";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import { Link, useParams } from "react-router-dom";
import AiChat from "../Components/AiChat.jsx";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Editor from "@monaco-editor/react";
import {
  ArrowBigLeftDash,
  CloudCheck,
  Code2,
  MessageSquareCode,
  Monitor,
  MonitorOff,
  Redo2,
  Undo2,
} from "lucide-react";

const WebsiteEditor = () => {
  const { id } = useParams();
  const [website, setWebsite] = useState();
  const [websiteCode, setWebsiteCode] = useState("");
  const [conversation, setConversation] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [openEdior, setOpenEditor] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const iFrameRef = useRef();
  const [loading, setloading] = useState(false);
  const [changes, setChanges] = useState([]);
  const [changesCount, setChangesCount] = useState(0);
  const [err, setErr] = useState("");
  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(".backbtn", {
      x: "100%",
      duration: 1,
      ease: "bounce.out",
    });

    tl.from(".arrow", {
      x: "10px",
      duration: 1,
      ease: "bounce.out",
    });
  });

  useGSAP(
    () => {
      if (openEdior) {
        // Opening animation
        gsap.fromTo(
          ".editor",
          { x: "100%", ease: "bounce.in" },
          { x: "0%", duration: 1, ease: "bounce.out" },
        );
      } else {
        // Closing animation
        gsap.to(".editor", {
          x: "100%",
          duration: 1,
          ease: "power2.in",
        });
      }
    },
    { dependencies: [openEdior] },
  );

  useGSAP(
    () => {
      if (openChat) {
        gsap.fromTo(
          ".chat",
          { width: "100%" },
          { width: "0%", duration: 0.5, ease: "power2.out" },
        );
      } else {
        // Closing animation
        gsap.to(".chat", {
          width: "100%",
          duration: 0.5,
          ease: "power2.in",
        });
      }
    },
    { dependencies: [openChat] },
  );


  useEffect(() => {
    const getWebsite = async () => {
      try {
        const res = await API.get(`/api/website/get-by-id/${id}`, {
          withCredentials: true,
        });
        setWebsite(res.data);
        setWebsiteCode(res.data.latestCode);
        setChanges([{ code: res.data.latestCode }]);
        setChangesCount(0);
        setConversation(res.data.conversation);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setErr(errorMessage);
        console.error("Get Website Error:", errorMessage);
      }
    };
    getWebsite();
  }, [id]);

  const deploy = async () => {
    try {
      const res = await API.get(`/api/website/deploy/${website._id}`, {
        withCredentials: true,
      });
      setWebsite((prev) => ({ ...prev, isDeployed: true }));

      window.open(`${res.data.url}`, "_blank");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setErr(errorMessage);
      console.error("Deploy Error:", errorMessage);
    }
  };

  const undoChanges = () => {
    if (changesCount > 0) {
      setWebsiteCode(changes[changesCount - 1].code);
      setChangesCount((prev) => prev - 1);
    }
  };

  const redoChanges = () => {
    if (changesCount < changes.length - 1) {
      setWebsiteCode(changes[changesCount + 1].code);
      setChangesCount((prev) => prev + 1);
    }
  };

  const saveChanges = async () => {
    setloading(true);
    if (websiteCode === website.latestCode) {
      alert("No changes to save!");
      setloading(false);
      return;
    }
    try {
      const res = await API.post(
        `/api/website/save-changes/${id}`,
        { code: websiteCode },
        { withCredentials: true },
      );
      setWebsite((prev) => ({ ...prev, latestCode: websiteCode }));
      setChanges((prev) => [
        ...prev.slice(0, changesCount + 1),
        { code: websiteCode },
      ]);
      setChangesCount((prev) => prev + 1);
      alert(res.data.message || "Changes saved successfully!");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setErr(errorMessage);
      console.error("Save Error:", errorMessage);
      alert("Failed to save changes.");
    } finally {
      setloading(false);
    }
  };


  useEffect(() => {
    if (!websiteCode || !iFrameRef.current) return;

    const blob = new Blob([websiteCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iFrameRef.current.src = url;

    return () => URL.revokeObjectURL(url);
  }, [websiteCode]);

  if (!website)
    return (
      <div className="h-full flex items-center justify-center bg-black text-white">
        🔃Loading...
      </div>
    );

  return (
    <div className="h-screen w-screen flex bg-black text-white overflow-hidden">
      <aside className="chat flex absolute h-full lg:static flex-col border-r border-white/10 bg-black lg:bg-black/80 max-w-[450px] overflow-hidden">
        <header className="h-14 px-4 flex items-center justify-between border-b border-white/10">
          <span className="font-bold truncate">{website?.title}</span>
          <button
            className={`p-2 ${!openChat ? "text-blue-500 " : "hidden"} transition-all duration-300 `}
            onClick={() => {
              setOpenChat(!openChat);
            }}
          >
            <MessageSquareCode />
          </button>
        </header>
        {err && (
          <div className="px-4 py-4 bg-black/40 border-b border-white/10">
            <ErrorBanner message={err} />
          </div>
        )}
        <AiChat
          website={website}
          setWebsiteCode={setWebsiteCode}
          id={id}
          prompt={prompt}
          setPrompt={setPrompt}
          conversation={conversation}
          setConversation={setConversation}
          setChanges={setChanges}
          setChangesCount={setChangesCount}
          loading={loading}
          setLoading={setloading}
        />
      </aside>

      <section className="flex-1 flex flex-col">
        <header className=" h-14 py-4 px-4 flex justify-between items-center border-b border-white/10 bg-black/80">
          <button
            className={`hover:bg-white/10 p-2 transition rounded-xl ${!openChat && "text-blue-500 hidden"} duration-300`}
            onClick={() => {
              setOpenChat(!openChat);
            }}
          >
            <MessageSquareCode />
          </button>
          <span className="text-xs font-semibold text-zinc-400 ">
            Live Preview
          </span>
          <div className="flex gap-4">
            {website?.isDeployed ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-500 font-semibold hover:scale-105 transition"
              >
                <span className="text-xl">🤩</span>Deployed
              </Link>
            ) : (
              <button
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-linear-to-r from-indigo-500 to-purple-500 font-semibold hover:scale-105 transition"
                onClick={deploy}
              >
                <span className="text-xl">🚀</span>Deploy
              </button>
            )}
            <button
              className={`hover:bg-white/10 p-2 transtiion rounded-xl ${openEdior && "text-blue-500"} duration-300`}
              onClick={() => {
                setOpenEditor(!openEdior);
              }}
            >
              <Code2 />
            </button>
            <button
              className="hover:bg-white/10 p-2 transtiion rounded-xl"
              onClick={() => {
                setFullScreen(true);
                setOpenEditor(false);
                setOpenChat(false);
              }}
            >
              <Monitor />
            </button>
            <Link
              to="/dashboard"
              className="backbtn flex bg-white text-black  gap-1 hover:bg-white/90 p-2 transtiion rounded-xl border-black/10 border"
            >
              <ArrowBigLeftDash className="arrow" /> Dashboard
            </Link>
          </div>
        </header>

        <section
          className={`flex-1 w-full h-full ${fullScreen && "absolute w-screen h-screen top-0 left-0"} bg-white`}
        >
          <button
            className={`cut absolute ${!fullScreen && "hidden"} bg-black text-white p-2 rounded-full top-2 right-4 hover:scale-105 transition-all`}
            onClick={() => setFullScreen(false)}
          >
            <MonitorOff />
          </button>
          <iframe
            className="w-full h-full"
            sandbox="allow-forms allow-modals allow-same-origin allow-scripts"
            ref={iFrameRef}
          />
        </section>
      </section>

      <section className={`editor fixed inset-y-0 sm:w-full lg:w-[57.5%] xl:w-[45%] right-0 lg:top-[56px] sm:top-0 border-l border-white/10 z-50 bg-[#1e1e1e] flex flex-col ${!openEdior ? 'translate-x-full' : ''}`}>
        <div className="bg-[#010409] py-1 px-3 flex justify-between items-center border-b border-white/10">
          Source Code
          <button
            className={`lg:hidden flex gap-2 p-2 ${openEdior && "text-blue-500"} transition-all duration-300`}
            onClick={() => {
              setOpenEditor(!openEdior);
            }}
          >
            <Code2 />
            Close Editor
          </button>
          <div className="flex gap-2">
            <button className={`flex gap-2 p-2 bg-green-600 rounded-[3px] hover:bg-green-700 active:scale-95 ${ changesCount === 0 && "opacity-50 cursor-not-allowed" }`}
              onClick={() => {undoChanges()}}
            >
              <Undo2 />
            </button>
            <button className={`flex gap-2 p-2 bg-green-600 rounded-[3px] hover:bg-green-700 active:scale-95 ${ changesCount >= changes.length - 1 && "opacity-50 cursor-not-allowed" }`}
            disabled={changesCount >= changes.length - 1}
              onClick={() => {redoChanges()}}
            >
              <Redo2 />
            </button>
            <button
              className="flex gap-2 p-2 bg-blue-500 text-white rounded-[3px] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                saveChanges();
              }}
              disabled={loading}
            >
              <CloudCheck /> {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
        <Editor
          className="bg-[#010409]"
          theme="vs-dark"
          value={websiteCode}
          language="html"
          onChange={(code) => {
            setWebsiteCode(code);
          }}
        />
      </section>
    </div>
  );
};

export default WebsiteEditor;
