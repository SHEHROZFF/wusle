"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import RoadmapImage from "../../../assets/Images/hospital.webp";

// Roadmap Phases
const phases = [
  {
    title: "Brainstorming & Project Preparation",
    quarter: "Q1 2024",
    description: (
      <p>
        Laying down the bold foundation for Wusle Coin with visionary ideas and in-depth feasibility analysis. This phase establishes the groundwork for innovation, setting the stage for scalable growth and future-proof tech integration.
      </p>
    ),
  },
  {
    title: "Development Phase",
    quarter: "Q2 2024",
    description: (
      <div className="space-y-2">
        <p>Deploying MVPs, smart contracts, and technical milestones.</p>
        <p>
          Extensive testing and validation cycles ensure robustness. We're crafting a decentralized solution that redefines usability and performance in the crypto space.
        </p>
      </div>
    ),
  },
  {
    title: "Presale & Coin Launch",
    quarter: "Q3 2024",
    description: (
      <p>
        Introducing Wusle Coin to early adopters. Our presale and launch event aim to set new standards in crypto community engagement and value delivery.
      </p>
    ),
  },
  {
    title: "Expansion & Community Building",
    quarter: "Q3–Q4 2024",
    description: (
      <p>
        Strategic partnerships, global community cultivation, and real-world use-case development are core to this phase. We're fueling adoption and network effects.
      </p>
    ),
  },
  {
    title: "2025: Global Expansion & New Horizons",
    quarter: "2025",
    description: (
      <div className="space-y-2">
        <p>
          <strong>Launching V2:</strong> The presale was just the start! Our focus shifts to long-term growth and record-breaking milestones. On January 10th, we release our official trailer, offering a cinematic glimpse into Wusle Coin’s future.
        </p>
        <p>
          <strong>Community Engagement:</strong> Launching <em>wusle.social</em>, empowering the community to shape growth. February kicks off with major contests and massive rewards.
        </p>
        <p>
          <strong>Lore Expansion:</strong> Debuting a 2D animated series to deepen the Wusle narrative and engagement.
        </p>
        <p>
          <strong>DEX Listings & NFTs:</strong> Listing on Raydium, DEXTools, CMC, CoinGecko with secured liquidity. NFT collection of 222 unique pieces launches Feb 22.
        </p>
      </div>
    ),
  },
];

