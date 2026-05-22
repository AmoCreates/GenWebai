import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowBigLeftDash } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios.js";
import ErrorBanner from "../Components/ErrorBanner.jsx";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import { useEffect, useState } from "react";
import websiteLogo from "../assets/website_logo.png";

const Generate = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const PHASES = [
    "Analyzing your idea...",
    "Designing layout & structure...",
    "Writing HTML & CSS...",
    "Adding logic via javascript",
    "Adding animation and interactions...",
    "Final quality checks...",
  ];

  useGSAP(() => {
    gsap.from("header", {
      y: "-100%",
      duration: 1,
      ease: "bounce.out",
    });

    gsap.from(".arrow", {
      x: "100%",
      duration: 1,
      delay: 1,
      ease: "bounce.out",
    });
  });

  // Animate progress bar when progress changes
  useEffect(() => {
    if (loading) {
      gsap.to(".progress-bar-fill", {
        width: `${progress}%`,
        duration: 0.5,
        ease: "power2.out",
      });
    } else {
      // Reset progress bar when not loading
      gsap.to(".progress-bar-fill", {
        width: "0%",
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [progress, loading]);

  const generateWebsite = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await API.post(
        "/api/website/generate",
        { prompt },
        { withCredentials: true },
      );
      setProgress(100);
      setLoading(false);
      navigate(`/editor/${res.data.websiteId}`);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setErr(errorMessage);
      setLoading(false);
      console.error("Generate Error:", errorMessage);
    }
  };

  useEffect(() => {
    if (!loading) {
      setCurrentPhase(0);
      setProgress(0);
      return;
    }

    let value = 0;
    let phase = 0;
    const interval = setInterval(() => {
      let increment =
        value < 20
          ? Math.random() * 1.5
          : value < 60
            ? Math.random() * 1.2
            : Math.random() * 0.8;
      value += increment;
      if (value >= 93) value = 93;

      phase = Math.min(
        Math.floor((value / 100) * PHASES.length),
        PHASES.length - 1,
      );

      setProgress(Math.floor(value));
      setCurrentPhase(phase);
    }, 1200);

    return () => clearInterval(interval);
  }, [loading, PHASES.length]);

  return (
    <div className="min-h-screen bg-linear-to-br from-[#050505] via-[#0b0b0b] to-[#050505] text-white">
      <header className="header sticky bg-black/30 top-0 left-0 w-full flex justify-between items-center border border-zinc-700 px-[10vw] py-4 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hover:bg-white/10 p-2 transition rounded-xl"
          >
            <ArrowBigLeftDash className="arrow" />
          </Link>
          <div className="flex items-center gap-0 ">
            <img src={websiteLogo} alt="GenWeb.ai Logo" className="h-12 w-12" />
            <Link
              to="/"
              className="text-xl translate-y-0.5 bg-linear-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text font-bold "
            >
              GenWeb.ai
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 ">
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Build Website with{" "}
            <span className="block bg-linear-to-r from-white to-zinc-400 bg-clip-text">
              Real Ai Power
            </span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            This process may take several minutes. GenWeb.ai focuses on quality,
            not shortcuts.
          </p>
        </section>

        <section className="mb-14">
          <h1 className="text-xl font-semibold mx-3 mb-2">
            Describe your website
          </h1>
          <div className="relative">
            <textarea
              value={prompt}
              placeholder="Describe your website in detail..."
              className="w-full h-56 p-6 rounded-3xl bg-black/60 border border-white/10 outline-white resize-none text-sm leading-relaxed focus:ring-2 focus:ring-white/20"
              onChange={(e) => {
                setPrompt(e.target.value);
              }}
            ></textarea>
          </div>

          {err && !loading && <ErrorBanner message={err} />}
          <div className="text-center mt-10">
            <button
              className={`active:scale-95 transition-all rounded-2xl font-semibold bg-white text-black py-4 px-14 tex-lg
              ${
                prompt.trim() && !loading
                  ? "bg-white text-black"
                  : "bg-white/20 text-zinc-400 cursor-not-allowed"
              }  `}
              disabled={!prompt.trim() || loading}
              onClick={generateWebsite}
            >
              {loading ? "Generating..." : "Generate Website 🚀"}
            </button>
          </div>
          {loading && (
            <div className="max-w-xl mx-auto mt-12">
              <div className="flex justify-between mb-2 text-xs text-zinc-400">
                <span>{PHASES[currentPhase]}</span>
                <span>{progress}%</span>
              </div>

              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="progress-bar-fill h-full bg-linear-to-r from-white to-zinc-300"
                  style={{ width: "0%" }}
                ></div>
              </div>

              <div className="text-center text-xs text-zinc-400 mt-4">
                Estimated time remaining:{" "}
                <span className="text-white font-medium">~8-12 minutes</span>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Generate;
