// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import { useInView } from "react-intersection-observer";
// import Image from "next/image";
// import RoadmapImage from "../../../assets/Images/hospital.webp";

// // Roadmap Phases
// const phases = [
//   {
//     title: "Brainstorming & Project Preparation",
//     quarter: "Q1 2024",
//     description: (
//       <p>
//         Laying down the bold foundation for Wusle Coin with visionary ideas and in-depth feasibility analysis. This phase establishes the groundwork for innovation, setting the stage for scalable growth and future-proof tech integration.
//       </p>
//     ),
//   },
//   {
//     title: "Development Phase",
//     quarter: "Q2 2024",
//     description: (
//       <div className="space-y-2">
//         <p>Deploying MVPs, smart contracts, and technical milestones.</p>
//         <p>
//           Extensive testing and validation cycles ensure robustness. We're crafting a decentralized solution that redefines usability and performance in the crypto space.
//         </p>
//       </div>
//     ),
//   },
//   {
//     title: "Presale & Coin Launch",
//     quarter: "Q3 2024",
//     description: (
//       <p>
//         Introducing Wusle Coin to early adopters. Our presale and launch event aim to set new standards in crypto community engagement and value delivery.
//       </p>
//     ),
//   },
//   {
//     title: "Expansion & Community Building",
//     quarter: "Q3–Q4 2024",
//     description: (
//       <p>
//         Strategic partnerships, global community cultivation, and real-world use-case development are core to this phase. We're fueling adoption and network effects.
//       </p>
//     ),
//   },
//   {
//     title: "2025: Global Expansion & New Horizons",
//     quarter: "2025",
//     description: (
//       <div className="space-y-2">
//         <p>
//           <strong>Launching V2:</strong> The presale was just the start! Our focus shifts to long-term growth and record-breaking milestones. On January 10th, we release our official trailer, offering a cinematic glimpse into Wusle Coin’s future.
//         </p>
//         <p>
//           <strong>Community Engagement:</strong> Launching <em>wusle.social</em>, empowering the community to shape growth. February kicks off with major contests and massive rewards.
//         </p>
//         <p>
//           <strong>Lore Expansion:</strong> Debuting a 2D animated series to deepen the Wusle narrative and engagement.
//         </p>
//         <p>
//           <strong>DEX Listings & NFTs:</strong> Listing on Raydium, DEXTools, CMC, CoinGecko with secured liquidity. NFT collection of 222 unique pieces launches Feb 22.
//         </p>
//       </div>
//     ),
//   },
// ];

// export default function Roadmap() {
//   const [headingRef, headingInView] = useInView({
//     threshold: 0.5,
//     triggerOnce: false,
//   });

//   return (
//     <div className="overflow-x-hidden relative min-h-screen py-20 flex flex-col items-center justify-center text-white">
//       {/* Background Image with Overlay */}
//       <div className="absolute inset-0 z-0">
//         <Image
//           src={RoadmapImage}
//           alt="Background"
//           fill
//           className="object-cover object-center mix-blend-multiply opacity-80"
//           priority
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

//       {/* Timeline Cards */}
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
//                 className="custom-card w-full md:w-1/2 py-10 px-8"
//               >
//                 <h2 className="fontFamily text-3xl md:text-4xl mb-4">
//                   {phase.title} <span className="text-3xl">[{phase.quarter}]</span>
//                 </h2>
//                 <div className="fontFamilyText text-lg sm:text-base leading-relaxed space-y-2">
//                   {phase.description}
//                 </div>
//               </motion.div>
//             </motion.div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }





"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image, { StaticImageData } from "next/image";
import RoadmapImage from "../../../assets/Images/DALL·E 2025-02-05 08.37.35 - A peaceful and ethereal landscape scene featuring small purple and pink flowers placed in the corner of the image. A soft glowing heartbeat pulse is s.webp";
import Watch1 from "../../../assets/Images/watch1.png";
import Watch2 from "../../../assets/Images/watch2.png";
import Watch3 from "../../../assets/Images/watch3.png";
import Watch5 from "../../../assets/Images/watch5.png";

interface Phase {
  title: string;
  description: string;
  quarter: string;
  image: StaticImageData;
}

const phases: Phase[] = [
  {
    title: "Events, Listings & Community Engagement",
    description: `Launching V2: Official cinematic trailer release in May, 2025, showcasing $WUSLE’s future.
Community Engagement: Launching wusle.social, a platform for community-driven growth, with a major contest offering big rewards.
Expanding the $WUSLE Story: Debut of a 2D animated short series, introducing $WUSLE’s vision and impact.
DEX Listings Launch: Listings on Raydium, DEXTools, CoinMarketCap, and CoinGecko.`,
    quarter: "May 2025",
    image: Watch2,
  },
  {
    title: "Entering the Global Stage",
    description: `Tier 1 CEX Listing #1: First major exchange listing for global exposure and credibility.
Tier 1 CEX Listing #2: Second high-profile exchange listing, expanding investor reach.
Community Contest #2: Rewarding top contributors and most active users with exclusive $WUSLE incentives.
Marketing Expansion: Large-scale digital campaigns, influencer collaborations, and strategic partnerships to drive global awareness.`,
    quarter: "Q2 2025",
    image: Watch1,
  },
  {
    title: "Real-World Use Cases & Blockchain Growth",
    description: `Launching the $WUSLE Blockchain: Custom blockchain launch for enhanced scalability, security, and efficiency.
Expanding the Ecosystem: Partnerships with fitness brands, wellness platforms, and blockchain projects.
Binance Listing: Application for Binance listing, targeting one of the largest exchanges worldwide.`,
    quarter: "Q3 2025",
    image: Watch3,
  },
  {
    title: "Establishing & Strengthening Brand Presence",
    description: `$WUSLE Mobile App & Game: Launching an interactive fitness app and blockchain-integrated game with rewards for activity.
Exclusive Merchandise: Introducing fitness gear, wearables, and collectibles to boost brand loyalty.
Real-World Partnerships: Collaborating with global fitness chains, wellness influencers, and health organizations for wider adoption.`,
    quarter: "Q4 2025",
    image: Watch5,
  },
  {
    title: "Expansion & Future Innovations",
    description: `Airdrops for Holders: Exclusive rewards for $WUSLE Coin holders to increase engagement.
Further Expansion: Continuous growth through new partnerships, feature integrations, and blockchain advancements.`,
    quarter: "2026",
    image: Watch1,
  },
];

export default function Roadmap(): React.ReactElement {
  const [headingRef, headingInView] = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  // Function to render subheading lines in description
  const renderDescription = (description: string): React.ReactElement[] => {
    return description.split("\n").map((line, idx) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1) {
        const subheading = line.slice(0, colonIndex);
        const detail = line.slice(colonIndex + 1);
        return (
          <div key={idx} className="mb-2">
            <span className="font-bold   text-white px-2 py-1 rounded-md shadow mr-2">
              {subheading}:
            </span>
            <span>{detail.trim()}</span>
          </div>
        );
      }
      return (
        <div key={idx} className="mb-2">
          {line}
        </div>
      );
    });
  };

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
          A detailed journey of $WUSLE’s progress and milestones.
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
                <div className="text-base sm:text-lg mb-4">
                  {renderDescription(phase.description)}
                </div>
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
                  className="hover:scale-110 transition-transform"
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
