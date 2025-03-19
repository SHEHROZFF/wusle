"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import HeartStepsImageBg from "../../../assets/Images/howtobuy3.webp";
import "animate.css";
import S_IMAGE from "../../../assets/Images/s.webp";
import { useIsMobile } from "@/hooks/useIsMobile";

const HeartSteps: React.FC = () => {
  const stepsRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoSrc, setVideoSrc] = useState("");
  const isMobile = useIsMobile(1352);
  const isMobile2 = useIsMobile(585);
  const steps = [
    {
      id: 1,
      title: "CONNECT YOUR WALLET",
      description: "Go to the wallet connect button on the website and connect your wallet to the presale panel",
    },
    {
      id: 2,
      title: "SELECT THE AMOUNT",
      description: "Select the currency you want to use to pay, enter the amount you want to spend",
    },
    {
      id: 3,
      title: "CONFIRM AND GO",
      description: "Click on the confirm button and approve. Congrats you have now purchased $Wusle!",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimate(true);
          } else {
            setAnimate(false);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (stepsRef.current) {
      observer.observe(stepsRef.current);
    }

    return () => {
      if (stepsRef.current) {
        observer.unobserve(stepsRef.current);
      }
    };
  }, []);

  const openVideo = (src: string) => {
    window.open(src, "_blank");
  };

  return (
    <div
      className="overflow-x-hidden relative h-auto bg-gradient-to-tr from-gray-900 to-green-900 py-16 px-4 md:px-8"
      ref={stepsRef}
    >
      <Image
        src={HeartStepsImageBg}
        alt="Background"
        fill
        className="object-cover opacity-50"
      />
      <div className={`flex justify-between items-center ${isMobile ? "flex-col" : "flex-row"}`}>
        <h1
          className={`fontFamily uppercase ${isMobile ? `${isMobile2 ? "text-4xl text-center" : "text-7xl w-full text-center"}`: "text-lg md:text-9xl w-full md:w-1/2 text-left"} text-nowrap text-white mb-8 m-4 ${
            animate ? "animate__animated animate__backInLeft" : ""
          }`}
        >
          {/* "HOW TO BUY" section */}
          <div className={`${isMobile ? `${isMobile2 ? "-mb-8" : "-mb-16"}` : "-mb-32"} text-center`}>
            HOW TO BUY
          </div> 
          <br />
          {/* "WuSle" section */}
          Wu
          <span
            className={`relative inline-block align-middle ${isMobile ? `${isMobile2 ? "w-14 " : "w-24 md:w-24"}` : "w-20 md:w-48 lg:w-48"} `}
          >
            <Image
              src={S_IMAGE}
              alt="S"
              width={isMobile ? (isMobile2 ? 200 : 250) : 400}
              height={isMobile ? (isMobile2 ? 200 : 250) : 400}
              className={`absolute object-contain ${isMobile ? `${isMobile2 ? "-top-8" : "-top-14"}` : "-top-28"}`}
            />
          </span>
          le
        </h1>
        <div
          className={`flex flex-col items-center md:items-end ${
            animate ? "animate__animated animate__backInRight" : ""
          }`}
        >
          <div className="flex flex-col md:flex-col gap-4 md:mt-5 mt-0">
            <button
              className="text-base md:text-xl py-6 px-4 cursor-pointer rounded-full bg-transparent text-white font-extrabold mb-4 md:mb-8 tracking-wide drop-shadow-lg uppercase border-2 border-white hover:bg-purple-900 "
              onClick={() => openVideo("/video.mp4")}
            >
              Watch Desktop Tutorial
            </button>

            <button
              className="text-base md:text-xl py-6 px-4 cursor-pointer rounded-full bg-transparent text-white font-extrabold tracking-wide drop-shadow-lg uppercase border-2 border-white hover:bg-purple-900"
              onClick={() => openVideo("/video.mp4")}
            >
              Watch Mobile Tutorial
            </button>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="grid grid-cols-1 gap-12 mt-8 px-4 md:px-8">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex flex-col md:flex-row items-center ${
              index % 2 === 0 ? "md:flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-full md:w-[50%] p-12 text-white bgStunColor rounded-lg shadow-md text-center md:text-left ${
                animate
                  ? index % 2 === 0
                    ? "animate__animated animate__fadeInRight"
                    : "animate__animated animate__fadeInLeft"
                  : ""
              }`}
            >
              <h2 className="fontFamily text-xl md:text-4xl mb-4">
                [{step.id}] {step.title}
              </h2>
              <p className="fontFamilyText text-lg md:text-2xl text-gray-200 mb-4 mt-10">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Video Popup */}
      {videoOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center ">
          <div className="relative w-11/12 md:w-3/4 lg:w-1/2 bg-white rounded-lg p-4 shadow-lg">
            <button
              className="absolute top-2 right-2 text-black text-2xl font-bold"
              onClick={() => setVideoOpen(false)}
            >
              ×
            </button>
            <video controls autoPlay className="w-full h-auto rounded-lg">
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeartSteps;










// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import HeartStepsImageBg from "../../../assets/Images/howtobuy3.webp";
// import "animate.css";
// import S_IMAGE from "../../../assets/Images/s.webp";
// import { useIsMobile } from "@/hooks/useIsMobile";

// const HeartSteps: React.FC = () => {
//   const stepsRef = useRef<HTMLDivElement>(null);
//   const [animate, setAnimate] = useState(false);
//   const [videoOpen, setVideoOpen] = useState(false);
//   const [videoSrc, setVideoSrc] = useState("");
//   const isMobile = useIsMobile(1352);
//   const steps = [
//     {
//       id: 1,
//       title: "CONNECT YOUR WALLET",
//       description: "Go to the wallet connect button on the website and connect your wallet to the presale panel",
//     },
//     {
//       id: 2,
//       title: "SELECT THE AMOUNT",
//       description: "Select the currency you want to use to pay, enter the amount you want to spend",
//     },
//     {
//       id: 3,
//       title: "CONFIRM AND GO",
//       description: "Click on the confirm button and approve. Congrats you have now purchased $Wusle!",
//     },
//   ];

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setAnimate(true);
//           } else {
//             setAnimate(false);
//           }
//         });
//       },
//       { threshold: 0.2 }
//     );

//     if (stepsRef.current) {
//       observer.observe(stepsRef.current);
//     }

//     return () => {
//       if (stepsRef.current) {
//         observer.unobserve(stepsRef.current);
//       }
//     };
//   }, []);

//   const openVideo = (src: string) => {
//     window.open(src, "_blank");
//   };

//   return (
//     <div
//       className="overflow-x-hidden relative h-auto bg-gradient-to-tr from-gray-900 to-green-900 py-16 px-4 md:px-8"
//       ref={stepsRef}
//     >
//       <Image
//         src={HeartStepsImageBg}
//         alt="Background"
//         fill
//         className="object-cover opacity-50"
//       />
//       <div className={`flex justify-between items-center ${isMobile ? "flex-col" : "flex-row"}`}>
//         <h1
//           className={`fontFamily uppercase text-lg md:text-9xl  text-nowrap w-full md:w-1/2 text-white mb-8 text-center md:text-left m-4 ${
//             animate ? "animate__animated animate__backInLeft" : ""
//           }`}
//         >
//           <div className="-mb-32 text-center -mx-40">
//             HOW TO BUY
//           </div>
          
//           <br />
//           Wu
//           <span
//             className={`relative inline-block align-middle w-20 md:w-48 lg:w-48 z-50 "
//             `}
//           >
//             <Image
//               src={S_IMAGE}
//               alt="S"
//               width={400}
//               height={400}
//               className={`absolute object-contain  ${isMobile ? "-top-28" : "-top-28"}`}
//             />
//           </span>
//           le
//         </h1>
//         <div
//           className={`flex flex-col items-center md:items-end ${
//             animate ? "animate__animated animate__backInRight" : ""
//           }`}
//         >
//           <div className="flex flex-col md:flex-col gap-4 md:mt-5 mt-0">
//             <button
//               className="text-base md:text-xl py-6 px-4 cursor-pointer rounded-full bg-transparent text-white font-extrabold mb-4 md:mb-8 tracking-wide drop-shadow-lg uppercase border-2 border-white hover:bg-purple-900 z-50"
//               onClick={() => openVideo("/video.mp4")}
//             >
//               Watch Desktop Tutorial
//             </button>

//             <button
//               className="text-base md:text-xl py-6 px-4 cursor-pointer rounded-full bg-transparent text-white font-extrabold tracking-wide drop-shadow-lg uppercase border-2 border-white hover:bg-purple-900"
//               onClick={() => openVideo("/video.mp4")}
//             >
//               Watch Mobile Tutorial
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Steps Section */}
//       <div className="grid grid-cols-1 gap-12 mt-8 px-4 md:px-8">
//         {steps.map((step, index) => (
//           <div
//             key={step.id}
//             className={`flex flex-col md:flex-row items-center ${
//               index % 2 === 0 ? "md:flex-row-reverse" : ""
//             }`}
//           >
//             <div
//               className={`w-full md:w-[50%] p-12 text-white bgStunColor rounded-lg shadow-md text-center md:text-left ${
//                 animate
//                   ? index % 2 === 0
//                     ? "animate__animated animate__fadeInRight"
//                     : "animate__animated animate__fadeInLeft"
//                   : ""
//               }`}
//             >
//               <h2 className="fontFamily text-xl md:text-4xl  mb-4">
//                 [{step.id}] {step.title}
//               </h2>
//               <p className="fontFamilyText  text-lg md:text-2xl text-gray-200 mb-4 mt-10">
//                 {step.description}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Video Popup */}
//       {videoOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
//           <div className="relative w-11/12 md:w-3/4 lg:w-1/2 bg-white rounded-lg p-4 shadow-lg">
//             <button
//               className="absolute top-2 right-2 text-black text-2xl font-bold"
//               onClick={() => setVideoOpen(false)}
//             >
//               ×
//             </button>
//             <video controls autoPlay className="w-full h-auto rounded-lg">
//               <source src={videoSrc} type="video/mp4" />
//               Your browser does not support the video tag.
//             </video>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HeartSteps;











// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import HeartStepsImageBg from "../../../assets/Images/HeartStepsBg.webp";
// import "animate.css";
// import S_IMAGE from "../../../assets/Images/s.webp";

// const HeartSteps: React.FC = () => {
//   const stepsRef = useRef<HTMLDivElement>(null);
//   const [animate, setAnimate] = useState(false);
//   const [videoOpen, setVideoOpen] = useState(false);
//   const [videoSrc, setVideoSrc] = useState("");

//   const steps = [
//     {
//       id: 1,
//       title: "CONNECT YOUR WALLET",
//       description: "Access Wusle Panel",
//     },
//     {
//       id: 2,
//       title: "SELECT THE AMOUNT",
//       description: "Choose your currency and invest in Wusle Coins",
//     },
//     {
//       id: 3,
//       title: "CONFIRM AND GO",
//       description: "Approve the transaction and start earning rewards",
//     },
//   ];

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setAnimate(true);
//           } else {
//             setAnimate(false);
//           }
//         });
//       },
//       { threshold: 0.2 }
//     );

//     if (stepsRef.current) {
//       observer.observe(stepsRef.current);
//     }

//     return () => {
//       if (stepsRef.current) {
//         observer.unobserve(stepsRef.current);
//       }
//     };
//   }, []);

//   const openVideo = (src: string) => {
//     window.open(src, "_blank");
//   };

//   return (
//     <div
//       className="overflow-x-hidden relative h-auto bg-gradient-to-tr from-gray-700 to-purple-500 py-16 px-4 md:px-8"
//       ref={stepsRef}
//     >
//       <Image
//         src={HeartStepsImageBg}
//         alt="Background"
//         fill
//         className="object-cover opacity-50"
//       />
//       <div className="flex flex-col md:flex-row justify-between items-center">
//         <h1
//           className={`text-lg md:text-5xl md:text-wrap text-nowrap w-full md:w-1/2 text-yellow-50 font-extrabold mb-8 tracking-wide drop-shadow-lg text-center md:text-left m-4 ${
//             animate ? "animate__animated animate__backInLeft" : ""
//           }`}
//         >
//           HOW TO Buy Wu
//           <span className="relative inline-block size-14 sm:size-16 align-middle z-50">
//             <Image src={S_IMAGE} alt="S" fill className="object-contain" />
//           </span>
//           le
//         </h1>
//         <div
//           className={`flex flex-col items-center md:items-end ${
//             animate ? "animate__animated animate__backInRight" : ""
//           }`}
//         >
//           <div className="flex flex-col md:flex-col gap-4 md:mt-32 mt-0">
//             <button
//               className="text-base md:text-xl py-6 px-4 cursor-pointer rounded-full bg-transparent text-white font-extrabold mb-4 md:mb-8 tracking-wide drop-shadow-lg uppercase border-2 border-white hover:bg-purple-500 z-50"
//               onClick={() => openVideo("/video.mp4")}
//             >
//               Watch Desktop Tutorial
//             </button>

//             <button
//               className="text-base md:text-xl py-6 px-4 cursor-pointer rounded-full bg-transparent text-white font-extrabold tracking-wide drop-shadow-lg uppercase border-2 border-white hover:bg-purple-500"
//               onClick={() => openVideo("/video.mp4")}
//             >
//               Watch Mobile Tutorial
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Steps Section */}
//       <div className="grid grid-cols-1 gap-12 mt-8 px-4 md:px-8">
//         {steps.map((step, index) => (
//           <div
//             key={step.id}
//             className={`flex flex-col md:flex-row items-center ${
//               index % 2 === 0 ? "md:flex-row-reverse" : ""
//             }`}
//           >
//             <div
//               className={`w-full md:w-1/3 p-6 text-white bg-purple-600 rounded-lg shadow-md text-center md:text-left ${
//                 animate
//                   ? index % 2 === 0
//                     ? "animate__animated animate__fadeInRight"
//                     : "animate__animated animate__fadeInLeft"
//                   : ""
//               }`}
//             >
//               <h2 className="text-xl md:text-3xl font-bold mb-4">
//                 [{step.id}] {step.title}
//               </h2>
//               <p className="text-lg md:text-2xl text-gray-200 mb-4">
//                 {step.description}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Video Popup */}
//       {videoOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
//           <div className="relative w-11/12 md:w-3/4 lg:w-1/2 bg-white rounded-lg p-4 shadow-lg">
//             <button
//               className="absolute top-2 right-2 text-black text-2xl font-bold"
//               onClick={() => setVideoOpen(false)}
//             >
//               ×
//             </button>
//             <video controls autoPlay className="w-full h-auto rounded-lg">
//               <source src={videoSrc} type="video/mp4" />
//               Your browser does not support the video tag.
//             </video>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HeartSteps;
