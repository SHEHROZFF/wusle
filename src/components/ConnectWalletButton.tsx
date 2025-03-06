"use client";

import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

const ConnectWalletButton = () => {
  const { connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = () => {
    if (!connected) {
      // Open the wallet modal to let the user choose a wallet (Phantom, Solflare, etc.)
      setVisible(true);
    } else {
      // Optionally disconnect the wallet when already connected
      disconnect();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-white text-black px-5 py-2 rounded-full hover:bg-gray-300 transition font-medium"
    >
      {connected ? "Disconnect Wallet" : "Connect Wallet"}
    </button>
  );
};

export default ConnectWalletButton;
