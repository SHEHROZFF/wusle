"use client";

import React from "react";
import Image from "next/image";
import HeartCharacter from "../../assets/Images/Heart Character landing page.png";

const AnimatedHeart: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <Image
        src={HeartCharacter}
        alt="Heart Character"
        width={600}
        height={600}
        className="object-contain drop-shadow-xl mt-8 md:mt-0 sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px]"
      />
    </div>
  );
};

export default AnimatedHeart;
