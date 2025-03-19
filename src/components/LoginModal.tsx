"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Logo from "../assets/Images/logo.jpeg";
import ForgotPasswordModal from "./ForgotPasswordModal"; // The new 
// enhanced forgot modal

import { createPortal } from 'react-dom';

interface Props {
  show: boolean;
  onClose: () => void;
}

export default function LoginModal({ show, onClose }: Props) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false); // for ForgotPasswordModal
  const router = useRouter();

  if (!show) return null;

  const resetFields = () => {
    setEmail("");
    setPassword("");
    setName("");
  };

  const handleClose = () => {
    onClose();
    resetFields();
  };

  const handleSignUp = async () => {
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (res.ok) {
        // Optionally auto-sign in after signup
        await signIn("credentials", { email, password, redirect: false });
        handleClose();
        router.refresh();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      console.error("SignUp Error:", err);
    }
  };

  const handleSignIn = async () => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        alert(result.error);
      } else {
        handleClose();
        router.refresh();
      }
    } catch (err: any) {
      console.error("SignIn Error:", err);
    }
  };

  const handleGoogleSignIn = async () => {
    // By default, this will redirect to Google
    await signIn("google");
  };

  return createPortal(
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            className="fixed inset-0  flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Click outside to close (optional) */}
            <div className="absolute inset-0" onClick={handleClose} />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              // The "teeth" border is done via clip-path
              className="
                presale-card 
                relative
                p-6
                w-full
                max-w-md
                bg-gradient-to-br from-[#4f0289]/40 to-[#9c23d5]/40
                backdrop-blur-xl
                border border-white/20 ring-1 ring-white/20
                text-white
                flex flex-col
                overflow-hidden
                shadow-2xl
                
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-white text-2xl hover:text-gray-300"
              >
                &times;
              </button>

              {/* Logo (if you have one) */}
              <div className="flex justify-center mb-2">
                <Image
                  src={Logo}
                  alt="Logo"
                  width={60}
                  height={60}
                  className="rounded-full  border-4 border-[#9c23d5] bg-white flex-shrink-0 hover:text-black transition py-2 "
                />
              </div>

              <h2 className="fontFamily text-3xl  text-center mb-4">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>

              {/* Some short text */}
              <p className="fontFamilyText text-center text-md font-sans text-gray-200 mb-4">
              Track your heart health, earn Wusle Coins, and unlock rewards! Stay fit, get rewarded—because every heartbeat counts.❤️
              </p>

              {/* If creating new account, show Name field */}
              {isSignUp && (
                <input
                  className="
                    fontFamilyText
                    rounded-md mb-2 p-3
                    bg-white/20 focus:bg-white/30
                    placeholder-gray-200
                    focus:outline-none
                  "
                  placeholder="Name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <input
                className="
                  fontFamilyText
                  rounded-md mb-2 p-3
                  bg-white/20 focus:bg-white/30
                  placeholder-gray-200
                  focus:outline-none
                "
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="
                  fontFamilyText
                  rounded-md mb-4 p-3
                  bg-white/20 focus:bg-white/30
                  placeholder-gray-200
                  focus:outline-none
                "
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Credentials Submit Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={isSignUp ? handleSignUp : handleSignIn}
                className="
                  fontFamily
                  mb-3 py-3 px-5
                  bg-purple-600 hover:bg-purple-700
                  rounded-full
                  transition-colors duration-300
                "
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </motion.button>

              {/* Google Sign-In Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGoogleSignIn}
                className="
                fontFamily
                  mb-4 py-3 px-5
                  
                  rounded-full
                  transition-colors duration-300
                  flex items-center justify-center
                  bg-white
                  text-purple-700
                  hover:bg-gray-100
                "
              >
                <span className="mr-2"> 
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 64 64"
                    xmlns="http://www.w3.org/2000/svg"
                    className="inline-block"
                  >
                    <path
                      fill="#EA4335"
                      d="M33 28v8h11c-1 4-5 11-11 11-6 0-12-5-12-12s6-12 12-12c3 0 6 1 8 3l6-6C41 18 37 17 33 17 22 17 13 26 13 37s9 20 20 20 19-9 19-20c0-1 0-2-1-3H33z"
                    />
                  </svg>
                </span>
                {isSignUp ? "Sign Up with Google" : "Sign In with Google"}
              </motion.button>

              {/* Forgot link if not sign up */}
              {!isSignUp && (
                <div className="text-right -mt-3">
                  <button
                    className="fontFamilyText text-sm  text-purple-300 hover:text-purple-400"
                    onClick={() => setShowForgot(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Toggle between Sign In & Sign Up */}
              <div className="fontFamily text-center text-sm mt-6">
                {isSignUp ? (
                  <>
                    Already have an account?{" "}
                    <span
                      onClick={() => setIsSignUp(false)}
                      className="text-[#d199eb] font-bold cursor-pointer hover:text-purple-500"
                    >
                      Sign In
                    </span>
                  </>
                ) : (
                  <>
                    Don’t have an account?{" "}
                    <span
                      onClick={() => setIsSignUp(true)}
                      className="fontFamilyText text-[#d199eb]  cursor-pointer hover:text-purple-500"
                    >
                      Sign Up
                    </span>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Our Forgot Password Modal, re-themed */}
      <ForgotPasswordModal
        show={showForgot}
        onClose={() => setShowForgot(false)}
      />
    </>,
    document.body
  );
}









// "use client";

// import { useState } from "react";
// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import Logo from "../assets/Images/logo.jpeg";

// // Props for the modal
// interface Props {
//   show: boolean;
//   onClose: () => void;
// }

// export default function LoginModal({ show, onClose }: Props) {
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [email, setEmail] = useState("");
//   const [name, setName] = useState("");
//   const [password, setPassword] = useState("");
//   const router = useRouter();

//   if (!show) return null;

//   const resetFields = () => {
//     setEmail("");
//     setPassword("");
//     setName("");
//   };

//   const handleClose = () => {
//     onClose();
//     resetFields();
//   };

//   const handleSignUp = async () => {
//     try {
//       const res = await fetch("/api/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password, name }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         // Optionally auto-sign in after signup
//         await signIn("credentials", { email, password, redirect: false });
//         handleClose();
//         router.refresh();
//       } else {
//         alert(data.error);
//       }
//     } catch (err: any) {
//       console.error("SignUp Error:", err);
//     }
//   };

//   const handleSignIn = async () => {
//     try {
//       const result = await signIn("credentials", {
//         email,
//         password,
//         redirect: false,
//       });
//       if (result?.error) {
//         alert(result.error);
//       } else {
//         handleClose();
//         router.refresh();
//       }
//     } catch (err: any) {
//       console.error("SignIn Error:", err);
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     // By default, this will redirect to Google
//     // If you prefer a callback or custom route, pass an object: signIn("google", { callbackUrl: "/dashboard" })
//     await signIn("google");
//   };

//   return (
//     <AnimatePresence>
//       {show && (
//         <motion.div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           {/* Click outside to close (optional) */}
//           <div
//             className="absolute inset-0"
//             onClick={handleClose}
//           />

//           {/* Modal Content */}
//           <motion.div
//             initial={{ scale: 0.8, opacity: 0, y: 50 }}
//             animate={{ scale: 1, opacity: 1, y: 0 }}
//             exit={{ scale: 0.8, opacity: 0, y: 50 }}
//             transition={{ duration: 0.4, ease: "easeOut" }}
//             // The "teeth" border is done via clip-path
//             className="
//               relative
//               p-6
//               w-full
//               max-w-md
//               bg-gradient-to-br from-[#4f0289]/40 to-[#9c23d5]/40
//               backdrop-blur-xl
//               border border-white/20 ring-1 ring-white/20
//               text-white
//               flex flex-col
//               overflow-hidden
//               shadow-2xl
//               [clip-path:polygon(
//                 0% 0%, 
//                 100% 0%, 
//                 100% 90%, 
//                 90% 80%, 
//                 80% 90%, 
//                 70% 80%, 
//                 60% 90%, 
//                 50% 80%, 
//                 40% 90%, 
//                 30% 80%, 
//                 20% 90%, 
//                 10% 80%, 
//                 0% 90%
//               )]
//             "
//             onClick={(e) => e.stopPropagation()} // prevent closing on modal click
//           >
//             {/* Close button */}
//             <button
//               onClick={handleClose}
//               className="absolute top-3 right-3 text-white text-2xl hover:text-gray-300"
//             >
//               &times;
//             </button>

//             {/* Logo (if you have one) */}
//             <div className="flex justify-center mb-2">
//               <Image
//                 src={Logo}
//                 alt="Logo"
//                 width={60}
//                 height={60}
//                 className="rounded-full border-2 border-white"
//               />
//             </div>

//             <h2 className="text-3xl font-extrabold text-center mb-4">
//               {isSignUp ? "Create Account" : "Welcome Back"}
//             </h2>

//             {/* Some short “lorem ipsum” style text */}
//             <p className="text-center text-sm text-gray-200 mb-4">
//               Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
//               blandit imperdiet sapien, eu malesuada elit faucibus sed.
//             </p>

//             {/* If creating new account, show Name field */}
//             {isSignUp && (
//               <input
//                 className="rounded-md mb-2 p-3 bg-white/20 focus:bg-white/30 placeholder-gray-200 focus:outline-none"
//                 placeholder="Name (optional)"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               />
//             )}

//             <input
//               className="rounded-md mb-2 p-3 bg-white/20 focus:bg-white/30 placeholder-gray-200 focus:outline-none"
//               placeholder="Email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             <input
//               className="rounded-md mb-4 p-3 bg-white/20 focus:bg-white/30 placeholder-gray-200 focus:outline-none"
//               placeholder="Password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />

//             {/* Credentials Submit Button */}
//             <motion.button
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               onClick={isSignUp ? handleSignUp : handleSignIn}
//               className="
//                 mb-3 py-3 px-5
//                 font-bold
//                 bg-purple-600 hover:bg-purple-700
//                 rounded-full
//                 transition-colors duration-300
//               "
//             >
//               {isSignUp ? "Sign Up" : "Sign In"}
//             </motion.button>

//             {/* Google Sign-In Button */}
//             <motion.button
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               onClick={handleGoogleSignIn}
//               className="
//                 mb-4 py-3 px-5
//                 font-bold
//                 rounded-full
//                 transition-colors duration-300
//                 flex items-center justify-center
//                 bg-white
//                 text-purple-700
//                 hover:bg-gray-100
//               "
//             >
//               {/* You can optionally place a Google icon on the left */}
//               <span className="mr-2"> 
//                 <svg
//                   width="20"
//                   height="20"
//                   viewBox="0 0 64 64"
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="inline-block"
//                 >
//                   <path
//                     fill="#EA4335"
//                     d="M33 28v8h11c-1 4-5 11-11 11-6 0-12-5-12-12s6-12 12-12c3 0 6 1 8 3l6-6C41 18 37 17 33 17 22 17 13 26 13 37s9 20 20 20 19-9 19-20c0-1 0-2-1-3H33z"
//                   />
//                 </svg>
//               </span>
//               {isSignUp ? "Sign Up with Google" : "Sign In with Google"}
//             </motion.button>

//             {/* Toggle between Sign In & Sign Up */}
//             <div className="text-center text-sm mt-auto">
//               {isSignUp ? (
//                 <>
//                   Already have an account?{" "}
//                   <span
//                     onClick={() => setIsSignUp(false)}
//                     className="text-white underline cursor-pointer hover:text-gray-300"
//                   >
//                     Sign In
//                   </span>
//                 </>
//               ) : (
//                 <>
//                   Don’t have an account?{" "}
//                   <span
//                     onClick={() => setIsSignUp(true)}
//                     className="text-white underline cursor-pointer hover:text-gray-300"
//                   >
//                     Sign Up
//                   </span>
//                 </>
//               )}
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }









