import React from "react";
import { useEffect } from "react";
import API from "../api/axios.js";
import ErrorBanner from "../Components/ErrorBanner.jsx";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import { useParams } from "react-router-dom";
import { useState } from "react";

const Live = () => {
  const { id } = useParams();
  const [websiteCode, setWebsiteCode] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const getWebsite = async () => {
      setErr("");
      try {
        const res = await API.get(`/api/website/get-by-slug/${id}`, {
          withCredentials: true,
        });
        setWebsiteCode(res.data.latestCode);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setErr(errorMessage);
        console.error("Get Live Website Error:", errorMessage);
      }
    };
    getWebsite();
  }, [id]);

  if (err) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white p-6">
        <div className="max-w-3xl w-full">
          <ErrorBanner message={err} />
        </div>
      </div>
    );
  }

  return (
    <iframe
      title="Live Site"
      srcDoc={websiteCode}
      sandbox="allow-scripts allow-same-origin allow-forms"
      className="w-screen h-screen border-none"
    />
  );
};

export default Live;