"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import ReceiptModal from "./ReceiptModal";

interface SlipData {
  id: string;
  userId: string;
  walletAddress: string;
  currency: string;
  amountPaid: number;
  wuslePurchased: number;
  redeemCode: string;
  createdAt: string;
}

interface PurchaseHistoryModalProps {
  show: boolean;
  onClose: () => void;
}

const PurchaseHistoryModal: React.FC<PurchaseHistoryModalProps> = ({ show, onClose }) => {
  const { data: session } = useSession();
  const [slips, setSlips] = useState<SlipData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<SlipData | null>(null);

  useEffect(() => {
    if (show && session?.user?.email) {
      setLoading(true);
      fetch("/api/slip/history")
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setSlips(data.slips || []);
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load purchase history.");
          setLoading(false);
        });
    }
  }, [show, session]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { scale: 0.6, opacity: 0, y: 50 },
    visible: { scale: 1, opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Click outside to close */}
          <div className="absolute inset-0" onClick={onClose}></div>
          <motion.div
            className="presale-card relative p-6 w-full max-w-3xl bg-gradient-to-br from-[#5b0396]/70 to-[#8e31c5]/70 rounded-lg shadow-2xl z-10 overflow-y-auto max-h-full scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800 [clip-path:polygon(0% 0%, 100% 0%, 100% 85%, 90% 100%, 10% 100%, 0% 85%)]"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* <div
              className="absolute inset-0 bg-[url('/wusle.jpg')] bg-center bg-current bg-no-repeat opacity-10 pointer-events-none rounded-full"
            /> */}

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300 transition"
            >
              &times;
            </button>
            {!selectedSlip ? (
              <>
                <h2 className="fontFamily text-white text-4xl mb-6 text-center uppercase ">
                  Epic Purchase History
                </h2>
                {loading ? (
                  <p className="fontFamilyText text-center text-white text-lg">
                    Loading your mystical receipts...
                  </p>
                ) : error ? (
                  <p className="fontFamilyText text-center text-red-400 text-lg">{error}</p>
                ) : slips.length === 0 ? (
                  <p className="text-center text-white text-lg">
                    No legendary purchase history found.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {slips.map((slip) => (
                      <motion.div
                        key={slip.id}
                        className="p-4 bg-purple-800 rounded-lg flex justify-between items-center hover:bg-p-700 transition transform hover:scale-105"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div>
                          <p className="text-sm text-gray-300">
                            <span className="fontFamilyText text-white">Slip:</span>{" "}
                            {slip.id}
                          </p>
                          <p className="text-sm text-gray-300">
                            <span className="fontFamilyText text-white">Date:</span>{" "}
                            {slip.createdAt ? format(new Date(slip.createdAt), "PPpp") : "N/A"}
                          </p>
                          <p className="text-sm text-gray-300">
                            <span className="fontFamilyText text-white">Amount:</span>{" "}
                            {slip.amountPaid} {slip.currency}
                          </p>
                        </div>
                        <Button
                          onClick={() => setSelectedSlip(slip)}
                          className="fontFamilyText px-4 py-2 bg-pink-700 hover:bg-pink-600 text-white rounded-md"
                        >
                          View Details
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <ReceiptModal show={!!selectedSlip} slip={selectedSlip!} onClose={() => setSelectedSlip(null)} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PurchaseHistoryModal;








// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useSession } from "next-auth/react";
// import { Button } from "@/components/ui/button";
// import { format } from "date-fns";

// interface SlipData {
//   id: string;
//   userId: string;
//   walletAddress: string;
//   currency: string;
//   amountPaid: number;
//   wuslePurchased: number;
//   redeemCode: string;
//   createdAt: string;
// }

// interface PurchaseHistoryModalProps {
//   show: boolean;
//   onClose: () => void;
// }

// const PurchaseHistoryModal: React.FC<PurchaseHistoryModalProps> = ({ show, onClose }) => {
//   const { data: session } = useSession();
//   const [slips, setSlips] = useState<SlipData[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedSlip, setSelectedSlip] = useState<SlipData | null>(null);

//   useEffect(() => {
//     if (show && session?.user?.email) {
//       setLoading(true);
//       fetch("/api/slip/history")
//         .then((res) => res.json())
//         .then((data) => {
//           if (data.error) {
//             setError(data.error);
//           } else {
//             setSlips(data.slips || []);
//           }
//           setLoading(false);
//         })
//         .catch(() => {
//           setError("Failed to load purchase history.");
//           setLoading(false);
//         });
//     }
//   }, [show, session]);

//   const backdropVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1 },
//   };

//   const modalVariants = {
//     hidden: { scale: 0.6, opacity: 0, y: 50 },
//     visible: { scale: 1, opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
//   };

//   return (
//     <AnimatePresence>
//       {show && (
//         <motion.div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
//           variants={backdropVariants}
//           initial="hidden"
//           animate="visible"
//           exit="hidden"
//         >
//           {/* Click outside to close */}
//           <div className="absolute inset-0" onClick={onClose}></div>
//           <motion.div
//             className="relative p-6 w-full max-w-3xl bg-gradient-to-br from-[#5b0396]/70 to-[#8e31c5]/70 rounded-lg shadow-2xl z-10 overflow-y-auto max-h-full [clip-path:polygon(0% 0%, 100% 0%, 100% 85%, 90% 100%, 10% 100%, 0% 85%)]"
//             variants={modalVariants}
//             initial="hidden"
//             animate="visible"
//             exit="hidden"
//           >
//             <button
//               onClick={onClose}
//               className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300 transition"
//             >
//               &times;
//             </button>
//             {!selectedSlip ? (
//               <>
//                 <h2 className="text-4xl font-extrabold mb-6 text-center uppercase tracking-wide text-white drop-shadow-lg">
//                   Epic Purchase History
//                 </h2>
//                 {loading ? (
//                   <p className="text-center text-white text-lg">
//                     Loading your mystical receipts...
//                   </p>
//                 ) : error ? (
//                   <p className="text-center text-red-400 text-lg">{error}</p>
//                 ) : slips.length === 0 ? (
//                   <p className="text-center text-white text-lg">
//                     No legendary purchase history found.
//                   </p>
//                 ) : (
//                   <div className="space-y-6">
//                     {slips.map((slip) => (
//                       <motion.div
//                         key={slip.id}
//                         className="p-4 bg-gray-800 rounded-lg flex justify-between items-center hover:bg-gray-700 transition transform hover:scale-105"
//                         whileHover={{ scale: 1.02 }}
//                       >
//                         <div>
//                           <p className="text-sm text-gray-300">
//                             <span className="font-semibold text-white">Slip:</span>{" "}
//                             {slip.id}
//                           </p>
//                           <p className="text-sm text-gray-300">
//                             <span className="font-semibold text-white">Date:</span>{" "}
//                             {slip.createdAt ? format(new Date(slip.createdAt), "PPpp") : "N/A"}
//                           </p>
//                           <p className="text-sm text-gray-300">
//                             <span className="font-semibold text-white">Amount:</span>{" "}
//                             {slip.amountPaid} {slip.currency}
//                           </p>
//                         </div>
//                         <Button
//                           onClick={() => setSelectedSlip(slip)}
//                           className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
//                         >
//                           View Details
//                         </Button>
//                       </motion.div>
//                     ))}
//                   </div>
//                 )}
//               </>
//             ) : (
//               <ReceiptModal show={!!selectedSlip} slip={selectedSlip!} onClose={() => setSelectedSlip(null)} />
//             )}
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// interface ReceiptModalProps {
//   show: boolean;
//   slip: SlipData;
//   onClose: () => void;
// }

// function ReceiptModal({ show, slip, onClose }: ReceiptModalProps) {
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
//           <div className="absolute inset-0" onClick={onClose} />
//           <motion.div
//             initial={{ scale: 0.8, opacity: 0, y: 50 }}
//             animate={{ scale: 1, opacity: 1, y: 0 }}
//             exit={{ scale: 0.8, opacity: 0, y: 50 }}
//             transition={{ duration: 0.4, ease: "easeOut" }}
//             className="relative p-6 w-full max-w-md bg-gradient-to-br from-[#4f0289]/40 to-[#9c23d5]/40 backdrop-blur-xl border border-white/20 ring-1 ring-white/20 text-white flex flex-col shadow-2xl [clip-path:polygon(0% 0%, 100% 0%, 100% 90%, 90% 80%, 80% 90%, 70% 80%, 60% 90%, 50% 80%, 40% 90%, 30% 80%, 20% 90%, 10% 80%, 0% 90%)]"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               onClick={onClose}
//               className="absolute top-3 right-3 text-white text-2xl hover:text-gray-300"
//             >
//               &times;
//             </button>
//             <h2 className="text-2xl font-extrabold text-center mb-4 uppercase">
//               Purchase Receipt
//             </h2>
//             <div className="text-sm flex flex-col gap-2">
//               <p>
//                 <span className="font-bold">Slip ID:</span> {slip.id}
//               </p>
//               <p>
//                 <span className="font-bold">Wallet:</span> {slip.walletAddress}
//               </p>
//               <p>
//                 <span className="font-bold">Currency:</span> {slip.currency}
//               </p>
//               <p>
//                 <span className="font-bold">Amount Paid:</span> {slip.amountPaid}
//               </p>
//               <p>
//                 <span className="font-bold">WUSLE Purchased:</span> {slip.wuslePurchased}
//               </p>
//               <div className="mt-2 p-2 bg-white/20 rounded-md">
//                 <span className="font-bold">Redeem Code:</span>{" "}
//                 <span className="font-mono text-purple-100">{slip.redeemCode}</span>
//               </div>
//             </div>
//             <p className="mt-4 text-center text-xs text-gray-300">
//               Keep this slip code safe to redeem your WUSLE tokens later!
//             </p>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

// export default PurchaseHistoryModal;
