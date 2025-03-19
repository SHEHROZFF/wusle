"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FaXTwitter, FaInstagram, FaWallet } from "react-icons/fa6";
import Logo from "../../assets/Images/logo.jpeg";
import { useSession, signOut } from "next-auth/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import LoginModal from "@/components/LoginModal";
import PurchaseHistoryModal from "@/components/PurchaseHistoryModal";
import { FaBars, FaSignInAlt } from "react-icons/fa";
import { useIsWide } from "@/hooks/useIsWide";

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "/whitepaper.pdf", label: "Whitepaper" },
  { href: "/Wusle_Audit.pdf", label: "Audit" },
];

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const { connected } = useWallet();
  const [showLogin, setShowLogin] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // center nav overlay state
  const [sliderOpen, setSliderOpen] = useState(false); // right side slider
  const [showHistory, setShowHistory] = useState(false); // purchase history modal

  const isWide = useIsWide(480)

  // Split nav links into left and right groups
  const half = Math.ceil(links.length / 2);
  const leftLinks = links.slice(0, half);
  const rightLinks = links.slice(half);

  // Mobile detection: treat screens less than 1106px as mobile
  const [isMobile, setIsMobile] = useState(false);
  // const [isWide, setIsWide] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1220);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  // useEffect(() => {
  //   setIsWide(window.innerWidth > 480);
  // }, []);

  // Logout handler (redirects to home after logout)
  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  // Framer-motion variants for center nav overlay (desktop)
  const menuVariants = {
    left: {
      hidden: { x: -50, opacity: 0 },
      visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
    },
    right: {
      hidden: { x: 50, opacity: 0 },
      visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120 },
    },
  };

  // Slide variants for right-side slider
  const slideVariants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  function handleScroll(e: React.MouseEvent, id: string) {
    e.preventDefault();
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      if (isMobile) setIsOpen(false);
    }
  }

  return (
    <>
      {isMobile ? (
        // Mobile Layout for screens less than 1106px
        <div className="flex justify-between items-center bg-transparent relative z-30 px-2 py-2">
          {/* Left Side: Social Media Icons */}
          <div className="flex">
            <a
              href="https://x.com/wusle_official?s=21"
              target="_blank"
              rel="noopener noreferrer"
              className={`border-2 flex border-[#9c23d5] bg-[#fce2ff] rounded-full items-center justify-center hover:text-black transition ${isWide ? "w-12 h-12" : "w-8 h-8"}`}
            >
              <FaXTwitter className="text-[#9c23d5] text-2xl" />
            </a>

            {isWide && (
                <a
                href="https://www.instagram.com/wusle_official/#"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition ml-2"
              >
                <FaInstagram className="text-[#9c23d5] text-2xl" />
              </a>
            )}

          </div>

          {/* Center: Main Nav or Hamburger */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white text-xl focus:outline-none ml-2"
              >
                <div className="border-4 border-[#9c23d5] bg-white rounded-full cursor-pointer hover:text-black transition">
                <Image
                  src={Logo}
                  alt="Logo"
                  width={isWide ? 40 : 20}
                  height={isWide ? 40 : 20}
                  className="rounded-full my-2 mx-1"
                />
                </div>
              </button>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="absolute left-1/2 top-52 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-indigo-600/70 to-[#4f0289]/90 text-white w-[80%] flex flex-col justify-center items-center gap-6 py-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {links.map((link) =>
                    link.href.startsWith("#") ? (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={(e) => handleScroll(e, link.href)}
                        className="relative px-4 py-2 rounded-md text-2xl font-semibold transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        download={link.href.endsWith(".pdf") ? true : undefined}
                        className="relative px-4 py-2 rounded-md text-2xl font-semibold transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
                      >
                        {link.label}
                      </Link>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side: Wallet Connect & Slider / Login */}
          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <div className="flex-shrink-0 min-w-[160px]">
                  <WalletMultiButton
                    style={{
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      color: "black",
                      background: "white",
                      border: "2px solid #9c23d5",
                      borderRadius: "50px",
                      cursor: "pointer",
                      transition: "all 0.3s ease-in-out",
                      marginLeft:'130px',
                      padding: "0px 15px",
                      textAlign: "center",
                      backgroundColor: "#fce2ff",
                    }}
                  >
                    {connected ? <FaWallet className="text-purple-700 text-2xl h-5 w-5" /> : <FaWallet className="text-2xl h-4 w-4" />}
                  </WalletMultiButton>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setSliderOpen(!sliderOpen)}
                    className={`text-[#9c23d5] border-2 border-[#9c23d5] bg-[#fce2ff] rounded-full flex items-center justify-center hover:text-black transition transform hover:scale-110 ${ isWide ? 'w-12 h-12' : 'w-8 h-8'}`}
                  >
                    <FaBars className={`text-xl  ${ isWide ? '' : 'h-4 w-4'}`} />
                  </button>
                  <AnimatePresence>
                    {sliderOpen && (
                      <motion.div
                        className="fixed top-0 right-0 w-[300px] h-full bg-gradient-to-br from-[#4f0289]/80 to-[#9c23d5]/80 text-white z-50 flex flex-col p-8 [clip-path:polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)] shadow-2xl"
                        variants={slideVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <button
                          onClick={() => setSliderOpen(false)}
                          className="self-end text-3xl hover:text-gray-300 transition"
                        >
                          &times;
                        </button>
                        <div className="mt-10 flex flex-col gap-6">
                          <button
                            onClick={() => setShowHistory(true)}
                            className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
                          >
                            Purchase History
                          </button>
                          <button
                            onClick={handleLogout}
                            className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              // Mobile Login Button: Icon-only
              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowLogin(true)}
                  style={{
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    color: "black",
                    background: "white",
                    borderRadius: "50px",
                    cursor: "pointer",
                    transition: "all 0.3s ease-in-out",
                    padding: "5px 5px",
                    textAlign: "center",
                    backgroundColor: "#fce2ff",
                    border: "2px solid #9c23d5",
                  }}
                >
                  <FaSignInAlt className="text-2xl" />
                </button>
              </div>
            )}
          </div>

          {/* Modals */}
          <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
          <PurchaseHistoryModal show={showHistory} onClose={() => setShowHistory(false)} />
        </div>
      ) : (
        // Desktop Layout for screens 1106px and above
        <div className="flex justify-between items-center bg-transparent relative z-30 px-6 py-4 min-h-[70px] w-full">
          {/* Left Column (Fixed Width) */}
          <div className="w-[200px] flex gap-6">
            <a
              href="https://x.com/wusle_official?s=21"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
            >
              <FaXTwitter className="text-[#9c23d5] text-2xl" />
            </a>
            <a
              href="https://www.instagram.com/wusle_official/#"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
            >
              <FaInstagram className="text-[#9c23d5] text-2xl" />
            </a>
          </div>

          {/* Center Column (Logo & Hover Nav) */}
          <div 
            className="flex flex-col items-center relative flex-grow"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <Link
              href="/"
              className="border-4 border-[#9c23d5] bg-white rounded-full cursor-pointer flex-shrink-0 hover:text-black transition z-10"
            >
              <Image
                src={Logo}
                alt="Logo"
                width={65}
                height={65}
                className="rounded-full my-2"
              />
            </Link>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute top-2 left-1/2 transform -translate-x-1/2 flex gap-40 text-lg font-semibold bg-gradient-to-br from-indigo-600/70 to-[#4f0289]/90 px-10 py-3 rounded-full"

                  
                >
                  <div className="flex gap-6">
                    {leftLinks.map((link) => (
                      <motion.div key={link.href} variants={itemVariants}>
                        {link.href.startsWith("#") ? (
                          <a
                            href={link.href}
                            onClick={(e) => handleScroll(e, link.href)}
                            className="relative py-2 px-4 rounded-full text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            download={link.href.endsWith(".pdf") ? true : undefined}
                            className="relative py-2 px-4 rounded-full text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
                          >
                            {link.label}
                          </Link>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex gap-6">
                    {rightLinks.map((link) => (
                      <motion.div key={link.href} variants={itemVariants}>
                        {link.href.startsWith("#") ? (
                          <a
                            href={link.href}
                            onClick={(e) => handleScroll(e, link.href)}
                            className="relative py-2 px-4 rounded-full text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            download={link.href.endsWith(".pdf") ? true : undefined}
                            className="relative py-2 px-4 rounded-full text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
                          >
                            {link.label}
                          </Link>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column (Fixed Width) */}
          <div className="w-[200px] flex justify-end items-center gap-3">
            {session?.user ? (
              <>
                <div className="flex-shrink-0 min-w-[160px]">
                  <WalletMultiButton
                    style={{
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      color: "black",
                      background: "white",
                      border: "2px solid #9c23d5",
                      borderRadius: "50px",
                      cursor: "pointer",
                      transition: "all 0.3s ease-in-out",
                      padding: "10px 20px",
                      textAlign: "center",
                      backgroundColor: "#fce2ff",
                    }}
                  >
                    {connected ? "CONNECTED" : "CONNECT WALLET"}
                  </WalletMultiButton>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setSliderOpen(!sliderOpen)}
                    className="text-[#9c23d5] border-2 border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 flex items-center justify-center hover:text-black transition transform hover:scale-110"
                  >
                    <FaBars className="text-xl" />
                  </button>
                  <AnimatePresence>
                    {sliderOpen && (
                      <motion.div
                        className="fixed top-0 right-0 w-[300px] h-full bg-gradient-to-br from-[#4f0289]/80 to-[#9c23d5]/80 text-white z-50 flex flex-col p-8 [clip-path:polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)] shadow-2xl"
                        variants={slideVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <button
                          onClick={() => setSliderOpen(false)}
                          className="self-end text-3xl hover:text-gray-300 transition"
                        >
                          &times;
                        </button>
                        <div className="mt-10 flex flex-col gap-6">
                          <button
                            onClick={() => setShowHistory(true)}
                            className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
                          >
                            Purchase History
                          </button>
                          <button
                            onClick={handleLogout}
                            className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              // Desktop Login Button: Text-based
              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowLogin(true)}
                  style={{
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    color: "black",
                    background: "white",
                    borderRadius: "50px",
                    cursor: "pointer",
                    transition: "all 0.3s ease-in-out",
                    padding: "10px 20px",
                    textAlign: "center",
                    backgroundColor: "#fce2ff",
                    border: "2px solid #9c23d5",
                  }}
                >
                  LOGIN
                </button>
              </div>
            )}
          </div>

          {/* Modals */}
          <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
          <PurchaseHistoryModal show={showHistory} onClose={() => setShowHistory(false)} />
        </div>
      )}
    </>
  );
};

export default Navbar;









// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";
// import { FaXTwitter, FaInstagram, FaWallet } from "react-icons/fa6";
// import Logo from "../../assets/Images/logo.jpeg";
// import { useSession, signOut } from "next-auth/react";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import LoginModal from "@/components/LoginModal";
// import PurchaseHistoryModal from "@/components/PurchaseHistoryModal";
// import { FaBars, FaSignInAlt } from "react-icons/fa";

// const links = [
//   { href: "#home", label: "Home" },
//   { href: "#about", label: "About" },
//   { href: "/whitepaper.pdf", label: "Whitepaper" },
//   { href: "/Wusle_Audit.pdf", label: "Audit" },
// ];

// const Navbar: React.FC = () => {
//   const { data: session } = useSession();
//   const { connected } = useWallet();
//   const [showLogin, setShowLogin] = useState(false);
//   const [isOpen, setIsOpen] = useState(false); // center nav overlay state
//   const [sliderOpen, setSliderOpen] = useState(false); // right side slider
//   const [showHistory, setShowHistory] = useState(false); // purchase history modal

//   // Split nav links into left and right groups
//   const half = Math.ceil(links.length / 2);
//   const leftLinks = links.slice(0, half);
//   const rightLinks = links.slice(half);

//   // Mobile detection: treat screens less than 1106px as mobile
//   const [isMobile, setIsMobile] = useState(false);
//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth < 1106);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // Logout handler (redirects to home after logout)
//   const handleLogout = () => {
//     signOut({ callbackUrl: "/" });
//   };

//   // Framer-motion variants for center nav overlay (desktop)
//   const menuVariants = {
//     left: {
//       hidden: { x: -50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//     right: {
//       hidden: { x: 50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: -10 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { type: "spring", stiffness: 120 },
//     },
//   };

//   // Slide variants for right-side slider
//   const slideVariants = {
//     hidden: { x: "100%" },
//     visible: { x: 0, transition: { duration: 0.4, ease: "easeOut" } },
//   };

//   function handleScroll(e: React.MouseEvent, id: string) {
//     e.preventDefault();
//     const element = document.querySelector(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//       if (isMobile) setIsOpen(false);
//     }
//   }

//   return (
//     <>
//       {isMobile ? (
//         // Mobile Layout for screens less than 1106px
//         <div className="flex justify-between items-center bg-transparent relative z-30 px-6 py-4">
//           {/* Left Side: Social Media Icons */}
//           <div className="flex">
//             <a
//               href="https://x.com/wusle_official?s=21"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//             >
//               <FaXTwitter className="text-[#9c23d5] text-2xl" />
//             </a>
//             <a
//               href="https://www.instagram.com/wusle_official/#"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition ml-2"
//             >
//               <FaInstagram className="text-[#9c23d5] text-2xl" />
//             </a>
//           </div>

//           {/* Center: Main Nav or Hamburger */}
//           <div className="flex items-center justify-between w-full">
//             <div className="flex items-center gap-2">
//               {/* <a
//                 href="https://x.com/wusle_official?s=21"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="border-2 border-[#9c23d5] bg-[#fce2ff] rounded-full w-10 h-10 flex items-center justify-center hover:text-black transition"
//               >
//                 <FaXTwitter className="text-[#9c23d5] text-3xl" />
//               </a> */}
//               <button
//                 onClick={() => setIsOpen(!isOpen)}
//                 className="text-white text-xl focus:outline-none ml-2"
//               >
//                 <div className="border-4 border-[#9c23d5] bg-white rounded-full cursor-pointer hover:text-black transition">
//                   <Image
//                     src={Logo}
//                     alt="Logo"
//                     width={40}
//                     height={40}
//                     className="rounded-full my-2"
//                   />
//                 </div>
//               </button>
//             </div>
//             <AnimatePresence>
//               {isOpen && (
//                 <motion.div
//                   className="absolute left-1/2 top-52 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-indigo-600/70 to-[#4f0289]/90 text-white w-[80%] flex flex-col justify-center items-center gap-6 py-6"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   transition={{ duration: 0.5 }}
//                 >
//                   {links.map((link) =>
//                     link.href.startsWith("#") ? (
//                       <a
//                         key={link.href}
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="relative px-4 py-2 rounded-md text-2xl font-semibold transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         key={link.href}
//                         href={link.href}
//                         onClick={() => setIsOpen(false)}
//                         download={link.href.endsWith(".pdf") ? true : undefined}
//                         className="relative px-4 py-2 rounded-md text-2xl font-semibold transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                       >
//                         {link.label}
//                       </Link>
//                     )
//                   )}
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Right Side: Wallet Connect & Slider */}
//           <div className="flex items-center gap-3">
//             {session?.user ? (
//               <>
//                 <div className="flex-shrink-0 min-w-[160px]">
//                   <WalletMultiButton
//                     style={{
//                       fontSize: "16px",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       fontWeight: "bold",
//                       color: "black",
//                       background: "white",
//                       border: "2px solid #9c23d5",
//                       borderRadius: "50px",
//                       cursor: "pointer",
//                       transition: "all 0.3s ease-in-out",
//                       padding: "10px 20px",
//                       textAlign: "center",
//                       backgroundColor: "#fce2ff",
//                     }}
//                   >
//                     {isMobile 
//                       ? (connected ? <FaWallet className="text-purple-700 text-2xl" /> : <FaWallet className="text-2xl" />)
//                       : (connected ? "CONNECTED" : "CONNECT WALLET")
//                     }
//                   </WalletMultiButton>
//                 </div>
//                 <div className="relative">
//                   <button
//                     onClick={() => setSliderOpen(!sliderOpen)}
//                     className="text-[#9c23d5] border-2 border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 flex items-center justify-center hover:text-black transition transform hover:scale-110"
//                   >
//                     <FaBars className="text-xl" />
//                   </button>
//                   <AnimatePresence>
//                     {sliderOpen && (
//                       <motion.div
//                         className="fixed top-0 right-0 w-[300px] h-full bg-gradient-to-br from-[#4f0289]/80 to-[#9c23d5]/80 text-white z-50 flex flex-col p-8 [clip-path:polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)] shadow-2xl"
//                         variants={slideVariants}
//                         initial="hidden"
//                         animate="visible"
//                         exit="hidden"
//                       >
//                         <button
//                           onClick={() => setSliderOpen(false)}
//                           className="self-end text-3xl hover:text-gray-300 transition"
//                         >
//                           &times;
//                         </button>
//                         <div className="mt-10 flex flex-col gap-6">
//                           <button
//                             onClick={() => setShowHistory(true)}
//                             className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
//                           >
//                             Purchase History
//                           </button>
//                           <button
//                             onClick={handleLogout}
//                             className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
//                           >
//                             Logout
//                           </button>
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               </>
//             ) : (
//               <div className="flex-shrink-0 min-w-[160px]">
//                 <button
//                   onClick={() => setShowLogin(true)}
//                   style={{
//                     fontSize: "16px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontWeight: "bold",
//                     color: "black",
//                     background: "white",
//                     borderRadius: "50px",
//                     cursor: "pointer",
//                     transition: "all 0.3s ease-in-out",
//                     padding: "10px 20px",
//                     textAlign: "center",
//                     backgroundColor: "#fce2ff",
//                     border: "2px solid #9c23d5",
//                   }}
//                 >
//                   {isMobile ? <FaSignInAlt className="text-2xl" /> : "LOGIN"}
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Modals */}
//           <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
//           <PurchaseHistoryModal show={showHistory} onClose={() => setShowHistory(false)} />
//         </div>
//       ) : (
//         // Desktop Layout for screens 1106px and above
//         <div className="flex justify-between items-center bg-transparent relative z-30 px-6 py-4 min-h-[70px] w-full">
//           {/* Left Column (Fixed Width) */}
//           <div className="w-[200px] flex gap-6">
//             <a
//               href="https://x.com/wusle_official?s=21"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//             >
//               <FaXTwitter className="text-[#9c23d5] text-2xl" />
//             </a>
//             <a
//               href="https://www.instagram.com/wusle_official/#"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//             >
//               <FaInstagram className="text-[#9c23d5] text-2xl" />
//             </a>
//           </div>

//           {/* Center Column (Logo & Hover Nav) */}
//           <div 
//             className="flex flex-col items-center relative flex-grow"
//             onMouseEnter={() => setIsOpen(true)}
//             onMouseLeave={() => setIsOpen(false)}
//           >
//             <Link
//               href="/"
//               className="border-4 border-[#9c23d5] bg-white rounded-full cursor-pointer flex-shrink-0 hover:text-black transition z-10"
//             >
//               <Image
//                 src={Logo}
//                 alt="Logo"
//                 width={65}
//                 height={65}
//                 className="rounded-full my-2"
//               />
//             </Link>
//             <AnimatePresence>
//               {isOpen && (
//                 <motion.div
//                   initial="hidden"
//                   animate="visible"
//                   exit="hidden"
//                   className="absolute top-2 left-1/2 transform -translate-x-1/2 flex gap-40 text-lg font-semibold bg-gradient-to-br from-[#4f0289]/80 to-[#9c23d5]/80 px-10 py-3 rounded-full"
//                 >
//                   <div className="flex gap-6">
//                     {leftLinks.map((link) => (
//                       <motion.div key={link.href} variants={itemVariants}>
//                         {link.href.startsWith("#") ? (
//                           <a
//                             href={link.href}
//                             onClick={(e) => handleScroll(e, link.href)}
//                             className="relative py-2 rounded-md text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                           >
//                             {link.label}
//                           </a>
//                         ) : (
//                           <Link
//                             href={link.href}
//                             download={link.href.endsWith(".pdf") ? true : undefined}
//                             className="relative py-2 rounded-md text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                           >
//                             {link.label}
//                           </Link>
//                         )}
//                       </motion.div>
//                     ))}
//                   </div>
//                   <div className="flex gap-6">
//                     {rightLinks.map((link) => (
//                       <motion.div key={link.href} variants={itemVariants}>
//                         {link.href.startsWith("#") ? (
//                           <a
//                             href={link.href}
//                             onClick={(e) => handleScroll(e, link.href)}
//                             className="relative py-2  rounded-md text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                           >
//                             {link.label}
//                           </a>
//                         ) : (
//                           <Link
//                             href={link.href}
//                             download={link.href.endsWith(".pdf") ? true : undefined}
//                             className="relative py-2 rounded-md text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                           >
//                             {link.label}
//                           </Link>
//                         )}
//                       </motion.div>
//                     ))}
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Right Column (Fixed Width) */}
//           <div className="w-[200px] flex justify-end items-center gap-3">
//             {session?.user ? (
//               <>
//                 <div className="flex-shrink-0 min-w-[160px]">
//                   <WalletMultiButton
//                     style={{
//                       fontSize: "16px",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       fontWeight: "bold",
//                       color: "black",
//                       background: "white",
//                       border: "2px solid #9c23d5",
//                       borderRadius: "50px",
//                       cursor: "pointer",
//                       transition: "all 0.3s ease-in-out",
//                       padding: "10px 20px",
//                       textAlign: "center",
//                       backgroundColor: "#fce2ff",
//                     }}
//                   >
//                     {connected ? "CONNECTED" : "CONNECT WALLET"}
//                   </WalletMultiButton>
//                 </div>
//                 <div className="relative">
//                   <button
//                     onClick={() => setSliderOpen(!sliderOpen)}
//                     className="text-[#9c23d5] border-2 border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 flex items-center justify-center hover:text-black transition transform hover:scale-110"
//                   >
//                     <FaBars className="text-xl" />
//                   </button>
//                   <AnimatePresence>
//                     {sliderOpen && (
//                       <motion.div
//                         className="fixed top-0 right-0 w-[300px] h-full bg-gradient-to-br from-[#4f0289]/80 to-[#9c23d5]/80 text-white z-50 flex flex-col p-8 [clip-path:polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)] shadow-2xl"
//                         variants={slideVariants}
//                         initial="hidden"
//                         animate="visible"
//                         exit="hidden"
//                       >
//                         <button
//                           onClick={() => setSliderOpen(false)}
//                           className="self-end text-3xl hover:text-gray-300 transition"
//                         >
//                           &times;
//                         </button>
//                         <div className="mt-10 flex flex-col gap-6">
//                           <button
//                             onClick={() => setShowHistory(true)}
//                             className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
//                           >
//                             Purchase History
//                           </button>
//                           <button
//                             onClick={handleLogout}
//                             className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
//                           >
//                             Logout
//                           </button>
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               </>
//             ) : (
//               <div className="flex-shrink-0 min-w-[160px]">
//                 <button
//                   onClick={() => setShowLogin(true)}
//                   style={{
//                     fontSize: "16px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontWeight: "bold",
//                     color: "black",
//                     background: "white",
//                     borderRadius: "50px",
//                     cursor: "pointer",
//                     transition: "all 0.3s ease-in-out",
//                     padding: "10px 20px",
//                     textAlign: "center",
//                     backgroundColor: "#fce2ff",
//                     border: "2px solid #9c23d5",
//                   }}
//                 >
//                   {"LOGIN"}
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Modals */}
//           <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
//           <PurchaseHistoryModal show={showHistory} onClose={() => setShowHistory(false)} />
//         </div>
//       )}
//     </>
//   );
// };

// export default Navbar;











// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";
// import { FaXTwitter, FaInstagram, FaWallet } from "react-icons/fa6";
// import Logo from "../../assets/Images/logo.jpeg";
// import { useSession, signOut } from "next-auth/react";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import LoginModal from "@/components/LoginModal";
// import PurchaseHistoryModal from "@/components/PurchaseHistoryModal";
// import { FaBars, FaSignInAlt } from "react-icons/fa";

// const links = [
//   { href: "#home", label: "Home" },
//   { href: "#about", label: "About" },
//   { href: "/whitepaper.pdf", label: "Whitepaper" },
//   { href: "/Wusle_Audit.pdf", label: "Audit" },
// ];

// const Navbar: React.FC = () => {
//   const { data: session } = useSession();
//   const { connected } = useWallet();
//   const [showLogin, setShowLogin] = useState(false);
//   const [isOpen, setIsOpen] = useState(false); // center nav overlay state
//   const [sliderOpen, setSliderOpen] = useState(false); // right side slider
//   const [showHistory, setShowHistory] = useState(false); // purchase history modal

//   // Split nav links into left and right groups
//   const half = Math.ceil(links.length / 2);
//   const leftLinks = links.slice(0, half);
//   const rightLinks = links.slice(half);

//   // Mobile detection
//   const [isMobile, setIsMobile] = useState(false);
//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth < 1106);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // Logout handler (redirects to home after logout)
//   const handleLogout = () => {
//     signOut({ callbackUrl: "/" });
//   };

//   // Framer-motion variants for center nav overlay (desktop)
//   const menuVariants = {
//     left: {
//       hidden: { x: -50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//     right: {
//       hidden: { x: 50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: -10 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { type: "spring", stiffness: 120 },
//     },
//   };

//   // Slide variants for right-side slider
//   const slideVariants = {
//     hidden: { x: "100%" },
//     visible: { x: 0, transition: { duration: 0.4, ease: "easeOut" } },
//   };

//   function handleScroll(e: React.MouseEvent, id: string) {
//     e.preventDefault();
//     const element = document.querySelector(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//       if (isMobile) setIsOpen(false);
//     }
//   }

//   return (
//     <>
//       {isMobile ? (
//         // Mobile Layout (unchanged)
//         <div className="flex justify-between items-center bg-transparent relative z-30 px-6 py-4">
//           {/* Left Side: Social Media Icons */}
//           <div className="flex ">
//             <a
//               href="https://x.com/wusle_official?s=21"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 hidden md:flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//             >
//               <FaXTwitter className="text-[#9c23d5] text-2xl" />
//             </a>
//             <a
//               href="https://www.instagram.com/wusle_official/#"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 hidden md:flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//             >
//               <FaInstagram className="text-[#9c23d5] text-2xl" />
//             </a>
//           </div>

//           {/* Center: Main Nav or Hamburger */}
//           <div className="flex items-center justify-between w-full">
//             <div className="flex items-center gap-2">
//               <a
//                 href="https://x.com/wusle_official?s=21"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="border-2 border-[#9c23d5] bg-[#fce2ff] rounded-full w-10 h-10 flex items-center justify-center hover:text-black transition"
//               >
//                 <FaXTwitter className="text-[#9c23d5] text-3xl" />
//               </a>
//               <button
//                 onClick={() => setIsOpen(!isOpen)}
//                 className="text-white text-xl focus:outline-none"
//               >
//                 <div className="border-4 border-[#9c23d5] bg-white rounded-full cursor-pointer hover:text-black transition">
//                   <Image
//                     src={Logo}
//                     alt="Logo"
//                     width={40}
//                     height={40}
//                     className="rounded-full my-2"
//                   />
//                 </div>
//               </button>
//             </div>
//             <AnimatePresence>
//               {isOpen && (
//                 <motion.div
//                   className="absolute left-1/2 top-52 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-indigo-600/70 to-[#4f0289]/90 text-white w-[80%] flex flex-col justify-center items-center gap-6 py-6"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   transition={{ duration: 0.5 }}
//                 >
//                   {links.map((link) =>
//                     link.href.startsWith("#") ? (
//                       <a
//                         key={link.href}
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="relative px-4 py-2 rounded-md text-2xl font-semibold transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         key={link.href}
//                         href={link.href}
//                         onClick={() => setIsOpen(false)}
//                         download={link.href.endsWith(".pdf") ? true : undefined}
//                         className="relative px-4 py-2 rounded-md text-2xl font-semibold transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                       >
//                         {link.label}
//                       </Link>
//                     )
//                   )}
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Right Side: Wallet Connect & Slider */}
//           <div className="flex items-center gap-3">
//             {session?.user ? (
//               <>
//                 <div className="flex-shrink-0 min-w-[160px]">
//                   <WalletMultiButton
//                     style={{
//                       fontSize: "16px",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       fontWeight: "bold",
//                       color: "black",
//                       background: "white",
//                       border: "2px solid #9c23d5",
//                       borderRadius: "50px",
//                       cursor: "pointer",
//                       transition: "all 0.3s ease-in-out",
//                       padding: "10px 20px",
//                       textAlign: "center",
//                       backgroundColor: "#fce2ff",
//                     }}
//                   >
//                     {isMobile 
//                       ? (connected ? <FaWallet className="text-purple-700 text-2xl" /> : <FaWallet className="text-2xl" />)
//                       : (connected ? "CONNECTED" : "CONNECT WALLET")
//                     }
//                   </WalletMultiButton>
//                 </div>
//                 <div className="relative">
//                   <button
//                     onClick={() => setSliderOpen(!sliderOpen)}
//                     className="text-[#9c23d5] border-2 border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 flex items-center justify-center hover:text-black transition transform hover:scale-110"
//                   >
//                     <FaBars className="text-xl" />
//                   </button>
//                   <AnimatePresence>
//                     {sliderOpen && (
//                       <motion.div
//                         className="fixed top-0 right-0 w-[300px] h-full bg-gradient-to-br from-[#4f0289]/80 to-[#9c23d5]/80 text-white z-50 flex flex-col p-8 [clip-path:polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)] shadow-2xl"
//                         variants={slideVariants}
//                         initial="hidden"
//                         animate="visible"
//                         exit="hidden"
//                       >
//                         <button
//                           onClick={() => setSliderOpen(false)}
//                           className="self-end text-3xl hover:text-gray-300 transition"
//                         >
//                           &times;
//                         </button>
//                         <div className="mt-10 flex flex-col gap-6">
//                           <button
//                             onClick={() => setShowHistory(true)}
//                             className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
//                           >
//                             Purchase History
//                           </button>
//                           <button
//                             onClick={handleLogout}
//                             className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
//                           >
//                             Logout
//                           </button>
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               </>
//             ) : (
//               <div className="flex-shrink-0 min-w-[160px]">
//                 <button
//                   onClick={() => setShowLogin(true)}
//                   style={{
//                     fontSize: "16px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontWeight: "bold",
//                     color: "black",
//                     background: "white",
//                     borderRadius: "50px",
//                     cursor: "pointer",
//                     transition: "all 0.3s ease-in-out",
//                     padding: "10px 20px",
//                     textAlign: "center",
//                     backgroundColor: "#fce2ff",
//                     border: "2px solid #9c23d5",
//                   }}
//                 >
//                   {isMobile ? <FaSignInAlt className="text-2xl" /> : "LOGIN"}
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Modals */}
//           <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
//           <PurchaseHistoryModal show={showHistory} onClose={() => setShowHistory(false)} />
//         </div>
//       ) : (
//         // Desktop Layout with fixed left/center/right columns
//         <div className="hidden md:flex justify-between items-center bg-transparent relative z-30 px-6 py-4 min-h-[70px] w-full">
//           {/* Left Column (Fixed Width) */}
//           <div className="w-[200px] flex gap-6">
//             <a
//               href="https://x.com/wusle_official?s=21"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//             >
//               <FaXTwitter className="text-[#9c23d5] text-2xl" />
//             </a>
//             <a
//               href="https://www.instagram.com/wusle_official/#"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//             >
//               <FaInstagram className="text-[#9c23d5] text-2xl" />
//             </a>
//           </div>

//           {/* Center Column (Logo & Hover Nav) */}
//           <div 
//             className="flex flex-col items-center relative flex-grow"
//             onMouseEnter={() => setIsOpen(true)}
//             onMouseLeave={() => setIsOpen(false)}
//           >
//             <Link
//               href="/"
//               className="border-4 border-[#9c23d5] bg-white rounded-full cursor-pointer flex-shrink-0 hover:text-black transition z-10"
//             >
//               <Image
//                 src={Logo}
//                 alt="Logo"
//                 width={65}
//                 height={65}
//                 className="rounded-full my-2"
//               />
//             </Link>
//             <AnimatePresence>
//               {isOpen && (
//                 <motion.div
//                   initial="hidden"
//                   animate="visible"
//                   exit="hidden"
//                   className="absolute top-2 left-1/2 transform -translate-x-1/2 flex gap-40 text-lg font-semibold bg-gradient-to-br from-[#4f0289]/80 to-[#9c23d5]/80 px-10 py-3 rounded-full"
//                 >
//                   <div className="flex gap-6">
//                     {leftLinks.map((link) => (
//                       <motion.div key={link.href} variants={itemVariants}>
//                         {link.href.startsWith("#") ? (
//                           <a
//                             href={link.href}
//                             onClick={(e) => handleScroll(e, link.href)}
//                             className="relative py-2 rounded-md text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                           >
//                             {link.label}
//                           </a>
//                         ) : (
//                           <Link
//                             href={link.href}
//                             download={link.href.endsWith(".pdf") ? true : undefined}
//                             className="relative py-2 rounded-md text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                           >
//                             {link.label}
//                           </Link>
//                         )}
//                       </motion.div>
//                     ))}
//                   </div>
//                   <div className="flex gap-6">
//                     {rightLinks.map((link) => (
//                       <motion.div key={link.href} variants={itemVariants}>
//                         {link.href.startsWith("#") ? (
//                           <a
//                             href={link.href}
//                             onClick={(e) => handleScroll(e, link.href)}
//                             className="relative py-2  rounded-md text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                           >
//                             {link.label}
//                           </a>
//                         ) : (
//                           <Link
//                             href={link.href}
//                             download={link.href.endsWith(".pdf") ? true : undefined}
//                             className="relative py-2 rounded-md text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                           >
//                             {link.label}
//                           </Link>
//                         )}
//                       </motion.div>
//                     ))}
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Right Column (Fixed Width) */}
//           <div className="w-[200px] flex justify-end items-center gap-3">
//             {session?.user ? (
//               <>
//                 <div className="flex-shrink-0 min-w-[160px]">
//                   <WalletMultiButton
//                     style={{
//                       fontSize: "16px",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       fontWeight: "bold",
//                       color: "black",
//                       background: "white",
//                       border: "2px solid #9c23d5",
//                       borderRadius: "50px",
//                       cursor: "pointer",
//                       transition: "all 0.3s ease-in-out",
//                       padding: "10px 20px",
//                       textAlign: "center",
//                       backgroundColor: "#fce2ff",
//                     }}
//                   >
//                     {connected ? "CONNECTED" : "CONNECT WALLET"}
//                   </WalletMultiButton>
//                 </div>
//                 <div className="relative">
//                   <button
//                     onClick={() => setSliderOpen(!sliderOpen)}
//                     className="text-[#9c23d5] border-2 border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 flex items-center justify-center hover:text-black transition transform hover:scale-110"
//                   >
//                     <FaBars className="text-xl" />
//                   </button>
//                   <AnimatePresence>
//                     {sliderOpen && (
//                       <motion.div
//                         className="fixed top-0 right-0 w-[300px] h-full bg-gradient-to-br from-[#4f0289]/80 to-[#9c23d5]/80 text-white z-50 flex flex-col p-8 [clip-path:polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)] shadow-2xl"
//                         variants={slideVariants}
//                         initial="hidden"
//                         animate="visible"
//                         exit="hidden"
//                       >
//                         <button
//                           onClick={() => setSliderOpen(false)}
//                           className="self-end text-3xl hover:text-gray-300 transition"
//                         >
//                           &times;
//                         </button>
//                         <div className="mt-10 flex flex-col gap-6">
//                           <button
//                             onClick={() => setShowHistory(true)}
//                             className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
//                           >
//                             Purchase History
//                           </button>
//                           <button
//                             onClick={handleLogout}
//                             className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
//                           >
//                             Logout
//                           </button>
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               </>
//             ) : (
//               <div className="flex-shrink-0 min-w-[160px]">
//                 <button
//                   onClick={() => setShowLogin(true)}
//                   style={{
//                     fontSize: "16px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontWeight: "bold",
//                     color: "black",
//                     background: "white",
//                     borderRadius: "50px",
//                     cursor: "pointer",
//                     transition: "all 0.3s ease-in-out",
//                     padding: "10px 20px",
//                     textAlign: "center",
//                     backgroundColor: "#fce2ff",
//                     border: "2px solid #9c23d5",
//                   }}
//                 >
//                   {"LOGIN"}
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Modals */}
//           <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
//           <PurchaseHistoryModal show={showHistory} onClose={() => setShowHistory(false)} />
//         </div>
//       )}
//     </>
//   );
// };

// export default Navbar;











// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";
// import { FaXTwitter, FaInstagram, FaWallet } from "react-icons/fa6";
// import Logo from "../../assets/Images/logo.jpeg";
// import { useSession, signOut } from "next-auth/react";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import LoginModal from "@/components/LoginModal";
// import PurchaseHistoryModal from "@/components/PurchaseHistoryModal";
// import { FaBars, FaSignInAlt } from "react-icons/fa";

// const links = [
//   { href: "#home", label: "Home" },
//   { href: "#about", label: "About" },
//   { href: "/whitepaper.pdf", label: "Whitepaper" },
//   { href: "/Wusle_Audit.pdf", label: "Audit" },
// ];

// const Navbar: React.FC = () => {
//   const { data: session } = useSession();
//   const { connected } = useWallet();
//   const [showLogin, setShowLogin] = useState(false);
//   const [isOpen, setIsOpen] = useState(false); // center nav overlay state
//   const [sliderOpen, setSliderOpen] = useState(false); // right side slider
//   const [showHistory, setShowHistory] = useState(false); // purchase history modal

//   // Split nav links into left and right groups
//   const half = Math.ceil(links.length / 2);
//   const leftLinks = links.slice(0, half);
//   const rightLinks = links.slice(half);

//   // Mobile detection
//   const [isMobile, setIsMobile] = useState(false);
//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth < 768);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // Logout handler (redirects to home after logout)
//   const handleLogout = () => {
//     signOut({ callbackUrl: "/" });
//   };

//   // Framer-motion variants for center nav overlay (desktop)
//   const menuVariants = {
//     left: {
//       hidden: { x: -50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//     right: {
//       hidden: { x: 50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: -10 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { type: "spring", stiffness: 120 },
//     },
//   };

//   // Slide variants for right-side slider
//   const slideVariants = {
//     hidden: { x: "100%" },
//     visible: { x: 0, transition: { duration: 0.4, ease: "easeOut" } },
//   };

//   function handleScroll(e: React.MouseEvent, id: string) {
//     e.preventDefault();
//     const element = document.querySelector(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//       if (isMobile) setIsOpen(false);
//     }
//   }

//   return (
//     <>
//       {isMobile ? (
//         // Mobile Layout (unchanged)
//         <div className="flex justify-between items-center bg-transparent relative z-30 px-6 py-4">
//           {/* Left Side: Social Media Icons */}
//           <div className="flex gap-6">
//             <a
//               href="https://x.com/wusle_official?s=21"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 hidden md:flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//             >
//               <FaXTwitter className="text-[#9c23d5] text-2xl" />
//             </a>
//             <a
//               href="https://www.instagram.com/wusle_official/#"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 hidden md:flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//             >
//               <FaInstagram className="text-[#9c23d5] text-2xl" />
//             </a>
//           </div>

//           {/* Center: Main Nav or Hamburger */}
//           <div className="flex items-center justify-between w-full">
//             <div className="flex items-center gap-2">
//               <a
//                 href="https://x.com/wusle_official?s=21"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="border-2 border-[#9c23d5] bg-[#fce2ff] rounded-full w-10 h-10 flex items-center justify-center hover:text-black transition"
//               >
//                 <FaXTwitter className="text-[#9c23d5] text-3xl" />
//               </a>
//               <button
//                 onClick={() => setIsOpen(!isOpen)}
//                 className="text-white text-xl focus:outline-none"
//               >
//                 <div className="border-4 border-[#9c23d5] bg-white rounded-full cursor-pointer hover:text-black transition">
//                   <Image
//                     src={Logo}
//                     alt="Logo"
//                     width={40}
//                     height={40}
//                     className="rounded-full my-2"
//                   />
//                 </div>
//               </button>
//             </div>
//             <AnimatePresence>
//               {isOpen && (
//                 <motion.div
//                   className="absolute left-1/2 top-52 rounded-md transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-indigo-600/70 to-[#4f0289]/90 text-white w-[80%] flex flex-col justify-center items-center gap-6 py-6"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   transition={{ duration: 0.5 }}
//                 >
//                   {links.map((link) =>
//                     link.href.startsWith("#") ? (
//                       <a
//                         key={link.href}
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="relative px-4 py-2 rounded-md text-2xl font-semibold transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         key={link.href}
//                         href={link.href}
//                         onClick={() => setIsOpen(false)}
//                         download={link.href.endsWith(".pdf") ? true : undefined}
//                         className="relative px-4 py-2 rounded-md text-2xl font-semibold transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                       >
//                         {link.label}
//                       </Link>
//                     )
//                   )}
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Right Side: Wallet Connect & Slider */}
//           <div className="flex items-center gap-3">
//             {session?.user ? (
//               <>
//                 <div className="flex-shrink-0 min-w-[160px]">
//                   <WalletMultiButton
//                     style={{
//                       fontSize: "16px",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       fontWeight: "bold",
//                       color: "black",
//                       background: "white",
//                       border: "2px solid #9c23d5",
//                       borderRadius: "50px",
//                       cursor: "pointer",
//                       transition: "all 0.3s ease-in-out",
//                       padding: "10px 20px",
//                       textAlign: "center",
//                       backgroundColor: "#fce2ff",
//                     }}
//                   >
//                     {isMobile 
//                       ? (connected ? <FaWallet className="text-purple-700 text-2xl" /> : <FaWallet className="text-2xl" />)
//                       : (connected ? "CONNECTED" : "CONNECT WALLET")
//                     }
//                   </WalletMultiButton>
//                 </div>
//                 <div className="relative">
//                   <button
//                     onClick={() => setSliderOpen(!sliderOpen)}
//                     className="text-[#9c23d5] border-2 border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 flex items-center justify-center hover:text-black transition transform hover:scale-110"
//                   >
//                     <FaBars className="text-xl" />
//                   </button>
//                   <AnimatePresence>
//                     {sliderOpen && (
//                       <motion.div
//                         className="fixed top-0 right-0 w-[300px] h-full bg-gradient-to-br from-[#4f0289]/80 to-[#9c23d5]/80 text-white z-50 flex flex-col p-8 [clip-path:polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)] shadow-2xl"
//                         variants={slideVariants}
//                         initial="hidden"
//                         animate="visible"
//                         exit="hidden"
//                       >
//                         <button
//                           onClick={() => setSliderOpen(false)}
//                           className="self-end text-3xl hover:text-gray-300 transition"
//                         >
//                           &times;
//                         </button>
//                         <div className="mt-10 flex flex-col gap-6">
//                           <button
//                             onClick={() => setShowHistory(true)}
//                             className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
//                           >
//                             Purchase History
//                           </button>
//                           <button
//                             onClick={handleLogout}
//                             className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
//                           >
//                             Logout
//                           </button>
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               </>
//             ) : (
//               <div className="flex-shrink-0 min-w-[160px]">
//                 <button
//                   onClick={() => setShowLogin(true)}
//                   style={{
//                     fontSize: "16px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontWeight: "bold",
//                     color: "black",
//                     background: "white",
//                     borderRadius: "50px",
//                     cursor: "pointer",
//                     transition: "all 0.3s ease-in-out",
//                     padding: "10px 20px",
//                     textAlign: "center",
//                     backgroundColor: "#fce2ff",
//                     border: "2px solid #9c23d5",
//                   }}
//                 >
//                   {isMobile ? <FaSignInAlt className="text-2xl" /> : "LOGIN"}
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Modals */}
//           <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
//           <PurchaseHistoryModal show={showHistory} onClose={() => setShowHistory(false)} />
//         </div>
//       ) : (
//         // Desktop Layout with fixed left/center/right columns
//         <div className="hidden md:flex justify-between items-center bg-transparent relative z-30 px-6 py-4 min-h-[70px] w-full">
//           {/* Left Column (Fixed Width) */}
//           <div className="w-[200px] flex gap-6">
//             <a
//               href="https://x.com/wusle_official?s=21"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//             >
//               <FaXTwitter className="text-[#9c23d5] text-2xl" />
//             </a>
//             <a
//               href="https://www.instagram.com/wusle_official/#"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//             >
//               <FaInstagram className="text-[#9c23d5] text-2xl" />
//             </a>
//           </div>

