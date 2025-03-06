"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import RoadmapImage from "../../../assets/Images/DALL·E 2025-02-05 08.37.35 - A peaceful and ethereal landscape scene featuring small purple and pink flowers placed in the corner of the image. A soft glowing heartbeat pulse is s.webp";
import Watch1 from "../../../assets/Images/watch1.png";
import Watch2 from "../../../assets/Images/watch3.png";
import Watch3 from "../../../assets/Images/watch1.png";
import Watch4 from "../../../assets/Images/watch4.png";

const phases = [
  {
    title: "Brainstorming and Project Preparation",
    description:
      "Preparing the foundation for HeartBitcoin, including initial ideas and feasibility analysis.",
    quarter: "Q1 2024",
    image: Watch1,
  },
  {
    title: "Development Phase",
    description:
      "Launching MVPs, smart contracts, and other technical milestones for HeartBitcoin.",
    quarter: "Q2 2024",
    image: Watch2,
  },
  {
    title: "Presale and Token Launch",
    description:
      "Introducing HeartBitcoin to early investors and launching the token.",
    quarter: "Q3 2024",
    image: Watch3,
  },
  {
    title: "Expansion and Community Building",
    description:
      "Building partnerships and fostering a global community around HeartBitcoin.",
    quarter: "Q3-Q4 2024",
    image: Watch4,
  },
  {
    title: "2025: Expansion and New Opportunities",
    description:
      "Exploring new innovations and opportunities to expand HeartBitcoin's ecosystem.",
    quarter: "2025",
    image: Watch1,
  },
];

export default function Roadmap() {
  const [headingRef, headingInView] = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  return (
    <div className="overflow-x-hidden relative min-h-screen py-16 flex flex-col items-center justify-center bg-gradient-to-tr from-gray-500 to-purple-500 text-white overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={RoadmapImage}
          alt="Background"
          fill
          className="object-cover opacity-40"
        />
      </div>

      {/* Heading with Animation */}
      <motion.div
        ref={headingRef}
        className="relative z-10 text-center mb-10 px-4"
        initial={{ opacity: 0, y: -50 }}
        animate={headingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-3xl md:text-7xl font-extrabold tracking-wide text-yellow-50 drop-shadow-lg uppercase">
          Roadmap
        </h1>
        <p className="text-base md:text-xl text-purple-200 mt-2">
          A detailed journey of HeartBitcoin's progress and milestones.
        </p>
      </motion.div>

      {/* Timeline Content */}
      <div className="relative max-w-7xl w-full z-10 px-4 sm:px-8">
        {phases.map((phase, index) => {
          const [ref, inView] = useInView({
            threshold: 0.2,
            triggerOnce: false,
          });

          return (
            <motion.div
              ref={ref}
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`mb-12 flex flex-col md:flex-row ${
                index % 2 === 0 ? "md:flex-row-reverse" : ""
              } items-center justify-between gap-6 md:gap-12`}
            >
              {/* Text Section */}
              <motion.div
                className="bg-gradient-to-br from-purple-500/30 to-purple-700/30 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-lg w-full md:w-2/3 text-center md:text-left"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg sm:text-3xl font-bold mb-3">
                  {phase.title}
                </h2>
                <p className="text-base sm:text-lg mb-4">{phase.description}</p>
                <span className="text-sm sm:text-base font-bold bg-purple-800 py-1 px-3 sm:px-4 rounded-full inline-block">
                  {phase.quarter}
                </span>
              </motion.div>

              {/* Image Section */}
              <motion.div
                className="flex justify-center w-full md:w-1/3"
                initial={{ scale: 0.8 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Image
                  src={phase.image}
                  alt={phase.title}
                  className=" hover:scale-110 transition-transform"
                  width={500}
                  height={500}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
