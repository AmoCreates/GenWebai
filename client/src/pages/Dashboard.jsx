import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ArrowBigLeftDash,
  Check,
  Plus,
  Share2,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import API from "../api/axios.js";
import ErrorBanner from "../Components/ErrorBanner.jsx";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import websiteLogo from "../assets/website_logo.png";

const Dashboard = () => {
  const { userData } = useSelector((state) => state.user);
  const [websites, setWebsites] = useState([]);
  const [loading, setloading] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [deleteSite, setDeleteSite] = useState("");
  const [error, setError] = useState("");

  const headerRef = useRef();
  const arrowRef = useRef();
  const btnRef = useRef();
  const greetingRef = useRef();

  useGSAP(() => {
    gsap.from(headerRef.current, {
      y: "-100%",
      duration: 1,
      ease: "bounce.out",
    });

    gsap.from(arrowRef.current, {
      x: "100%",
      duration: 1,
      delay: 1,
      ease: "bounce.out",
    });

    gsap.from(btnRef.current, {
      x: "100%",
      delay: 1,
      opacity: 0,
      duration: 1,
    });

    gsap.from(greetingRef.current.children, {
      opacity: 0,
      duration: 2,
      stagger: 1,
    });
  });

  const deleteWebsite = async (id) => {
    try {
      setError("");
      await API.get(`/api/website/delete-by-id/${id}`, {
        withCredentials: true,
      });
      setWebsites((prev) => prev.filter((site) => site._id !== id));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error("Delete Error:", errorMessage);
    }
  };

  const deploy = async (id) => {
    try {
      setError("");
      const res = await API.get(`/api/website/deploy/${id}`, {
        withCredentials: true,
      });
      setWebsites((prev) =>
        prev.map((site) =>
          site._id === id ? { ...site, isDeployed: true, deployedUrl: res.data.url } : site,
        ),
      );
      window.open(`${res.data.url}`, "_blank");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      console.error("Deploy Error:", errorMessage);
    }
  };

  useEffect(() => {
    const getAllWebsites = async () => {
      setloading(true);
      setError("");
      try {
        const res = await API.get("/api/website/get/all", {
          withCredentials: true,
        });
        const sortedWebsites = (res.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setWebsites(sortedWebsites);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
        console.error("Fetch Websites Error:", errorMessage);
      } finally {
        setloading(false);
      }
    };
    getAllWebsites();
  }, []);

  const copy = async (site) => {
    await navigator.clipboard.writeText(site.deployedUrl);
    setCopiedId(site._id);
    setTimeout(() => {
      setCopiedId("");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header ref={headerRef} className="sticky bg-black/30 top-0 left-0 w-full flex justify-between items-center border border-zinc-700 px-[10vw] py-4 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="hover:bg-white/10 p-2 transition rounded-xl">
            <ArrowBigLeftDash ref={arrowRef} />
          </Link>
          <h1>Dashboard</h1>
        </div>

        <div className="-translate-y-[2px]">
          <img src={websiteLogo} alt="GenWeb.ai Logo" className="h-12 w-12" />
        </div>

        <div ref={btnRef}>
          <Link
            to="/generate"
            className="flex items-center justify-center gap-1 px-4 py-3 rounded-lg bg-white text-black text-sm font-semibold hover:scale-105 transition-all"
          >
            <Plus className="-translate-y-[2px]" size={16}/> New Website
          </Link>
        </div>
      </header>

      <main className="relative px-[10vw] py-4">
        <div ref={greetingRef} className="py-4">
          <p className="text-sm text-zinc-400 mb-1">Welcome Back</p>
          <h1 className="text-3xl font-bold">{userData?.name}</h1>
        </div>

        <section className="relative mt-24">
          <div className="flex justify-between items-center p-2">
            <h1 className="text-zinc-400">Your Websites</h1>
            <h1 className="text-zinc-400">Total Websites: {websites.length}</h1>
          </div>
          {error && <ErrorBanner message={error} />}
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : websites.length === 0 ? (
            <div className="text-center">No Website Yet</div>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {websites.map((website) => {
                const copied = copiedId === website._id;
                return (
                  <div
                    key={website._id}
                    className="relative rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 hover:-translate-y-2.5 transition flex flex-col"
                  >
                    <Link
                      to={`/editor/${website._id}`}
                      className="relative h-40 bg-black cursor-pointer"
                    >
                      <iframe
                        srcDoc={website.latestCode?.replace(
                          /https:\/\/via\.placeholder\.com\/300/g,
                          "https://placehold.co/300",
                        )}
                        className="absolute inset-0 w-[140%] h-[140%] scale-[0.72] origin-top-left pointer-events-none bg-white"
                      />
                    </Link>
                    <div className="p-4 flex flex-col gap-4 border-t border-white/10 font-medium truncate">
                      <h3>{website.title}</h3>
                      <div className="text-xs text-zinc-400">
                        <p>Created: {new Date(website.createdAt).toLocaleDateString()}</p>
                        <p>Updated: {new Date(website.updatedAt).toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between gap-4 items-center">
                        {!website.isDeployed ? (
                          <button
                            className="flex w-full justify-center items-center gap-2 px-4 py-1.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 font-semibold hover:scale-105 transition"
                            onClick={() => deploy(website._id)}
                          >
                            <span className="text-xl">🚀</span>
                            Deploy
                          </button>
                        ) : (
                          <button
                            className={`flex w-full justify-center items-center gap-2 px-4 py-1.5 rounded-xl ${copied ? "bg-green-500" : "bg-blue-500"} font-semibold hover:scale-105 transition`}
                            onClick={() => copy(website)}
                          >
                            {copied ? (
                              <>
                                <Check />
                                Link Copied
                              </>
                            ) : (
                              <>
                                <Share2 />
                                Share Link
                              </>
                            )}
                          </button>
                        )}
                        <button
                          className="bg-black/80 p-1.5 rounded-xl hover:text-red-500 hover:bg-white transition-all"
                          onClick={() => setDeleteSite(website._id)}
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </section>
      </main>
      {deleteSite && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg flex flex-col items-center gap-4">
            <TriangleAlert className="text-yellow-500" size={48} />
            <h2 className="text-xl font-bold">Delete Website</h2>
            <p>Are you sure you want to delete this website?</p>
            <div className="flex gap-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                onClick={() => {
                  deleteWebsite(deleteSite);
                  setDeleteSite("");
                }}
              >
                Delete
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                onClick={() => setDeleteSite("")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;