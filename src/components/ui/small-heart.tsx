"use client";

import type React from "react";
import { motion } from "framer-motion";

interface HospitalEquipmentProps {
  size?: number;
}

const HospitalEquipment: React.FC<HospitalEquipmentProps> = ({ size = 24 }) => {
  const equipmentIcons = [
    // Stethoscope Icon
    "M19.5 3a2.5 2.5 0 00-2.5 2.5v5.75c0 1.24-1.01 2.25-2.25 2.25s-2.25-1.01-2.25-2.25V9a.75.75 0 00-1.5 0v2.25c0 2.07 1.68 3.75 3.75 3.75s3.75-1.68 3.75-3.75V5.5a1 1 0 112 0v5.75c0 3.45-2.8 6.25-6.25 6.25S7 14.7 7 11.25V5.5a2.5 2.5 0 10-1.5 0v5.75c0 4.2 3.3 7.5 7.5 7.5s7.5-3.3 7.5-7.5V5.5A2.5 2.5 0 0019.5 3z",

    // Syringe Icon
    "M17 2a1 1 0 00-1 1v.59l-3.29 3.3a2.5 2.5 0 00-3.42 3.42L3.3 15.3a1 1 0 001.42 1.42l6-6a2.5 2.5 0 003.42-3.42L18.41 4H19a1 1 0 000-2h-2zM7 14l-2 2v2h2l2-2-2-2zm9-9l-1 1-2-2 1-1h2v2z",

    // Bandage Icon
    "M9.17 6.34a1 1 0 011.41 0l7.08 7.08a1 1 0 010 1.41l-2.83 2.83a1 1 0 01-1.41 0L6.34 9.17a1 1 0 010-1.41l2.83-2.83zM4.22 12.22a1 1 0 011.42 0l6.36 6.36a1 1 0 01-1.42 1.42L4.22 13.64a1 1 0 010-1.42zm11.31 0a1 1 0 010 1.42l-6.36 6.36a1 1 0 01-1.42-1.42l6.36-6.36a1 1 0 011.42 0z",
  ];

  const randomIndex = Math.floor(Math.random() * equipmentIcons.length);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 360],
      }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
      }}
    >
      <path d={equipmentIcons[randomIndex]} />
    </motion.svg>
  );
};

export default HospitalEquipment;