//           {/* Center Column (Logo & Hover Nav) */}
//           <div 
//             className="flex flex-col items-center relative flex-grow"
//             onMouseEnter={() => setIsOpen(true)}
//             onMouseLeave={() => setIsOpen(false)}
//           >
//             <Link
//               href="/"
//               className="border-4 border-[#9c23d5] bg-white rounded-full cursor-pointer flex-shrink-0 hover:text-black transition z-10"
//             >
//               <Image
//                 src={Logo}
//                 alt="Logo"
//                 width={65}
//                 height={65}
//                 className="rounded-full my-2"
//               />
//             </Link>
//             <AnimatePresence>
//               {isOpen && (
//                 <motion.div
//                   initial="hidden"
//                   animate="visible"
//                   exit="hidden"
//                   variants={menuVariants.left}
//                   className="absolute right-[465px] flex  top-2 gap-24 text-lg font-semibold bg-inherit bg-gradient-to-br from-[#4f0289]/80 to-[#9c23d5]/80 px-20 py-3 rounded-full"

//                 >
//                   {leftLinks.map((link) => (
//                     <motion.div key={link.href} variants={itemVariants}>
//                       {link.href.startsWith("#") ? (
//                         <a
//                           href={link.href}
//                           onClick={(e) => handleScroll(e, link.href)}
//                           className="relative py-2 -ml-12 rounded-md text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                         >
//                           {link.label}
//                         </a>
//                       ) : (
//                         <Link
//                           href={link.href}
//                           download={link.href.endsWith(".pdf") ? true : undefined}
//                           className="relative py-2 rounded-md text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                         >
//                           {link.label}
//                         </Link>
//                       )}
//                     </motion.div>
//                   ))}
//                   {rightLinks.map((link) => (
//                     <motion.div key={link.href} variants={itemVariants}>
//                       {link.href.startsWith("#") ? (
//                         <a
//                           href={link.href}
//                           onClick={(e) => handleScroll(e, link.href)}
//                           className="relative  py-2  rounded-md text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                         >
//                           {link.label}
//                         </a>
//                       ) : (
//                         <Link
//                           href={link.href}
//                           download={link.href.endsWith(".pdf") ? true : undefined}
//                           className="relative py-2 -mr-14 rounded-md text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                         >
//                           {link.label}
//                         </Link>
//                       )}
//                     </motion.div>
//                   ))}
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Right Column (Fixed Width) */}
//           <div className="w-[200px] flex justify-end items-center gap-3">
//             {session?.user ? (
//               <>
//                 <div className="flex-shrink-0 min-w-[160px]">
//                   <WalletMultiButton
//                     style={{
//                       fontSize: "16px",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       fontWeight: "bold",
//                       color: "black",
//                       background: "white",
//                       border: "2px solid #9c23d5",
//                       borderRadius: "50px",
//                       cursor: "pointer",
//                       transition: "all 0.3s ease-in-out",
//                       padding: "10px 20px",
//                       textAlign: "center",
//                       backgroundColor: "#fce2ff",
//                     }}
//                   >
//                     {connected ? "CONNECTED" : "CONNECT WALLET"}
//                   </WalletMultiButton>
//                 </div>
//                 <div className="relative">
//                   <button
//                     onClick={() => setSliderOpen(!sliderOpen)}
//                     className="text-[#9c23d5] border-2 border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 flex items-center justify-center hover:text-black transition transform hover:scale-110"
//                   >
//                     <FaBars className="text-xl" />
//                   </button>
//                   <AnimatePresence>
//                     {sliderOpen && (
//                       <motion.div
//                         className="fixed top-0 right-0 w-[300px] h-full bg-gradient-to-br from-[#4f0289]/80 to-[#9c23d5]/80 text-white z-50 flex flex-col p-8 [clip-path:polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)] shadow-2xl"
//                         variants={slideVariants}
//                         initial="hidden"
//                         animate="visible"
//                         exit="hidden"
//                       >
//                         <button
//                           onClick={() => setSliderOpen(false)}
//                           className="self-end text-3xl hover:text-gray-300 transition"
//                         >
//                           &times;
//                         </button>
//                         <div className="mt-10 flex flex-col gap-6">
//                           <button
//                             onClick={() => setShowHistory(true)}
//                             className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
//                           >
//                             Purchase History
//                           </button>
//                           <button
//                             onClick={handleLogout}
//                             className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
//                           >
//                             Logout
//                           </button>
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               </>
//             ) : (
//               <div className="flex-shrink-0 min-w-[160px]">
//                 <button
//                   onClick={() => setShowLogin(true)}
//                   style={{
//                     fontSize: "16px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontWeight: "bold",
//                     color: "black",
//                     background: "white",
//                     borderRadius: "50px",
//                     cursor: "pointer",
//                     transition: "all 0.3s ease-in-out",
//                     padding: "10px 20px",
//                     textAlign: "center",
//                     backgroundColor: "#fce2ff",
//                     border: "2px solid #9c23d5",
//                   }}
//                 >
//                   {"LOGIN"}
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Modals */}
//           <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
//           <PurchaseHistoryModal show={showHistory} onClose={() => setShowHistory(false)} />
//         </div>
//       )}
//     </>
//   );
// };

