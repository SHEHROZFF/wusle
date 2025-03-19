"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from 'react-dom';

interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ show, onClose }: ForgotPasswordModalProps) {
  // Steps: 1 => Enter email, 2 => Enter OTP, 3 => New password
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  // We'll store OTP in an array of 6 strings
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");

  // Close & reset
  function handleClose() {
    setStep(1);
    setEmail("");
    setOtp(Array(6).fill(""));
    setNewPassword("");
    setStatus("");
    onClose();
  }

  // Step 1 => request OTP
  async function handleRequestOtp() {
    setStatus("Working...");
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("6-digit code sent! Check your email.");
        setStep(2);
      } else {
        setStatus(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setStatus("Server error");
    }
  }

  // Step 2 => automatically verify once OTP is complete
  async function handleVerifyOtp(finalOtpArr: string[]) {
    setStatus("Verifying code...");
    const code = finalOtpArr.join("");
    console.log("Final OTP typed by user:", code);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("OTP verified! Set your new password.");
        setStep(3);
      } else {
        setStatus(data.error || "Invalid or expired OTP");
      }
    } catch (err) {
      console.error(err);
      setStatus("Server error");
    }
  }

  // Step 3 => reset password
  async function handleResetPassword() {
    setStatus("Resetting password...");
    const code = otp.join("");
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: code,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Password updated! You can now sign in.");
      } else {
        setStatus(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setStatus("Server error");
    }
  }

  // Automatic OTP input logic
  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return; // digits only

    // create a copy of the OTP array
    const newArr = [...otp];
    newArr[index] = value.slice(-1); // single digit
    setOtp(newArr);

    // focus next field if user typed something
    if (value && index < 5) {
      const nextEl = document.getElementById(`otp-${index + 1}`);
      if (nextEl) (nextEl as HTMLInputElement).focus();
    }

    // if user typed last digit (index=5) and all are filled, auto-verify
    if (index === 5 && value && newArr.every((d) => d !== "")) {
      // short delay so the UI updates the last digit visually
      setTimeout(() => {
        handleVerifyOtp(newArr);
      }, 300);
    }
  }

  if (!show) return null;

  return createPortal(

    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0  flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Click outside to close */}
          <div className="absolute inset-0" onClick={handleClose} />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
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
              hover:scale-[1.005]
              transition-transform
              duration-300
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

            {/* Step content */}
            {step === 1 && (
              <Step1
                email={email}
                setEmail={setEmail}
                handleRequestOtp={handleRequestOtp}
              />
            )}

            {step === 2 && (
              <Step2
                email={email}
                otp={otp}
                handleOtpChange={handleOtpChange}
              />
            )}

            {step === 3 && (
              <Step3
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                handleResetPassword={handleResetPassword}
              />
            )}

            {/* status message */}
            {status && (
              <div className="fontFamilyText mt-3 text-sm text-center px-2">
                {status}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,

    document.body
  );
}

/** Step 1: Collect Email */
function Step1({
  email,
  setEmail,
  handleRequestOtp,
}: {
  email: string;
  setEmail: (val: string) => void;
  handleRequestOtp: () => void;
}) {
  return (
    <>
      <h2 className="fontFamily text-3xl  text-center mb-4">
        Forgot Password
      </h2>
      <p className="fontFamilyText text-center text-sm text-gray-200 mb-4">
        Enter your email, and we'll send you a 6-digit code.
      </p>

      <input
        className="
        fontFamilyText
          w-full
          rounded-md
          mb-3 p-3
          bg-white/20
          focus:bg-white/30
          placeholder-gray-200
          focus:outline-none
        "
        placeholder="Your Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleRequestOtp}
        className="
        fontFamily
          w-full
          py-3 px-5
          font-bold
          bg-purple-600
          hover:bg-purple-700
          rounded-full
          transition-colors duration-300
        "
      >
        Send OTP
      </motion.button>
    </>
  );
}

/** Step 2: Enter OTP */
function Step2({
  email,
  otp,
  handleOtpChange,
}: {
  email: string;
  otp: string[];
  handleOtpChange: (index: number, value: string) => void;
}) {
  return (
    <>
      <h2 className="fontFamily text-2xl text-center mb-4">
        Verify OTP
      </h2>
      <p className="fontFamilyText text-center text-sm text-gray-200 mb-4">
        A 6-digit code was sent to <b>{email}</b>.
      </p>

      <div className="flex justify-center gap-2 mb-4">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            id={`otp-${idx}`}
            type="text"
            maxLength={1}
            className="
            fontFamilyText
              w-10 h-10
              bg-white/20
              focus:bg-white/30
              text-center
              rounded
              text-2xl
              text-white
              focus:outline-none
              hover:scale-105
              transition
            "
            value={digit}
            onChange={(e) => handleOtpChange(idx, e.target.value)}
          />
        ))}
      </div>
    </>
  );
}

