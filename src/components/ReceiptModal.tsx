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
            className="presale-card  relative p-6 w-full max-w-md bg-gradient-to-br from-[#4f0289]/40 to-[#9c23d5]/40 backdrop-blur-xl border border-white/20 ring-1 ring-white/20 text-white flex flex-col shadow-2xl "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background image div */}
            {/* <div
              className="absolute inset-0 bg-[url('/wusle.jpg')] bg-center bg-cover bg-no-repeat opacity-10 pointer-events-none rounded-full"
            /> */}

            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white text-2xl hover:text-gray-300"
            >
              &times;
            </button>
            <h2 className="fontFamily  text-2xl  text-center mb-4 uppercase">
              Purchase Receipt
            </h2>
            <div className="text-sm flex flex-col gap-2">
              <p>
                <span className="fontFamilyText">Slip ID:</span> {slip?.id}
              </p>
              <p>
                <span className="fontFamilyText">Wallet:</span> {slip?.walletAddress}
              </p>
              <p>
                <span className="fontFamilyText">Currency:</span> {slip?.currency}
              </p>
              <p>
                <span className="fontFamilyText">Amount Paid:</span> {slip?.amountPaid}
              </p>
              <p>
                <span className="fontFamilyText">WUSLE Purchased:</span> {slip?.wuslePurchased}
              </p>
              <div className="mt-2 p-2 bg-white/20 rounded-md">
                <span className="fontFamilyText">Redeem Code:</span>{" "}
                <span className="fontFamilyText text-purple-100">{slip?.redeemCode}</span>
              </div>
            </div>
            <p className="fontFamilyText mt-4 text-center text-xs text-gray-300">
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