// export default Navbar;












// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";
// import { FaXTwitter, FaInstagram, FaWallet } from "react-icons/fa6";
// import Logo from "../../assets/Images/logo.jpeg";
// import { useSession, signOut } from "next-auth/react";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import LoginModal from "@/components/LoginModal";
// import PurchaseHistoryModal from "@/components/PurchaseHistoryModal";
// import { FaBars, FaSignInAlt } from "react-icons/fa";

// const links = [
//   { href: "#home", label: "Home" },
//   { href: "#about", label: "About" },
//   { href: "/whitepaper.pdf", label: "Whitepaper" },
//   { href: "/Wusle_Audit.pdf", label: "Audit" },
// ];

// const Navbar: React.FC = () => {
//   const { data: session } = useSession();
//   const [showLogin, setShowLogin] = useState(false);
//   const [isOpen, setIsOpen] = useState(false); // center nav open state
//   const [sliderOpen, setSliderOpen] = useState(false); // right side slider
//   const [showHistory, setShowHistory] = useState(false); // purchase history modal

//   const {connected} = useWallet();

//   // Split nav links into left and right groups
//   const half = Math.ceil(links.length / 2);
//   const leftLinks = links.slice(0, half);
//   const rightLinks = links.slice(half);

//   // Mobile detection
//   const [isMobile, setIsMobile] = useState(false);
//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth < 768);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // Logout handler (redirects to home after logout)
//   const handleLogout = () => {
//     signOut({ callbackUrl: "/" });
//   };

