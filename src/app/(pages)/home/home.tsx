"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import AnimatedHeart from "@/components/ui/animated-heart";
import { CgShapeZigzag } from "react-icons/cg";
import Heartegg from "../../../assets/Images/heart egg.png";
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

  useEffect(() => {
    const generatePositions = () => {
      return Array.from({ length: 10 }, () => ({
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
  }, [controls]);

  return (
    <div className="absolute md:h-screen h-[140vh] inset-0 overflow-hidden bg-gradient-to-tr from-gray-700 to-purple-500">
      {/* Background Image */}
      <Image
        src={BgLandingImage}
        alt="Background"
        fill
        className="object-cover opacity-40"
      />

      {/* Foreground content */}
      <div className="overflow-x-hidden relative z-10 flex flex-col h-full px-4 text-center  md:mt-36 mt-36 md:-mr-15 mr-0">
        <div className="flex flex-wrap items-center justify-center gap-4  md:mr-12 mr-0">
          <motion.h1
            className="text-7xl  tracking-widest font-black text-white/80 font-nunito md:text-8xl  uppercase animate__animated animate__fadeIn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            Wu
            <span className="relative inline-block md:size-36 size-32 align-middle z-50">
              <Image src={S_Image} alt="S" fill className="object-contain" />
            </span>
            le
          </motion.h1>
        </div>

        {/* <div className="relative -mt-24">
          <AnimatedHeart />
        </div> */}
      </div>

      {/* Zigzag blockchain visualizations */}
      {positions.map((pos, index) => (
        <motion.div
          key={`zigzag-${index}`}
          className="absolute text-white opacity-70"
          style={{
            top: `calc(${pos.top} + 50px)`,
            left: `calc(${pos.left} + 50px)`,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
        >
          <CgShapeZigzag size={36} />
        </motion.div>
      ))}
    </div>
  );
}
