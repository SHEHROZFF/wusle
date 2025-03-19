"use client";
import { motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSession } from "next-auth/react";
import { useState } from "react";
import LoginModal from "@/components/LoginModal";
import Image from "next/image";
import Logo from "@/assets/Images/logo.jpeg";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const Footer: React.FC = () => {
  const { data: session } = useSession();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <footer className="relative overflow-hidden p-10 bg-black/80 backdrop-blur-lg text-white">
      {/* Pulsing gradient overlay for a futuristic glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-800 to-blue-800 opacity-30 animate-pulse -z-10" />

      {/* Logo in center above the links */}
      <div className="container mx-auto text-center mb-8">
        <Image
          src={Logo}
          alt="Logo"
          width={65}
          height={65}
          className=" my-2 py-2 mx-auto border-2 border-[#9c23d5] bg-white rounded-full cursor-pointer hover:text-black transition"
        />
        {/* <img src="/logo.png" alt="Logo" className="mx-auto w-32" /> */}
      </div>

      {/* Grid Links */}
      <motion.div
        className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {["ABOUT", "DOCS", "TERMS", "SOCIALS"].map((title) => (
          <motion.div key={title} variants={fadeIn}>
            <h3 className="fontFamily mb-4 text-xl border-b border-white/20 pb-2">
              {title}
            </h3>
            <ul className="space-y-1">
              {title === "ABOUT" && (
                <>
                  <li>
                    <a href="#" className=" inline-block text-white hover:text-purple-300 transition-colors transform hover:scale-110 fontFamily ">
                      Tokenomics
                    </a>
                  </li>
                  <li>
                    <a href="#" className="inline-block text-white hover:text-purple-300 transition-colors transform hover:scale-110  fontFamily">
                      How to Buy
                    </a>
                  </li>
                </>
              )}
              {title === "DOCS" && (
                <>
                  <li>
                    <a
                      href="/Wusle_Audit.pdf"
                      className="inline-block text-white hover:text-purple-300 transition-colors transform hover:scale-110  fontFamily"
                      download
                    >
                      Audit
                    </a>
                  </li>
                </>
              )}
              {title === "TERMS" && (
                <>
                  <li>
                    <a href="#" className="inline-block text-white hover:text-purple-300 transition-colors transform hover:scale-110  fontFamily">
                      Cookies Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="/Wusle_privacy_policy.pdf"
                      className="inline-block text-white hover:text-purple-300 transition-colors transform hover:scale-110  fontFamily"
                      download
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="/Wusle_Terms_and_Condition.pdf"
                      className="inline-block text-white hover:text-purple-300 transition-colors transform hover:scale-110  fontFamily"
                      download
                    >
                      Terms of Use
                    </a>
                  </li>
                </>
              )}
              {title === "SOCIALS" && (
                <>
                  <li>
                    <a
                      href="https://www.instagram.com/wusle_official/"
                      className="inline-block text-white hover:text-purple-300 transition-colors transform hover:scale-110  fontFamily"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://x.com/wusle_official?s=21"
                      className="inline-block text-white hover:text-purple-300 transition-colors transform hover:scale-110  fontFamily"
                    >
                      X
                    </a>
                  </li>
                </>
              )}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      {/* Disclaimer and Action Buttons */}
      <motion.div
        className="mt-12 relative z-10 fontFamily text-sm text-gray-300 text-center space-y-4"
        variants={fadeIn}
      >
        <p className="max-w-2xl mx-auto">
          Disclaimer: Cryptocurrency may be unregulated in your jurisdiction.
          The value of cryptocurrencies may go down as well as up. Profits may be
          subject to capital gains or other taxes applicable in your jurisdiction.
        </p>
        <p>© {new Date().getFullYear()} WUSLE. All Rights Reserved.</p>

        {session?.user ? (
          <WalletMultiButton
          style={{
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            color: "black",
            background: "white",
            border: "none",
            borderRadius: "50px",
            cursor: "pointer",
            transition: "all 0.3s ease-in-out",
            animation: "heartbeat 1s infinite ease-in-out",
            padding: "10px 20px",
            textAlign: "center",
          }}
        >
          CONNECT WALLET
        </WalletMultiButton>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="mt-4 fontFamily text-black bg-white px-6 py-3 rounded-full shadow-lg hover:shadow-2xl transition transform hover:scale-105"
          >
            LOGIN
          </button>
        )}
      </motion.div>

      {/* Futuristic animated SVG divider */}
      {/* <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="footerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7f00ff" />
            <stop offset="100%" stopColor="#e100ff" />
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#footerGradient)"
          d="M0,64L48,58.7C96,53,192,43,288,42.7C384,43,480,53,576,90.7C672,128,768,192,864,213.3C960,235,1056,213,1152,186.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg> */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 300"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="footerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8e44ad" />
            <stop offset="100%" stopColor="#c39bd3" />
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#footerGradient)"
          d="M0,64L48,58.7C96,53,192,43,288,42.7C384,43,480,53,576,90.7C672,128,768,192,864,213.3C960,235,1056,213,1152,186.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>
 
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
    </footer>
  );
};

export default Footer;










// "use client";
// import { motion } from "framer-motion";
// import Image from "next/image";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useSession } from "next-auth/react";
// import { useState } from "react";
// import LoginModal from "@/components/LoginModal"; // import your modal

// const fadeIn = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
// };

// const Footer: React.FC = () => {
//   const { data: session } = useSession();
//   const [showLogin, setShowLogin] = useState(false);

//   return (
//     <footer className="relative overflow-hidden text-white p-8 flex flex-col items-center text-center bg-black/80">
//       {/* Footer Links */}
//       <motion.div
//         className="relative container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-gray-400 text-center"
//         initial="hidden"
//         whileInView="visible"
//         viewport={{ once: true, amount: 0.3 }}
//       >
//         {["ABOUT", "DOCS", "TERMS", "SOCIALS"].map((title) => (
//           <motion.div key={title} variants={fadeIn}>
//             <h3 className="font-bold mb-2 text-white">{title}</h3>
//             <ul>
//               {title === "ABOUT" && (
//                 <>
//                   <li>
//                     <a href="#" className="hover:text-white">
//                       Tokenomics
//                     </a>
//                   </li>
//                   <li>
//                     <a href="#" className="hover:text-white">
//                       How to Buy
//                     </a>
//                   </li>
//                 </>
//               )}
//               {title === "DOCS" && (
//                 <>
//                   {/* <li>
//                     <a href="#" className="hover:text-white">
//                       Whitepaper
//                     </a>
//                   </li> */}
//                   <li>
//                     <a
//                       href="/Wusle_Audit.pdf"
//                       className="hover:text-white"
//                       download
//                     >
//                       Audit
//                     </a>
//                   </li>
//                 </>
//               )}
//               {title === "TERMS" && (
//                 <>
//                   <li>
//                     <a href="#" className="hover:text-white">
//                       Cookies Policy
//                     </a>
//                   </li>
//                   <li>
//                     <a
//                       href="/Wusle_privacy_policy.pdf"
//                       className="hover:text-white"
//                       download={true}
//                     >
//                       Privacy Policy
//                     </a>
//                   </li>
//                   <li>
//                     <a
//                       href="/Wusle_Terms_and_Condition.pdf"
//                       className="hover:text-white"
//                       download={true}
//                     >
//                       Terms of Use
//                     </a>
//                   </li>
//                 </>
//               )}
//               {title === "SOCIALS" && (
//                 <>
//                   <li>
//                     <a
//                       href="https://www.instagram.com/wusle_official/"
//                       className="hover:text-white"
//                     >
//                       Instagram
//                     </a>
//                   </li>
//                   <li>
//                     <a
//                       href="https://x.com/wusle_official?s=21"
//                       className="hover:text-white"
//                     >
//                       X
//                     </a>
//                   </li>
//                 </>
//               )}
//             </ul>
//           </motion.div>
//         ))}
//       </motion.div>

//       {/* Disclaimer */}
//       <motion.div
//         className="relative text-center text-sm text-gray-400 mt-12"
//         variants={fadeIn}
//       >
//         <p>
//           Disclaimer: Cryptocurrency may be unregulated in your jurisdiction.
//           The value of cryptocurrencies may go down as well as up. Profits may
//           be subject to capital gains or other taxes applicable in your
//           jurisdiction.
//         </p>
//         <p className="mt-2 mb-3">© 2024 WUSLE. All Rights Reserved.</p>

//         {session?.user ? (
//           // Logged-in user => show Connect Wallet
          // <WalletMultiButton
          //   style={{
          //     fontSize: "16px",
          //     display: "flex",
          //     alignItems: "center",
          //     justifyContent: "center",
          //     fontWeight: "bold",
          //     color: "black",
          //     background: "white",
          //     border: "none",
          //     borderRadius: "50px",
          //     cursor: "pointer",
          //     transition: "all 0.3s ease-in-out",
          //     animation: "heartbeat 1s infinite ease-in-out",
          //     padding: "10px 20px",
          //     textAlign: "center",
          //   }}
          // >
          //   CONNECT WALLET
          // </WalletMultiButton>
//         ) : (
//           // Not logged in => show LOGIN button
//           <button
//             onClick={() => setShowLogin(true)}
//             style={{
//               fontSize: "16px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontWeight: "bold",
//               color: "black",
//               background: "white",
//               border: "none",
//               borderRadius: "50px",
//               cursor: "pointer",
//               transition: "all 0.3s ease-in-out",
//               animation: "heartbeat 1s infinite ease-in-out",
//               padding: "10px 20px",
//               textAlign: "center",
//             }}
//           >
//             LOGIN
//           </button>
//         )}
//       </motion.div>

//       {/* Our login modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
//     </footer>
//   );
// };

// export default Footer;










// // components/Footer.jsx
// "use client";
// import { motion } from "framer-motion";
// import Image from "next/image";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// const fadeIn = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
// };

// const Footer: React.FC = () => {
//   return (
//     <footer className="relative overflow-hidden text-white p-8 flex flex-col items-center text-center bg-black/80">
//       {/* Footer Links */}
//       <motion.div
//         className="relative container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-gray-400 text-center"
//         initial="hidden"
//         whileInView="visible"
//         viewport={{ once: true, amount: 0.3 }}
//       >
//         {["ABOUT", "DOCS", "TERMS", "SOCIALS"].map((title) => (
//           <motion.div key={title} variants={fadeIn}>
//             <h3 className="font-bold mb-2 text-white">{title}</h3>
//             <ul>
//               {title === "ABOUT" && (
//                 <>
//                   <li>
//                     <a href="#" className="hover:text-white">
//                       Tokenomics
//                     </a>
//                   </li>
//                   <li>
//                     <a href="#" className="hover:text-white">
//                       How to Buy
//                     </a>
//                   </li>
//                 </>
//               )}
//               {title === "DOCS" && (
//                 <>
//                   {/* <li>
//                     <a href="#" className="hover:text-white">
//                       Whitepaper
//                     </a>
//                   </li> */}
//                   <li>
//                     <li>
//                       <a
//                         href="/Wusle_Audit.pdf"
//                         className="hover:text-white"
//                         download
//                       >
//                         Audit
//                       </a>
//                     </li>
//                   </li>
//                 </>
//               )}
//               {title === "TERMS" && (
//                 <>
//                   <li>
//                     <a href="#" className="hover:text-white">
//                       Cookies Policy
//                     </a>
//                   </li>
//                   <li>
//                     <a
//                       href="/Wusle_privacy_policy.pdf"
//                       className="hover:text-white"
//                       download={true}
//                     >
//                       Privacy Policy
//                     </a>
//                   </li>
//                   <li>
//                     <a
//                       href="/Wusle_Terms_and_Condition.pdf"
//                       className="hover:text-white"
//                       download={true}
//                     >
//                       Terms of Use
//                     </a>
//                   </li>
//                 </>
//               )}
//               {title === "SOCIALS" && (
//                 <>
//                   <li>
//                     <a
//                       href="https://www.instagram.com/wusle_official/"
//                       className="hover:text-white"
//                     >
//                       Instagram
//                     </a>
//                   </li>
//                   <li>
//                     <a
//                       href="https://x.com/wusle_official?s=21"
//                       className="hover:text-white"
//                     >
//                       X
//                     </a>
//                   </li>
//                 </>
//               )}
//             </ul>
//           </motion.div>
//         ))}
//       </motion.div>

//       {/* Disclaimer */}
//       <motion.div
//         className="relative text-center text-sm text-gray-400 mt-12"
//         variants={fadeIn}
//       >
//         <p>
//           Disclaimer: Cryptocurrency may be unregulated in your jurisdiction.
//           The value of cryptocurrencies may go down as well as up. Profits may
//           be subject to capital gains or other taxes applicable in your
//           jurisdiction.
//         </p>
//         <p className="mt-2 mb-3">© 2024 WUSLE. All Rights Reserved.</p>
//         <WalletMultiButton
//           style={{
//             fontSize: "16px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             fontWeight: "bold",
//             color: "black",
//             background: "white",
//             border: "none",
//             borderRadius: "50px",
//             cursor: "pointer",
//             transition: "all 0.3s ease-in-out",
//             animation: "heartbeat 1s infinite ease-in-out",
//             padding: "10px 20px", // Adjust padding for better spacing
//             textAlign: "center",
//           }}
//         >
//           CONNECT WALLET
//         </WalletMultiButton>
//       </motion.div>

//       {/* Wallet Button */}
//     </footer>
//   );
// };

// export default Footer;
