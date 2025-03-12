"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import Usdt from "../../assets/Images/usdt.png";
import Sol from "../../assets/Images/sol.png";
import Wusle from "../../assets/Images/logo.jpeg";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSession } from "next-auth/react";
import LoginModal from "@/components/LoginModal";
import Lottie from "lottie-react";
import lottieAnimation from "@/assets/Images/wave.json";


// For real SOL transactions on devnet:
import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

// Import SPL token functions for USDT transfers
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import ReceiptModal from "../ReceiptModal";

/* --------------- Types --------------- */
interface StageData {
  stageNumber: number;
  target: number;
  raised: number;
  startTime: string;
  endTime: string;
  rate: number;
  listingPrice: number;
}

interface PresaleAPIResponse {
  stages: StageData[];
  currentStage: number;
  endsAt: string;
  wusleRate: number;
  listingPrice: number;
  totalWusleSupply: string;
  liquidityAtLaunch: string;
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Slip / receipt data from server
interface SlipData {
  id: string;
  userId: string;
  walletAddress: string;
  currency: string;
  amountPaid: number;
  wuslePurchased: number;
  redeemCode: string;
  createdAt: string;
  // possibly txSignature, isRedeemed, etc.
}

export default function PresaleInterface() {
  const { data: session } = useSession();
  const { publicKey, connected, sendTransaction } = useWallet();

  // The presale data from /api/presale
  const [presaleData, setPresaleData] = useState<PresaleAPIResponse | null>(null);

  // Countdown, progress, user input
  const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState<number>(0);

  const [amount, setAmount] = useState<string>("0");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
  const [wusleAmount, setWusleAmount] = useState<number>(0);

  const [showLogin, setShowLogin] = useState(false);

  // For receipt modal
  const [showReceipt, setShowReceipt] = useState(false);
  const [slip, setSlip] = useState<SlipData | null>(null);

    // At the top of your component:
  const [userStats, setUserStats] = useState<{ wuslePurchased: number; spent: number } | null>(null);

  // Function to refresh user stats from your new API endpoint:
  async function refreshUserStats() {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      if (res.ok) {
        setUserStats(data);
      } else {
        console.error("Error fetching user stats:", data.error);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  }

  // Optionally, fetch stats on mount if the session exists:
  useEffect(() => {
    if (session?.user) {
      refreshUserStats();
    }
  }, [session]);

  // 1) Fetch presale data once (or poll every X seconds)
  useEffect(() => {
    async function fetchPresale() {
      try {
        const res = await fetch("/api/presale");
        const data = await res.json();
        if (res.ok) {
          setPresaleData(data);
        } else {
          console.error("Failed to load presale data:", data.error);
        }
      } catch (err) {
        console.error("Error fetching presale data:", err);
      }
    }

    fetchPresale();
    // optional poll
    // const interval = setInterval(() => fetchPresale(), 30000);
    // return () => clearInterval(interval);
  }, []);

  // 2) Recalc progress bar
  useEffect(() => {
    if (!presaleData) return;
    const { stages, currentStage } = presaleData;
    const totalCap = stages.reduce((acc, s) => acc + s.target, 0);

    const active = stages.find((s) => s.stageNumber === currentStage);
    if (!active) {
      setProgress(0);
      return;
    }

    let sumCompleted = 0;
    for (const st of stages) {
      if (st.stageNumber < currentStage) sumCompleted += st.target;
    }
    const partial = active.raised;
    const totalRaisedSoFar = sumCompleted + partial;

    const frac = (totalRaisedSoFar / totalCap) * 100;
    setProgress(Math.min(Math.max(frac, 0), 100));
  }, [presaleData]);

  // 3) Local countdown
  useEffect(() => {
    if (!presaleData) return;
    const endsAt = new Date(presaleData.endsAt).getTime();

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = endsAt - now;
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setCountdown({ days: d, hours: h, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [presaleData]);

  // 4) WUSLE calc
  useEffect(() => {
    if (!presaleData) return;
    const rate = presaleData.wusleRate || 0.0037;
    const val = parseFloat(amount || "0") / rate;
    setWusleAmount(isNaN(val) ? 0 : val);
  }, [amount, presaleData]);

  // Stage markers
  // function getStageMarkers() {
  //   if (!presaleData) return [];
  //   const { stages } = presaleData;
  //   if (!stages.length) return [];
  //   const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
  
  //   let cumulative = 0;
  //   return stages.map((st) => {
  //     // Place the marker at the start of this stage
  //     const pct = (cumulative / totalCap) * 100;
  
  //     // Then add this stage’s target to move the cumulative forward
  //     cumulative += st.target;
  
  //     return { pct, label: `${st.stageNumber}` };
  //   });
  // }
  function getStageMarkers() {
    if (!presaleData) return [];
    const { stages, currentStage } = presaleData;
    if (!stages.length) return [];
    const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
    
    let cumulative = 0;
    return stages.map((st) => {
      // Place the marker at the start of this stage
      const pct = (cumulative / totalCap) * 100;
      cumulative += st.target;
      // Determine status: completed if stage number is less than current,
      // current if equal, upcoming if greater.
      let status = "upcoming";
      if (st.stageNumber < currentStage) {
        status = "completed";
      } else if (st.stageNumber === currentStage) {
        status = "current";
      }
      return { pct, label: `${st.stageNumber}`, status };
    });
  }
  
  
  // Summation for "WUSLE Sold" or "USDT raised" so far
  function stagesTotalRaisedSoFar() {
    if (!presaleData) return 0;
    const { stages, currentStage } = presaleData;
    const active = stages.find((s) => s.stageNumber === currentStage);
    if (!active) return 0;

    let completed = 0;
    for (const st of stages) {
      if (st.stageNumber < currentStage) completed += st.target;
    }
    return completed + active.raised;
  }

  // The buy slip function with complete USDT functionality
  async function handleBuyNow() {
    try {
      if (!session?.user) {
        alert("You must be logged in.");
        return;
      }
      if (!publicKey || !connected) {
        alert("Connect your wallet first!");
        return;
      }

      const paid = parseFloat(amount || "0");
      if (paid <= 0) {
        alert("Enter a valid amount!");
        return;
      }

      // On-chain transaction: using either SOL or USDT
      let txSignature = "";
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");

      if (selectedCurrency === "SOL") {
        const receiverAddress = "Fc71HwgDJTAfMMd1f7zxZq1feBM67A3pZQQwoFbLWx6G"; // Replace with your receiver address
        const receiverPubkey = new PublicKey(receiverAddress);

        const lamports = Math.floor(paid * LAMPORTS_PER_SOL);
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: receiverPubkey,
            lamports,
          })
        );
        txSignature = await sendTransaction(transaction, connection);
        console.log("SOL Transaction sig:", txSignature);
      } else if (selectedCurrency === "USDT") {
        // USDT transaction using SPL token instructions
        // Replace with your actual USDT mint address (devnet or mainnet)
        const USDT_MINT = new PublicKey("INSERT_YOUR_USDT_MINT_ADDRESS_HERE");
        // Replace with the USDT receiving wallet for the presale
        const recipientPubkey = new PublicKey("INSERT_USDT_RECEIVER_ADDRESS_HERE");

        // Derive the associated token accounts for sender and recipient
        const senderUsdtATA = await getAssociatedTokenAddress(USDT_MINT, publicKey);
        const recipientUsdtATA = await getAssociatedTokenAddress(USDT_MINT, recipientPubkey);

        // USDT typically has 6 decimals. Convert the amount accordingly.
        const usdtDecimals = 6;
        const amountInSmallestUnits = Math.floor(paid * Math.pow(10, usdtDecimals));

        const transaction = new Transaction().add(
          createTransferInstruction(
            senderUsdtATA,
            recipientUsdtATA,
            publicKey,
            amountInSmallestUnits,
            [],
            TOKEN_PROGRAM_ID
          )
        );

        txSignature = await sendTransaction(transaction, connection);
        console.log("USDT Transaction sig:", txSignature);
      }

      // Confirm transaction on-chain
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: txSignature,
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      });
      console.log(`${selectedCurrency} devnet transaction confirmed!`);

      // Proceed with creating the slip record on your backend
      const res = await fetch("/api/slip/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          currency: selectedCurrency,
          amountPaid: paid,
          wuslePurchased: wusleAmount,
          txSignature,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSlip(data.slip);
        setShowReceipt(true);
      } else {
        alert(data.error || "Error creating slip");
      }
    } catch (err) {
      console.error("handleBuyNow error:", err);
      alert("Error on buy slip or devnet transaction");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div
        className="
          relative
          p-4
          w-full
          max-w-xl
          bg-gradient-to-br from-[#5b0396]/70 to-[#8e31c5]/70
          text-white
          border border-white/20
          shadow-[0_0_30px_rgba(128,0,255,0.6)]
          backdrop-blur-xl
          [clip-path:polygon(
            0% 0%,
            80% 0%,
            85% 5%,
            100% 0%,
            100% 85%,
            90% 100%,
            20% 100%,
            10% 90%,
            0% 100%
          )]
          hover:scale-[1.01]
          hover:shadow-[0_0_50px_rgba(128,0,255,0.8)]
          transition-all
          duration-300
        "
      >
        {/* Background image div */}
        <div
          className="absolute inset-0 bg-[url('/wusle.jpg')] bg-center bg-cover bg-no-repeat opacity-5 pointer-events-none rounded-full"
        />
        {/* Title / Stage Info */}
        <div className="text-center mt-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold drop-shadow-lg uppercase tracking-wider text-white">
            $WUSLE PRESALE
          </h2>
          {presaleData && (
            <>
              <p className="text-sm sm:text-base mt-1 text-gray-200 font-bold">
                LIQUIDITY AT LAUNCH: ${presaleData.liquidityAtLaunch} USDT
              </p>
              <p className="text-lg sm:text-xl mt-1 text-purple-100 font-semibold">
                IS NOW LIVE!
              </p>
              <p className="text-sm mt-1 text-purple-300 font-medium">
                STAGE {presaleData.currentStage}/{presaleData.stages.length}
              </p>
            </>
          )}
        </div>
        {/* Lottie Animation */}
        <div className="w-full max-w-44 mx-auto mb-4">
          <Lottie animationData={lottieAnimation} loop={true} />
        </div>


        {/* Countdown */}
        {presaleData ? (
          <div className="mt-4 grid grid-cols-4 gap-2 text-center px-2">
            <div className="flex flex-col items-center justify-center bg-white/10 
                            rounded-lg p-2 hover:bg-white/20 transition">
              <span className="text-2xl sm:text-3xl font-bold">
                {countdown.days}
              </span>
              <span className="text-[10px] uppercase text-purple-300">Days</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white/10 
                            rounded-lg p-2 hover:bg-white/20 transition">
              <span className="text-2xl sm:text-3xl font-bold">
                {countdown.hours}
              </span>
              <span className="text-[10px] uppercase text-purple-300">Hrs</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white/10 
                            rounded-lg p-2 hover:bg-white/20 transition">
              <span className="text-2xl sm:text-3xl font-bold">
                {countdown.minutes}
              </span>
              <span className="text-[10px] uppercase text-purple-300">Mins</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white/10 
                            rounded-lg p-2 hover:bg-white/20 transition">
              <span className="text-2xl sm:text-3xl font-bold">
                {countdown.seconds}
              </span>
              <span className="text-[10px] uppercase text-purple-300">Secs</span>
            </div>
          </div>
        ) : (
          <p className="text-center text-white mt-2">Loading Presale Data...</p>
        )}

        {/* Progress + markers */}
        {/* <div className="mt-5 px-3">
          <div className="relative w-full h-4 bg-white/20 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-purple-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            {presaleData &&
              getStageMarkers().map((m, idx) => (
                <div
                  key={idx}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${m.pct}%` }}
                >
                  <div className="w-[2px] h-6 bg-white 
                                  translate-x-[-1px] translate-y-[-10px]" />
                  <span
                    className="text-[10px] text-white mt-1 
                               whitespace-nowrap translate-x-[-50%]"
                  >
                    {m.label}
                  </span>
                </div>
              ))}
          </div>
        </div> */}
        {/* Progress + Markers */}
        <div className="mt-5 px-3">
          {/* Outer container for markers + progress bar */}
          <div className="relative">

            {/* 1) Markers row */}
            <div className="relative w-full h-8 mb-0">
  {presaleData &&
    getStageMarkers().map((m, idx) => {
      // Determine arrow color based on marker status
      let arrowColor;
      let textColor;
      if (m.status === "completed") {
        arrowColor = "border-t-green-500"; // Tailwind green
        textColor = "text-green-500";
      } else if (m.status === "current") {
        arrowColor = "border-t-yellow-500"; // Tailwind yellow
        textColor = "text-yellow-500";
      } else {
        arrowColor = "border-t-white";
        textColor = "text-white";
      }
      return (
        <div
          key={idx}
          className="absolute flex flex-col items-center"
          style={{ left: `calc(${m.pct}% - 8px)` }}
        >
          <span className={`text-xs font-bold mb-1 ${textColor}`}>
            {m.label}
          </span>
          <div
            className={`
              w-0 h-0
              border-l-4 border-r-4
              border-l-transparent border-r-transparent
              border-t-8 ${arrowColor}
            `}
          />
        </div>
      );
    })}
</div>


            {/* 2) The actual progress bar */}
            <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>


        {/* WUSLE SOLD / USDT RAISED */}
        <div className="flex justify-between text-xs sm:text-sm text-purple-200 mt-2 px-3">
          <div className="flex flex-col">
            <span className="text-purple-100 font-medium">WUSLE SOLD</span>
            <span className="font-semibold text-white">
              {presaleData
                ? (
                    stagesTotalRaisedSoFar() /
                    (presaleData.wusleRate || 0.0037)
                  ).toLocaleString(undefined, { maximumFractionDigits: 0 })
                : 0}{" "}
                / {presaleData ? presaleData.totalWusleSupply : 0}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-purple-100 font-medium">USDT RAISED</span>
            <span className="font-semibold text-white">
              ${presaleData ? stagesTotalRaisedSoFar().toLocaleString() : "0"}
            </span>
          </div>
        </div>

        {/* Rate Info */}
        {presaleData && (
          <div className="mt-4 mx-3 bg-white/10 rounded-md py-3 px-4 text-center hover:bg-white/20 transition">
            <p className="text-xs sm:text-sm text-purple-100 mb-1 font-semibold">
              1 WUSLE = {presaleData.wusleRate.toFixed(4)} USDT
            </p>
            <p className="text-[10px] sm:text-xs text-purple-200">
              LISTING PRICE: {presaleData.listingPrice.toFixed(3)} USDT
            </p>
          </div>
        )}

        {/* "YOUR PURCHASED WUSLE" placeholder */}
        {session?.user  && (
            <div className="text-center mt-3 text-sm">
            <span className="text-purple-200 uppercase text-xs">YOUR PURCHASED WUSLE</span>
            <br />
            <span className="font-bold text-xl text-white">
              {(userStats?.wuslePurchased ?? 0).toFixed(5)}
            </span>

          </div>
        )}


        {/* Currency selection */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <Button
            onClick={() => setSelectedCurrency("USDT")}
            variant={selectedCurrency === "USDT" ? "default" : "outline"}
            className="
              flex items-center justify-center space-x-2
              bg-white/20 border-none text-white
              hover:bg-white/30
              transition-colors duration-200
            "
          >
            <Image src={Usdt} alt="USDT" width={24} height={24} />
            <span>USDT</span>
          </Button>
          <Button
            onClick={() => setSelectedCurrency("SOL")}
            variant={selectedCurrency === "SOL" ? "default" : "outline"}
            className="
              flex items-center justify-center space-x-2
              bg-white/20 border-none text-white
              hover:bg-white/30
              transition-colors duration-200
            "
          >
            <Image src={Sol} alt="Sol" width={24} height={24} />
            <span>SOL</span>
          </Button>
        </div>

        {/* Payment row */}
        <div className="mt-4 flex items-center space-x-4 px-4">
          <div className="flex flex-col w-1/2">
            <span className="text-[11px] text-purple-200 mb-1">YOU PAY</span>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="
                  bg-white/20 border-none text-white placeholder-purple-300
                  focus:ring-0
                  backdrop-blur-md hover:bg-white/30
                  transition-colors duration-200
                "
              />
              <span className="text-white text-xl">
                {selectedCurrency === "USDT" ? (
                  <Image src={Usdt} alt="USDT" width={24} height={24} />
                ) : (
                  <Image src={Sol} alt="Sol" width={24} height={24} />
                )}
              </span>
            </div>
          </div>
          <div className="flex flex-col w-1/2">
            <span className="text-[11px] text-purple-200 mb-1">YOU GET</span>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={wusleAmount.toFixed(4)}
                disabled
                className="
                  bg-white/20 border-none text-white placeholder-purple-300
                  focus:ring-0
                  backdrop-blur-md hover:bg-white/30
                  transition-colors duration-200
                "
              />
              <span className="text-white text-xl border-2 rounded-full py-1 bg-white">
                <Image
                  src={Wusle}
                  alt="WUSLE"
                  width={36}
                  height={36}
                  className="rounded-full "
                />
              </span>
            </div>
          </div>
        </div>

        {/* Connect wallet / buy / login section */}
        <div className="mt-5 flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-7 pb-2">
        {!session?.user ? (
          <Button
            onClick={() => setShowLogin(true)}
            className="w-full sm:w-auto px-6 py-3 text-white font-bold bg-purple-900 hover:bg-purple-700 animate-heartbeat"
          >
            CONNECT YOUR WALLET
          </Button>
        ) : (
          <WalletMultiButton
            style={{
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              color: "white",
              borderRadius: "50px",
              background: "#9c23d5",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease-in-out",
              animation: "heartbeat 0.5s infinite ease-in-out",
              padding: "10px 20px",
              textAlign: "center",
            }}
            className="w-20 sm:w-auto"
          >
            {connected ?  "CONNECTED" : "CONNECT WALLET"}
          </WalletMultiButton>
        )}

        {/* Show BUY NOW only if user & wallet connected */}
        {session?.user && publicKey && connected && (
          <Button
            onClick={handleBuyNow}
            className="w-20 sm:w-auto px-16 py-6 text-white font-bold bg-purple-600 hover:bg-purple-700 animate-heartbeat rounded-full"
          >
            BUY NOW
          </Button>
        )}
      </div>

      </div>

      {/* The login modal */}
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />

      {/* Our fancy slip receipt modal */}
      <ReceiptModal
        show={showReceipt}
        slip={slip}
        onClose={() => setShowReceipt(false)}
      />
    </div>
  );
}