/** Step 3: Enter new password */
function Step3({
  newPassword,
  setNewPassword,
  handleResetPassword,
}: {
  newPassword: string;
  setNewPassword: (val: string) => void;
  handleResetPassword: () => void;
}) {
  return (
    <>
      <h2 className="fontFamily text-2xl font-extrabold text-center mb-4">
        Reset Password
      </h2>
      <p className="fontFamilyText text-center text-sm text-gray-200 mb-4">
        Enter your new password below.
      </p>

      <input
        className="
        fontFamilyText
          w-full
          rounded-md
          mb-3 p-3
          bg-white/20
          focus:bg-white/30
          placeholder-gray-200
          focus:outline-none
        "
        placeholder="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleResetPassword}
        className="
        fontFamily
          w-full
          py-3 px-5
          font-bold
          bg-purple-600
          hover:bg-purple-700
          rounded-full
          transition-colors duration-300
        "
      >
        Set New Password
      </motion.button>
    </>
  );
}










// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// interface ForgotPasswordModalProps {
//   show: boolean;
//   onClose: () => void;
// }

// export default function ForgotPasswordModal({ show, onClose }: ForgotPasswordModalProps) {
//   // 1 => Email input, 2 => OTP input, 3 => new pass
//   const [step, setStep] = useState(1);

//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState(Array(6).fill(""));
//   const [newPassword, setNewPassword] = useState("");

//   const [status, setStatus] = useState("");

//   function handleClose() {
//     setStep(1);
//     setEmail("");
//     setOtp(Array(6).fill(""));
//     setNewPassword("");
//     setStatus("");
//     onClose();
//   }

//   // Step 1 => request code
//   async function handleRequestOtp() {
//     setStatus("Working...");
//     try {
//       const res = await fetch("/api/auth/forgot", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setStatus("6-digit code sent to your email!");
//         setStep(2);
//       } else {
//         setStatus(data.error || "Something went wrong");
//       }
//     } catch (err) {
//       console.error(err);
//       setStatus("Server error");
//     }
//   }

//   // Step 2 => verify code
//   async function handleVerifyOtp() {
//     setStatus("Verifying code...");
//     const code = otp.join("");
//     try {
//       const res = await fetch("/api/auth/verify", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp: code }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setStatus("OTP verified, set your new password!");
//         setStep(3);
//       } else {
//         setStatus(data.error || "Invalid/expired OTP");
//       }
//     } catch (err) {
//       console.error(err);
//       setStatus("Server error");
//     }
//   }

//   // Step 3 => set new pass
//   async function handleResetPassword() {
//     setStatus("Resetting password...");
//     const code = otp.join("");
//     try {
//       const res = await fetch("/api/auth/reset", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email,
//           otp: code,
//           newPassword,
//         }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setStatus("Password updated! You can now sign in.");
//       } else {
//         setStatus(data.error || "Something went wrong");
//       }
//     } catch (err) {
//       console.error(err);
//       setStatus("Server error");
//     }
//   }

//   function handleOtpChange(index: number, value: string) {
//     // only digits
//     if (!/^\d*$/.test(value)) return;
//     const newArr = [...otp];
//     newArr[index] = value.slice(-1);
//     setOtp(newArr);
//     // auto-focus next
//     if (value && index < 5) {
//       const nextEl = document.getElementById(`otp-${index + 1}`);
//       if (nextEl) (nextEl as HTMLInputElement).focus();
//     }
//   }

//   if (!show) return null;

//   return (
//     <AnimatePresence>
//       {show && (
//         <motion.div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           {/* Click outside to close */}
//           <div className="absolute inset-0" onClick={handleClose} />

//           <motion.div
//             initial={{ scale: 0.8, opacity: 0, y: 50 }}
//             animate={{ scale: 1, opacity: 1, y: 0 }}
//             exit={{ scale: 0.8, opacity: 0, y: 50 }}
//             transition={{ duration: 0.4, ease: "easeOut" }}
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
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               onClick={handleClose}
//               className="absolute top-3 right-3 text-white text-2xl hover:text-gray-300"
//             >
//               &times;
//             </button>

//             {step === 1 && (
//               <>
//                 <h2 className="text-3xl font-extrabold text-center mb-4">
//                   Forgot Password
//                 </h2>
//                 <p className="text-center text-sm text-gray-200 mb-4">
//                   Enter your email, and we'll send you a 6-digit code.
//                 </p>
//                 <input
//                   className="
//                     w-full
//                     rounded-md
//                     mb-3 p-3
//                     bg-white/20
//                     focus:bg-white/30
//                     placeholder-gray-200
//                     focus:outline-none
//                   "
//                   placeholder="Your Email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//                 <motion.button
//                   whileHover={{ scale: 1.03 }}
//                   whileTap={{ scale: 0.97 }}
//                   onClick={handleRequestOtp}
//                   className="
//                     w-full
//                     py-3 px-5
//                     font-bold
//                     bg-purple-600
//                     hover:bg-purple-700
//                     rounded-full
//                     transition-colors duration-300
//                   "
//                 >
//                   Send OTP
//                 </motion.button>
//               </>
//             )}

