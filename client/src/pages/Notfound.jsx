import React, { useEffect, useState } from "react";

import page1 from "../assets/page1.png";
import page2 from "../assets/page2.png";
import page3 from "../assets/page3.png";
import { Link } from "react-router-dom";

const Notfound = () => {
  const [randomNumber, setRandomNumber] = useState(0);

  useEffect(() => {
    setRandomNumber(Math.floor(Math.random() * 3) + 1);
  }, []);

  return (
    <div className="w-screen overflow-hidden h-screen flex items-center justify-center bg-black text-white text-4xl">
      {/* <img className='h-full w-full object-cover' src={page1} alt="" /> */}
      {randomNumber === 1 && (
        <img className="h-full w-full object-cover" src={page1} alt="" />
      )}
      {randomNumber === 2 && (
        <img className="h-full w-full object-cover" src={page2} alt="" />
      )}
      {randomNumber === 3 && (
        <img className="h-full w-full object-cover" src={page3} alt="" />
      )}

      {randomNumber === 1 && (
        <Link
          to="/"
          className="absolute top-[90%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-xl bg-transparent px-4 py-2 border border-black rounded-full hover:bg-black/10 transition focus:scale-95 text-black"
        >
          BACK HOME
        </Link>
      )}
      {randomNumber === 2 && (
        <Link
          to="/"
          className="absolute top-[90%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-xl bg-transparent px-4 py-2 border border-white rounded-full hover:bg-white/10 transition focus:scale-95"
        >
          BACK TO HOME
        </Link>
      )}
      {randomNumber === 3 && (
        <Link
          to="/"
          className="absolute top-[90%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-xl bg-transparent px-4 py-2 border border-white rounded-full hover:bg-white/10 transition focus:scale-95"
        >
          GO HOME
        </Link>
      )}

      
    
    </div>
  );
};
export default Notfound;
