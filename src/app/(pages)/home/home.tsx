"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { useIsMobile } from "@/hooks/useIsMobile"; // adjust the path as needed
import { CgShapeZigzag } from "react-icons/cg";
import S_Image from "../../../assets/Images/S.png";
import BgLandingImage from "../../../assets/Images/Bg landing page1.webp";
import "animate.css";

interface Position {
  top: string;
  left: string;
}

export default function Home() {
  const [positions, setPositions] = useState<Position[]>([]);
  const controls = useAnimation();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Adjust the number of zigzags based on screen size for a lighter mobile experience
    const count = isMobile ? 5 : 10;
    const generatePositions = () => {
      return Array.from({ length: count }, () => ({
        top: `${Math.random() * 90}vh`,
        left: `${Math.random() * 90}vw`,
      }));
    };

    setPositions(generatePositions());
    controls.start({
      opacity: [0.6, 1, 0.6],
      y: [0, 10, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
      },
    });
  }, [controls, isMobile]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-gradient-to-tr from-gray-700 to-purple-500 ${
        isMobile ? "h-[140vh]" : "h-[140vh]"
      }`}
    >
      {/* Background Image */}
      <Image
        src={BgLandingImage}
        alt="Background"
        fill
        className="object-cover opacity-40"
      />

      {/* Foreground content */}
      <div
        className={`relative z-10 flex flex-col px-4 text-center ${
          isMobile ? "mt-32" : "mt-56"
        }`}
      >
        <div
          className={`flex flex-wrap items-center justify-center gap-4 ${
            isMobile ? "mr-0" : "md:mr-12"
          }`}
        >
          <motion.h1
            className={`tracking-widest font-black text-white/80 font-nunito uppercase animate__animated animate__fadeIn ${
              isMobile ? "text-5xl" : "md:text-9xl "
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            Wu
            <span
              className="relative inline-block align-middle z-50"
              style={{
                width: isMobile ? "60px" : "145px",
                height: isMobile ? "60px" : "145px",
              }}
            >
              <Image src={S_Image} alt="S" fill className="object-contain" />
            </span>
            le
          </motion.h1>
        </div>
      </div>

      {/* Zigzag blockchain visualizations */}
      {positions.map((pos, index) => (
        <motion.div
          key={`zigzag-${index}`}
          className="absolute text-white opacity-70"
          style={{
            top: `calc(${pos.top} + ${isMobile ? "30px" : "50px"})`,
            left: `calc(${pos.left} + ${isMobile ? "30px" : "50px"})`,
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 10, repeat: Infinity }}
        >
          <CgShapeZigzag size={isMobile ? 24 : 36} />
        </motion.div>
      ))}
    </div>
  );
}










// "use client";

// import React, { useEffect, useState } from "react";
// import { motion, useAnimation } from "framer-motion";
// import Image from "next/image";
// import { CgShapeZigzag } from "react-icons/cg";
// import S_Image from "../../../assets/Images/S.png";
// import BgLandingImage from "../../../assets/Images/Bg landing page1.webp";

// interface Position {
//   top: string;
//   left: string;
// }

// export default function Home() {
//   const [positions, setPositions] = useState<Position[]>([]);
//   const controls = useAnimation();

//   useEffect(() => {
//     const generatePositions = () => {
//       return Array.from({ length: 10 }, () => ({
//         top: `${Math.random() * 90}vh`,
//         left: `${Math.random() * 90}vw`,
//       }));
//     };

//     setPositions(generatePositions());
//     controls.start({
//       opacity: [0.6, 1, 0.6],
//       y: [0, 10, 0],
//       transition: {
//         duration: 5,
//         repeat: Infinity,
//         repeatType: "reverse",
//       },
//     });
//   }, [controls]);

//   return (
//     <div className="absolute inset-0 overflow-hidden bg-gradient-to-tr from-gray-700 to-purple-500 h-[150vh]">

//       {/* Background Image */}
//       <Image
//         src={BgLandingImage}
//         alt="Background"
//         fill
//         className="object-cover opacity-40"
//       />

//       {/* Foreground content */}
//       <div
//         className="relative z-10 flex flex-col items-center justify-center text-center px-4 -ml-8 my-8"
//         style={{ marginTop: "clamp(8rem, 8vw, 5rem)" }}
//       >
//         <motion.h1
//           className="tracking-widest font-black text-white/80 font-nunito uppercase"
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 1 }}
//           style={{ fontSize: "clamp(2rem, 8vw, 6rem)" }}
//         >
//           Wu
//           <span
//             className="relative inline-block"
//             style={{
//               width: "clamp(2rem, 12vw, 8rem)",
//               height: "clamp(2rem, 12vw, 8rem)",
//             }}
//           >
//             <Image src={S_Image} alt="S" fill className="object-contain "
//             style={{ marginTop: "clamp(0rem, 8vw, 1rem)" }}
//             />
//           </span>
//           le
//         </motion.h1>
//       </div>

//       {/* Zigzag blockchain visualizations */}
//       {positions.map((pos, index) => (
//         <motion.div
//           key={`zigzag-${index}`}
//           className="absolute text-white opacity-70"
//           style={{
//             top: `calc(${pos.top} + 50px)`,
//             left: `calc(${pos.left} + 50px)`,
//           }}
//           animate={{ rotate: [0, 360] }}
//           transition={{ duration: 10, repeat: Infinity }}
//         >
//           <CgShapeZigzag size={36} />
//         </motion.div>
//       ))}
//     </div>
//   );
// }












// "use client";

// import React, { useEffect, useState } from "react";
// import { motion, useAnimation } from "framer-motion";
// import Image from "next/image";
// import AnimatedHeart from "@/components/ui/animated-heart";
// import { CgShapeZigzag } from "react-icons/cg";
// import Heartegg from "../../../assets/Images/heart egg.png";
// import S_Image from "../../../assets/Images/S.png";
// import BgLandingImage from "../../../assets/Images/Bg landing page1.webp";
// import "animate.css";

// interface Position {
//   top: string;
//   left: string;
// }

// export default function Home() {
//   const [positions, setPositions] = useState<Position[]>([]);
//   const controls = useAnimation();

//   useEffect(() => {
//     const generatePositions = () => {
//       return Array.from({ length: 10 }, () => ({
//         top: `${Math.random() * 90}vh`,
//         left: `${Math.random() * 90}vw`,
//       }));
//     };

//     setPositions(generatePositions());
//     controls.start({
//       opacity: [0.6, 1, 0.6],
//       y: [0, 10, 0],
//       transition: {
//         duration: 5,
//         repeat: Infinity,
//         repeatType: "reverse",
//       },
//     });
//   }, [controls]);

//   return (
//     <div className="absolute md:h-screen h-[140vh] inset-0 overflow-hidden bg-gradient-to-tr from-gray-700 to-purple-500">
//       {/* Background Image */}
//       <Image
//         src={BgLandingImage}
//         alt="Background"
//         fill
//         className="object-cover opacity-40"
//       />

//       {/* Foreground content */}
//       <div className="overflow-x-hidden relative z-10 flex flex-col h-full px-4 text-center  md:mt-36 mt-36 md:-mr-15 mr-0">
//         <div className="flex flex-wrap items-center justify-center gap-4  md:mr-12 mr-0">
//           <motion.h1
//             className="text-7xl  tracking-widest font-black text-white/80 font-nunito md:text-8xl  uppercase animate__animated animate__fadeIn"
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 1 }}
//           >
//             Wu
//             <span className="relative inline-block md:size-36 size-32 align-middle z-50">
//               <Image src={S_Image} alt="S" fill className="object-contain" />
//             </span>
//             le
//           </motion.h1>
//         </div>

//         {/* <div className="relative -mt-24">
//           <AnimatedHeart />
//         </div> */}
//       </div>

//       {/* Zigzag blockchain visualizations */}
//       {positions.map((pos, index) => (
//         <motion.div
//           key={`zigzag-${index}`}
//           className="absolute text-white opacity-70"
//           style={{
//             top: `calc(${pos.top} + 50px)`,
//             left: `calc(${pos.left} + 50px)`,
//           }}
//           animate={{
//             rotate: [0, 360],
//           }}
//           transition={{
//             duration: 10,
//             repeat: Infinity,
//           }}
//         >
//           <CgShapeZigzag size={36} />
//         </motion.div>
//       ))}
//     </div>
//   );
// }
