"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

import FooterBg from "../../../assets/Images/earth.webp";
import Doc from "../../../assets/Images/docfloat.png";
import animationData from "../../../assets/Images/Faq.json";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useIsWide } from "@/hooks/useIsWide";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "WHAT IS WUSLE?",
    answer:
      "WUSLE is a revolutionary platform designed to bring innovation to the cryptocurrency space.",
  },
  {
    question: "WHY WUSLE?",
    answer:
      "You can buy Coins through our platform using supported cryptocurrencies or fiat methods.",
  },
  {
    question: "HOW CAN I GET NFT?",
    answer:
      "Yes, we use state-of-the-art encryption to ensure your data and transactions are always safe.",
  },
  {
    question: "HOW DO I GET WUSLE?",
    answer:
      "Yes, we use state-of-the-art encryption to ensure your data and transactions are always safe.",
  },
  {
    question: "WHO DO I CONTACT?",
    answer:
      "Yes, we use state-of-the-art encryption to ensure your data and transactions are always safe.Yes, we use state-of-the-art encryption to ensure your data and transactions are always safe.Yes, we use state-of-the-art encryption to ensure your data and transactions are always safe.Yes, we use state-of-the-art encryption to ensure your data and transactions are always safe.Yes, we use state-of-the-art encryption to ensure your data and transactions are always safe.",
  },
];

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: "easeOut" },
  },
};

const faqItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" },
  }),
};

const answerVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: "auto", opacity: 1, transition: { duration: 0.5 } },
};

const FAQSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const isWide = useIsWide(940);
  const isWide2 = useIsWide(772);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden py-96">
      <div className="absolute inset-0 -z-10">
        <Image
          src={FooterBg}
          alt="Background"
          fill
          className="object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-[#421b76cc] via-[#9470becc] to-[#ffc0cb44] mix-blend-color-burn" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-[10%] w-1 h-1 bg-white rounded-full animate-pulse" />
          <div className="absolute top-[20%] left-[50%] w-2 h-2 bg-white rounded-full animate-ping" />
          <div className="absolute top-[70%] left-[30%] w-1 h-1 bg-white rounded-full animate-pulse" />
          <div className="absolute top-[60%] left-[80%] w-2 h-2 bg-white rounded-full animate-ping" />
          <div className="absolute top-[40%] left-[85%] w-1 h-1 bg-white rounded-full animate-pulse" />
        </div>
      </div>
      <div className="w-full relative"></div>


      <motion.div
        className="relative z-10 w-full max-w-5xl px-4 -mt-40"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >

        <div className={`relative md:p-6 ${isMobile ? "" : "transition transform hover:-rotate-1 hover:scale-[1.01]"}`}>
        <div className="flex justify-center mb-11">
          <h2 className={`FaqHeading ${isMobile ? "text-4xl" : "text-9xl"} font-bold`}>
            FAQ
          </h2>
        </div>
        {/* {!isMobile && (
            <Image
            src={Doc}
            alt="Background"
            width={isWide ? 600 : (isWide2 ? 570 : 530)}
            height={isWide ? 600 : (isWide2 ? 570 : 530)}
            // fill
            className="  fixed -left-80 top-52 "
          />
        )} */}

        

          {/* <div className="flex justify-center">
            <div className={`${isMobile ? "w-40 h-40" : "w-44 h-40"}`}>
              <Lottie animationData={animationData} loop={true}/>
            </div>
          </div> */}
          {/* <h2 className={`font-bold font-mono text-center text-white mb-6 drop-shadow-sm ${isMobile ? "text-xl" : "md:text-5xl"}`}>
            Your Burning Questions, Answered
          </h2> */}
          <div className="space-y-0">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={faqItemVariants}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`bg-slate-600 p-3 border border-white/100 text-left ${
                  activeIndex === index ? "rounded-3xl" : "rounded-full"
                } ${isMobile ? "text-sm" : "md:text-3xl w-3/4 mx-auto"}`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className={`fontFamily -my-1 flex items-center justify-between w-full text-white font-semibold text-lg focus:outline-none ${isMobile ? "text-sm" : "md:text-4xl"}`}
                >
                  <span className={`${isMobile ? "mt-2 mx-3" : "mt-2 mx-6"}`}>{faq.question}</span>
                  <motion.span
                    animate={{ rotate: activeIndex === index ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={` text-2xl font-extrabold border-2 border-white/100 rounded-full flex items-center justify-center mt-2 mr-3 ${isMobile ? "w-8 h-8" : "w-12 h-12"}`}
                  >
                    +
                  </motion.span>
                </button>
                <motion.div
                  variants={answerVariants}
                  initial="collapsed"
                  animate={activeIndex === index ? "expanded" : "collapsed"}
                  className={`fontFamily overflow-hidden leading-relaxed text-gray-200 mt-3 font-semibold ${
                    isMobile ? "mx-6 text-sm" : "mx-11 md:text-lg"
                  }`}
                >
                  <p>{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>

        </div>
      </motion.div>
      <div className="w-full relative mt-10"></div>
    </section>
  );
};

export default FAQSection;










// "use client";

// import { motion } from "framer-motion";
// import { useState } from "react";
// import Image from "next/image";
// import dynamic from "next/dynamic";

// // Import your background image and Lottie JSON
// import FooterBg from "../../../assets/Images/earth2.webp";
// import animationData from "../../../assets/Images/Faq.json";
//  import { useIsMobile } from "@/hooks/useIsMobile";

// // Dynamically load Lottie for SSR
// const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// // FAQ items
// interface FAQ {
//   question: string;
//   answer: string;
// }

// const faqs: FAQ[] = [
//   {
//     question: "WHAT IS WUSLE?",
//     answer:
//       "WUSLE is a revolutionary platform designed to bring innovation to the cryptocurrency space.",
//   },
//   {
//     question: "WHY WUSLE?",
//     answer:
//       "You can buy Coins through our platform using supported cryptocurrencies or fiat methods.",
//   },
//   {
//     question: "HOW CAN I GET NFT?",
//     answer:
//       "Yes, we use state-of-the-art encryption to ensure your data and transactions are always safe.",
//   },
//   {
//     question: "HOW DO I GET WUSLE?",
//     answer:
//       "Yes, we use state-of-the-art encryption to ensure your data and transactions are always safe.",
//   },
//   {
//     question: "WHO DO I CONTACT?",
//     answer:
//       "Yes, we use state-of-the-art encryption to ensure your data and transactions are always safe.Yes, we use state-of-the-art encryption to ensure your data and transactions are always safe.Yes, we use state-of-the-art encryption to ensure your data and transactions are always safe.Yes, we use state-of-the-art encryption to ensure your data and transactions are always safe.Yes, we use state-of-the-art encryption to ensure your data and transactions are always safe.",
//   },
// ];

// /** Animations **/

// // Container fade & scale in
// const containerVariants = {
//   hidden: { opacity: 0, scale: 0.95 },
//   visible: {
//     opacity: 1,
//     scale: 1,
//     transition: { duration: 1, ease: "easeOut" },
//   },
// };

// // Each FAQ item fade & slight slide
// const faqItemVariants = {
//   hidden: { opacity: 0, y: 30 },
//   visible: (i: number) => ({
//     opacity: 1,
//     y: 0,
//     transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" },
//   }),
// };

// // Collapsible answer
// const answerVariants = {
//   collapsed: { height: 0, opacity: 0 },
//   expanded: { height: "auto", opacity: 1, transition: { duration: 0.5 } },
// };

// const FAQSection: React.FC = () => {
//   const [activeIndex, setActiveIndex] = useState<number | null>(null);

//   const isMobile = useIsMobile();

//   const toggleFAQ = (index: number) => {
//     setActiveIndex(activeIndex === index ? null : index);
//   };

//   return (
//     <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden py-96">
//       {/* Background + Star Overlay */}
//       <div className="absolute inset-0 -z-10">
//         {/* Main BG Image */}
//         <Image
//           src={FooterBg}
//           alt="Background"
//           fill
//           className="object-cover object-center opacity-70"
//         />
//         {/* A subtle gradient overlay */}
//         <div className="absolute inset-0 bg-gradient-to-bl from-[#421b76cc] via-[#592d8dcc] to-[#ffc0cb44] mix-blend-overlay" />
//         {/* Twinkling stars with pseudo-elements */}
//         <div className="pointer-events-none absolute inset-0 overflow-hidden">
//           {/* Each star is an absolutely positioned little white dot 
//               We’ll replicate a handful of them for that starry effect. */}
//           <div className="absolute top-1/3 left-[10%] w-1 h-1 bg-white rounded-full animate-pulse" />
//           <div className="absolute top-[20%] left-[50%] w-2 h-2 bg-white rounded-full animate-ping" />
//           <div className="absolute top-[70%] left-[30%] w-1 h-1 bg-white rounded-full animate-pulse" />
//           <div className="absolute top-[60%] left-[80%] w-2 h-2 bg-white rounded-full animate-ping" />
//           <div className="absolute top-[40%] left-[85%] w-1 h-1 bg-white rounded-full animate-pulse" />
//         </div>
//       </div>

//       {/* Decorative Multi-Layer Top Waves */}
//       <div className="w-full relative">
//         {/* <svg
//           className="w-full h-20 text-purple-400 fill-current"
//           viewBox="0 0 1440 320"
//           preserveAspectRatio="none"
//         >
//           <defs>
//           <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
//             <stop offset="0%" stopColor="#7f00ff" />
//             <stop offset="100%" stopColor="#e100ff" />
//           </linearGradient>
//         </defs>
//           <path 
//           fill="url(#gradient)"
//           d="M0,192L48,170.7C96,149,192,107,288,96C384,85,480,107,576,133.3C672,160,768,192,864,213.3C960,235,1056,245,1152,224C1248,203,1344,149,1392,122.7L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
//         </svg> */}
//         {/* <svg
//           className="w-full h-40 text-purple-600 fill-current mt-[-2px]"
//           viewBox="0 0 1440 320"
//           preserveAspectRatio="none"
//         >
//           <path d="M0,96L48,85.3C96,75,192,53,288,42.7C384,32,480,32,576,42.7C672,53,768,75,864,85.3C960,96,1056,96,1152,117.3C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
//         </svg> */}
//       </div>

//       {/* FAQ Content Container */}
//       <motion.div
//         className="relative z-10 w-full max-w-5xl px-4"
//         variants={containerVariants}
//         initial="hidden"
//         whileInView="visible"
//         viewport={{ once: true, amount: 0.3 }}
//       >
//         {/* Fancy Card with diagonal gradient + mild rotation on hover */}
//         <div className={`relative md:p-6 ${isMobile ? "" : "transition transform hover:-rotate-1 hover:scale-[1.01]"}`}>
//           {/* Lottie Animation near Title */}
//           <div className="flex justify-center">
//             <div className={`${isMobile ? "w-40 h-40" : "w-60 h-60"}`}>
//               <Lottie animationData={animationData} loop={true} />
//             </div>
//           </div>
//           {/* Title */}
//           <h2 className={` font-bold font-mono text-center text-white mb-6 drop-shadow-sm ${isMobile ? "text-xl" : "md:text-5xl"}`}>
//             Your Burning Questions, Answered
//           </h2>

//           {/* FAQ items */}
//           <div className="space-y-0">
//             {faqs.map((faq, index) => (
//               <motion.div
//                 key={index}
//                 variants={faqItemVariants}
//                 custom={index}
//                 initial="hidden"
//                 whileInView="visible"
//                 viewport={{ once: true }}
//                 className={`bg-purple-600 bg-opacity-80 backdrop-blur-md  p-2 border border-white/100 text-left ${activeIndex === index ? "rounded-3xl " : "rounded-full "} ${isMobile ? "text-sm" : "md:text-3xl w-3/4 mx-auto"}`}
//               >
//                 {/* Question button */}
//                 <button
//                   onClick={() => toggleFAQ(index)}
//                   className={`flex items-center justify-between w-full text-white font-semibold text-lg focus:outline-none ${isMobile ? "text-sm" : "md:text-3xl "}`} 
//                 >
//                   <span className={`${isMobile ? "mt-2 mx-6" : "mt-2 mx-11" }`}>{faq.question}</span>
//                   <motion.span
//                     animate={{ rotate: activeIndex === index ? 45 : 0 }}
//                     transition={{ duration: 0.3 }}
//                     className={`text-2xl font-extrabold  border-2 border-white/100 rounded-full  flex items-center justify-center mt-2 mr-3 ${isMobile ? "w-8 h-8" : "w-10 h-10"}`}
//                   >
//                      + 
//                   </motion.span>
//                 </button>
//                 {/* Animated Answer */}
//                 <motion.div
//                   variants={answerVariants}
//                   initial="collapsed"
//                   animate={activeIndex === index ? "expanded" : "collapsed"}
//                   className={`overflow-hidden  leading-relaxed text-gray-200 mt-3  font-semibold ${isMobile ? "mx-6 text-sm" : "mx-11 md:text-lg "}`}
//                 >
//                   <p>{faq.answer}</p>
//                 </motion.div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </motion.div>

//       {/* Decorative Multi-Layer Bottom Waves */}
//       <div className="w-full relative mt-10">
//         {/* <svg
//           className="w-full h-40 text-purple-600 fill-current"
//           viewBox="0 0 1440 320"
//           preserveAspectRatio="none"
//         >
//           <path d="M0,128L30,128C60,128,120,128,180,138.7C240,149,300,171,360,202.7C420,235,480,277,540,293.3C600,309,660,299,720,256C780,213,840,139,900,112C960,85,1020,107,1080,112C1140,117,1200,107,1260,128C1320,149,1380,203,1410,229.3L1440,256L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z" />
//         </svg> */}
//         {/* <svg
//           className="w-full h-40 text-purple-400 fill-current mt-[-2px]"
//           viewBox="0 0 1440 320"
//           preserveAspectRatio="none"
//         >
//             <defs>
//             <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
//               <stop offset="0%" stopColor="#7f00ff" />
//               <stop offset="100%" stopColor="#e100ff" />
//             </linearGradient>
//           </defs>
//           <path 
//           fill="url(#gradient)"
//           d="M0,192L40,197.3C80,203,160,213,240,208C320,203,400,181,480,165.3C560,149,640,139,720,154.7C800,171,880,213,960,202.7C1040,192,1120,128,1200,112C1280,96,1360,128,1400,144L1440,160L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z" />
//         </svg> */}
//       </div>
//     </section>
//   );
// };

// export default FAQSection;






// "use client";
// import { motion } from "framer-motion";
// import { useState } from "react";
// import Image from "next/image";
// import FooterBg from "../../../assets/Images/FotterEarth.jpeg";

// interface FAQ {
//   question: string;
//   answer: string;
// }


// const fadeIn = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
// };

// const faqVariants = {
//   hidden: { opacity: 0, height: 0 },
//   visible: {
//     opacity: 1,
//     height: "auto",
//     transition: { duration: 0.5, ease: "easeInOut" },
//   },
// };

// const faqs: FAQ[] = [
//   {
//     question: "What is WUSLE?",
//     answer:
//       "WUSLE is a revolutionary platform designed to bring innovation to the cryptocurrency space.",
//   },
//   {
//     question: "How do I buy tokens?",
//     answer:
//       "You can buy tokens through our platform using supported cryptocurrencies or fiat methods.",
//   },
//   {
//     question: "Is my data secure?",
//     answer:
//       "Yes, we use state-of-the-art encryption to ensure your data and transactions are secure.",
//   },
// ];

// const FAQSection: React.FC = () => {
//   const [activeIndex, setActiveIndex] = useState<number | null>(null);

//   const toggleFAQ = (index: number) => {
//     setActiveIndex(activeIndex === index ? null : index);
//   };

//   return (
//     <section className="relative h-[150vh] text-white p-8 flex flex-col items-center text-center">
//       {/* Background Image */}
//       <div className="absolute inset-0">
//         <Image
//           src={FooterBg}
//           alt="Background"
//           fill
//           className="object-cover opacity-100"
//         />
//       </div>

//       {/* FAQ Content Card with Glass Effect */}
//       <motion.div
//         className="relative z-10 bg-white bg-opacity-20 backdrop-blur-sm mt-[30rem] text-gray-900 max-w-4xl mx-auto flex flex-col justify-center p-8 rounded-3xl shadow-xl border border-gray-300"
//         initial="hidden"
//         whileInView="visible"
//         viewport={{ once: true, amount: 0.3 }}
//       >
//         <motion.h3
//           className="text-center text-6xl font-bold mb-8 text-white"
//           variants={fadeIn}
//         >
//           FAQs
//         </motion.h3>
//         <div className="space-y-6">
//           {faqs.map((faq, index) => (
//             <motion.div
//               key={index}
//               className="bg-white bg-opacity-20 backdrop-blur-lg text-gray-900 rounded-2xl shadow-lg p-6 border border-gray-300"
//               variants={fadeIn}
//             >
//               <button
//                 onClick={() => toggleFAQ(index)}
//                 className="w-full text-lg font-semibold flex justify-between items-center focus:outline-none text-slate-800"
//               >
//                 {faq.question}
//                 <span>{activeIndex === index ? "−" : "+"}</span>
//               </button>
//               <motion.div
//                 variants={faqVariants}
//                 initial="hidden"
//                 animate={activeIndex === index ? "visible" : "hidden"}
//                 className="overflow-hidden text-base mt-4 text-slate-800"
//               >
//                 <p>{faq.answer}</p>
//               </motion.div>
//             </motion.div>
//           ))}
//         </div>
//       </motion.div>
//     </section>
//   );
// };

// export default FAQSection;
