import React, { useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase.js";
import API from "../api/axios.js";
import ErrorBanner from "../Components/ErrorBanner.jsx";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";

const Login = ({ close }) => {
  useGSAP(() => {
    gsap.from(".login_page", {
      opacity: 0,
      duration: 0.3,
    });

    gsap.from(".loginCard", {
      y: 50,
      scale: 0.8,
      duration: 0.5,
    });
  });

  const dispatch = useDispatch();
  const [err, setErr] = useState("");
  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const { data } = await API.post(
        "/api/auth/signup",
        {
          name: result.user.displayName,
          email: result.user.email,
          avatar: result.user.photoURL,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(data));
      close();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setErr(errorMessage);
      console.error("Google Authentication Error:", errorMessage);
    }
  };

  return (
    <div
      className="login_page z-50 fixed inset-0 bg-black/30 backdrop-blur-2xl flex justify-center items-center"
      onClick={() => close()}
    >
      <div
        className="loginCard relative w-110 flex flex-col items-center gap-5 bg-linear-to-br from-purple-500/30 via-blue-500/40 to-transparent p-5 rounded-3xl border border-[#352642] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-5 right-5 z-20 text-zinc-400 hover:text-white transition-all"
          onClick={() => {
            close();
          }}
        >
          X
        </button>
        <p className="border mt-8 rounded-full text-zinc-300 py-1 px-2 text-xs bg-white/5 border-white/10">
          Ai-powered website builder
        </p>

        <div className="flex flex-col w-full items-center justify-center gap-3">
          <h2 className=" text-center text-3xl font-semibold tracking-tight">
            <span>Welcome to </span>
            <span className="bg-linear-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text ">
              GenWeb.ai
            </span>
          </h2>
          {err && <ErrorBanner message={err} />}
          <button
            className="flex w-[90%] bg-white text-black justify-center items-center gap-3 p-2 rounded-[5px] hover:scale-105 transition-all active:scale-95 shadow-xl"
            onClick={handleGoogleAuth}
          >
            <img
              className="h-5"
              src="https://freelogopng.com/images/all_img/1657952440google-logo-png-transparent.png"
              alt="google"
            />
            Continue with Google
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3 ">
          <div className="border-white/10 border w-[125px] flex-1"></div>
          <span className="text-xs text-zinc-500 tracking-wide">
            Secure Login
          </span>
          <div className="border-white/10 border w-[125px] flex-1"></div>
        </div>

        <div className="m-3.5 text-zinc-500 text-xs tracking-wide text-center">
          By continuing you agree to our{" "}
          <span className="underline hover:text-white text-sm cursor-pointer">
            Terms of Services
          </span>{" "}
          and{" "}
          <span className="underline hover:text-white text-sm cursor-pointer">
            Privacy Policy
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;