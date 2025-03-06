"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import "animate.css";
import TokenomicsImage from "../../../assets/Images/Group 1 (1).png";
import BgTokenicsImage from "../../../assets/Images/DALL·E 2025-02-05 17.43.03 - A seamless website background in landscape orientation with a soft purple and pink gradient. The design features delicate heartbeats, flowers, leaves,.webp";

export default function Page() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 bg-gradient-to-tr from-gray-700 to-purple-500 text-white overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={BgTokenicsImage}
          alt="Background"
          fill
          className="object-cover opacity-10"
          priority
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-8 w-full mt-20">
        {/* Title */}
        <h1
          className={`text-2xl md:text-7xl font-extrabold tracking-wide drop-shadow-lg uppercase transition-opacity duration-700 ${
            isVisible ? "animate__animated animate__fadeInDown" : "opacity-0"
          }`}
          key={isVisible ? "visible" : "hidden"} // Force re-render to restart animation
        >
          Tokenomics
        </h1>

        {/* Foreground Image */}
        <div className="w-full  max-w-[500px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[900px] flex items-center justify-center">
          <Image
            src={TokenomicsImage}
            alt="Tokenomics"
            className={`w-full  rounded-lg shadow-lg transition-opacity duration-700 ${
              isVisible
                ? "animate__animated animate__fadeInUp animate__delay-1s"
                : "opacity-0"
            }`}
            key={isVisible ? "image-visible" : "image-hidden"} // Force re-render
          />
        </div>
      </div>
    </div>
  );
}