//   // Framer-motion variants for center nav
//   const menuVariants = {
//     left: {
//       hidden: { x: -50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//     right: {
//       hidden: { x: 50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: -10 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { type: "spring", stiffness: 120 },
//     },
//   };

//   // Slide variants for right-side slider
//   const slideVariants = {
//     hidden: { x: "100%" },
//     visible: { x: 0, transition: { duration: 0.4, ease: "easeOut" } },
//   };

//   function handleScroll(e: React.MouseEvent, id: string) {
//     e.preventDefault();
//     const element = document.querySelector(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//       if (isMobile) setIsOpen(false);
//     }
//   }

//   return (
//     <div className="flex justify-between items-center bg-transparent relative z-30 px-6 py-4">
//       {/* Left Side: Social Media Icons */}
//       <div className="flex gap-6">
//         <a
//           href="https://x.com/wusle_official?s=21"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="border-2 hidden md:flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//         >
//           <FaXTwitter className="text-[#9c23d5] text-2xl" />
//         </a>
//         <a
//           href="https://www.instagram.com/wusle_official/#"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="border-2 hidden md:flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//         >
//           <FaInstagram className="text-[#9c23d5] text-2xl" />
//         </a>
//       </div>

//       {/* Center: Main Nav (Desktop) or Hamburger (Mobile) */}
//       {isMobile ? (
//         <div className="flex items-center justify-between w-full">
//           <div className="flex items-center gap-2">
//             <a
//               href="https://x.com/wusle_official?s=21"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 border-[#9c23d5] bg-[#fce2ff] rounded-full w-10 h-10 flex items-center justify-center hover:text-black transition"
//             >
//               <FaXTwitter className="text-[#9c23d5] text-3xl" />
//             </a>
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="text-white text-xl focus:outline-none"
//             >
//               <div className="border-4 border-[#9c23d5] bg-white rounded-full cursor-pointer hover:text-black transition">
//                 <Image
//                   src={Logo}
//                   alt="Logo"
//                   width={40}
//                   height={40}
//                   className="rounded-full my-2"
//                 />
//               </div>
//             </button>
//           </div>
//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 className="absolute left-1/2 top-52 rounded-md transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-indigo-600/70 to-[#4f0289]/90 text-white w-[80%] flex flex-col justify-center items-center gap-6 py-6"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 {links.map((link) =>
//                   link.href.startsWith("#") ? (
//                     <a
//                       key={link.href}
//                       href={link.href}
//                       onClick={(e) => handleScroll(e, link.href)}
//                       className="relative px-4 py-2 rounded-md text-2xl font-semibold transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                     >
//                       {link.label}
//                     </a>
//                   ) : (
//                     <Link
//                       key={link.href}
//                       href={link.href}
//                       onClick={() => setIsOpen(false)}
//                       download={link.href.endsWith(".pdf") ? true : undefined}
//                       className="relative px-4 py-2 rounded-md text-2xl font-semibold transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                     >
//                       {link.label}
//                     </Link>
//                   )
//                 )}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       ) : (
//         <div
//           className="relative items-center gap-8 hidden md:flex"
//           onMouseEnter={() => setIsOpen(true)}
//           onMouseLeave={() => setIsOpen(false)}
//         >
//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//                 variants={menuVariants.left}
//                 className="absolute right-32 flex gap-8 text-lg font-semibold"
//               >
//                 {leftLinks.map((link) => (
//                   <motion.div key={link.href} variants={itemVariants}>
//                     {link.href.startsWith("#") ? (
//                       <a
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="relative px-4 py-2 rounded-md text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         href={link.href}
//                         download={link.href.endsWith(".pdf") ? true : undefined}
//                         className="relative px-4 py-2 rounded-md text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                       >
//                         {link.label}
//                       </Link>
//                     )}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <Link
//             href="/"
//             className="border-4 border-[#9c23d5] bg-white rounded-full cursor-pointer flex-shrink-0 hover:text-black transition"
//           >
//             <Image
//               src={Logo}
//               alt="Logo"
//               width={65}
//               height={65}
//               className="rounded-full my-2"
//             />
//           </Link>

