// "use client";

// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import Image from "next/image";
// import ImageInProgress1 from "../../assets/Images/IMG_0088.png";
// import ImageInProgress2 from "../../assets/Images/IMG_0089.png";
// import ImageInProgress3 from "../../assets/Images/IMG_0090.png";
// import ImageInProgress4 from "../../assets/Images/IMG_0091.png";
// import ImageInProgress5 from "../../assets/Images/IMG_0092.png";

// export default function Marquee() {
//   const images = [
//     ImageInProgress1,
//     ImageInProgress2,
//     ImageInProgress3,
//     ImageInProgress4,
//     ImageInProgress5,
//   ];

//   const [isPaused, setIsPaused] = useState(false);

//   return (
//     <div className="relative overflow-hidden">
//       {/* Scrolling Marquee */}


//       {/* Fixed (Static) Second Marquee Layer */}
//       <div className="flex flex-nowrap whitespace-nowrap bgStunColor py-10 -mt- px-6 sm:px-10
//       my-32 -skew-y-12">
//         {Array.from({ length: 3 }).flatMap(() =>
//           images.map((image, index) => (
//             <motion.div
//               key={index}
//               className="group min-w-[150px]"
//               whileHover={{
//                 scale: 1.2,
//                 rotate: 5,
//                 transition: { duration: 0.3 },
//               }}
//               whileTap={{
//                 scale: 0.9,
//                 rotate: -5,
//                 transition: { duration: 0.2 },
//               }}
//             >
//               <Image
//                 src={image}
//                 alt={`In Progress Image ${index}`}
//                 width={150}
//                 height={150}
//                 layout="intrinsic"
//               />
//             </motion.div>
//           ))
//         )}
//       </div>

//       <div className="w-full overflow-hidden py-4 my-32  bgStunColor">
//         <motion.div
//           className="flex gap-6 sm:gap-8 whitespace-nowrap"
//           animate={{ x: isPaused ? 0 : "-50%" }}
//           transition={{
//             ease: "linear",
//             duration: 12,
//             repeat: Infinity,
//           }}
//           onHoverStart={() => setIsPaused(true)}
//           onHoverEnd={() => setIsPaused(false)}
//           style={{ display: "flex", width: "max-content" }}
//         >
//           {[...images, ...images, ...images, ...images].map((image, index) => (
//             <motion.div
//               key={index}
//               className="group"
//               whileHover={{
//                 scale: 1.2,
//                 rotate: 5,
//                 transition: { duration: 0.3 },
//               }}
//               whileTap={{
//                 scale: 0.9,
//                 rotate: -5,
//                 transition: { duration: 0.2 },
//               }}
//             >
//               <Image
//                 src={image}
//                 alt={`In Progress Image ${index}`}
//                 width={150}
//                 height={150}
//                 layout="intrinsic"
//               />
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </div>
//   );
// }







"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import ImageInProgress1 from "../../assets/Images/IMG_0088.png";
import ImageInProgress2 from "../../assets/Images/IMG_0089.png";
import ImageInProgress3 from "../../assets/Images/IMG_0090.png";
import ImageInProgress4 from "../../assets/Images/IMG_0091.png";
import ImageInProgress5 from "../../assets/Images/IMG_0092.png";

export default function Marquee() {
  const images = [
    ImageInProgress1,
    ImageInProgress2,
    ImageInProgress3,
    ImageInProgress4,
    ImageInProgress5,
  ];

  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="relative overflow-hidden bg-gradient-to-tr from-gray-700 to-purple-500">
      {/* Scrolling Marquee */}
      <div className="w-full overflow-hidden py-6 sm:py-8">
        <motion.div
          className="flex gap-6 sm:gap-8 whitespace-nowrap"
          animate={{ x: isPaused ? 0 : "-50%" }}
          transition={{
            ease: "linear",
            duration: 12,
            repeat: Infinity,
          }}
          onHoverStart={() => setIsPaused(true)}
          onHoverEnd={() => setIsPaused(false)}
          style={{ display: "flex", width: "max-content" }}
        >
          {[...images, ...images, ...images, ...images].map((image, index) => (
            <motion.div
              key={index}
              className="group"
              whileHover={{
                scale: 1.2,
                rotate: 5,
                transition: { duration: 0.3 },
              }}
              whileTap={{
                scale: 0.9,
                rotate: -5,
                transition: { duration: 0.2 },
              }}
            >
              <Image
                src={image}
                alt={`In Progress Image ${index}`}
                width={150}
                height={150}
                layout="intrinsic"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Fixed (Static) Second Marquee Layer */}
      <div className="flex flex-nowrap gap-6 sm:gap-8 whitespace-nowrap bg-purple-600 py-8 px-6 sm:px-10 -skew-y-3">
        {Array.from({ length: 3 }).flatMap(() =>
          images.map((image, index) => (
            <motion.div
              key={index}
              className="group min-w-[150px]"
              whileHover={{
                scale: 1.2,
                rotate: 5,
                transition: { duration: 0.3 },
              }}
              whileTap={{
                scale: 0.9,
                rotate: -5,
                transition: { duration: 0.2 },
              }}
            >
              <Image
                src={image}
                alt={`In Progress Image ${index}`}
                width={150}
                height={150}
                layout="intrinsic"
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
