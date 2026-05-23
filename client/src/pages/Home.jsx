import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Login from "../Components/Login.jsx";
import { useDispatch, useSelector } from "react-redux";
import { Coins } from "lucide-react";
import API from "../api/axios.js";
import ErrorBanner from "../Components/ErrorBanner.jsx";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import { setUserData } from "../redux/userSlice.js";
import { Link, useNavigate } from "react-router-dom";
import websiteLogo from "../assets/website_logo.png";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, setLogin] = useState(false);
  const { userData } = useSelector((state) => state.user);
  const [dashboardView, setDashboardView] = useState(false);
  const [err, setErr] = useState("");
  const [websites, setWebsites] = useState();
  const [loading, setloading] = useState(false);

  const mainRef = useRef();
  const gridRef = useRef();
  useGSAP(() => {
    gsap.from(".header", {
      y: "-100%",
      duration: 1,
      ease: "bounce.out",
    });

    gsap.from(mainRef.current, {
      y: "100%",
      opacity: 0,
      duration: 1,
      ease: "bounce.out",
    });

    gsap.from("button", {
      x: "100%",
      delay: 1,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
    });

    gsap.from(".project-card", {
        y: 30,
        opacity: 0,
        delay: 0.5,
        duration: 1,
        stagger: 0.3,
        ease: "power2.out",
      });
  });

  useGSAP(() => {
    if (!loading && websites?.length > 0 && userData) {
      gsap.from(gridRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
      });
    } 
  }, { dependencies: [loading, websites, userData] });

  const handleLogOut = async () => {
    try {
      await API.get("/api/auth/logout", {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      setDashboardView(false);
    } catch (error) {
      console.log(
        "Logout Error: ",
        error.response?.data?.message || error.message,
      );
    }
  };

  useEffect(() => {
    if (!userData && !login) {
      const timer = setTimeout(() => {
        setLogin(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [userData, login]);

  useEffect(() => {
    if (!userData) return;

    const getAllWebistes = async () => {
      setloading(true);
      try {
        const res = await API.get("/api/website/get/all", {
          withCredentials: true,
        });
        // Sort by date descending (newest first) to avoid using .reverse() in render
        const sortedWebsites = (res.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setWebsites(sortedWebsites);
      } catch (error) {
        setErr(getErrorMessage("Please enable cookies",error));
        console.error("Update Error:", error.response?.data || error.message);
      } finally {
        setloading(false);
      }
    };
    getAllWebistes();
  }, [userData]);

  const highlights = [
    "AI Generated Code",
    "Fully Responsive Layouts",
    "Production Ready Output",
  ];
  return (
    <div
      className="relative flex flex-col items-center bg-black text-white w-full min-h-screen overflow-x-hidden"
      onClick={() => {
        if (dashboardView == true) setDashboardView(false);
      }}
    >
      <section className="header fixed bg-black/30 top-0 left-0 w-full flex justify-between items-center border border-zinc-700  px-[10vw] py-4 backdrop-blur-xl z-10">
        <div className="flex items-center">
          <img src={websiteLogo} alt="GenWeb.ai Logo" className="h-12 w-12" />
          <h1 className="translate-y-[2px] bg-linear-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text font-bold text-xl">
            GenWeb.ai
          </h1>
        </div>
        <div className="flex gap-5 items-center ">
          <Link
            to="/pricing"
            className="hidden md:block cursor-pointer text-zinc-400 hover:text-white"
          >
            Pricing
          </Link>
          {userData && (
            <Link
              to="/pricing"
              className="credits flex items-center gap-1 bg-white/10 border-white/10 border rounded-full px-2 py-1 text-zinc-400 cursor-pointer hover:bg-white/20 hover:text-white"
            >
              <span className="text-yellow-600">{<Coins />}</span>
              <span>Credits {userData.credits}</span>
              <span>+</span>
            </Link>
          )}
          {!userData ? (
            <button
              className="border-gray-600 border rounded-[5px] px-1.5 py-1"
              onClick={() => {
                setLogin(true);
              }}
            >
              Get Started
            </button>
          ) : (
            <div className="relateive ">
              <button
                className="flex border border-white items-center h-[35px] w-[35px] bg-white  rounded-full overflow-hidden cursor-pointer"
                onClick={() => {
                  setDashboardView(!dashboardView);
                }}
              >
                <img
                  className="object-cover h-full w-full"
                  src={
                    userData.avatar ||
                    `https://ui-avatars.com/api/?background=ffffff&color=0F00FF&name=${userData.name}`
                  }
                  referrerPolicy="no-referrer"
                />
              </button>

              {dashboardView && (
                <div className="absolute overflow-hidden right-[10%] w-70 top-[100%] z-40 rounded-xl bg-[#0b0b0b] border border-white/10 shadow-2xl  flex flex-col leading-tight">
                  <div className="w-full flex flex-col items-center justify-center gap-1 text-xs px-4 py-3 border-b border-white/10 hover:bg-white/5 cursor-pointer">
                    <div className="flex items-center h-[45px] w-[45px] bg-white  rounded-full overflow-hidden cursor-pointer">
                      <img
                        className="object-cover h-full w-full"
                        src={
                          userData.avatar ||
                          `https://ui-avatars.com/api/?background=ffffff&color=0F00FF&name=${userData.name}`
                        }
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h2 className="text-xl truncate">{userData.name}</h2>
                    <p className="truncate text-sm text-zinc-400">
                      {userData.email}
                    </p>
                  </div>

                  <div className="credits2 w-full px-4 py-3 border-b border-white/10 hover:bg-white/5 cursor-pointer">
                    <button
                      className="flex items-center gap-1 bg-white/10 border-white/10 border rounded-full px-2 py-1 text-zinc-400 cursor-pointer hover:bg-white/20 hover:text-white"
                      onClick={() => navigate("/pricing")}
                    >
                      <span className="text-yellow-600">{<Coins />}</span>
                      <span>Credits {userData.credits}</span>
                      <span>+</span>
                    </button>
                  </div>

                  <Link
                    to="/dashboard"
                    className="px-4 py-3 border-b border-white/10 hover:bg-white/5 cursor-pointer"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/generate"
                    className="px-4 py-3 border-b border-white/10 hover:bg-white/5 cursor-pointer"
                  >
                    Generate
                  </Link>
                  <button
                    onClick={handleLogOut}
                    className="px-4 py-3 text-red-500 border-b border-white/10 hover:bg-white/5 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <main ref={mainRef} className="mt-50 flex flex-col items-center gap-6">
        {err && (
          <div className="w-full max-w-4xl px-[10vw]">
            <ErrorBanner message={err} />
          </div>
        )}
        <h1 className="text-center text-[6vw] leading-[7vw] font-bold tracking-tight">
          Build Stunning Websites <br />
          <span className="bg-linear-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text ">
            with AI
          </span>
        </h1>
        <p className="text-zinc-400 max-w-[550px] text-center text-lg">
          Describe your idea and let Ai Generate a modern, responsive,
          porduction-ready website.
        </p>
        <button
          className="bg-white text-black font-bold py-2.5 px-6 mt-2 rounded-[8px]"
          onClick={() => {
            userData ? navigate("/dashboard") : setLogin(true);
          }}
        >
          {userData ? "View Dashboard" : "Get Started"}
        </button>
      </main>

      {!userData || websites?.length == 0 ? (
        <section className="flex flex-wrap justify-around mx-[10vw] mt-30">
          {highlights.map((highlight, key) => {
            return (
              <div
                key={key}
                className="project-card flex flex-col bg-[#111111] px-4 py-5 text-white border-[1px] border-white w-[350px] m-3.5 rounded-2xl cursor-pointer"
              >
                <h1 className="font-bold text-2xl">{highlight}</h1>
                <p className="text-zinc-400  text-[14px]">
                  GenWeb ai builds real websites - clean code, animations,
                  responsiveness and scalable structure
                </p>
              </div>
            );
          })}
        </section>
      ) : (
        <section ref={gridRef} className="relative mt-30">
          <h1 className="text-zinc-400 p-2 mx-[13vw] text-center mb-2 text-2xl font-bold">Your Websites</h1>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <section className="flex flex-wrap justify-center gap-7 ">
              {websites?.slice(0, 3).map((website, key) => {
                return (
                  <div
                    key={key}
                    className="website-card relative w-[450px] rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 hover:-translate-y-2.5 transition flex flex-col"
                  >
                    <Link
                      to={`/editor/${website._id}`}
                      className="relative h-40 lg:h-55 bg-black cursor-pointer"
                    >
                      <iframe
                        srcDoc={website?.latestCode?.replace(
                          /https:\/\/via\.placeholder\.com\/300/g,
                          "https://placehold.co/300",
                        )}
                        className="absolute inset-0 w-[140%] h-[140%] scale-[0.72] origin-top-left pointer-events-none bg-white"
                      />
                    </Link>
                    <div className="p-4 flex flex-col gap-4 flex-1/12 border-t border-white/10 font-medium truncate">
                      <h3>{website?.title}</h3>
                      <div className="text-xs flex justify-between items-center text-zinc-400"></div>
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </section>
      )}

      <footer className=" w-full border-t border-white/10 w-full mt-15 py-8 text-center text-zinc-500 text-sm">
        &copy; {new Date().getFullYear()} GenWeb.ai
      </footer>

      {login && <Login close={() => setLogin(false)} />}
    </div>
  );
};

export default Home;