export default function Roadmap() {
  const [headingRef, headingInView] = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  return (
    <div className="overflow-x-hidden relative min-h-screen py-20 flex flex-col items-center justify-center text-white">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={RoadmapImage}
          alt="Background"
          fill
          className="object-cover object-center mix-blend-multiply opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-black opacity-30" />
      </div>

      {/* Heading */}
      <motion.div
        ref={headingRef}
        className="relative z-10 text-center mb-16 px-4"
        initial={{ opacity: 0, y: -50 }}
        animate={headingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <h1 className="roadmap-heading text-4xl md:text-8xl">Roadmap</h1>
        <p className="fontFamily text-lg md:text-2xl mt-4">
          Witness the evolution of Wusle Coin — where vision meets innovation.
        </p>
      </motion.div>

      {/* Timeline Cards */}
      <div className="relative max-w-7xl w-full z-10 px-4 sm:px-8">
        {phases.map((phase, index) => {
          const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: false });
          const isEven = index % 2 === 0;

          return (
            <motion.div
              ref={ref}
              key={index}
              initial={{ opacity: 0, x: isEven ? -150 : 150 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`mb-16 flex flex-col md:flex-row items-center  ${
                isEven ? "" : "md:flex-row-reverse"
              }`}
            >
              {/* Text Card */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="custom-card w-full md:w-1/2 py-10 px-8"
              >
                <h2 className="fontFamily text-3xl md:text-4xl mb-4">
                  {phase.title} <span className="text-3xl">[{phase.quarter}]</span>
                </h2>
                <div className="fontFamilyText text-lg sm:text-base leading-relaxed space-y-2">
                  {phase.description}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}









// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import { useInView } from "react-intersection-observer";
// import Image from "next/image";
// import RoadmapImage from "../../../assets/Images/roadmap4.webp";
// import Watch1 from "../../../assets/Images/watch1.png";
// import Watch2 from "../../../assets/Images/watch3.png";
// import Watch3 from "../../../assets/Images/watch1.png";
// import Watch4 from "../../../assets/Images/watch4.png";

// const phases = [
//   {
//     title: "Brainstorming & Project Preparation",
//     description: "Laying down the bold foundation for Wusle Coin with visionary ideas and in-depth feasibility analysis.Laying down the bold foundation for Wusle Coin with visionary ideas and in-depth feasibility analysis.Laying down the bold foundation for Wusle Coin with visionary ideas and in-depth feasibility analysis.Laying down the bold foundation for Wusle Coin with visionary ideas and in-depth feasibility analysis.Laying down the bold foundation for Wusle Coin with visionary ideas and in-depth feasibility analysis.Laying down the bold foundation for Wusle Coin with visionary ideas and in-depth feasibility analysis.Laying down the bold foundation for Wusle Coin with visionary ideas and in-depth feasibility analysis.Laying down the bold foundation for Wusle Coin with visionary ideas and in-depth feasibility analysis.",
//     quarter: "Q1 2024",
//     image: Watch1,
//   },
//   {
//     title: "Development Phase",
//     description: "Deploying MVPs, smart contracts, and setting technical milestones that break the mold.Laying down the bold foundation for Wusle Coin with visionary ideas and in-depth feasibility analysis.Laying down the bold foundation for Wusle Coin with visionary ideas and in-depth feasibility analysis.Laying down the bold foundation for Wusle Coin with visionary ideas and in-depth feasibility analysis.Laying down the bold foundation for Wusle Coin with visionary ideas and in-depth feasibility analysis.Laying down the bold foundation for Wusle Coin with visionary ideas and in-depth feasibility analysis."
//     ,
//     quarter: "Q2 2024",
//     image: Watch2,
//   },
//   {
//     title: "Presale & Coin Launch",
//     description: "Introducing Wusle Coin to early adopters with a launch event that redefines the crypto space.",
//     quarter: "Q3 2024",
//     image: Watch3,
//   },
//   {
//     title: "Expansion & Community Building",
//     description: "Forging strategic partnerships and cultivating a global, thriving community around Wusle Coin.",
//     quarter: "Q3-Q4 2024",
//     image: Watch4,
//   },
//   {
//     title: "2025: Global Expansion & New Horizons",
//     description: "Innovating and expanding the ecosystem into uncharted territories—pushing beyond imagination.",
//     quarter: "2025",
//     image: Watch1,
//   },
// ];

// export default function Roadmap() {
//   const [headingRef, headingInView] = useInView({
//     threshold: 0.5,
//     triggerOnce: false,
//   });

//   return (
//     <div className="overflow-x-hidden relative min-h-screen py-20 flex flex-col items-center justify-center mix-blend-multiply text-white">
//       {/* Background Image */}
//       <div className="absolute inset-0 z-0">
//         <Image
//           src={RoadmapImage}
//           alt="Background"
//           fill
//           className="object-cover object-center mix-blend-multiply opacity-80"
//         />
//         <div className="absolute inset-0 bg-black opacity-30" />
//       </div>

//       {/* Heading */}
//       <motion.div
//         ref={headingRef}
//         className="relative z-10 text-center mb-16 px-4"
//         initial={{ opacity: 0, y: -50 }}
//         animate={headingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
//         transition={{ duration: 1, ease: "easeOut" }}
//       >
//         <h1 className="roadmap-heading text-4xl md:text-8xl">Roadmap</h1>
//         <p className="fontFamily text-lg md:text-2xl mt-4">
//           Witness the evolution of Wusle Coin — where vision meets innovation.
//         </p>
//       </motion.div>

//       {/* Timeline */}
//       <div className="relative max-w-7xl w-full z-10 px-4 sm:px-8">
//         {phases.map((phase, index) => {
//           const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: false });
//           const isEven = index % 2 === 0;

//           return (
//             <motion.div
//               ref={ref}
//               key={index}
//               initial={{ opacity: 0, x: isEven ? -150 : 150 }}
//               animate={inView ? { opacity: 1, x: 0 } : {}}
//               transition={{ duration: 1, ease: "easeOut" }}
//               className={`mb-16 flex flex-col md:flex-row items-center  ${
//                 isEven ? "" : "md:flex-row-reverse"
//               }`}
//             >
//               {/* Text Card */}
//               <motion.div
//                 whileHover={{ scale: 1.05 }}
//                 transition={{ duration: 0.3 }}
//                 className="custom-card md:w-2/5 py-20 px-10"
//               >
//                 <h2 className="fontFamily text-4xl mb-4">{phase.title} [{phase.quarter}]</h2>
//                 <p className="fontFamily">{phase.description}</p>
//                 {/* <span className="fontFamily">{phase.quarter}</span> */}
//               </motion.div>

//               {/* Image */}
//               <motion.div
//                 initial={{ scale: 0.8 }}
//                 animate={inView ? { scale: 1 } : {}}
//                 transition={{ duration: 1, ease: "easeOut" }}
//                 className="flex justify-center w-full md:w-3/5"
//               >
//                 {/* <Image
//                   src={phase.image}
//                   alt={phase.title}
//                   className="rounded-full shadow-md transition-transform hover:scale-110"
//                   width={300}
//                   height={300}
//                 /> */}
//               </motion.div>
//             </motion.div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }









// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import { useInView } from "react-intersection-observer";
// import Image from "next/image";
// import RoadmapImage from "../../../assets/Images/roadmap4.webp";
// import Watch1 from "../../../assets/Images/watch1.png";
// import Watch2 from "../../../assets/Images/watch3.png";
// import Watch3 from "../../../assets/Images/watch1.png";
// import Watch4 from "../../../assets/Images/watch4.png";
// import { useIsMobile } from "@/hooks/useIsMobile";
// import { useIsWide } from "@/hooks/useIsWide";

// const phases = [
//   {
//     title: "Brainstorming & Project Preparation",
//     description:
//       "Laying down the bold foundation for Wusle Coin with visionary ideas and in-depth feasibility analysis.",
//     quarter: "Q1 2024",
//     image: Watch1,
//   },
//   {
//     title: "Development Phase",
//     description:
//       "Deploying MVPs, smart contracts, and setting technical milestones that break the mold.",
//     quarter: "Q2 2024",
//     image: Watch2,
//   },
//   {
//     title: "Presale & Coin Launch",
//     description:
//       "Introducing Wusle Coin to early adopters with a launch event that redefines the crypto space.",
//     quarter: "Q3 2024",
//     image: Watch3,
//   },
//   {
//     title: "Expansion & Community Building",
//     description:
//       "Forging strategic partnerships and cultivating a global, thriving community around Wusle Coin.",
//     quarter: "Q3-Q4 2024",
//     image: Watch4,
//   },
//   {
//     title: "2025: Global Expansion & New Horizons",
//     description:
//       "Innovating and expanding the ecosystem into uncharted territories—pushing beyond imagination.",
//     quarter: "2025",
//     image: Watch1,
//   },
// ];

// export default function Roadmap() {
//   const [headingRef, headingInView] = useInView({
//     threshold: 0.5,
//     triggerOnce: false,
//   });

//   return (
//     <div className="overflow-x-hidden relative min-h-screen py-20 flex flex-col items-center justify-center mix-blend-multiply text-white">
//       {/* Background Image with Enhanced Overlay */}
//       <div className="absolute inset-0 z-0">
//         <Image
//           src={RoadmapImage}
//           alt="Background"
//           fill
//           className="object-cover object-center mix-blend-multiply opacity-80"
//         />
//         <div className="absolute inset-0 bg-black opacity-30" />
//       </div>

//       {/* Animated Heading with Gradient Text */}
//       <motion.div
//         ref={headingRef}
//         className="relative z-10 text-center mb-16 px-4"
//         initial={{ opacity: 0, y: -50 }}
//         animate={headingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
//         transition={{ duration: 1, ease: "easeOut" }}
//       >
//         <h1 className="roadmap-heading text-4xl md:text-8xl ">
//           Roadmap
//         </h1>
//         <p className="fontFamily text-lg md:text-2xl  mt-4">
//           Witness the evolution of Wusle Coin — where vision meets innovation.
//         </p>
//       </motion.div>

//       {/* Timeline Content */}
//       <div className="relative max-w-7xl w-full z-10 px-4 sm:px-8">
//         {phases.map((phase, index) => {
//           const [ref, inView] = useInView({
//             threshold: 0.2,
//             triggerOnce: false,
//           });

//           return (
//             <motion.div
//               ref={ref}
//               key={index}
//               initial={{ opacity: 0, x: index % 2 === 0 ? -150 : 150 }}
//               animate={inView ? { opacity: 1, x: 0 } : {}}
//               transition={{ duration: 1, ease: "easeOut" }}
//               className={`mb-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 ${
//                 index % 2 === 0 ? "md:flex-row-reverse" : ""
//               }`}
//             >
//               {/* Text Card */}
//               {/* <motion.div
//                 whileHover={{ scale: 1.05 }}
//                 transition={{ duration: 0.3 }}
//                 className="bg-gradient-to-br from-purple-600/40 to-purple-900/70 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full md:w-2/3 border border-white/20"
//               >
//                 <h2 className="text-2xl sm:text-4xl font-bold mb-4 drop-shadow-md">
//                   {phase.title}
//                 </h2>
//                 <p className="text-base sm:text-lg mb-6 leading-relaxed">
//                   {phase.description}
//                 </p>
//                 <span className="inline-block text-sm sm:text-base font-bold bg-purple-800/70 py-2 px-4 rounded-full">
//                   {phase.quarter}
//                 </span>
//               </motion.div> */}
//               <motion.div
//                 whileHover={{ scale: 1.05 }}
//                 transition={{ duration: 0.3 }}
//                 className="custom-card"
//               >
//                 <h2 className="custom-card-heading">
//                   {phase.title}
//                 </h2>
//                 <p className="custom-card-text">
//                   {phase.description}
//                 </p>
//                 <span className="custom-card-quarter">
//                   {phase.quarter}
//                 </span>
//               </motion.div>


//               {/* Image */}
//               {/* <motion.div
//                 initial={{ scale: 0.8 }}
//                 animate={inView ? { scale: 1 } : {}}
//                 transition={{ duration: 1, ease: "easeOut" }}
//                 className="flex justify-center w-full md:w-1/3"
//               >
//                 <Image
//                   src={phase.image}
//                   alt={phase.title}
//                   className="rounded-full shadow-md transition-transform hover:scale-110"
//                   width={500}
//                   height={500}
//                 />
//               </motion.div> */}
//             </motion.div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
