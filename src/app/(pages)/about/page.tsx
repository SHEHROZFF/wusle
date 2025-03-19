"use client";

import React from "react";
import { motion } from "framer-motion";
import Image, { StaticImageData } from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCube, Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cube";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Import Lottie with dynamic import
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import { useIsMobile } from "@/hooks/useIsMobile";

// Import Images
import AboutHeart1 from "../../../assets/Images/Doctor.jpeg";
import AboutHeart3 from "../../../assets/Images/watch5.png";
import AboutHeart3Alt from "../../../assets/Images/watch1.png";
import AboutHeart3Alt1 from "../../../assets/Images/watch2.png";
import AboutHeart3Alt2 from "../../../assets/Images/watch4.png";
import Docfloat from "../../../assets/Images/docfloat.png";
import S_IMAGE from "../../../assets/Images/s.webp";
import AboutBg from "../../../assets/Images/about.webp";

// Lottie JSON data
import aboutVisionAnimation from "../../../assets/Images/aboutVision.json";
import aboutJourneyAnimation from "../../../assets/Images/aboutJourney.json";

const AboutPage: React.FC = () => {
  const swipeImages: StaticImageData[] = [
    AboutHeart3,
    AboutHeart3Alt,
    AboutHeart3Alt1,
    AboutHeart3Alt2,
  ];

  const isMobile = useIsMobile(1286);
  const isDesktop = useIsMobile(1024);
  const IsMobile2 = useIsMobile(768);

  // Each step now includes separate margin values for desktop and mobile:
  // - titleMx / titleMxMobile: margin for the title container
  // - contentMx / contentMxMobile: margin for the combined media and description container
  const steps = [
    {
      id: 1,
      title: "What is WUSLE?",
      description:
        "WUSLE is an innovative platform that seamlessly integrates health and technology. Our solution rewards users with wusle coins digital currency earned by tracking and improving their heart health.",
      image: AboutHeart1,
      titleMx: "500px",      // Desktop title offset for step 1
      contentMx: "70px",     // Desktop content offset for step 1
      titleMxMobile: "20px", // Mobile title offset for step 1
      contentMxMobile: "10px", // Mobile content offset for step 1
    },
    {
      id: 2,
      title: "Our Vision",
      description:
        "Founded with a mission to revolutionize health tracking through blockchain technology, WUSLE empowers users to achieve their fitness goals while benefiting from state-of-the-art innovation.",
      lottieAnimation: aboutVisionAnimation,
      titleMx: "15px",
      contentMx: "-250px",
      titleMxMobile: "10px",
      contentMxMobile: "10px",
    },
    {
      id: 3,
      title: "Why Choose WUSLE?",
      description:
        "It is a groundbreaking invention that allows users to generate cryptocurrency through the use of the bracelet. By simply wearing the device, users can harness their heart rate data to mine cryptocurrency effortlessly. This innovative approach not only combines health and technology but also transforms everyday activities into an opportunity for financial gain. With this bracelet, users can engage in a new way of earning that seamlessly integrates into their daily lives.",
      swipeable: true,
      titleMx: "800px",
      contentMx: "70px",
      titleMxMobile: "30px",
      contentMxMobile: "10px",
    },
    {
      id: 4,
      title: "Our Journey",
      description:
        "What began as an idea has evolved into a thriving global platform. WUSLE has bridged the gap between advanced health tracking and blockchain technology, creating a transformative experience for users.",
      webp: Docfloat,
      titleMx: "400px",
      contentMx: "24px",
      titleMxMobile: "20px",
      contentMxMobile: "5px",
    },
  ];

  return (
    <div className="overflow-x-hidden overflow-y-hidden relative min-h-screen py-16 flex flex-col items-center justify-center bg-gradient-to-tr from-gray-700 to-green-700 mix-blend-multiply">
      {/* Background Image */}
      <Image
        src={AboutBg}
        alt="Background"
        fill
        className="object-cover opacity-60"
      />

      {/* Page Title */}
      <div className="relative z-10 container mx-auto px-4 text-center mb-20">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          className="fontFamily md:text-9xl text-6xl text-white"
        >
          ABOUT
          <br />
          <span className="inline-block">WU</span>
          <span
            className={`relative inline-block align-middle w-20 md:w-48 lg:w-48  ${
              IsMobile2 ? "-top-12 -mx-6" : "-top-28 -mx-12"
            }`}
          >
            <Image
              src={S_IMAGE}
              alt="S"
              width={IsMobile2 ? 200 : 400}
              height={IsMobile2 ? 200 : 400}
              className="absolute top-0 left-0 object-contain"
            />
          </span>
          <span className="inline-block">LE</span>
        </motion.h1>
      </div>

      {/* Steps Section */}
      <div className={`container mx-auto px-4 md:px-12 z-20 ${IsMobile2 ? "space-y-20" : "space-y-48"}`}>
        {steps.map((step, index) => (
          <div key={step.id} className="mb-12">
            {/* Title Section with separate margin */}
            <motion.div
              style={{
                marginLeft: isMobile ? step.titleMxMobile : step.titleMx,
              }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: false, amount: 0.2 }}
              className="mb-8"
            >
              <div className="border-2 border-white rounded-full py-3 bgStunColor inline-block">
                <h2 className={`fontFamily uppercase  text-white text-center px-6 ${isDesktop ? "text-2xl" : "text-4xl"} `}>
                  {step.title}
                </h2>
              </div>
            </motion.div>

            {/* Combined Media + Description Section with separate margin */}
            <motion.div
              style={{
                marginLeft: isMobile ? step.contentMxMobile : step.contentMx,
              }}
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: false, amount: 0.2 }}
              className="flex flex-col md:flex-row items-center sm:gap-6 sm:px-0"
            >
              {/* Media Section */}
              <div className="w-full md:w-1/2 flex justify-center relative">
                {step.lottieAnimation ? (
                  <Lottie
                    animationData={step.lottieAnimation}
                    loop={true}
                    style={{ width: isMobile ? 300 : 500, height: isMobile ? 300 : 500 }}
                  />
                ) : step.swipeable ? (
                  <div className="relative w-full max-w-72 items-center">
                    <Swiper
                      effect="cube"
                      grabCursor={true}
                      centeredSlides={true}
                      slidesPerView={1}
                      cubeEffect={{
                        shadow: true,
                        slideShadows: true,
                        shadowOffset: 20,
                        shadowScale: 0.94,
                      }}
                      // pagination={{ clickable: true }}
                      autoplay={{ delay: 1500, disableOnInteraction: false }}
                      loop
                      modules={[EffectCube, Pagination, Navigation, Autoplay]}
                      className="rounded-lg"
                    >
                      {swipeImages.map((image, idx) => (
                        <SwiperSlide key={idx} className="w-64">
                          <div className={`relative rounded-xl overflow-hidden shadow-lg bgStunColor2 ${isMobile ? "w-72 h-72" : "w-96 h-96 "}`}>
                            <Image
                              src={image}
                              alt={`Slide ${idx}`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                ) : step.webp ? (
                  <Image
                    src={step.webp}
                    alt={step.title}
                    className="mt-4"
                    width={IsMobile2 ? 300 : 500}
                    height={IsMobile2 ? 300 : 500}
                  />
                ) : (
                  <Image
                    src={step.image ?? AboutHeart1}
                    alt={step.title}
                    className="mt-4 rounded-full"
                    width={IsMobile2 ? 200 : 500}
                    height={IsMobile2 ? 200 : 500}
                  />
                )}
              </div>

              {/* Description Section */}
              <div className="w-full sm:w-3/4 md:w-2/5 text-center md:text-left">
                <p className="fontFamilyText sm:text-xl md:text-2xl text-white leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutPage;






// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import Image, { StaticImageData } from "next/image";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { EffectCube, Navigation, Pagination, Autoplay } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/effect-cube";
// import "swiper/css/navigation";
// import "swiper/css/pagination";

// // Import Lottie with dynamic import
// import dynamic from "next/dynamic";
// const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// import { useIsMobile } from "@/hooks/useIsMobile";

// // Import Images
// import AboutHeart1 from "../../../assets/Images/Doctor.jpeg";
// import AboutHeart3 from "../../../assets/Images/watch5.png";
// import AboutHeart3Alt from "../../../assets/Images/watch1.png";
// import AboutHeart3Alt1 from "../../../assets/Images/watch2.png";
// import AboutHeart3Alt2 from "../../../assets/Images/watch4.png";
// import Docfloat from "../../../assets/Images/docfloat.png";
// import S_IMAGE from "../../../assets/Images/s.webp";
// import AboutBg from "../../../assets/Images/about.webp";

// // Lottie JSON data
// import aboutVisionAnimation from "../../../assets/Images/aboutVision.json";
// import aboutJourneyAnimation from "../../../assets/Images/aboutJourney.json";

// const AboutPage: React.FC = () => {
//   const swipeImages: StaticImageData[] = [
//     AboutHeart3,
//     AboutHeart3Alt,
//     AboutHeart3Alt1,
//     AboutHeart3Alt2,
//   ];

//   const isMobile = useIsMobile(768);

//   const steps = [
//     {
//       id: 1,
//       title: "What is WUSLE?",
//       description:
//         "WUSLE is an innovative platform that seamlessly integrates health and technology. Our solution rewards users with wusle coins digital currency earned by tracking and improving their heart health.",
//       image: AboutHeart1,
//     },
//     {
//       id: 2,
//       title: "Our Vision",
//       description:
//         "Founded with a mission to revolutionize health tracking through blockchain technology, WUSLE empowers users to achieve their fitness goals while benefiting from state-of-the-art innovation.",
//       lottieAnimation: aboutVisionAnimation,
//     },
//     {
//       id: 3,
//       title: "Why Choose WUSLE?",
//       description:
//         "It is a groundbreaking invention that allows users to generate cryptocurrency through the use of the bracelet. By simply wearing the device, users can harness their heart rate data to mine cryptocurrency effortlessly. This innovative approach not only combines health and technology but also transforms everyday activities into an opportunity for financial gain. With this bracelet, users can engage in a new way of earning that seamlessly integrates into their daily lives.",
//       swipeable: true,
//     },
//     {
//       id: 4,
//       title: "Our Journey",
//       description:
//         "What began as an idea has evolved into a thriving global platform. WUSLE has bridged the gap between advanced health tracking and blockchain technology, creating a transformative experience for users.",
//       // Using WebP image here
//       webp: Docfloat,
//     },
//   ];

//   return (
//     <div className="overflow-x-hidden overflow-y-hidden relative min-h-screen py-16 flex flex-col items-center justify-center bg-gradient-to-tr from-gray-700 to-green-700 mix-blend-multiply">
//       {/* Background Image */}
//       <Image
//         src={AboutBg}
//         alt="Background"
//         fill
//         className="object-cover opacity-60"
//       />

//       {/* Page Title */}
//       <div className="relative z-10 container mx-auto px-4 text-center mb-20 ">
//         <motion.h1
//           initial={{ opacity: 0, y: -50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, ease: "easeOut" }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: false, amount: 0.2 }}
//           className="fontFamily md:text-9xl text-6xl text-white"
//         >
//           {/* <motion.span
//             animate={{ scale: [1, 1.1, 1] }}
//             transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
//             className="inline-block"
//           > */}
//             ABOUT
//           {/* </motion.span> */}
//           <br />
//           <span className="inline-block">WU</span>
//           <span className={`relative inline-block align-middle w-20  md:w-48 lg:w-48 z-50   ${isMobile ? "-top-12 -mx-6" : "-top-28 -mx-12"}`}>
//             <Image
//               src={S_IMAGE}
//               alt="S"
//               width={isMobile ? 200 : 400}
//               height={isMobile ? 200 : 400}
//               className="absolute top-0 left-0 object-contain"
//             />
//           </span>
//           <span className="inline-block">LE</span>
//         </motion.h1>
//       </div>


//       {/* Steps Section */}
//       <div className="container mx-auto px-4 md:px-12 z-20">
//         {steps.map((step, index) => (
//           <div key={step.id} className="mb-12">
//             {/* Title Section */}
//             <motion.div
//               initial={{ opacity: 0, y: 50 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, ease: "easeOut" }}
//               viewport={{ once: false, amount: 0.2 }}
//               className="flex justify-center mb-8"
//             >
//               <div className="border-2 border-white rounded-full py-3 bgStunColor inline-block">
//                 <h2 className="fontFamily uppercase text-xl sm:text-4xl md:text-4xl text-white text-center px-6">
//                   {step.title}
//                 </h2>
//               </div>
//             </motion.div>

//             {/* Content Section */}
//             <motion.div
//               initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.6, ease: "easeOut" }}
//               viewport={{ once: false, amount: 0.2 }}
//               className={`flex flex-col md:flex-row items-center gap-4 sm:gap-6 px-4 sm:px-0 ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}
//             >
//               {/* Media Section */}
//               <div className="w-full md:w-1/2 flex justify-center relative">
//                 {step.lottieAnimation ? (
//                   <Lottie
//                     animationData={step.lottieAnimation}
//                     loop={true}
//                     style={{ width: 300, height: 300 }}
//                   />
//                 ) : step.swipeable ? (
//                   <div className="relative w-full max-w-72 items-center">
//                     <Swiper
//                       effect="cube"
//                       grabCursor={true}
//                       centeredSlides={true}
//                       slidesPerView={1}
//                       cubeEffect={{
//                         shadow: true,
//                         slideShadows: true,
//                         shadowOffset: 20,
//                         shadowScale: 0.94,
//                       }}
//                       pagination={{ clickable: true }}
//                       autoplay={{ delay: 2500, disableOnInteraction: false }}
//                       loop
//                       modules={[EffectCube, Pagination, Navigation, Autoplay]}
//                       className="rounded-lg"
//                     >
//                       {swipeImages.map((image, idx) => (
//                         <SwiperSlide key={idx} className="w-64">
//                           <div className="relative w-72 h-96 rounded-xl overflow-hidden shadow-lg">
//                             <Image
//                               src={image}
//                               alt={`Slide ${idx}`}
//                               fill
//                               className="object-contain"
//                             />
//                           </div>
//                         </SwiperSlide>
//                       ))}
//                     </Swiper>
//                   </div>
//                 ) : step.webp ? (
//                   <Image
//                     src={step.webp}
//                     alt={step.title}
//                     className="mt-4"
//                     width={500}
//                     height={500}
//                   />
//                 ) : (
//                   <Image
//                     src={step.image ?? AboutHeart1}
//                     alt={step.title}
//                     className="mt-4 rounded-full"
//                     width={300}
//                     height={300}
//                   />
//                 )}
//               </div>

//               {/* Description Section */}
//               <div className="w-full sm:w-3/4 md:w-2/5 text-center md:text-left">
//                 <p className="fontFamily sm:text-xl md:text-2xl text-white leading-relaxed ">
//                   {step.description}
//                 </p>
//               </div>
//             </motion.div>
//           </div>
//         ))}
//       </div>

//     </div>
//   );
// };

// export default AboutPage;







// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import Image, { StaticImageData } from "next/image";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { EffectCube, Navigation, Pagination, Autoplay } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/effect-cube";
// import "swiper/css/navigation";
// import "swiper/css/pagination";

// // Import Lottie with dynamic import
// import dynamic from "next/dynamic";
// const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// // Import Images
// import AboutHeart1 from "../../../assets/Images/Doctor.jpeg";
// import AboutHeart2 from "../../../assets/Images/HeartCharacterAbout.png";
// import AboutHeart3 from "../../../assets/Images/watch5.png";
// import AboutHeart3Alt from "../../../assets/Images/watch1.png";
// import AboutHeart3Alt1 from "../../../assets/Images/watch2.png";
// import AboutHeart3Alt2 from "../../../assets/Images/watch4.png";
// import Docfloat from "../../../assets/Images/docfloat.png";
// import AboutHeart4 from "../../../assets/Images/HeartAbout.png";
// import S_IMAGE from "../../../assets/Images/s.webp";
// import AboutBg from "../../../assets/Images/about.webp";

// // Lottie JSON data
// import aboutVisionAnimation from "../../../assets/Images/aboutVision.json";
// import aboutJourneyAnimation from "../../../assets/Images/aboutJourney.json";

// const AboutPage: React.FC = () => {
//   const swipeImages: StaticImageData[] = [
//     AboutHeart3,
//     AboutHeart3Alt,
//     AboutHeart3Alt1,
//     AboutHeart3Alt2,
//   ];

//   const steps = [
//     {
//       id: 1,
//       title: "What is WUSLE?",
//       description:
//         "WUSLE is an innovative platform that seamlessly integrates health and technology. Our solution rewards users with wusle coins digital currency earned by tracking and improving their heart health.",
//       image: AboutHeart1,
//     },
//     {
//       id: 2,
//       title: "Our Vision",
//       description:
//         "Founded with a mission to revolutionize health tracking through blockchain technology, WUSLE empowers users to achieve their fitness goals while benefiting from state-of-the-art innovation.",
//       // Lottie animation file instead of a static image
//       lottieAnimation: aboutVisionAnimation,
//     },
//     {
//       id: 3,
//       title: "Why Choose WUSLE?",
//       description:
//         "It is a groundbreaking invention that allows users to generate cryptocurrency through the use of the bracelet. By simply wearing the device, users can harness their heart rate data to mine cryptocurrency effortlessly. This innovative approach not only combines health and technology but also transforms everyday activities into an opportunity for financial gain. With this bracelet, users can engage in a new way of earning that seamlessly integrates into their daily lives.",
//       swipeable: true,
//     },
//     {
//       id: 4,
//       title: "Our Journey",
//       description:
//         "What began as an idea has evolved into a thriving global platform. WUSLE has bridged the gap between advanced health tracking and blockchain technology, creating a transformative experience for users.",
//       // Also using Lottie here
//       webp: Docfloat,
//     },
//   ];

//   return (
//     <div className="overflow-x-hidden overflow-y-hidden relative min-h-screen py-16 flex flex-col items-center justify-center bg-gradient-to-tr from-gray-700 to-green-700 mix-blend-multiply">
//       {/* Background Image */}
//       <Image
//         src={AboutBg}
//         alt="Background"
//         fill
//         className="object-cover opacity-40"
//       />

//       {/* Page Title */}
      // <div className="relative z-10 container mx-auto px-4 text-center mb-6 ">
      //   <motion.h1
      //     initial={{ opacity: 0, y: -50 }}
      //     animate={{ opacity: 1, y: 0 }}
      //     transition={{ duration: 0.8, ease: "easeOut" }}
      //     whileInView={{ opacity: 1, y: 0 }}
      //     viewport={{ once: false, amount: 0.2 }}
      //     className="fontFamily md:text-7xl text-2xl text-yellow-50 "
      //   >
      //     <motion.span
      //       animate={{ scale: [1, 1.1, 1] }}
      //       transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      //     >
      //       ABOUT WU
      //     </motion.span>
      //     <span className="relative inline-block align-middle size-20 sm:size-20 lg:size-32 z-50 -mx-9">
            
      //       <Image
      //         src={S_IMAGE}
      //         alt="S"
      //         width={200}
      //         height={200}
      //         className="absolute top-0 left-0 object-contain"              
      //       />
      //     </span>
      //     <motion.span
      //       animate={{ scale: [1, 1.1, 1] }}
      //       transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      //     >
      //       LE
      //     </motion.span>
      //   </motion.h1>
      // </div>

//       {/* Steps Section */}
//       <div className="container mx-auto px-4 md:px-12 z-20">
//         {steps.map((step, index) => (
//           <motion.div
//             key={step.id}
//             initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6, ease: "easeOut" }}
//             viewport={{ once: false, amount: 0.2 }}
//             className={`step flex flex-col md:flex-row items-center gap-4 sm:gap-6 px-4 sm:px-0 ${
//               index % 2 === 0 ? "md:flex-row-reverse" : ""
//             }`}
//           >
//             {/* Media (Lottie, Swiper, or Image) */}
//             <div className="w-full md:w-1/2 flex justify-center relative">
//               {step.lottieAnimation ? (
//                 // Render Lottie instead of an Image
//                 <Lottie
//                   animationData={step.lottieAnimation}
//                   loop={true}
//                   // autoplay is true by default in lottie-react, but you can be explicit:
//                   // autoplay={true}
//                   style={{ width: 300, height: 300 }}
//                 />
//               ) : step.swipeable ? (
//                 // Render Swiper if swipeable
//                 <div className="relative w-full max-w-72 items-center ">
//                   <Swiper
//                     effect="cube"
//                     grabCursor={true}
//                     centeredSlides={true}
//                     slidesPerView={1}
//                     cubeEffect={{
//                       shadow: true,
//                       slideShadows: true,
//                       shadowOffset: 20,
//                       shadowScale: 0.94,
//                     }}
//                     pagination={{ clickable: true }}
//                     autoplay={{ delay: 2500, disableOnInteraction: false }}
//                     loop
//                     modules={[EffectCube, Pagination, Navigation, Autoplay]}
//                     className="rounded-lg"
//                   >
//                     {swipeImages.map((image, idx) => (
//                       <SwiperSlide key={idx} className="w-64">
//                         <div className="relative w-72 h-96 rounded-xl overflow-hidden shadow-lg">
//                           <Image
//                             src={image}
//                             alt={`Slide ${idx}`}
//                             fill
//                             className="object-contain"
//                           />
//                         </div>
//                       </SwiperSlide>
//                     ))}
//                   </Swiper>
//                 </div>
//               ) : (
//                 // Standard Image fallback
//                 <Image
//                   src={step.image ?? AboutHeart1}
//                   alt={step.title}
//                   className="mt-4"
//                   width={500}
//                   height={500}
//                 />
//               )}
//             </div>

//             {/* Text Section */}
//             <motion.div
//               initial={{ opacity: 0, y: 50 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, ease: "easeOut" }}
//               viewport={{ once: false, amount: 0.2 }}
//               className="w-full sm:w-3/4 md:w-1/2 text-center md:text-left"
//             >
//               <div className="mb-8 border-2 border-white rounded-full py-3 bgStunColor inline-block">
//                 <h2 className="fontFamily text-xl sm:text-4xl md:text-5xl text-white text-center px-6">
//                   {step.title}
//                 </h2>
//               </div>



//               <p className="fontFamily sm:text-xl md:text-2xl text-gray-100 leading-relaxed">
//                 {step.description}
//               </p>
//             </motion.div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AboutPage;








// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import Image, { StaticImageData } from "next/image";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { EffectCube, Navigation, Pagination, Autoplay } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/effect-cube";
// import "swiper/css/navigation";
// import "swiper/css/pagination";

// // Import Images
// import AboutHeart1 from "../../../assets/Images/Doctor.jpeg";
// import AboutHeart2 from "../../../assets/Images/HeartCharacterAbout.png";
// import AboutHeart3 from "../../../assets/Images/watch5.png";
// import AboutHeart3Alt from "../../../assets/Images/watch1.png";
// import AboutHeart3Alt1 from "../../../assets/Images/watch2.png";
// import AboutHeart3Alt2 from "../../../assets/Images/watch4.png";
// import AboutHeart4 from "../../../assets/Images/HeartAbout.png";
// import S_IMAGE from "../../../assets/Images/S_IMAGE.png";
// import AboutBg from "../../../assets/Images/DALL·E 2025-02-05 08.28.46 - A serene and artistic landscape composition with small purple and pink flowers positioned in the corner of the image. The flowers should be soft and d.webp";

// const AboutPage: React.FC = () => {
//   const swipeImages: StaticImageData[] = [
//     AboutHeart3,
//     AboutHeart3Alt,
//     AboutHeart3Alt1,
//     AboutHeart3Alt2,
//   ];

//   const steps = [
//     {
//       id: 1,
//       title: "What is WUSLE?",
//       description:
//         "WUSLE is an innovative platform that seamlessly integrates health and technology. Our solution rewards users with wusle coins digital currency earned by tracking and improving their heart health.",
//       image: AboutHeart1,
//     },
//     {
//       id: 2,
//       title: "Our Vision",
//       description:
//         "Founded with a mission to revolutionize health tracking through blockchain technology, WUSLE empowers users to achieve their fitness goals while benefiting from state-of-the-art innovation.",
//       image: AboutHeart2,
//     },
//     {
//       id: 3,
//       title: "Why Choose WUSLE?",
//       description:
//         "It is a groundbreaking invention that allows users to generate cryptocurrency through the use of the bracelet. By simply wearing the device, users can harness their heart rate data to mine cryptocurrency effortlessly. This innovative approach not only combines health and technology but also transforms everyday activities into an opportunity for financial gain. With this bracelet, users can engage in a new way of earning that seamlessly integrates into their daily lives.",
//       swipeable: true,
//     },
//     {
//       id: 4,
//       title: "Our Journey",
//       description:
//         "What began as an idea has evolved into a thriving global platform. WUSLE has bridged the gap between advanced health tracking and blockchain technology, creating a transformative experience for users.",
//       image: AboutHeart4,
//     },
//   ];

//   return (
//     <div className="overflow-x-hidden overflow-y-hidden relative min-h-screen py-16 flex flex-col items-center justify-center bg-gradient-to-tr from-gray-700 to-purple-500">
//       <Image
//         src={AboutBg}
//         alt="Background"
//         fill
//         className="object-cover opacity-40"
//       />

//       <div className="relative z-10 container mx-auto px-4 text-center mb-6 ">
//         <motion.h1
//           initial={{ opacity: 0, y: -50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, ease: "easeOut" }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: false, amount: 0.2 }}
//           className="md:text-7xl text-2xl text-yellow-50 font-extrabold tracking-wide drop-shadow-lg"
//         >
//           <motion.span
//             animate={{ scale: [1, 1.1, 1] }}
//             transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
//           >
//             ABOUT WU
//           </motion.span>
//           <span className="relative inline-block align-middle size-20 sm:size-20 lg:size-32 z-50">
//             <Image src={S_IMAGE} alt="S" fill className="object-contain" />
//           </span>
//           <motion.span
//             animate={{ scale: [1, 1.1, 1] }}
//             transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
//           >
//             LE
//           </motion.span>
//         </motion.h1>
//       </div>

//       <div className="container mx-auto px-4 md:px-12 z-20">
//         {steps.map((step, index) => (
//           <motion.div
//             key={step.id}
//             initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6, ease: "easeOut" }}
//             viewport={{ once: false, amount: 0.2 }}
//             className={`step flex flex-col md:flex-row items-center gap-4 sm:gap-6 px-4 sm:px-0 ${
//               index % 2 === 0 ? "md:flex-row-reverse" : ""
//             }`}
//           >
//             <div className="w-full  md:w-1/2 flex justify-center relative">
//               {step.swipeable ? (
//                 <div className="relative w-full max-w-72 items-center ">
//                   <Swiper
//                     effect={"cube"}
//                     grabCursor={true}
//                     centeredSlides={true}
//                     slidesPerView={1}
//                     cubeEffect={{
//                       shadow: true,
//                       slideShadows: true,
//                       shadowOffset: 20,
//                       shadowScale: 0.94,
//                     }}
//                     pagination={{ clickable: true }}
//                     autoplay={{ delay: 2500, disableOnInteraction: false }}
//                     loop
//                     modules={[EffectCube, Pagination, Navigation, Autoplay]}
//                     className="rounded-lg"
//                   >
//                     {swipeImages.map((image, idx) => (
//                       <SwiperSlide key={idx} className="w-64">
//                         <div className="relative w-72 h-96 rounded-xl overflow-hidden shadow-lg">
//                           <Image
//                             src={image}
//                             alt={`Slide ${idx}`}
//                             layout="fill"
//                             objectFit="contain"
//                           />
//                         </div>
//                       </SwiperSlide>
//                     ))}
//                   </Swiper>
//                 </div>
//               ) : (
//                 <Image
//                   src={step.image ? step.image : AboutHeart1}
//                   alt={step.title}
//                   className="  rounded-full"
//                   width={300}
//                   height={300}
//                 />
//               )}
//             </div>

//             <motion.div
//               initial={{ opacity: 0, y: 50 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, ease: "easeOut" }}
//               viewport={{ once: false, amount: 0.2 }}
//               className="w-full sm:w-3/4 md:w-1/2 text-center md:text-left"
//             >
//               <h2 className="text-xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
//                 {step.title}
//               </h2>
//               <p className="text-base sm:text-xl md:text-2xl text-gray-200 leading-relaxed">
//                 {step.description}
//               </p>
//             </motion.div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AboutPage;

// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import Image, { StaticImageData } from "next/image";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { EffectCoverflow, Navigation, Pagination, Autoplay } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/effect-coverflow";
// import "swiper/css/navigation";
// import "swiper/css/pagination";

// // Import Images
// import AboutHeart1 from "../../../assets/Images/AboutHeart.png";
// import AboutHeart2 from "../../../assets/Images/HeartCharacterAbout.png";
// import AboutHeart3 from "../../../assets/Images/watch1.png";
// import AboutHeart3Alt from "../../../assets/Images/watch2.png";
// import AboutHeart3Alt1 from "../../../assets/Images/watch3.png";
// import AboutHeart3Alt2 from "../../../assets/Images/watch4.png";
// import AboutHeart4 from "../../../assets/Images/HeartAbout.png";
// import S_IMAGE from "../../../assets/Images/S_IMAGE.png";
// import AboutBg from "../../../assets/Images/DALL·E 2025-02-05 08.28.46 - A serene and artistic landscape composition with small purple and pink flowers positioned in the corner of the image. The flowers should be soft and d.webp";

// const AboutPage: React.FC = () => {
//   const swipeImages: StaticImageData[] = [
//     AboutHeart3,
//     AboutHeart3Alt,
//     AboutHeart3Alt1,
//     AboutHeart3Alt2,
//   ];

//   const steps = [
//     {
//       id: 1,
//       title: "What is WUSLE?",
//       description:
//         "WUSLE is an innovative platform that seamlessly integrates health and technology. Our solution rewards users with Heart Coins—a digital currency earned by tracking and improving their heart health.",
//       image: AboutHeart1,
//     },
//     {
//       id: 2,
//       title: "Our Vision",
//       description:
//         "Founded with a mission to revolutionize health tracking through blockchain technology, WUSLE empowers users to achieve their fitness goals while benefiting from state-of-the-art innovation.",
//       image: AboutHeart2,
//     },
//     {
//       id: 3,
//       title: "Why Choose WUSLE?",
//       description:
//         "We prioritize integrity, innovation, and inclusivity using cutting-edge blockchain technology to make health improvements engaging and rewarding.",
//       swipeable: true,
//     },
//     {
//       id: 4,
//       title: "Our Journey",
//       description:
//         "What began as an idea has evolved into a thriving global platform. WUSLE has bridged the gap between advanced health tracking and blockchain technology, creating a transformative experience for users.",
//       image: AboutHeart4,
//     },
//   ];

//   return (
//     <div className="overflow-x-hidden relative min-h-screen py-16 flex flex-col items-center justify-center bg-gradient-to-tr from-gray-700 to-purple-500">
//       <Image src={AboutBg} alt="Background" fill className="object-cover opacity-40" />

//       <div className="relative z-10 container mx-auto px-4 text-center">
//         <motion.h1
//           initial={{ opacity: 0, y: -50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, ease: "easeOut" }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: false, amount: 0.2 }}
//           className="md:text-7xl text-2xl text-yellow-50 font-extrabold tracking-wide drop-shadow-lg"
//         >
//           <motion.span
//             animate={{ scale: [1, 1.1, 1] }}
//             transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
//           >
//             ABOUT WU
//           </motion.span>
//           <span className="relative inline-block align-middle size-20 sm:size-20 lg:size-32 z-50">
//             <Image src={S_IMAGE} alt="S" fill className="object-contain" />
//           </span>
//           <motion.span
//             animate={{ scale: [1, 1.1, 1] }}
//             transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
//           >
//             LE
//           </motion.span>
//         </motion.h1>
//       </div>

//       <div className="container mx-auto px-4 md:px-12 z-20">
//         {steps.map((step, index) => (
//           <motion.div
//             key={step.id}
//             initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6, ease: "easeOut" }}
//             viewport={{ once: false, amount: 0.2 }}
//             className={`step flex flex-col md:flex-row items-center gap-4 sm:gap-6 px-4 sm:px-0 ${
//               index % 2 === 0 ? "md:flex-row-reverse" : ""
//             }`}
//           >
//             <div className="w-full sm:w-3/4 md:w-1/2 flex justify-center relative">
//               {step.swipeable ? (
//                 <div className="relative w-full max-w-lg">
//                   <Swiper
//                     effect="coverflow"
//                     grabCursor={true}
//                     centeredSlides={true}
//                     slidesPerView={"auto"}
//                     coverflowEffect={{
//                       rotate: 25, // Rotation effect (default: 50)
//                       stretch: 0, // Space between slides (default: 0)
//                       depth: 250, // Depth effect (default: 100)
//                       modifier: 1, // Strength of effect (default: 1)
//                       slideShadows: true, // Enable shadow effect
//                     }}
//                     pagination={{ clickable: true }}
//                     navigation
//                     autoplay={{ delay: 2500, disableOnInteraction: false }}
//                     loop
//                     modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
//                     className="rounded-lg"
//                   >
//                     {swipeImages.map((image, idx) => (
//                       <SwiperSlide key={idx} className="w-64">
//                         <div className="relative w-64 h-80 rounded-xl overflow-hidden shadow-lg">
//                           <Image src={image} alt={`Slide ${idx}`} layout="fill" objectFit="cover" />
//                         </div>
//                       </SwiperSlide>
//                     ))}
//                   </Swiper>
//                 </div>
//               ) : (
//                 <Image
//                   src={step.image ? step.image : AboutHeart1}
//                   alt={step.title}
//                   className="object-cover w-full h-auto rounded-lg"
//                   width={500}
//                   height={350}
//                 />
//               )}
//             </div>

//             <motion.div
//               initial={{ opacity: 0, y: 50 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, ease: "easeOut" }}
//               viewport={{ once: false, amount: 0.2 }}
//               className="w-full sm:w-3/4 md:w-1/2 text-center md:text-left"
//             >
//               <h2 className="text-xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">{step.title}</h2>
//               <p className="text-base sm:text-xl md:text-2xl text-gray-200 leading-relaxed">{step.description}</p>
//             </motion.div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AboutPage;
