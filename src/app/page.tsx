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

export default function Page() {
  return (
    <>
      <div id="home" className="  h-screen overflow-x-hidden ">
        <Navbar />
        <Home />

        <div className="absolute w-[90%] top-[71%] md:top-[73%] left-1/2 md:left-[49%] transform -translate-x-1/2 -translate-y-1/2 z-20">
          <PresaleInterface />
        </div>
      </div>
      <div id="about" className=" overflow-x-hidden">
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

      {/* <div id="roadmap" className="  h-screen">
        <HeartSteps />
        
        <Tokenomics />
        <Roadmap />
      </div> */}
    </>
  );
}