//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//                 variants={menuVariants.right}
//                 className="absolute left-32 flex gap-6 text-lg font-semibold"
//               >
//                 {rightLinks.map((link) => (
//                   <motion.div key={link.href} variants={itemVariants}>
//                     {link.href.startsWith("#") ? (
//                       <a
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="relative px-4 py-2 rounded-md text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         href={link.href}
//                         download={link.href.endsWith(".pdf") ? true : undefined}
//                         className="relative px-4 py-2 rounded-md text-white transition duration-300 hover:bg-gradient-to-br hover:from-[#4f0289]/80 hover:to-[#9c23d5]/80"
//                       >
//                         {link.label}
//                       </Link>
//                     )}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       )}

//       {/* Right Side: Wallet Connect & extra slider */}
//       <div className="flex items-center gap-3">
//         {session?.user ? (
//           <>
//             <WalletMultiButton
//               style={{
//                 fontSize: "16px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontWeight: "bold",
//                 color: "black",
//                 background: "white",
//                 border: "2px solid #9c23d5",
//                 borderRadius: "50px",
//                 cursor: "pointer",
//                 transition: "all 0.3s ease-in-out",
//                 padding: "10px 20px",
//                 textAlign: "center",
//                 backgroundColor: "#fce2ff",
//               }}
//             >
//             {isMobile 
//               ? (connected ? <FaWallet className="text-purple-700 text-2xl" /> : <FaWallet className="text-2xl" />) 
//               : (connected ? "CONNECTED" : "CONNECT WALLET")
//             }

//             </WalletMultiButton>

//             {/* Enhanced Slider for User Options */}
//             <div className="relative">
//               <button
//                 onClick={() => setSliderOpen(!sliderOpen)}
//                 className="text-[#9c23d5] border-2 border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 flex items-center justify-center hover:text-black transition transform hover:scale-110"
//               >
//                 <FaBars className="text-xl" />
//               </button>
//               <AnimatePresence>
//                 {sliderOpen && (
//                   <motion.div
//                     className="fixed top-0 right-0 w-[300px] h-full bg-gradient-to-br from-[#4f0289]/80 to-[#9c23d5]/80 text-white z-50 flex flex-col p-8 [clip-path:polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)] shadow-2xl"
//                     variants={slideVariants}
//                     initial="hidden"
//                     animate="visible"
//                     exit="hidden"
//                   >
//                     <button
//                       onClick={() => setSliderOpen(false)}
//                       className="self-end text-3xl hover:text-gray-300 transition"
//                     >
//                       &times;
//                     </button>
//                     <div className="mt-10 flex flex-col gap-6">
//                       <button
//                         onClick={() => setShowHistory(true)}
//                         className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
//                       >
//                         Purchase History
//                       </button>
//                       <button
//                         onClick={handleLogout}
//                         className="relative px-4 py-2 rounded-md text-xl transition duration-300 hover:bg-white/20"
//                       >
//                         Logout
//                       </button>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </>
//         ) : (
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
//               borderRadius: "50px",
//               cursor: "pointer",
//               transition: "all 0.3s ease-in-out",
//               padding: "10px 20px",
//               textAlign: "center",
//               backgroundColor: "#fce2ff",
//               border: "2px solid #9c23d5",
//             }}
//           >
//             {isMobile ? <FaSignInAlt className="text-2xl" /> : "LOGIN"}
//           </button>
//         )}
//       </div>

//       {/* Login Modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />

//       {/* Purchase History Modal */}
//       <PurchaseHistoryModal show={showHistory} onClose={() => setShowHistory(false)} />
//     </div>
//   );
// };

// export default Navbar;










// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";
// import { FaXTwitter, FaInstagram, FaWallet } from "react-icons/fa6";
// import Logo from "../../assets/Images/logo.jpeg";
// import { useSession, signOut } from "next-auth/react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import LoginModal from "@/components/LoginModal";
// import PurchaseHistoryModal from "@/components/PurchaseHistoryModal";
// import { FaBars, FaTimes, FaSignInAlt } from "react-icons/fa";


// const links = [
//   { href: "#home", label: "Home" },
//   { href: "#about", label: "About" },
//   { href: "/whitepaper.pdf", label: "Whitepaper" },
//   { href: "/Wusle_Audit.pdf", label: "Audit" },
// ];

// const Navbar: React.FC = () => {
//   const { data: session } = useSession();
//   const [showLogin, setShowLogin] = useState(false);
//   const [isOpen, setIsOpen] = useState(false); // center nav open state
//   const [sliderOpen, setSliderOpen] = useState(false); // right side slider
//   const [showHistory, setShowHistory] = useState(false); // purchase history modal

//   // Split nav links into left and right groups
//   const half = Math.ceil(links.length / 2);
//   const leftLinks = links.slice(0, half);
//   const rightLinks = links.slice(half);

//   // Mobile detection
//   const [isMobile, setIsMobile] = useState(false);
//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth < 768);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // Logout handler (redirects to home after logout)
//   const handleLogout = () => {
//     signOut({ callbackUrl: "/" });
//   };

//   // Framer-motion variants for center nav
//   const menuVariants = {
//     left: {
//       hidden: { x: -50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//     right: {
//       hidden: { x: 50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: -10 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { type: "spring", stiffness: 120 },
//     },
//   };

//   // Slide variants for right-side slider
//   const slideVariants = {
//     hidden: { x: "100%" },
//     visible: { x: 0, transition: { duration: 0.4, ease: "easeOut" } },
//   };

//   function handleScroll(e: React.MouseEvent, id: string) {
//     e.preventDefault();
//     const element = document.querySelector(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//       if (isMobile) setIsOpen(false);
//     }
//   }

//   return (
//     <div className="flex justify-between items-center bg-transparent relative z-30 px-6 py-4">
//       {/* Left Side: Social Media Icons */}
//       <div className="flex gap-6">
//         <a
//           href="https://x.com/wusle_official?s=21"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="border-2 hidden md:flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//         >
//           <FaXTwitter className="text-[#9c23d5] text-2xl" />
//         </a>
//         <a
//           href="https://www.instagram.com/wusle_official/#"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="border-2 hidden md:flex border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//         >
//           <FaInstagram className="text-[#9c23d5] text-2xl" />
//         </a>
//       </div>

//       {/* Center: Main Nav (Desktop) or Hamburger (Mobile) */}
//       {isMobile ? (
//         <div className="flex items-center justify-between w-full">
//           <div className="flex items-center gap-2">
//             <a
//               href="https://x.com/wusle_official?s=21"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 border-[#9c23d5] bg-[#fce2ff] rounded-full w-10 h-10 flex items-center justify-center hover:text-black transition"
//             >
//               <FaXTwitter className="text-[#9c23d5] text-3xl" />
//             </a>
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="text-white text-xl focus:outline-none"
//             >
//               <div className="border-4 border-[#9c23d5] bg-white rounded-full cursor-pointer hover:text-black transition">
//                 <Image
//                   src={Logo}
//                   alt="Logo"
//                   width={40}
//                   height={40}
//                   className="rounded-full my-2"
//                 />
//               </div>
//             </button>
//           </div>
//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//               className="absolute left-1/2 top-52 rounded-md transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-indigo-600/70 to-[#4f0289]/90 text-white w-[80%] flex flex-col justify-center items-center gap-6 py-6"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.5 }}
//             >
//               {links.map((link) =>
//                 link.href.startsWith("#") ? (
//                   <a
//                     key={link.href}
//                     href={link.href}
//                     onClick={(e) => handleScroll(e, link.href)}
//                     className="text-2xl font-semibold hover:text-gray-300 transition"
//                   >
//                     {link.label}
//                   </a>
//                 ) : (
//                   <Link
//                     key={link.href}
//                     href={link.href}
//                     className="text-2xl font-semibold hover:text-gray-300 transition"
//                     onClick={() => setIsOpen(false)}
//                     download={link.href.endsWith(".pdf") ? true : undefined}
//                   >
//                     {link.label}
//                   </Link>
//                 )
//               )}
//             </motion.div>
//           )}
            