//             {step === 2 && (
//               <>
//                 <h2 className="text-2xl font-extrabold text-center mb-4">
//                   Verify OTP
//                 </h2>
//                 <p className="text-center text-sm text-gray-200 mb-4">
//                   A 6-digit code was sent to <b>{email}</b>.
//                 </p>
//                 <div className="flex justify-center gap-2 mb-4">
//                   {otp.map((digit, idx) => (
//                     <input
//                       key={idx}
//                       id={`otp-${idx}`}
//                       type="text"
//                       maxLength={1}
//                       className="
//                         w-10 h-10
//                         bg-white/20
//                         focus:bg-white/30
//                         text-center
//                         rounded
//                         text-2xl
//                         text-white
//                         focus:outline-none
//                       "
//                       value={digit}
//                       onChange={(e) => handleOtpChange(idx, e.target.value)}
//                     />
//                   ))}
//                 </div>
//                 <motion.button
//                   whileHover={{ scale: 1.03 }}
//                   whileTap={{ scale: 0.97 }}
//                   onClick={handleVerifyOtp}
//                   className="
//                     w-full
//                     py-3 px-5
//                     font-bold
//                     bg-purple-600
//                     hover:bg-purple-700
//                     rounded-full
//                     transition-colors duration-300
//                   "
//                 >
//                   Verify OTP
//                 </motion.button>
//               </>
//             )}

//             {step === 3 && (
//               <>
//                 <h2 className="text-2xl font-extrabold text-center mb-4">
//                   Reset Password
//                 </h2>
//                 <p className="text-center text-sm text-gray-200 mb-4">
//                   Enter your new password below.
//                 </p>
//                 <input
//                   className="
//                     w-full
//                     rounded-md
//                     mb-3 p-3
//                     bg-white/20
//                     focus:bg-white/30
//                     placeholder-gray-200
//                     focus:outline-none
//                   "
//                   placeholder="New Password"
//                   type="password"
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                 />
//                 <motion.button
//                   whileHover={{ scale: 1.03 }}
//                   whileTap={{ scale: 0.97 }}
//                   onClick={handleResetPassword}
//                   className="
//                     w-full
//                     py-3 px-5
//                     font-bold
//                     bg-purple-600
//                     hover:bg-purple-700
//                     rounded-full
//                     transition-colors duration-300
//                   "
//                 >
//                   Set New Password
//                 </motion.button>
//               </>
//             )}

//             {status && (
//               <div className="mt-3 text-sm text-center">
//                 {status}
//               </div>
//             )}
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }





// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// interface ForgotPasswordModalProps {
//   show: boolean;
//   onClose: () => void;
// }

// export default function ForgotPasswordModal({ show, onClose }: ForgotPasswordModalProps) {
//   const [email, setEmail] = useState("");
//   const [status, setStatus] = useState("");

//   if (!show) return null;

//   const handleForgot = async () => {
//     setStatus("Working...");
//     try {
//       const res = await fetch("/api/auth/forgot", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setStatus(data.message || "Check your email for reset instructions.");
//       } else {
//         setStatus(data.error || "Something went wrong");
//       }
//     } catch (err: any) {
//       console.error(err);
//       setStatus("Error contacting server");
//     }
//   };

//   const handleClose = () => {
//     setEmail("");
//     setStatus("");
//     onClose();
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
//           {/* Click outside to close */}
//           <div className="absolute inset-0" onClick={handleClose} />

//           <motion.div
//             initial={{ scale: 0.8, opacity: 0, y: 50 }}
//             animate={{ scale: 1, opacity: 1, y: 0 }}
//             exit={{ scale: 0.8, opacity: 0, y: 50 }}
//             transition={{ duration: 0.4, ease: "easeOut" }}
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
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               onClick={handleClose}
//               className="absolute top-3 right-3 text-white text-2xl hover:text-gray-300"
//             >
//               &times;
//             </button>

//             <h2 className="text-3xl font-extrabold text-center mb-4">
//               Forgot Password
//             </h2>

//             <p className="text-center text-sm text-gray-200 mb-4">
//               No worries! Enter your email, and we'll send you a link to reset your password.
//             </p>

//             <input
//               className="
//                 w-full
//                 rounded-md
//                 mb-3 p-3
//                 bg-white/20
//                 focus:bg-white/30
//                 placeholder-gray-200
//                 focus:outline-none
//               "
//               placeholder="Your Email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />

//             <motion.button
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               onClick={handleForgot}
//               className="
//                 w-full
//                 py-3 px-5
//                 font-bold
//                 bg-purple-600
//                 hover:bg-purple-700
//                 rounded-full
//                 transition-colors duration-300
//               "
//             >
//               Send Reset Link
//             </motion.button>

//             {status && (
//               <div className="mt-3 text-sm text-gray-100 text-center">
//                 {status}
//               </div>
//             )}
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }
