"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import "animate.css";
import TokenomicsImage from "../../../assets/Images/board3.png";
import SmallBoard from "../../../assets/Images/smallboard.webp";
import BoardText from "../../../assets/Images/textboard.png";
import SmallboardText from "../../../assets/Images/smallboardtext.png";
import FullBoard from "../../../assets/Images/fullBoard.png";
import BgTokenicsImage from "../../../assets/Images/tokenomic 1.webp";
import Logo from "@/assets/Images/logo.jpeg";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useIsWide } from "@/hooks/useIsWide";

export default function Page() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const controls = useAnimation();
  const isMobile = useIsMobile();
  const isWide = useIsWide();
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
          if (entry.isIntersecting) controls.start("visible");
          else controls.start("hidden");
        });
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, [controls]);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut", staggerChildren: 0.3 },
    },
  };

  const particleVariants = {
    animate: {
      x: [0, 30, -30, 0],
      y: [0, -30, 30, 0],
      scale: [1, 1.2, 1, 0.8, 1],
      transition: { repeat: Infinity, duration: 8, ease: "easeInOut" },
    },
  };

  return (
    <div
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 min-h-screen bg-gradient-to-tr from-purple-900 via-indigo-800 to-blue-900 text-white overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={BgTokenicsImage}
          alt="Stunning Background"
          fill
          className="object-cover mix-blend-overlay opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-black opacity-20" />
      </div>

      <motion.div
        variants={particleVariants}
        animate="animate"
        className="absolute inset-0 z-20 pointer-events-none"
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 800 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="4" fill="#ffffff" opacity="0.7" />
          <circle cx="400" cy="300" r="3" fill="#ffffff" opacity="0.5" />
          <circle cx="700" cy="500" r="5" fill="#ffffff" opacity="0.8" />
          <circle cx="600" cy="150" r="2" fill="#ffffff" opacity="0.6" />
          <circle cx="200" cy="450" r="4" fill="#ffffff" opacity="0.7" />
        </svg>
      </motion.div>

      <motion.div
        className="relative z-30 flex flex-col items-center text-center space-y-12 w-full mt-20"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.h1
          className={`TokenomicsHeading  uppercase  animate__animated animate__fadeInDown ${isMobile ? ` ${isWide ? "text-5xl" : "text-3xl"}` : "text-7xl"}`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          Tokenomics
        </motion.h1>

        <motion.div
          className="w-full max-w-[2000px] mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        >
          <div className={`relative rounded-3xl transition-transform duration-700 transform hover:scale-105 ${isMobile ? `${isWide ? "ml-12" : "ml-10"}` : "ml-24"}`}>
            <Image
              src={FullBoard}
              alt="Tokenomics Showcase"
              width={isMobile ? 600 : 1000}
              height={isMobile ? 600 : 1000}
              className="rounded-3xl z-20 translate-y-[-7%] mx-auto"
            />
          </div>
            <motion.p
            className={`ultra max-w-xl mx-auto mb-10 transition-all duration-700 ${isMobile ? "text-sm" : "md:text-2xl"}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
          >
            " Redefining Tokenomics with a visionary approach—where art meets technology in a symphony
            of innovation and creativity. Prepare to have your mind blown and your expectations shattered. "
          </motion.p>
        </motion.div>


      </motion.div>
    </div>
  );
}












// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import Image from "next/image";
// import { motion, useAnimation } from "framer-motion";
// import "animate.css";
// import TokenomicsImage from "../../../assets/Images/board3.png";
// import SmallBoard from "../../../assets/Images/smallboard.webp";
// import BoardText from "../../../assets/Images/textboard.png";
// import SmallboardText from "../../../assets/Images/smallboardtext.png";
// import FullBoard from "../../../assets/Images/fullBoard.png";
// import BgTokenicsImage from "../../../assets/Images/tokenomic 1.webp";
// import Logo from "@/assets/Images/logo.jpeg";
// import { useIsMobile } from "@/hooks/useIsMobile";

// export default function Page() {
//   const sectionRef = useRef<HTMLDivElement>(null);
//   const [isVisible, setIsVisible] = useState(false);
//   const controls = useAnimation();
//   const isMobile = useIsMobile();

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           setIsVisible(entry.isIntersecting);
//           if (entry.isIntersecting) controls.start("visible");
//           else controls.start("hidden");
//         });
//       },
//       { threshold: 0.3 }
//     );
//     if (sectionRef.current) observer.observe(sectionRef.current);
//     return () => {
//       if (sectionRef.current) observer.unobserve(sectionRef.current);
//     };
//   }, [controls]);

//   // Container with a stagger effect to let children shine in sequence
//   const containerVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 1, ease: "easeOut", staggerChildren: 0.3 },
//     },
//   };

//   // More playful particle motion with added scale tweaks
//   const particleVariants = {
//     animate: {
//       x: [0, 30, -30, 0],
//       y: [0, -30, 30, 0],
//       scale: [1, 1.2, 1, 0.8, 1],
//       transition: { repeat: Infinity, duration: 8, ease: "easeInOut" },
//     },
//   };

//   return (
//     <div
//       ref={sectionRef}
//       className="relative flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 min-h-screen bg-gradient-to-tr from-purple-900 via-indigo-800 to-blue-900 text-white overflow-hidden"
//     >
//       {/* Background Layer */}
//       <div className="absolute inset-0 z-0">
//         <Image
//           src={BgTokenicsImage}
//           alt="Stunning Background"
//           fill
//           className="object-cover mix-blend-overlay opacity-60"
//           priority
//         />
//         <div className="absolute inset-0 bg-black opacity-20" />
//       </div>

//       {/* Animated Particles */}
//       <motion.div
//         variants={particleVariants}
//         animate="animate"
//         className="absolute inset-0 z-20 pointer-events-none"
//       >
//         <svg
//           className="w-full h-full"
//           viewBox="0 0 800 600"
//           fill="none"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <circle cx="100" cy="100" r="4" fill="#ffffff" opacity="0.7" />
//           <circle cx="400" cy="300" r="3" fill="#ffffff" opacity="0.5" />
//           <circle cx="700" cy="500" r="5" fill="#ffffff" opacity="0.8" />
//           <circle cx="600" cy="150" r="2" fill="#ffffff" opacity="0.6" />
//           <circle cx="200" cy="450" r="4" fill="#ffffff" opacity="0.7" />
//         </svg>
//       </motion.div>

//       {/* Main Content */}
//       <motion.div
//         className="relative z-30 flex flex-col items-center text-center space-y-12 w-full mt-20"
//         variants={containerVariants}
//         initial="hidden"
//         animate={controls}
//       >
//         {/* Title with a shimmering gradient effect */}
//         <motion.h1
//           className={` font-mono font-extrabold tracking-wider uppercase bg-clip-text text-slate-300  drop-shadow-2xl animate__animated animate__fadeInDown ${isMobile ? "text-5xl" : "text-9xl"}`}
//           initial={{ opacity: 0, y: -50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1.2, ease: "easeOut" }}
//         >
//           Tokenomics
//         </motion.h1>

//         {/* Showcase Image with hover lift */}
//         <motion.div
//           className="w-full max-w-[2000px] mx-auto"
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
//         >
//           <div className={`relative rounded-3xl transition-transform duration-700 transform hover:scale-105 ${isMobile ? "ml-5" : "ml-24" }`}>
        
//             <Image
//               src={FullBoard}
//               alt="Tokenomics Showcase"
//               width={isMobile ? 600 : 1000}
//               height={isMobile ? 600 : 1000}
//               className="rounded-3xl z-20 translate-y-[-7%] mx-auto"
//             />
//             {/* <Image
//               src={Logo}
//               alt="Logo"
//               width={295}
//               height={295}
//               className="absolute top-[15%] left-[52%] translate-x-[-50%] translate-y-[-50%] py-2 mx-auto rounded-full cursor-pointer hover:text-black transition mix-blend-color-burn"
//             />
//             <Image
//               src={BoardText}
//               alt="Overlay Text"
//               width={295}
//               height={295}
//               className="absolute top-[23%] left-[40%] mix-blend-luminosity"
//             />
//             <Image
//               src={SmallBoard}
//               alt="Overlay Text"
//               width={595}
//               height={595}
//               className="absolute top-[50%] left-[20%] mix-blend-luminosity"
//             />
//             <Image
//               src={SmallboardText}
//               alt="Overlay Text"
//               width={295}
//               height={295}
//               className="absolute top-[80%] left-[35%] mix-blend-exclusion"
//             /> */}
//           </div>
//         </motion.div>

//         {/* Descriptive Text with a subtle slide-in */}
//         <motion.p
//           className={`ultra  font-medium max-w-2xl transition-all duration-700  ${isMobile ? "text-sm" : "md:text-2xl z-50" }`}
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
//         >
//           " Redefining Tokenomics with a visionary approach—where art meets technology in a symphony
//           of innovation and creativity. Prepare to have your mind blown and your expectations shattered. "
//         </motion.p>

//         {/* <motion.p
//           className="text-lg md:text-2xl font-medium max-w-2xl transition-all duration-700 "
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
//         >
//           " Redefining Tokenomics with a visionary approach—where art meets technology in a symphony
//           of innovation and creativity. Prepare to have your mind blown and your expectations shattered. "
//         </motion.p> */}
//       </motion.div>
//     </div>
//   );
// }








// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import Image from "next/image";
// import { motion, useAnimation } from "framer-motion";
// import "animate.css";
// import TokenomicsImage from "../../../assets/Images/board3.png";
// import SmallBoard from "../../../assets/Images/smallboard.webp";
// import BoardText from "../../../assets/Images/textboard.png";
// import SmallboardText from "../../../assets/Images/smallboardtext.png";
// import FullBoard from "../../../assets/Images/fullBoard.png";
// import BgTokenicsImage from "../../../assets/Images/tokenomic 1.webp";
// import Logo from "@/assets/Images/logo.jpeg";

// export default function Page() {
//   const sectionRef = useRef<HTMLDivElement>(null);
//   const [isVisible, setIsVisible] = useState(false);
//   const controls = useAnimation();

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           setIsVisible(entry.isIntersecting);
//           if (entry.isIntersecting) controls.start("visible");
//           else controls.start("hidden");
//         });
//       },
//       { threshold: 0.3 }
//     );
//     if (sectionRef.current) observer.observe(sectionRef.current);
//     return () => {
//       if (sectionRef.current) observer.unobserve(sectionRef.current);
//     };
//   }, [controls]);

//   // Container with a stagger effect to let children shine in sequence
//   const containerVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 1, ease: "easeOut", staggerChildren: 0.3 },
//     },
//   };

//   // More playful particle motion with added scale tweaks
//   const particleVariants = {
//     animate: {
//       x: [0, 30, -30, 0],
//       y: [0, -30, 30, 0],
//       scale: [1, 1.2, 1, 0.8, 1],
//       transition: { repeat: Infinity, duration: 8, ease: "easeInOut" },
//     },
//   };

//   return (
//     <div
//       ref={sectionRef}
//       className="relative flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 min-h-screen bg-gradient-to-tr from-purple-900 via-indigo-800 to-blue-900 text-white overflow-hidden"
//     >
//       {/* Background Layer */}
//       <div className="absolute inset-0 z-0">
//         <Image
//           src={BgTokenicsImage}
//           alt="Stunning Background"
//           fill
//           className="object-cover mix-blend-overlay opacity-60"
//           priority
//         />
//         <div className="absolute inset-0 bg-black opacity-20" />
//       </div>

//       {/* Animated Particles */}
//       <motion.div
//         variants={particleVariants}
//         animate="animate"
//         className="absolute inset-0 z-20 pointer-events-none"
//       >
//         <svg
//           className="w-full h-full"
//           viewBox="0 0 800 600"
//           fill="none"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <circle cx="100" cy="100" r="4" fill="#ffffff" opacity="0.7" />
//           <circle cx="400" cy="300" r="3" fill="#ffffff" opacity="0.5" />
//           <circle cx="700" cy="500" r="5" fill="#ffffff" opacity="0.8" />
//           <circle cx="600" cy="150" r="2" fill="#ffffff" opacity="0.6" />
//           <circle cx="200" cy="450" r="4" fill="#ffffff" opacity="0.7" />
//         </svg>
//       </motion.div>

//       {/* Main Content */}
//       <motion.div
//         className="relative z-30 flex flex-col items-center text-center space-y-12 w-full mt-20"
//         variants={containerVariants}
//         initial="hidden"
//         animate={controls}
//       >
//         {/* Title with a shimmering gradient effect */}
//         <motion.h1
//           className="text-3xl md:text-8xl font-extrabold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-purple-400 to-indigo-500 drop-shadow-2xl animate__animated animate__fadeInDown"
//           initial={{ opacity: 0, y: -50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1.2, ease: "easeOut" }}
//         >
//           Tokenomics
//         </motion.h1>

//         {/* Showcase Image with hover lift */}
//         <motion.div
//           className="w-full max-w-[1000px] mx-auto"
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
//         >
//           <div className="relative rounded-3xl transition-transform duration-700 transform hover:scale-105">
        
//             <Image
//               src={TokenomicsImage}
//               alt="Tokenomics Showcase"
//               className="rounded-3xl z-20 translate-y-[-20%] py-2 mx-auto"
//             />
//             <Image
//               src={Logo}
//               alt="Logo"
//               width={295}
//               height={295}
//               className="absolute top-[15%] left-[52%] translate-x-[-50%] translate-y-[-50%] py-2 mx-auto rounded-full cursor-pointer hover:text-black transition mix-blend-color-burn"
//             />
//             <Image
//               src={BoardText}
//               alt="Overlay Text"
//               width={295}
//               height={295}
//               className="absolute top-[23%] left-[40%] mix-blend-luminosity"
//             />
//             <Image
//               src={SmallBoard}
//               alt="Overlay Text"
//               width={595}
//               height={595}
//               className="absolute top-[50%] left-[20%] mix-blend-luminosity"
//             />
//             <Image
//               src={SmallboardText}
//               alt="Overlay Text"
//               width={295}
//               height={295}
//               className="absolute top-[80%] left-[35%] mix-blend-exclusion"
//             />
//           </div>
//         </motion.div>

//         {/* Descriptive Text with a subtle slide-in */}
//         <motion.p
//           className="text-lg md:text-2xl font-medium max-w-2xl transition-all duration-700"
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
//         >
//           Redefining Tokenomics with a visionary approach—where art meets technology in a symphony
//           of innovation and creativity. Prepare to have your mind blown and your expectations shattered.
//         </motion.p>
//       </motion.div>
//     </div>
//   );
// }










// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import Image from "next/image";
// import { motion, useAnimation } from "framer-motion";
// import "animate.css";
// import TokenomicsImage from "../../../assets/Images/board.webp";
// import BoardText from "../../../assets/Images/textboard.png";
// import BgTokenicsImage from "../../../assets/Images/tokenomic 1.webp";

// export default function Page() {
//   const sectionRef = useRef<HTMLDivElement>(null);
//   const [isVisible, setIsVisible] = useState(false);
//   const controls = useAnimation();

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           setIsVisible(entry.isIntersecting);
//           if (entry.isIntersecting) controls.start("visible");
//           else controls.start("hidden");
//         });
//       },
//       { threshold: 0.3 }
//     );
//     if (sectionRef.current) observer.observe(sectionRef.current);
//     return () => {
//       if (sectionRef.current) observer.unobserve(sectionRef.current);
//     };
//   }, [controls]);

//   const containerVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 1, ease: "easeOut" },
//     },
//   };

//   const particleVariants = {
//     animate: {
//       x: [0, 50, -50, 0],
//       y: [0, -50, 50, 0],
//       transition: { repeat: Infinity, duration: 6, ease: "easeInOut" },
//     },
//   };

//   return (
//     <div
//       ref={sectionRef}
//       className="relative flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 min-h-screen bg-gradient-to-tr from-purple-900 via-indigo-800 to-blue-900 text-white overflow-hidden"
//     >
//       <div className="absolute inset-0 z-0">
//         <Image
//           src={BgTokenicsImage}
//           alt="Stunning Background"
//           fill
//           className="object-cover mix-blend-overlay opacity-60"
//           priority
//         />
//         <div className="absolute inset-0 bg-black opacity-20" />
//       </div>
//       <motion.div
//         variants={particleVariants}
//         animate="animate"
//         className="absolute inset-0 z-20 pointer-events-none"
//       >
//         <svg
//           className="w-full h-full"
//           viewBox="0 0 800 600"
//           fill="none"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <circle cx="100" cy="100" r="4" fill="#ffffff" opacity="0.7" />
//           <circle cx="400" cy="300" r="3" fill="#ffffff" opacity="0.5" />
//           <circle cx="700" cy="500" r="5" fill="#ffffff" opacity="0.8" />
//           <circle cx="600" cy="150" r="2" fill="#ffffff" opacity="0.6" />
//           <circle cx="200" cy="450" r="4" fill="#ffffff" opacity="0.7" />
//         </svg>
//       </motion.div>
//       <motion.div
//         className="relative z-30 flex flex-col items-center text-center space-y-12 w-full mt-20"
//         variants={containerVariants}
//         initial="hidden"
//         animate={controls}
//       >
//         <motion.h1
//           className="text-3xl md:text-8xl font-extrabold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-purple-400 to-indigo-500 drop-shadow-2xl transition-all duration-700"
//           initial={{ opacity: 0, y: -50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1.2, ease: "easeOut" }}
//         >
//           Tokenomics
//         </motion.h1>
//         <motion.div
//           className="w-full max-w-[800px] mx-auto"
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
//         >
//           <div className="rounded-3xl transition-transform duration-700 transform hover:scale-105 -mt-16">
//           <Image
//             src={TokenomicsImage}
//             alt="Tokenomics Showcase"
//             className=""
//           />
//           <Image
//             src={BoardText}
//             alt="Tokenomics Showcase"
//             className="top-[55%] left-[35%] absolute z-10  mix-blend-multiply"
//           />
//           </div>

//         </motion.div>
//         <motion.p
//           className="text-lg md:text-2xl font-medium max-w-2xl transition-all duration-700"
//           initial={{ opacity: 0, y: 50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
//         >
//           Redefining Tokenomics with a visionary approach—where art meets technology in a symphony of innovation and creativity.
//           Prepare to have your mind blown and your expectations shattered.
//         </motion.p>
//       </motion.div>
//     </div>
//   );
// }









// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import Image from "next/image";
// import "animate.css";
// import TokenomicsImage from "../../../assets/Images/board.webp";
// import BgTokenicsImage from "../../../assets/Images/DALL·E 2025-02-05 17.43.03 - A seamless website background in landscape orientation with a soft purple and pink gradient. The design features delicate heartbeats, flowers, leaves,.webp";

// export default function Page() {
//   const sectionRef = useRef<HTMLDivElement>(null);
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           setIsVisible(entry.isIntersecting);
//         });
//       },
//       { threshold: 0.3 }
//     );

//     if (sectionRef.current) {
//       observer.observe(sectionRef.current);
//     }

//     return () => {
//       if (sectionRef.current) {
//         observer.unobserve(sectionRef.current);
//       }
//     };
//   }, []);

//   return (
//     <div
//       ref={sectionRef}
//       className="relative flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 bg-gradient-to-tr from-gray-700 to-purple-500 text-white overflow-hidden"
//     >
//       {/* Background Image */}
//       <div className="absolute inset-0 z-0">
//         <Image
//           src={BgTokenicsImage}
//           alt="Background"
//           fill
//           className="object-cover opacity-80"
//           priority
//         />
//       </div>

//       {/* Foreground Content */}
//       <div className="relative z-10 flex flex-col items-center text-center space-y-8 w-full mt-20">
//         {/* Title */}
//         <h1
//           className={`text-2xl md:text-7xl font-extrabold tracking-wide drop-shadow-lg uppercase transition-opacity duration-700 ${
//             isVisible ? "animate__animated animate__fadeInDown" : "opacity-0"
//           }`}
//           key={isVisible ? "visible" : "hidden"} // Force re-render to restart animation
//         >
//           Tokenomics
//         </h1>

//         {/* Foreground Image */}
//         <div className="w-full  max-w-[500px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[900px] flex items-center justify-center">
//           <Image
//             src={TokenomicsImage}
//             alt="Tokenomics"
//             className={`w-full  rounded-lg shadow-lg transition-opacity duration-700 ${
//               isVisible
//                 ? "animate__animated animate__fadeInUp animate__delay-1s"
//                 : "opacity-0"
//             }`}
//             key={isVisible ? "image-visible" : "image-hidden"} // Force re-render
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
