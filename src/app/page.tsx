"use client";
import React from "react";
import Navbar from "@/components/navbar/navbar";
import Home from "./(pages)/home/home";
import HeartSteps from "./(pages)/heartsteps.tsx/page";
import AboutPage from "./(pages)/about/page";
import Tokenomics from "./(pages)/tokenomics/page";
import Roadmap from "./(pages)/roadmap/page";
import Marquee from "@/components/ui/marquee-text";
import Footer from "./(pages)/footer/page";
import PresaleInterface from "@/components/ui/presale";
import Faq from "./(pages)/faq/page";
import { useIsMobile } from "@/hooks/useIsMobile"; // adjust the import path as needed

export default function Page() {
  const isMobile = useIsMobile();

  return (
    <>
      <div id="home" className="h-screen overflow-x-hidden">
        <Navbar />
        <Home />
        {isMobile ? (
          // Mobile-specific positioning/styling
          <div className="absolute w-[100%] top-[80%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 ">
            <PresaleInterface />
          </div>
        ) : (
          // Desktop-specific positioning/styling
          <div className="absolute w-[80%] top-[73%] left-[48.5%] transform -translate-x-1/2 -translate-y-1/2 mt-10">
            <PresaleInterface />
          </div>
        )}
      </div>
      <div id="about" className="overflow-x-hidden mt-60">
        <Marquee />
        <HeartSteps />
        <Marquee />
        <AboutPage />
        <Tokenomics />
        <Marquee />
        <Roadmap />
        <Faq />
        <Footer />
      </div>
    </>
  );
}













// import React from "react";
// import Navbar from "@/components/navbar/navbar";
// import Home from "./(pages)/home/home";
// import HeartSteps from "./(pages)/heartsteps.tsx/page";
// import AboutPage from "./(pages)/about/page";
// import Tokenomics from "./(pages)/tokenomics/page";
// import Roadmap from "./(pages)/roadmap/page";
// import Marquee from "@/components/ui/marquee-text";
// import Footer from "./(pages)/footer/page";
// import PresaleInterface from "@/components/ui/presale";
// import Faq from "./(pages)/faq/page";

// export default function Page() {
//   return (
//     <>
//       <div id="home" className="  h-screen overflow-x-hidden ">
//         <Navbar />
//         <Home />

//         <div className="absolute w-[90%] top-[71%] md:top-[73%] left-1/2 md:left-[49%] transform -translate-x-1/2 -translate-y-1/2 z-20 mt-10" >
//           <PresaleInterface />
//         </div>
//       </div>
//       <div id="about" className=" overflow-x-hidden mt-60">
//         <Marquee />
//         <HeartSteps />
//         <Marquee />
//         <AboutPage />
//         <Tokenomics />
//         <Marquee />
//         <Roadmap />
//         <Faq />
//         <Footer />
//       </div>

//       {/* <div id="roadmap" className="  h-screen">
//         <HeartSteps />
        
//         <Tokenomics />
//         <Roadmap />
//       </div> */}
//     </>
//   );
// }
