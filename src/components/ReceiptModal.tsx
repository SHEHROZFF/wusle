"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export interface ReceiptModalProps {
  show: boolean;
  slip: {
    id: string;
    walletAddress: string;
    currency: string;
    amountPaid: number;
    wuslePurchased: number;
    redeemCode: string;
    createdAt: string;
  } | null;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ show, slip, onClose }) => {
  if (!show || !slip) return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative p-6 w-full max-w-md bg-gradient-to-br from-[#4f0289]/40 to-[#9c23d5]/40 backdrop-blur-xl border border-white/20 ring-1 ring-white/20 text-white flex flex-col shadow-2xl [clip-path:polygon(0% 0%, 100% 0%, 100% 90%, 90% 80%, 80% 90%, 70% 80%, 60% 90%, 50% 80%, 40% 90%, 30% 80%, 20% 90%, 10% 80%, 0% 90%)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background image div */}
            <div
              className="absolute inset-0 bg-[url('/wusle.jpg')] bg-center bg-cover bg-no-repeat opacity-10 pointer-events-none rounded-full"
            />

            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white text-2xl hover:text-gray-300"
            >
              &times;
            </button>
            <h2 className="text-2xl font-extrabold text-center mb-4 uppercase">
              Purchase Receipt
            </h2>
            <div className="text-sm flex flex-col gap-2">
              <p>
                <span className="font-bold">Slip ID:</span> {slip?.id}
              </p>
              <p>
                <span className="font-bold">Wallet:</span> {slip?.walletAddress}
              </p>
              <p>
                <span className="font-bold">Currency:</span> {slip?.currency}
              </p>
              <p>
                <span className="font-bold">Amount Paid:</span> {slip?.amountPaid}
              </p>
              <p>
                <span className="font-bold">WUSLE Purchased:</span> {slip?.wuslePurchased}
              </p>
              <div className="mt-2 p-2 bg-white/20 rounded-md">
                <span className="font-bold">Redeem Code:</span>{" "}
                <span className="font-mono text-purple-100">{slip?.redeemCode}</span>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-gray-300">
              Keep this slip code safe to redeem your WUSLE Coins later!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ReceiptModal;