//           </AnimatePresence>
//         </div>
//       ) : (
//         <div
//           className="relative items-center gap-8 hidden md:flex"
//           onMouseEnter={() => setIsOpen(true)}
//           onMouseLeave={() => setIsOpen(false)}
//         >
//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//                 variants={menuVariants.left}
//                 className="absolute right-32 flex gap-8 text-lg font-semibold "
//               >
//                 {leftLinks.map((link) => (
//                   <motion.div key={link.href} variants={itemVariants}>
//                     {link.href.startsWith("#") ? (
//                       <a
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="text-white hover:text-gray-300 transition"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         href={link.href}
//                         className="text-white hover:text-gray-300 transition"
//                         download={link.href.endsWith(".pdf") ? true : undefined}
//                       >
//                         {link.label}
//                       </Link>
//                     )}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <Link
//             href="/"
//             className="border-4 border-[#9c23d5] bg-white rounded-full cursor-pointer flex-shrink-0 hover:text-black transition"
//           >
//             <Image
//               src={Logo}
//               alt="Logo"
//               width={65}
//               height={65}
//               className="rounded-full my-2"
//             />
//           </Link>

//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//                 variants={menuVariants.right}
//                 className="absolute left-32 flex gap-6 text-lg font-semibold"
//               >
//                 {rightLinks.map((link) => (
//                   <motion.div key={link.href} variants={itemVariants}>
//                     {link.href.startsWith("#") ? (
//                       <a
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="text-white hover:text-gray-300 transition"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         href={link.href}
//                         className="text-white hover:text-gray-300 transition"
//                         download={link.href.endsWith(".pdf") ? true : undefined}
//                       >
//                         {link.label}
//                       </Link>
//                     )}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       )}

//       {/* Right Side: Wallet Connect & extra slider */}
//       <div className="flex items-center gap-3">
//         {session?.user ? (
//           <>
//             <WalletMultiButton
//               style={{
//                 fontSize: "16px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontWeight: "bold",
//                 color: "black",
//                 background: "white",
//                 border: "2px solid #9c23d5",
//                 borderRadius: "50px",
//                 cursor: "pointer",
//                 transition: "all 0.3s ease-in-out",
//                 padding: "10px 20px",
//                 textAlign: "center",
//                 backgroundColor: "#fce2ff",
//               }}
//             >
//               {isMobile ? <FaWallet className="text-2xl" /> : "CONNECT WALLET"}
//             </WalletMultiButton>

//             {/* Enhanced Slider for User Options */}

//             <div className="relative">
//               <button
//                 onClick={() => setSliderOpen(!sliderOpen)}
//                 className="text-[#9c23d5] border-2 border-[#9c23d5] bg-[#fce2ff] rounded-full w-12 h-12 flex items-center justify-center hover:text-black transition transform hover:scale-110"
//               >
//               <FaBars className="text-xl" />
//               </button>
//               <AnimatePresence>
//                 {sliderOpen && (
//                   <motion.div
//                     className="fixed top-0 right-0 w-[300px] h-full bg-gradient-to-br from-[#4f0289]/80 to-[#9c23d5]/80 text-white z-50 flex flex-col p-8 [clip-path:polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)] shadow-2xl"
//                     variants={slideVariants}
//                     initial="hidden"
//                     animate="visible"
//                     exit="hidden"
//                   >
//                     <button
//                       onClick={() => setSliderOpen(false)}
//                       className="self-end text-3xl hover:text-gray-300 transition"
//                     >
//                       &times;
//                     </button>
//                     <div className="mt-10 flex flex-col gap-6">
//                       <button
//                         onClick={() => setShowHistory(true)}
//                         className="text-left text-xl hover:text-gray-300 transition"
//                       >
//                         Purchase History
//                       </button>
//                       <button
//                         onClick={handleLogout}
//                         className="text-left text-xl hover:text-gray-300 transition"
//                       >
//                         Logout
//                       </button>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>

//           </>
//         ) : (
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
//               borderRadius: "50px",
//               cursor: "pointer",
//               transition: "all 0.3s ease-in-out",
//               padding: "10px 20px",
//               textAlign: "center",
//               backgroundColor: "#fce2ff",
//               border: "2px solid #9c23d5",
//             }}
//           >
//            {isMobile ? <FaSignInAlt className="text-2xl" /> : "LOGIN"}
//           </button>
//         )}
//       </div>

//       {/* Login Modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />

//       {/* Purchase History Modal */}
//       <PurchaseHistoryModal show={showHistory} onClose={() => setShowHistory(false)} />
//     </div>
//   );
// };

// export default Navbar;








// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";
// import { FaXTwitter, FaInstagram } from "react-icons/fa6";
// import Logo from "../../assets/Images/logo.jpeg";
// import { useSession, signOut } from "next-auth/react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import LoginModal from "@/components/LoginModal";
// import PurchaseHistoryModal from "@/components/PurchaseHistoryModal";

// const links = [
//   { href: "#home", label: "Home" },
//   { href: "#about", label: "About" },
//   { href: "/whitepaper.pdf", label: "Whitepaper" },
//   { href: "/Wusle_Audit.pdf", label: "Audit" },
// ];

// const Navbar: React.FC = () => {
//   const { data: session } = useSession();
//   const [showLogin, setShowLogin] = useState(false);
//   const [isOpen, setIsOpen] = useState(false); // center nav open state
//   const [sliderOpen, setSliderOpen] = useState(false); // right side slider
//   const [showHistory, setShowHistory] = useState(false); // purchase history modal

//   // Split nav links into left and right groups
//   const half = Math.ceil(links.length / 2);
//   const leftLinks = links.slice(0, half);
//   const rightLinks = links.slice(half);

//   // Mobile detection
//   const [isMobile, setIsMobile] = useState(false);
//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth < 768);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // Logout handler (redirects to home after logout)
//   const handleLogout = () => {
//     signOut({ callbackUrl: "/" });
//   };

//   // Framer-motion variants for center nav
//   const menuVariants = {
//     left: {
//       hidden: { x: -50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//     right: {
//       hidden: { x: 50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: -10 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { type: "spring", stiffness: 120 },
//     },
//   };

//   // Slide variants for right-side slider
//   const slideVariants = {
//     hidden: { x: "100%" },
//     visible: { x: 0, transition: { duration: 0.4, ease: "easeOut" } },
//   };

//   function handleScroll(e: React.MouseEvent, id: string) {
//     e.preventDefault();
//     const element = document.querySelector(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//       if (isMobile) setIsOpen(false);
//     }
//   }

//   return (
//     <div className="flex justify-between items-center bg-transparent relative z-30 px-6 py-4">
//       {/* Left Side: Social Media Icons */}
//       <div className="flex gap-6">
//         <a
//           href="https://x.com/wusle_official?s=21"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="border-2 hidden md:flex border-white rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//         >
//           <FaXTwitter className="text-white text-2xl" />
//         </a>
//         <a
//           href="https://www.instagram.com/wusle_official/#"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="border-2 hidden md:flex border-white rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//         >
//           <FaInstagram className="text-white text-2xl" />
//         </a>
//       </div>

//       {/* Center: Main Nav (Desktop) or Hamburger (Mobile) */}
//       {isMobile ? (
//         <div className="flex items-center justify-between w-full">
//           <div className="flex items-center gap-2">
//             <a
//               href="https://x.com/wusle_official?s=21"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 border-white rounded-full w-10 h-10 flex items-center justify-center hover:text-black transition"
//             >
//               <FaXTwitter className="text-white text-3xl" />
//             </a>
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="text-white text-xl focus:outline-none"
//             >
//               <div className="border-2 border-[#9c23d5] bg-white rounded-full cursor-pointer hover:text-black transition"
//               >
//                 <Image
//                   src={Logo}
//                   alt="Logo"
//                   width={40}
//                   height={40}
//                   className="rounded-full my-2"
//                 />
//               </div>
//             </button>
//           </div>
//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-4 rounded-md"
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//               >
//                 {links.map((link) =>
//                   link.href.startsWith("#") ? (
//                     <a
//                       key={link.href}
//                       href={link.href}
//                       onClick={(e) => handleScroll(e, link.href)}
//                       className="block text-lg py-1 hover:text-gray-300 transition"
//                     >
//                       {link.label}
//                     </a>
//                   ) : (
//                     <Link
//                       key={link.href}
//                       href={link.href}
//                       className="block text-lg py-1 hover:text-gray-300 transition"
//                       onClick={() => setIsOpen(false)}
//                       download={link.href.endsWith(".pdf") ? true : undefined}
//                     >
//                       {link.label}
//                     </Link>
//                   )
//                 )}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       ) : (
//         <div
//           className="relative items-center gap-8 hidden md:flex"
//           onMouseEnter={() => setIsOpen(true)}
//           onMouseLeave={() => setIsOpen(false)}
//         >
//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//                 variants={menuVariants.left}
//                 className="absolute right-32 flex gap-8 text-lg font-semibold"
//               >
//                 {leftLinks.map((link) => (
//                   <motion.div key={link.href} variants={itemVariants}>
//                     {link.href.startsWith("#") ? (
//                       <a
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="text-white hover:text-gray-300 transition"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         href={link.href}
//                         className="text-white hover:text-gray-300 transition"
//                         download={link.href.endsWith(".pdf") ? true : undefined}
//                       >
//                         {link.label}
//                       </Link>
//                     )}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <Link
//             href="/"
//             className="border-2 border-[#9c23d5] rounded-full cursor-pointer flex-shrink-0 hover:text-black transition"
//           >
//             <Image
//               src={Logo}
//               alt="Logo"
//               width={70}
//               height={70}
//               className="rounded-full"
//             />
//           </Link>

//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//                 variants={menuVariants.right}
//                 className="absolute left-32 flex gap-6 text-lg font-semibold"
//               >
//                 {rightLinks.map((link) => (
//                   <motion.div key={link.href} variants={itemVariants}>
//                     {link.href.startsWith("#") ? (
//                       <a
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="text-white hover:text-gray-300 transition"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         href={link.href}
//                         className="text-white hover:text-gray-300 transition"
//                         download={link.href.endsWith(".pdf") ? true : undefined}
//                       >
//                         {link.label}
//                       </Link>
//                     )}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       )}

//       {/* Right Side: Wallet Connect & extra slider */}
//       <div className="flex items-center gap-3">
//         {session?.user ? (
//         <>
//           <WalletMultiButton
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
//               // animation: "heartbeat 1s infinite ease-in-out",
//               padding: "10px 20px",
//               textAlign: "center",
//             }}
//           >
//             CONNECT WALLET
//           </WalletMultiButton>

//           {/* Enhanced Slider for User Options */}
//           <div className="relative">
//             <button
//               onClick={() => setSliderOpen(!sliderOpen)}
//               className="text-white border-2 border-white rounded-full w-12 h-12 flex items-center justify-center hover:text-black transition transform hover:scale-110"
//             >
//               {sliderOpen ? "×" : "≡"}
//             </button>
//             <AnimatePresence>
//               {sliderOpen && (
//                 <motion.div
//                   className="fixed top-0 right-0 w-[300px] h-full bg-gradient-to-br from-[#4f0289]/80 to-[#9c23d5]/80 text-white z-50 flex flex-col p-8 [clip-path:polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)] shadow-2xl"
//                   variants={slideVariants}
//                   initial="hidden"
//                   animate="visible"
//                   exit="hidden"
//                 >
//                   <button onClick={() => setSliderOpen(false)} className="self-end text-3xl hover:text-gray-300 transition">
//                     &times;
//                   </button>
//                   <div className="mt-10 flex flex-col gap-6">
//                     <button onClick={() => setShowHistory(true)} className="text-left text-xl hover:text-gray-300 transition">
//                       Purchase History
//                     </button>
//                     <button onClick={handleLogout} className="text-left text-xl hover:text-gray-300 transition">
//                       Logout
//                     </button>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </>
//         ) : (
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
//               // animation: "heartbeat 1s infinite ease-in-out",
//               padding: "10px 20px",
//               textAlign: "center",
//             }}
//           >
//             LOGIN
//           </button>
//         )}

//       </div>

//       {/* Login Modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />

//       {/* Purchase History Modal */}
//       <PurchaseHistoryModal show={showHistory} onClose={() => setShowHistory(false)} />
//     </div>
//   );
// };

// export default Navbar;


// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";
// import { FaXTwitter, FaInstagram } from "react-icons/fa6";
// import Logo from "../../assets/Images/logo.jpeg";
// import { useSession, signOut } from "next-auth/react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import LoginModal from "@/components/LoginModal";

// const links = [
//   { href: "#home", label: "Home" },
//   { href: "#about", label: "About" },
//   { href: "/whitepaper.pdf", label: "Whitepaper" },
//   { href: "/Wusle_Audit.pdf", label: "Audit" },
// ];

// const Navbar: React.FC = () => {
//   const { data: session } = useSession();
//   const [showLogin, setShowLogin] = useState(false);
//   const [isOpen, setIsOpen] = useState(false); // center nav open state
//   const [sliderOpen, setSliderOpen] = useState(false); // right side slider

//   // Split nav links into left and right groups
//   const half = Math.ceil(links.length / 2);
//   const leftLinks = links.slice(0, half);
//   const rightLinks = links.slice(half);

//   // Mobile detection
//   const [isMobile, setIsMobile] = useState(false);
//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth < 768);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // Logout handler (redirects to home after logout)
//   const handleLogout = () => {
//     signOut({ callbackUrl: "/" });
//   };

//   // Framer-motion variants for center nav
//   const menuVariants = {
//     left: {
//       hidden: { x: -50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//     right: {
//       hidden: { x: 50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: -10 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { type: "spring", stiffness: 120 },
//     },
//   };

//   // Slide variants for right-side slider
//   const slideVariants = {
//     hidden: { x: "100%" },
//     visible: { x: 0, transition: { duration: 0.3, ease: "easeOut" } },
//   };

//   function handleScroll(e: React.MouseEvent, id: string) {
//     e.preventDefault();
//     const element = document.querySelector(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//       if (isMobile) setIsOpen(false);
//     }
//   }

//   return (
//     <div className="flex justify-between items-center bg-transparent relative z-30 px-6 py-4">
//       {/* Left Side: Social Media Icons */}
//       <div className="flex gap-6">
//         <a
//           href="https://x.com/wusle_official?s=21"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="border-2 hidden md:flex border-white rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//         >
//           <FaXTwitter className="text-white text-2xl" />
//         </a>
//         <a
//           href="https://www.instagram.com/wusle_official/#"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="border-2 hidden md:flex border-white rounded-full w-12 h-12 items-center justify-center hover:text-black transition"
//         >
//           <FaInstagram className="text-white text-2xl" />
//         </a>
//       </div>

//       {/* Center: Main Nav (Desktop) or Hamburger (Mobile) */}
//       {isMobile ? (
//         <div className="flex items-center justify-between w-full">
//           <div className="flex items-center gap-2">
//             <a
//               href="https://x.com/wusle_official?s=21"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 border-white rounded-full w-10 h-10 flex items-center justify-center hover:text-black transition"
//             >
//               <FaXTwitter className="text-white text-3xl" />
//             </a>
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="text-white text-xl focus:outline-none"
//             >
//               <div className="p-2 border-2 border-white rounded-full cursor-pointer">
//                 <Image
//                   src={Logo}
//                   alt="Logo"
//                   width={30}
//                   height={30}
//                   className="rounded-full"
//                 />
//               </div>
//             </button>
//           </div>
//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-4 rounded-md"
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//               >
//                 {links.map((link) =>
//                   link.href.startsWith("#") ? (
//                     <a
//                       key={link.href}
//                       href={link.href}
//                       onClick={(e) => handleScroll(e, link.href)}
//                       className="block text-lg py-1 hover:text-gray-300 transition"
//                     >
//                       {link.label}
//                     </a>
//                   ) : (
//                     <Link
//                       key={link.href}
//                       href={link.href}
//                       className="block text-lg py-1 hover:text-gray-300 transition"
//                       onClick={() => setIsOpen(false)}
//                       download={link.href.endsWith(".pdf") ? true : undefined}
//                     >
//                       {link.label}
//                     </Link>
//                   )
//                 )}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       ) : (
//         <div
//           className="relative items-center gap-8 hidden md:flex"
//           onMouseEnter={() => setIsOpen(true)}
//           onMouseLeave={() => setIsOpen(false)}
//         >
//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//                 variants={menuVariants.left}
//                 className="absolute right-32 flex gap-8 text-lg font-semibold"
//               >
//                 {leftLinks.map((link) => (
//                   <motion.div key={link.href} variants={itemVariants}>
//                     {link.href.startsWith("#") ? (
//                       <a
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="text-white hover:text-gray-300 transition"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         href={link.href}
//                         className="text-white hover:text-gray-300 transition"
//                         download={link.href.endsWith(".pdf") ? true : undefined}
//                       >
//                         {link.label}
//                       </Link>
//                     )}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <Link
//             href="/"
//             className="p-2 border-2 border-white rounded-full cursor-pointer flex-shrink-0 hover:text-black transition"
//           >
//             <Image
//               src={Logo}
//               alt="Logo"
//               width={90}
//               height={90}
//               className="rounded-full"
//             />
//           </Link>

//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//                 variants={menuVariants.right}
//                 className="absolute left-32 flex gap-6 text-lg font-semibold"
//               >
//                 {rightLinks.map((link) => (
//                   <motion.div key={link.href} variants={itemVariants}>
//                     {link.href.startsWith("#") ? (
//                       <a
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="text-white hover:text-gray-300 transition"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         href={link.href}
//                         className="text-white hover:text-gray-300 transition"
//                         download={link.href.endsWith(".pdf") ? true : undefined}
//                       >
//                         {link.label}
//                       </Link>
//                     )}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       )}

//       {/* Right Side: Wallet Connect & extra slider */}
//       <div className="flex items-center gap-3">
//         {/* Wallet Connect/Login button remains */}
//         {session?.user ? (
//           <WalletMultiButton
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
//             CONNECT WALLET
//           </WalletMultiButton>
//         ) : (
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

//         {/* Extra Hamburger Slider for user options */}
//         <div className="relative">
//           <button
//             onClick={() => setSliderOpen(!sliderOpen)}
//             className="text-white border-2 border-white rounded-full w-12 h-12 flex items-center justify-center hover:text-black transition"
//           >
//             {sliderOpen ? "×" : "≡"}
//           </button>
//           <AnimatePresence>
//             {sliderOpen && (
//               <motion.div
//                 className="fixed top-0 right-0 w-[250px] h-full bg-gray-900 bg-opacity-90 text-white z-50 flex flex-col p-6"
//                 variants={slideVariants}
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//               >
//                 <button onClick={() => setSliderOpen(false)} className="self-end text-2xl hover:text-gray-300">
//                   &times;
//                 </button>
//                 <div className="mt-6 flex flex-col gap-4">
//                   <button
//                     onClick={() => {
//                       // Purchase history logic
//                       alert("Purchase History coming soon!");
//                     }}
//                     className="text-left hover:text-gray-300"
//                   >
//                     Purchase History
//                   </button>
//                   <button onClick={handleLogout} className="text-left hover:text-gray-300">
//                     Logout
//                   </button>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>

//       {/* Login Modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
//     </div>
//   );
// }

// export default Navbar;







// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";
// import { FaXTwitter, FaInstagram } from "react-icons/fa6";
// import Logo from "../../assets/Images/logo.jpeg";

// import { useSession, signOut } from "next-auth/react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import LoginModal from "@/components/LoginModal";

// const links = [
//   { href: "#home", label: "Home" },
//   { href: "#about", label: "About" },
//   { href: "/whitepaper.pdf", label: "Whitepaper" },
//   { href: "/Wusle_Audit.pdf", label: "Audit" },
// ];

// const Navbar: React.FC = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const { data: session } = useSession();
//   const [showLogin, setShowLogin] = useState(false);

//   const half = Math.ceil(links.length / 2);
//   const leftLinks = links.slice(0, half);
//   const rightLinks = links.slice(half);

//   const handleScroll = (e: React.MouseEvent, id: string) => {
//     e.preventDefault();
//     const element = document.querySelector(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//       if (isMobile) setIsOpen(false);
//     }
//   };

//   const menuVariants = {
//     left: {
//       hidden: { x: -50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//     right: {
//       hidden: { x: 50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: -10 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { type: "spring", stiffness: 120 },
//     },
//   };

//   const updateMobileView = () => {
//     setIsMobile(window.innerWidth < 768);
//   };

//   useEffect(() => {
//     updateMobileView();
//     window.addEventListener("resize", updateMobileView);
//     return () => window.removeEventListener("resize", updateMobileView);
//   }, []);

//   // Logout handler (optionally redirect to home after signOut)
//   const handleLogout = () => {
//     signOut({ callbackUrl: "/" });
//   };

//   return (
//     <div className="flex justify-between items-center bg-transparent relative z-30 px-6 py-4">
//       {/* Social Media Icons */}
//       <div className="flex gap-6">
//         <a
//           href="https://x.com/wusle_official?s=21"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="border-2 md:flex hidden border-white rounded-full size-16 items-center justify-center hover:text-black transition"
//         >
//           <FaXTwitter className="text-white text-3xl" />
//         </a>
//         <a
//           href="https://www.instagram.com/wusle_official/#"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="border-2 md:flex hidden border-white rounded-full size-16 items-center justify-center hover:text-black transition"
//         >
//           <FaInstagram className="text-white text-3xl" />
//         </a>
//       </div>

//       {isMobile ? (
//         /* ------------------ MOBILE NAV ------------------ */
//         <div className="flex items-center justify-between w-full">
//           <div className="flex items-center gap-2">
//             <a
//               href="https://x.com/wusle_official?s=21"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 border-white rounded-full size-10 order-2 flex items-center justify-center hover:text-black transition"
//             >
//               <FaXTwitter className="text-white text-3xl" />
//             </a>
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="text-white text-xl focus:outline-none"
//             >
//               <div className="p-2 border-2 border-white rounded-full cursor-pointer">
//                 <Image
//                   src={Logo}
//                   alt="Logo"
//                   width={30}
//                   height={30}
//                   className="rounded-full"
//                 />
//               </div>
//             </button>
//           </div>
//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 className="absolute left-1/2 top-52 rounded-md transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white w-[80%] flex flex-col justify-center items-center gap-6 py-6"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 {links.map((link) =>
//                   link.href.startsWith("#") ? (
//                     <a
//                       key={link.href}
//                       href={link.href}
//                       onClick={(e) => handleScroll(e, link.href)}
//                       className="text-2xl font-semibold hover:text-gray-300 transition"
//                     >
//                       {link.label}
//                     </a>
//                   ) : (
//                     <Link
//                       key={link.href}
//                       href={link.href}
//                       className="text-2xl font-semibold hover:text-gray-300 transition"
//                       onClick={() => setIsOpen(false)}
//                       download={link.href.endsWith(".pdf") ? true : undefined}
//                     >
//                       {link.label}
//                     </Link>
//                   )
//                 )}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       ) : (
//         /* ------------------ DESKTOP NAV ------------------ */
//         <div
//           className="relative items-center gap-8 hidden md:flex"
//           onMouseEnter={() => setIsOpen(true)}
//           onMouseLeave={() => setIsOpen(false)}
//         >
//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//                 variants={menuVariants.left}
//                 className="absolute right-32 flex gap-8 text-xl font-semibold"
//               >
//                 {leftLinks.map((link) => (
//                   <motion.div key={link.href} variants={itemVariants}>
//                     {link.href.startsWith("#") ? (
//                       <a
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="text-white hover:text-gray-300 transition"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         href={link.href}
//                         className="text-white hover:text-gray-300 transition"
//                         download={link.href.endsWith(".pdf") ? true : undefined}
//                       >
//                         {link.label}
//                       </Link>
//                     )}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Logo turned into a Link with consistent styling */}
//           <Link
//             href="/"
//             className="p-2 border-2 border-white rounded-full cursor-pointer flex-shrink-0 hover:text-black transition"
//           >
//             <Image
//               src={Logo}
//               alt="Logo"
//               width={90}
//               height={90}
//               className="rounded-full"
//             />
//           </Link>

//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//                 variants={menuVariants.right}
//                 className="absolute left-32 flex gap-6 text-xl font-semibold"
//               >
//                 {rightLinks.map((link) => (
//                   <motion.div key={link.href} variants={itemVariants}>
//                     {link.href.startsWith("#") ? (
//                       <a
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="text-white hover:text-gray-300 transition"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         href={link.href}
//                         className="text-white hover:text-gray-300 transition"
//                         download={
//                           link.href.endsWith(".pdf") ? true : undefined
//                         }
//                       >
//                         {link.label}
//                       </Link>
//                     )}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       )}

//       {/* Condition: if user is logged in => show Connect Wallet & Logout, else show Login */}
//       {session?.user ? (
//         <div className="flex items-center gap-3">
//           <WalletMultiButton
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
//             CONNECT WALLET
//           </WalletMultiButton>

//           <button
//             onClick={handleLogout}
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
//             LOGOUT
//           </button>
//         </div>
//       ) : (
//         <button
//           onClick={() => setShowLogin(true)}
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
//             padding: "10px 20px",
//             textAlign: "center",
//           }}
//         >
//           LOGIN
//         </button>
//       )}

//       {/* Our login modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
//     </div>
//   );
// };

// export default Navbar;










// "use client";
// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";
// import { FaXTwitter, FaInstagram } from "react-icons/fa6";
// import Logo from "../../assets/Images/logo.jpeg";

// import { useSession } from "next-auth/react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import LoginModal from "@/components/LoginModal"; // same modal as above

// const links = [
//   { href: "#home", label: "Home" },
//   { href: "#about", label: "About" },
//   { href: "/whitepaper.pdf", label: "Whitepaper" },
//   { href: "/Wusle_Audit.pdf", label: "Audit" },
// ];

// const Navbar: React.FC = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const { data: session } = useSession();
//   const [showLogin, setShowLogin] = useState(false);

//   const half = Math.ceil(links.length / 2);
//   const leftLinks = links.slice(0, half);
//   const rightLinks = links.slice(half);

//   const handleScroll = (e: React.MouseEvent, id: string) => {
//     e.preventDefault();
//     const element = document.querySelector(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//       if (isMobile) setIsOpen(false);
//     }
//   };

//   const menuVariants = {
//     left: {
//       hidden: { x: -50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//     right: {
//       hidden: { x: 50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: -10 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { type: "spring", stiffness: 120 },
//     },
//   };

//   const updateMobileView = () => {
//     setIsMobile(window.innerWidth < 768);
//   };

//   useEffect(() => {
//     updateMobileView();
//     window.addEventListener("resize", updateMobileView);
//     return () => window.removeEventListener("resize", updateMobileView);
//   }, []);

//   return (
//     <div className="flex justify-between items-center bg-transparent relative z-30 px-6 py-4">
//       {/* Social Media Icons */}
//       <div className="flex gap-6">
//         <a
//           href="https://x.com/wusle_official?s=21"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="border-2 md:flex hidden border-white rounded-full size-16 items-center justify-center hover:text-black transition"
//         >
//           <FaXTwitter className="text-white text-3xl" />
//         </a>
//         <a
//           href="https://www.instagram.com/wusle_official/#"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="border-2 md:flex hidden border-white rounded-full size-16 items-center justify-center hover:text-black transition"
//         >
//           <FaInstagram className="text-white text-3xl" />
//         </a>
//       </div>

//       {isMobile ? (
//         <div className="flex items-center justify-between w-full">
//           <div className="flex items-center gap-2">
//             <a
//               href="https://x.com/wusle_official?s=21"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 border-white rounded-full size-10 order-2 flex items-center justify-center hover:text-black transition"
//             >
//               <FaXTwitter className="text-white text-3xl" />
//             </a>
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="text-white text-xl focus:outline-none"
//             >
//               <div className="p-2 border-2 border-white rounded-full cursor-pointer">
//                 <Image
//                   src={Logo}
//                   alt="Logo"
//                   width={30}
//                   height={30}
//                   className="rounded-full"
//                 />
//               </div>
//             </button>
//           </div>
//           <AnimatePresence>
//             {isOpen && (
            //   <motion.div
            //     className="absolute left-1/2 top-52 rounded-md transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white w-[80%] flex flex-col justify-center items-center gap-6 py-6"
            //     initial={{ opacity: 0 }}
            //     animate={{ opacity: 1 }}
            //     exit={{ opacity: 0 }}
            //     transition={{ duration: 0.5 }}
            //   >
            //     {links.map((link) =>
            //       link.href.startsWith("#") ? (
            //         <a
            //           key={link.href}
            //           href={link.href}
            //           onClick={(e) => handleScroll(e, link.href)}
            //           className="text-2xl font-semibold hover:text-gray-300 transition"
            //         >
            //           {link.label}
            //         </a>
            //       ) : (
            //         <Link
            //           key={link.href}
            //           href={link.href}
            //           className="text-2xl font-semibold hover:text-gray-300 transition"
            //           onClick={() => setIsOpen(false)}
            //           download={link.href.endsWith(".pdf") ? true : undefined}
            //         >
            //           {link.label}
            //         </Link>
            //       )
            //     )}
            //   </motion.div>
            // )}
//           </AnimatePresence>
//         </div>
//       ) : (
//         <div
//           className="relative items-center gap-8 hidden md:flex"
//           onMouseEnter={() => setIsOpen(true)}
//           onMouseLeave={() => setIsOpen(false)}
//         >
//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//                 variants={menuVariants.left}
//                 className="absolute right-32 flex gap-8 text-xl font-semibold"
//               >
//                 {leftLinks.map((link) => (
//                   <motion.div key={link.href} variants={itemVariants}>
//                     {link.href.startsWith("#") ? (
//                       <a
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="text-white hover:text-gray-300 transition"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         href={link.href}
//                         className="text-white hover:text-gray-300 transition"
//                         download={
//                           link.href.endsWith(".pdf") ? true : undefined
//                         }
//                       >
//                         {link.label}
//                       </Link>
//                     )}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <div className="p-2 border-2 border-white rounded-full cursor-pointer flex-shrink-0">
//             <Image
//               src={Logo}
//               alt="Logo"
//               width={90}
//               height={90}
//               className="rounded-full"
//             />
//           </div>

//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//                 variants={menuVariants.right}
//                 className="absolute left-32 flex gap-6 text-xl font-semibold"
//               >
//                 {rightLinks.map((link) => (
//                   <motion.div key={link.href} variants={itemVariants}>
//                     {link.href.startsWith("#") ? (
//                       <a
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="text-white hover:text-gray-300 transition"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         href={link.href}
//                         className="text-white hover:text-gray-300 transition"
//                         download={
//                           link.href.endsWith(".pdf") ? true : undefined
//                         }
//                       >
//                         {link.label}
//                       </Link>
//                     )}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       )}

//       {/* Condition: if user is logged in => show Connect Wallet, else show Login */}
//       {session?.user ? (
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
//             padding: "10px 20px",
//             textAlign: "center",
//           }}
//         >
//           CONNECT WALLET
//         </WalletMultiButton>
//       ) : (
//         <button
//           onClick={() => setShowLogin(true)}
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
//             padding: "10px 20px",
//             textAlign: "center",
//           }}
//         >
//           LOGIN
//         </button>
//       )}

//       {/* Our login modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
//     </div>
//   );
// };

// export default Navbar;











// // components/Navbar.jsx
// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import Image from "next/image";
// import { FaXTwitter, FaTelegram, FaInstagram } from "react-icons/fa6";
// import Logo from "../../assets/Images/logo.jpeg";

// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// const links = [
//   { href: "#home", label: "Home" },
//   { href: "#about", label: "About" },
//   { href: "/whitepaper.pdf", label: "Whitepaper" },
//   { href: "/Wusle_Audit.pdf", label: "Audit" },
// ];

// const Navbar: React.FC = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const half = Math.ceil(links.length / 2);
//   const leftLinks = links.slice(0, half);
//   const rightLinks = links.slice(half);

//   const handleScroll = (e: React.MouseEvent, id: string) => {
//     e.preventDefault();
//     const element = document.querySelector(id);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth" });
//       if (isMobile) setIsOpen(false);
//     }
//   };

//   const menuVariants = {
//     left: {
//       hidden: { x: -50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//     right: {
//       hidden: { x: 50, opacity: 0 },
//       visible: { x: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: -10 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { type: "spring", stiffness: 120 },
//     },
//   };

//   const updateMobileView = () => {
//     setIsMobile(window.innerWidth < 768);
//   };

//   useEffect(() => {
//     updateMobileView();
//     window.addEventListener("resize", updateMobileView);
//     return () => window.removeEventListener("resize", updateMobileView);
//   }, []);

//   return (
//     <div className="flex justify-between items-center bg-transparent relative z-30 px-6 py-4">
//       {/* Social Media Icons */}
//       <div className="flex gap-6">
//         <a
//           href="https://x.com/wusle_official?s=21"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="border-2 md:flex hidden border-white rounded-full size-16 items-center justify-center hover:text-black transition"
//         >
//           <FaXTwitter className="text-white text-3xl" />
//         </a>
//         {/* <a
//           href="https://t.me"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="border-2 border-white rounded-full size-16 md:flex hidden items-center justify-center hover:text-black transition"
//         >
//           <FaTelegram className="text-white md:text-3xl text-2xl" />
//         </a> */}
//         <a
//           href="https://www.instagram.com/wusle_official/#"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="border-2 md:flex hidden border-white rounded-full size-16 items-center justify-center hover:text-black transition"
//         >
//           <FaInstagram className="text-white text-3xl" />
//         </a>
//       </div>

//       {isMobile ? (
//         <div className="flex items-center justify-between w-full">
//           <div className="flex items-center gap-2">
//             <a
//               href="https://x.com/wusle_official?s=21"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="border-2 border-white rounded-full size-10 order-2 flex items-center justify-center hover:text-black transition"
//             >
//               <FaXTwitter className="text-white text-3xl" />
//             </a>
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="text-white text-xl focus:outline-none"
//             >
//               <div className="p-2 border-2 border-white rounded-full cursor-pointer">
//                 <Image
//                   src={Logo}
//                   alt="Logo"
//                   width={30}
//                   height={30}
//                   className="rounded-full"
//                 />
//               </div>
//             </button>
//           </div>
//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 className="absolute left-1/2 top-52 rounded-md transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white w-[80%] flex flex-col justify-center items-center gap-6 py-6"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 {links.map((link) =>
//                   link.href.startsWith("#") ? (
//                     <a
//                       key={link.href}
//                       href={link.href}
//                       onClick={(e) => handleScroll(e, link.href)}
//                       className="text-2xl font-semibold hover:text-gray-300 transition"
//                     >
//                       {link.label}
//                     </a>
//                   ) : (
//                     <Link
//                       key={link.href}
//                       href={link.href}
//                       className="text-2xl font-semibold hover:text-gray-300 transition"
//                       onClick={() => setIsOpen(false)}
//                       download={link.href.endsWith(".pdf") ? true : undefined}
//                     >
//                       {link.label}
//                     </Link>
//                   )
//                 )}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       ) : (
//         <div
//           className="relative items-center gap-8 hidden md:flex"
//           onMouseEnter={() => setIsOpen(true)}
//           onMouseLeave={() => setIsOpen(false)}
//         >
//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//                 variants={menuVariants.left}
//                 className="absolute right-32 flex gap-8 text-xl font-semibold"
//               >
//                 {leftLinks.map((link) => (
//                   <motion.div key={link.href} variants={itemVariants}>
//                     {link.href.startsWith("#") ? (
//                       <a
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="text-white hover:text-gray-300 transition"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         href={link.href}
//                         className="text-white hover:text-gray-300 transition"
//                         download={link.href.endsWith(".pdf") ? true : undefined}
//                       >
//                         {link.label}
//                       </Link>
//                     )}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <div className="p-2 border-2 border-white rounded-full cursor-pointer  flex-shrink-0">
//             <Image
//               src={Logo}
//               alt="Logo"
//               width={90}
//               height={90}
//               className="rounded-full"
//             />
//           </div>

//           <AnimatePresence>
//             {isOpen && (
//               <motion.div
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//                 variants={menuVariants.right}
//                 className="absolute left-32 flex gap-6 text-xl font-semibold"
//               >
//                 {rightLinks.map((link) => (
//                   <motion.div key={link.href} variants={itemVariants}>
//                     {link.href.startsWith("#") ? (
//                       <a
//                         href={link.href}
//                         onClick={(e) => handleScroll(e, link.href)}
//                         className="text-white hover:text-gray-300 transition"
//                       >
//                         {link.label}
//                       </a>
//                     ) : (
//                       <Link
//                         href={link.href}
//                         className="text-white hover:text-gray-300 transition"
//                         download={link.href.endsWith(".pdf") ? true : undefined}
//                       >
//                         {link.label}
//                       </Link>
//                     )}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       )}

//       {/* Wallet Button */}
//       <WalletMultiButton
//         style={{
//           fontSize: "16px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontWeight: "bold",
//           color: "black",
//           background: "white",
//           border: "none",
//           borderRadius: "50px",
//           cursor: "pointer",
//           transition: "all 0.3s ease-in-out",
//           animation: "heartbeat 1s infinite ease-in-out",
//           padding: "10px 20px", // Adjust padding for better spacing
//           textAlign: "center",
//         }}
//       >
//         CONNECT WALLET
//       </WalletMultiButton>
//     </div>
//   );
// };

// export default Navbar;
