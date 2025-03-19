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
import dynamic from "next/dynamic";
import { useIsMobile } from "@/hooks/useIsMobile";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

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

  const isMobile = useIsMobile(1024);
  const isMobile2 = useIsMobile(768);
  const isMobile3 = useIsMobile(700);
  const isMobile4 = useIsMobile(600);
  const isMobile5 = useIsMobile(560);

  const isMobile6 = useIsMobile(475);

  // The presale data from /api/presale
  const [presaleData, setPresaleData] = useState<PresaleAPIResponse | null>(null);

  // Countdown, progress, user input
  const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState<number>(0);

  const [amount, setAmount] = useState<string>("");
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
  function getStageMarkers() {
    if (!presaleData) return [];
    const { stages, currentStage } = presaleData;
    if (!stages.length) return [];
    const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
    
    let cumulative = 0;
    return stages.map((st) => {
      const pct = (cumulative / totalCap) * 100;
      cumulative += st.target;
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
    <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
      <div
        className="
          relative
          py-10 sm:py-20
          p-2 sm:p-4
          w-full
          max-w-[700px]
          bgStunColor
          presale-card
          transition-all
          duration-300
        "
      >
        {/* Title / Stage Info */}
        <div className="text-center mt-2">
          <h2 className="fontFamily text-xl sm:text-3xl uppercase text-white">
            $WUSLE PRESALE
          </h2>
          {presaleData && (
            <>
              <h2 className="fontFamily text-xl sm:text-3xl uppercase text-white">
                IS NOW LIVE!
              </h2>
              <h3 className="fontFamily text-md sm:text-xl font-extrabold mt-1 text-white">
                STAGE {presaleData.currentStage}/{presaleData.stages.length}
              </h3>
              <p className="fontFamilyText text-xs sm:text-lg mt-4 text-gray-200">
                Liquidity At Launch: {presaleData.liquidityAtLaunch} USDT
              </p>
            </>
          )}
        </div>
        {/* Lottie Animation */}
        <div className="w-full max-w-40 sm:max-w-52 mx-auto mb-4">
          <Lottie animationData={lottieAnimation} loop={true} />
        </div>

        {/* Countdown */}
        {presaleData ? (
          <div className={`mt-4 grid text-center grid-cols-4  text-black ${isMobile6 ? "mx 8" : "mx-12"}`}>
            {["days", "hours", "minutes", "seconds"].map((unit) => (
              <div key={unit} className="flex flex-col items-center">
                <div className={`bg-white rounded-2xl hover:bg-white/20 transition flex items-center justify-center ${
                  isMobile2
                    ? isMobile3
                      ? isMobile4
                        ? isMobile5
                          ? isMobile6
                            ? "w-[60px] h-[50px]"
                            : "w-[70px] h-[60px]"
                          : "w-[90px] h-[60px]"
                        : "w-[100px] h-[80px]"
                      : "w-[120px] h-[100px]"
                    : "w-[120px] h-[100px]"
                }`}>
                  <span className="fontFamily text-3xl sm:text-[48px]">
                    {countdown[unit as keyof typeof countdown]}
                  </span>
                </div>
                <span className="fontFamilyText text-white text-[16px] sm:text-[25px] uppercase mt-2">
                  {unit === "days" ? "Days" : unit === "hours" ? "Hrs" : unit === "minutes" ? "Mins" : "Secs"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-white mt-2">Loading Presale Data...</p>
        )}

        {/* Progress + Markers */}
        <div className="mt-4 px-2 sm:px-3">
          <div className="relative px-2">
            {/* Markers row */}
            <div className="relative w-full h-8 mb-0">
              {presaleData &&
                getStageMarkers().map((m, idx) => {
                  let arrowColor;
                  let textColor;
                  if (m.status === "completed") {
                    arrowColor = "border-t-green-500";
                    textColor = "text-green-500";
                  } else if (m.status === "current") {
                    arrowColor = "border-t-yellow-500";
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
                          ${isMobile6 ? "w-2 h-1" : "w-3 h-1"}
                          border-l-4 border-r-4
                          border-l-transparent border-r-transparent
                          border-t-8 ${arrowColor}
                        `}
                      />
                    </div>
                  );
                })}
            </div>
            {/* Progress bar */}
            <div className={`w-full  bg-white/20 rounded-full overflow-hidden ${isMobile6 ? "h-5" : "h-10"}`}>
              <div
                className="h-full bg-purple-200 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* WUSLE SOLD / USDT RAISED */}
        <div className="flex flex-col gap-1 text-xs sm:text-sm text-purple-200 mt-2 px-3">
          <div className="flex justify-between">
            <span className={`fontFamilyText text-white ${isMobile6 ? "text-sm" : (isMobile4 ? "text-[17px]" : "text-2xl")}`}>WUSLE SOLD</span>
            <span className={`fontFamily text-white  ${isMobile6 ? "text-[12px]" : (isMobile4 ? "text-[15px]" : "text-xl")}`}>
              {presaleData
                ? (
                    stagesTotalRaisedSoFar() /
                    (presaleData.wusleRate || 0.0037)
                  ).toLocaleString(undefined, { maximumFractionDigits: 0 })
                : 0}{" "}
              / {presaleData ? presaleData.totalWusleSupply : 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={`fontFamilyText text-white ${isMobile6 ? "text-xs" : (isMobile4 ? "text-xs" : "text-sm")}`}>USDT RAISED</span>
            <span className={`fontFamilyText text-white ${isMobile6 ? "text-xs" : (isMobile4 ? "text-md" : "text-xl")}`}>
              ${presaleData ? stagesTotalRaisedSoFar().toLocaleString() : "0"}
            </span>
          </div>
        </div>

        {/* Rate Info */}
        {presaleData && (
          <div className="mt-3 sm:mt-4 mx-2 sm:mx-3 py-2 sm:py-3 px-3 sm:px-4 text-center transition">
            <p className={`fontFamilyText   text-white mb-1 ${isMobile6 ? "text-sm" : (isMobile4 ? "text-[18px]" : "text-2xl")}`}>
              1 WUSLE = {presaleData.wusleRate.toFixed(4)} USDT
            </p>
            <p className={`fontFamilyText  text-white ${isMobile6 ? "text-[10px]" : (isMobile4 ? "text-[13px]" : "text-lg")}`}>
              LISTING PRICE: {presaleData.listingPrice.toFixed(3)} USDT
            </p>
          </div>
        )}

        {/* "YOUR PURCHASED WUSLE" placeholder */}
        {session?.user  && (
          <div className="flex justify-between items-center mt-3 px-3 text-sm">
            <span className={`fontFamilyText text-white uppercase ${isMobile6 ? "text-xs" : (isMobile4 ? "text-[18px]" : "text-2xl")}`}>
              YOUR PURCHASED WUSLE
            </span>
            <span className={`fontFamily  text-white ${isMobile6 ? "text-xs" : (isMobile4 ? "text-[18px]" : "text-2xl")}`}>
              {(userStats?.wuslePurchased ?? 0).toFixed(5)}
            </span>
          </div>
        )}

        {/* Currency selection */}
        <div className="mt-4 flex items-center justify-between gap-2 px-4 sm:px-8">
          <Button
            onClick={() => setSelectedCurrency("USDT")}
            variant={selectedCurrency === "USDT" ? "default" : "outline"}
            className={`
              fontFamily  flex items-center justify-center space-x-2 py-6 sm:py-9 rounded-2xl
              bg-white text-black hover:bg-white/30 transition-colors duration-200 w-1/2
              ${selectedCurrency === "USDT" ? "border-2 border-black" : "border-none"}
             ${isMobile6 ? "text-sm" : (isMobile4 ? "text-[18px]" : "text-2xl")}` }
          >
            <Image src={Usdt} alt="USDT" width={isMobile6 ? 30 : 36} height={isMobile6 ? 30 : 36} />
            <span>USDT</span>
          </Button>
          <Button
            onClick={() => setSelectedCurrency("SOL")}
            variant={selectedCurrency === "SOL" ? "default" : "outline"}
            className={`
              fontFamily flex items-center justify-center space-x-2 py-6 sm:py-9 rounded-2xl
              bg-white text-black hover:bg-white/30 transition-colors duration-200 w-1/2
              ${selectedCurrency === "SOL" ? "border-2 border-black" : "border-none"}
              ${isMobile6 ? "text-sm" : (isMobile4 ? "text-[18px]" : "text-2xl")}`}
          >
            <Image src={Sol} alt="Sol" width={isMobile6 ? 28 : 36} height={isMobile6 ? 28 : 36} />
            <span>SOL</span>
          </Button>
        </div>

        {/* Payment row */}
        <div className="mt-4 flex justify-between gap-4 px-4 sm:px-8">
          {/* YOU PAY */}
          <div className="flex flex-col w-1/2">
            <div className="relative w-full">
              <Input
                type="number"
                placeholder="YOU PAY"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`
                  fontFamily bg-white placeholder:text-black placeholder:pr-10
                   py-6 sm:py-9 rounded-2xl
                  w-full
                 ${isMobile6 ? "text-sm placeholder:text-[10px]" : (isMobile4 ? "text-[18px] placeholder:text-xl" : "text-2xl placeholder:text-xl")}`}
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Image
                  src={selectedCurrency === 'USDT' ? Usdt : Sol}
                  alt={selectedCurrency}
                  width={isMobile6 ? 24 : 36} height={isMobile6 ? 24 : 36}
                />
              </span>
            </div>
          </div>
          {/* YOU GET */}
          <div className="flex flex-col w-1/2">
            <div className="relative w-full bg-white rounded-2xl">
              <Input
                type="number"
                value={wusleAmount.toFixed(4)}
                disabled
                placeholder="YOU GET"
                className={`
                  fontFamily text-black  py-6 sm:py-9 pr-14 rounded-2xl
                  placeholder:text-black  w-full
                 ${isMobile6 ? "placeholder:text-[10px]" : (isMobile4 ? "placeholder:text-xl" : "placeholder:text-xl")}`}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Image
                  src={Wusle}
                  alt="WUSLE"
                  width={isMobile6 ? 24 : 36} height={isMobile6 ? 24 : 36}
                  className={`rounded-full  border bg-white border-purple-700 ${isMobile6 ? "py-[2px]" : (isMobile4 ? "py-[6px]" : "py-[6px]")}`}
                />
              </span>
            </div>
          </div>
        </div>

        {/* Connect wallet / buy / login section */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-7 pb-2">
          {!session?.user ? (
            <Button
              onClick={() => setShowLogin(true)}
              className={`fontFamily w-[90%] py-8 text-black font-bold bg-white hover:bg-purple-900 rounded-2xl ${isMobile6 ? "text-sm" : (isMobile4 ? "text-[18px]" : "text-2xl")}`}
            >
              CONNECT YOUR WALLET
            </Button>
          ) : (
            <WalletMultiButton
              style={{
                fontFamily: "", // Replace if needed
                width: isMobile6
                ? "250px"
                : isMobile5
                  ? "350px"
                  : isMobile4
                    ? "400px"
                    : isMobile3
                      ? "450px"
                      : isMobile2
                        ? "500px"
                        : isMobile
                          ? "550px"
                          : "600px",
                padding: "32px 0", // py-8 = 32px top/bottom
                color: "black",
                fontWeight: "bold",
                background: "white",
                borderRadius: "16px", // rounded-2xl ≈ 16px
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                fontSize: isMobile6
                  ? "14px" // text-sm ≈ 14px
                  : isMobile4
                    ? "18px"
                    : "24px", // text-2xl ≈ 24px
                textAlign: "center",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
              }}
            >
              {connected ? "CONNECTED" : "CONNECT WALLET"}
            </WalletMultiButton>

          )}

          {session?.user && publicKey && connected && (
            <Button
              onClick={handleBuyNow}
              className="w-full sm:w-auto px-8 py-4 text-white font-bold bg-purple-600 hover:bg-purple-700 animate-heartbeat rounded-full text-sm sm:text-base"
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










// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Progress } from "@/components/ui/progress";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";

// import Usdt from "../../assets/Images/usdt.png";
// import Sol from "../../assets/Images/sol.png";
// import Wusle from "../../assets/Images/logo.jpeg";

// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useSession } from "next-auth/react";
// import LoginModal from "@/components/LoginModal";
// import dynamic from "next/dynamic";
// import { useIsMobile } from "@/hooks/useIsMobile";

// const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// import lottieAnimation from "@/assets/Images/wave.json";


// // For real SOL transactions on devnet:
// import {
//   Connection,
//   SystemProgram,
//   Transaction,
//   PublicKey,
//   LAMPORTS_PER_SOL,
// } from "@solana/web3.js";

// // Import SPL token functions for USDT transfers
// import {
//   getAssociatedTokenAddress,
//   createTransferInstruction,
//   TOKEN_PROGRAM_ID,
// } from "@solana/spl-token";

// import ReceiptModal from "../ReceiptModal";

// /* --------------- Types --------------- */
// interface StageData {
//   stageNumber: number;
//   target: number;
//   raised: number;
//   startTime: string;
//   endTime: string;
//   rate: number;
//   listingPrice: number;
// }

// interface PresaleAPIResponse {
//   stages: StageData[];
//   currentStage: number;
//   endsAt: string;
//   wusleRate: number;
//   listingPrice: number;
//   totalWusleSupply: string;
//   liquidityAtLaunch: string;
// }

// interface Countdown {
//   days: number;
//   hours: number;
//   minutes: number;
//   seconds: number;
// }

// // Slip / receipt data from server
// interface SlipData {
//   id: string;
//   userId: string;
//   walletAddress: string;
//   currency: string;
//   amountPaid: number;
//   wuslePurchased: number;
//   redeemCode: string;
//   createdAt: string;
//   // possibly txSignature, isRedeemed, etc.
// }

// export default function PresaleInterface() {
//   const { data: session } = useSession();
//   const { publicKey, connected, sendTransaction } = useWallet();

//   const isMobile = useIsMobile(1024);
//   const isMobile2 = useIsMobile(652);

//   // The presale data from /api/presale
//   const [presaleData, setPresaleData] = useState<PresaleAPIResponse | null>(null);

//   // Countdown, progress, user input
//   const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [progress, setProgress] = useState<number>(0);

//   const [amount, setAmount] = useState<string>("0");
//   const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
//   const [wusleAmount, setWusleAmount] = useState<number>(0);

//   const [showLogin, setShowLogin] = useState(false);

//   // For receipt modal
//   const [showReceipt, setShowReceipt] = useState(false);
//   const [slip, setSlip] = useState<SlipData | null>(null);

//     // At the top of your component:
//   const [userStats, setUserStats] = useState<{ wuslePurchased: number; spent: number } | null>(null);

//   // Function to refresh user stats from your new API endpoint:
//   async function refreshUserStats() {
//     try {
//       const res = await fetch("/api/user");
//       const data = await res.json();
//       if (res.ok) {
//         setUserStats(data);
//       } else {
//         console.error("Error fetching user stats:", data.error);
//       }
//     } catch (error) {
//       console.error("Error fetching user stats:", error);
//     }
//   }

//   // Optionally, fetch stats on mount if the session exists:
//   useEffect(() => {
//     if (session?.user) {
//       refreshUserStats();
//     }
//   }, [session]);

//   // 1) Fetch presale data once (or poll every X seconds)
//   useEffect(() => {
//     async function fetchPresale() {
//       try {
//         const res = await fetch("/api/presale");
//         const data = await res.json();
//         if (res.ok) {
//           setPresaleData(data);
//         } else {
//           console.error("Failed to load presale data:", data.error);
//         }
//       } catch (err) {
//         console.error("Error fetching presale data:", err);
//       }
//     }

//     fetchPresale();
//     // optional poll
//     // const interval = setInterval(() => fetchPresale(), 30000);
//     // return () => clearInterval(interval);
//   }, []);

//   // 2) Recalc progress bar
//   useEffect(() => {
//     if (!presaleData) return;
//     const { stages, currentStage } = presaleData;
//     const totalCap = stages.reduce((acc, s) => acc + s.target, 0);

//     const active = stages.find((s) => s.stageNumber === currentStage);
//     if (!active) {
//       setProgress(0);
//       return;
//     }

//     let sumCompleted = 0;
//     for (const st of stages) {
//       if (st.stageNumber < currentStage) sumCompleted += st.target;
//     }
//     const partial = active.raised;
//     const totalRaisedSoFar = sumCompleted + partial;

//     const frac = (totalRaisedSoFar / totalCap) * 100;
//     setProgress(Math.min(Math.max(frac, 0), 100));
//   }, [presaleData]);

//   // 3) Local countdown
//   useEffect(() => {
//     if (!presaleData) return;
//     const endsAt = new Date(presaleData.endsAt).getTime();

//     const timer = setInterval(() => {
//       const now = Date.now();
//       const diff = endsAt - now;
//       if (diff <= 0) {
//         setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//       } else {
//         const d = Math.floor(diff / (1000 * 60 * 60 * 24));
//         const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
//         const m = Math.floor((diff / (1000 * 60)) % 60);
//         const s = Math.floor((diff / 1000) % 60);
//         setCountdown({ days: d, hours: h, minutes: m, seconds: s });
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [presaleData]);

//   // 4) WUSLE calc
//   useEffect(() => {
//     if (!presaleData) return;
//     const rate = presaleData.wusleRate || 0.0037;
//     const val = parseFloat(amount || "0") / rate;
//     setWusleAmount(isNaN(val) ? 0 : val);
//   }, [amount, presaleData]);

//   // Stage markers
//   // function getStageMarkers() {
//   //   if (!presaleData) return [];
//   //   const { stages } = presaleData;
//   //   if (!stages.length) return [];
//   //   const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
  
//   //   let cumulative = 0;
//   //   return stages.map((st) => {
//   //     // Place the marker at the start of this stage
//   //     const pct = (cumulative / totalCap) * 100;
  
//   //     // Then add this stage’s target to move the cumulative forward
//   //     cumulative += st.target;
  
//   //     return { pct, label: `${st.stageNumber}` };
//   //   });
//   // }
//   function getStageMarkers() {
//     if (!presaleData) return [];
//     const { stages, currentStage } = presaleData;
//     if (!stages.length) return [];
//     const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
    
//     let cumulative = 0;
//     return stages.map((st) => {
//       // Place the marker at the start of this stage
//       const pct = (cumulative / totalCap) * 100;
//       cumulative += st.target;
//       // Determine status: completed if stage number is less than current,
//       // current if equal, upcoming if greater.
//       let status = "upcoming";
//       if (st.stageNumber < currentStage) {
//         status = "completed";
//       } else if (st.stageNumber === currentStage) {
//         status = "current";
//       }
//       return { pct, label: `${st.stageNumber}`, status };
//     });
//   }
  
  
//   // Summation for "WUSLE Sold" or "USDT raised" so far
//   function stagesTotalRaisedSoFar() {
//     if (!presaleData) return 0;
//     const { stages, currentStage } = presaleData;
//     const active = stages.find((s) => s.stageNumber === currentStage);
//     if (!active) return 0;

//     let completed = 0;
//     for (const st of stages) {
//       if (st.stageNumber < currentStage) completed += st.target;
//     }
//     return completed + active.raised;
//   }

//   // The buy slip function with complete USDT functionality
//   async function handleBuyNow() {
//     try {
//       if (!session?.user) {
//         alert("You must be logged in.");
//         return;
//       }
//       if (!publicKey || !connected) {
//         alert("Connect your wallet first!");
//         return;
//       }

//       const paid = parseFloat(amount || "0");
//       if (paid <= 0) {
//         alert("Enter a valid amount!");
//         return;
//       }

//       // On-chain transaction: using either SOL or USDT
//       let txSignature = "";
//       const connection = new Connection("https://api.devnet.solana.com", "confirmed");

//       if (selectedCurrency === "SOL") {
//         const receiverAddress = "Fc71HwgDJTAfMMd1f7zxZq1feBM67A3pZQQwoFbLWx6G"; // Replace with your receiver address
//         const receiverPubkey = new PublicKey(receiverAddress);

//         const lamports = Math.floor(paid * LAMPORTS_PER_SOL);
//         const transaction = new Transaction().add(
//           SystemProgram.transfer({
//             fromPubkey: publicKey,
//             toPubkey: receiverPubkey,
//             lamports,
//           })
//         );
//         txSignature = await sendTransaction(transaction, connection);
//         console.log("SOL Transaction sig:", txSignature);
//       } else if (selectedCurrency === "USDT") {
//         // USDT transaction using SPL token instructions
//         // Replace with your actual USDT mint address (devnet or mainnet)
//         const USDT_MINT = new PublicKey("INSERT_YOUR_USDT_MINT_ADDRESS_HERE");
//         // Replace with the USDT receiving wallet for the presale
//         const recipientPubkey = new PublicKey("INSERT_USDT_RECEIVER_ADDRESS_HERE");

//         // Derive the associated token accounts for sender and recipient
//         const senderUsdtATA = await getAssociatedTokenAddress(USDT_MINT, publicKey);
//         const recipientUsdtATA = await getAssociatedTokenAddress(USDT_MINT, recipientPubkey);

//         // USDT typically has 6 decimals. Convert the amount accordingly.
//         const usdtDecimals = 6;
//         const amountInSmallestUnits = Math.floor(paid * Math.pow(10, usdtDecimals));

//         const transaction = new Transaction().add(
//           createTransferInstruction(
//             senderUsdtATA,
//             recipientUsdtATA,
//             publicKey,
//             amountInSmallestUnits,
//             [],
//             TOKEN_PROGRAM_ID
//           )
//         );

//         txSignature = await sendTransaction(transaction, connection);
//         console.log("USDT Transaction sig:", txSignature);
//       }

//       // Confirm transaction on-chain
//       const latestBlockHash = await connection.getLatestBlockhash();
//       await connection.confirmTransaction({
//         signature: txSignature,
//         blockhash: latestBlockHash.blockhash,
//         lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
//       });
//       console.log(`${selectedCurrency} devnet transaction confirmed!`);

//       // Proceed with creating the slip record on your backend
//       const res = await fetch("/api/slip/buy", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           walletAddress: publicKey.toBase58(),
//           currency: selectedCurrency,
//           amountPaid: paid,
//           wuslePurchased: wusleAmount,
//           txSignature,
//         }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setSlip(data.slip);
//         setShowReceipt(true);
//       } else {
//         alert(data.error || "Error creating slip");
//       }
//     } catch (err) {
//       console.error("handleBuyNow error:", err);
//       alert("Error on buy slip or devnet transaction");
//     }
//   }

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <div
//         className="
//           relative
//           py-20
//           p-4
//           w-full
//           max-w-[600px]
//           bgStunColor
//           presale-card
//           transition-all
//           duration-300
//         "
//       >
//         {/* Background image div */}
//         {/* <div
//           className="absolute inset-0 bg-[url('/wusle.jpg')] bg-center bg-cover bg-no-repeat opacity-5 pointer-events-none rounded-full"
//         /> */}
//         {/* Title / Stage Info */}
//         <div className="text-center mt-2">
//           <h2 className="fontFamily text-4xl sm:text-3xl  uppercase  text-white">
//             $WUSLE PRESALE
//           </h2>
//           {presaleData && (
//             <>
//               <h2 className="fontFamily text-4xl sm:text-3xl  uppercase  text-white ">
//                 IS NOW LIVE!
//               </h2>
//               <h3 className="fontFamily text-xl font-extrabold mt-1 text-white ">
//                 STAGE {presaleData.currentStage}/{presaleData.stages.length}
//               </h3>
//               <p className="fontFamilyText  text-sm sm:text-base mt-10 text-gray-200 ">
//                 Liquidity At Launch: {presaleData.liquidityAtLaunch} USDT
//               </p>
//             </>
//           )}
//         </div>
//         {/* Lottie Animation */}
//         <div className="w-full max-w-52 mx-auto mb-4">
//           <Lottie animationData={lottieAnimation} loop={true} />
//         </div>


//         {/* Countdown */}
//         {presaleData ? (
//           // <div className="mt-4 grid grid-cols-4 gap-2 text-center px-2 text-black">
//           //   <div className="flex flex-col items-center justify-center bg-white rounded-3xl p-4 hover:bg-white/20 transition">
//           //     <span className="fontFamily text-4xl sm:text-3xl ">
//           //       {countdown.days}
//           //     </span>
//           //     <span className="fontFamilyText text-[20px] uppercase ">Days</span>
//           //   </div>
//           //   <div className="flex flex-col items-center justify-center bg-white 
//           //                   rounded-3xl p-2 hover:bg-white/20 transition">
//           //     <span className="fontFamily text-4xl sm:text-3xl ">
//           //       {countdown.hours}
//           //     </span>
//           //     <span className="fontFamilyText text-[20px] uppercase">Hrs</span>
//           //   </div>
//           //   <div className="flex flex-col items-center justify-center bg-white 
//           //                   rounded-3xl p-2 hover:bg-white/20 transition">
//           //     <span className="text-2xl sm:text-3xl fontFamilyText">
//           //       {countdown.minutes}
//           //     </span>
//           //     <span className="fontFamilyText text-[20px] uppercase">Mins</span>
//           //   </div>
//           //   <div className="flex flex-col items-center justify-center bg-white
//           //                   rounded-3xl p-2 hover:bg-white/20 transition">
//           //     <span className="text-2xl sm:text-3xl fontFamilyText">
//           //       {countdown.seconds}
//           //     </span>
//           //     <span className="fontFamilyText text-[20px] uppercase">Secs</span>
//           //   </div>
//           // </div>
//           <div className="mt-4 grid grid-cols-4 gap-2 text-center px-2 text-black">
//             {["days", "hours", "minutes", "seconds"].map((unit, idx) => (
//               <div key={unit} className="flex flex-col items-center">
//                 <div className="bg-white rounded-2xl  py-3 hover:bg-white/20 transition w-full flex items-center justify-center">
//                   <span className="fontFamily text-[48px]">
//                     {countdown[unit as keyof typeof countdown]}
//                   </span>
//                 </div>
//                 <span className="fontFamilyText text-white text-[25px] uppercase mt-2">
//                   {unit === "days" ? "Days" : unit === "hours" ? "Hrs" : unit === "minutes" ? "Mins" : "Secs"}
//                 </span>
//               </div>
//             ))}
//           </div>

//         ) : (
//           <p className="text-center text-white mt-2">Loading Presale Data...</p>
//         )}

//         {/* Progress + markers */}
//         {/* <div className="mt-5 px-3">
//           <div className="relative w-full h-4 bg-white/20 rounded-full overflow-hidden">
//             <div
//               className="absolute left-0 top-0 h-full bg-purple-400 transition-all duration-300"
//               style={{ width: `${progress}%` }}
//             />
//             {presaleData &&
//               getStageMarkers().map((m, idx) => (
//                 <div
//                   key={idx}
//                   className="absolute flex flex-col items-center"
//                   style={{ left: `${m.pct}%` }}
//                 >
//                   <div className="w-[2px] h-6 bg-white 
//                                   translate-x-[-1px] translate-y-[-10px]" />
//                   <span
//                     className="text-[10px] text-white mt-1 
//                                whitespace-nowrap translate-x-[-50%]"
//                   >
//                     {m.label}
//                   </span>
//                 </div>
//               ))}
//           </div>
//         </div> */}
//         {/* Progress + Markers */}
//         <div className="mt-5 px-3 ">
//           {/* Outer container for markers + progress bar */}
//           <div className="relative px-2">

//             {/* 1) Markers row */}
//             <div className="relative w-full h-8 mb-0 ">
//               {presaleData &&
//                 getStageMarkers().map((m, idx) => {
//                   // Determine arrow color based on marker status
//                   let arrowColor;
//                   let textColor;
//                   if (m.status === "completed") {
//                     arrowColor = "border-t-green-500"; // Tailwind green
//                     textColor = "text-green-500";
//                   } else if (m.status === "current") {
//                     arrowColor = "border-t-yellow-500"; // Tailwind yellow
//                     textColor = "text-yellow-500";
//                   } else {
//                     arrowColor = "border-t-white";
//                     textColor = "text-white";
//                   }
//                   return (
//                     <div
//                       key={idx}
//                       className="absolute flex flex-col items-center"
//                       style={{ left: `calc(${m.pct}% - 8px)` }}
//                     >
//                       <span className={`text-xs font-bold mb-1 ${textColor}`}>
//                         {m.label}
//                       </span>
//                       <div
//                         className={`
//                           w-3 h-1
//                           border-l-4 border-r-4
//                           border-l-transparent border-r-transparent
//                           border-t-8 ${arrowColor}
//                         `}
//                       />
//                     </div>
//                   );
//                 })}
//             </div>


//             {/* 2) The actual progress bar */}
//             <div className="w-full h-10 bg-white/20 rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-purple-200 rounded-full transition-all duration-300"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           </div>
//         </div>


//         {/* WUSLE SOLD / USDT RAISED */}
//         <div className="flex flex-col gap-1 text-xs sm:text-sm text-purple-200 mt-2 px-3">
//         {/* WUSLE SOLD row */}
//         <div className="flex justify-between">
//           <span className="fontFamilyText text-white text-2xl">WUSLE SOLD</span>
//           <span className="fontFamilyText text-white text-2xl">
//             {presaleData
//               ? (
//                   stagesTotalRaisedSoFar() /
//                   (presaleData.wusleRate || 0.0037)
//                 ).toLocaleString(undefined, { maximumFractionDigits: 0 })
//               : 0}{" "}
//             / {presaleData ? presaleData.totalWusleSupply : 0}
//           </span>
//         </div>

//         {/* USDT RAISED row */}
//         <div className="flex justify-between">
//           <span className="fontFamilyText text-white text-sm">USDT RAISED</span>
//           <span className="fontFamilyText text-white text-sm">
//             ${presaleData ? stagesTotalRaisedSoFar().toLocaleString() : "0"}
//           </span>
//         </div>
//       </div>


//         {/* Rate Info */}
//         {presaleData && (
//           <div className="mt-4 mx-3 py-3 px-4 text-center transition">
//             <p className="fontFamilyText text-[25px]  text-white mb-1 ">
//               1 WUSLE = {presaleData.wusleRate.toFixed(4)} USDT
//             </p>
//             <p className="fontFamilyText text-[18px]  text-white ">
//               LISTING PRICE: {presaleData.listingPrice.toFixed(3)} USDT
//             </p>
//           </div>
//         )}

//         {/* "YOUR PURCHASED WUSLE" placeholder */}
//         {session?.user  && (
//           <div className="flex justify-between items-center mt-3 px-3 text-sm">
//             <span className="fontFamilyText text-white uppercase text-xl">
//               YOUR PURCHASED WUSLE
//             </span>
//             <span className="fontFamily text-xl text-white">
//               {(userStats?.wuslePurchased ?? 0).toFixed(5)}
//             </span>
//           </div>

//         )}


//         {/* Currency selection */}
//         <div className="mt-4 flex items-center justify-between gap-2 px-8">
//           {/* Left: USDT */}
//           <Button
//             onClick={() => setSelectedCurrency("USDT")}
//             variant={selectedCurrency === "USDT" ? "default" : "outline"}
//             className={`
//               fontFamily text-2xl flex items-center justify-center space-x-2 py-9 rounded-2xl
//               bg-white text-black hover:bg-white/30 transition-colors duration-200 w-1/2
//               ${selectedCurrency === "USDT" ? "border-2 border-black" : "border-none"}
//             `}
//           >
//             <Image src={Usdt} alt="USDT" width={36} height={36} />
//             <span>USDT</span>
//           </Button>

//           {/* Right: SOL */}
//           <Button
//             onClick={() => setSelectedCurrency("SOL")}
//             variant={selectedCurrency === "SOL" ? "default" : "outline"}
//             className={`
//               fontFamily text-2xl flex items-center justify-center space-x-2 py-9 rounded-2xl
//               bg-white text-black hover:bg-white/30 transition-colors duration-200 w-1/2
//               ${selectedCurrency === "SOL" ? "border-2 border-black" : "border-none"}
//             `}
//           >
//             <Image src={Sol} alt="Sol" width={36} height={36} />
//             <span>SOL</span>
//           </Button>
//         </div>


//         {/* Payment row */}
//         <div className="mt-4 flex justify-between gap-4 px-8">
//           {/* YOU PAY */}
//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full">
//             <Input
//               type="number"
//               placeholder="YOU PAY"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               className="
//                 fontFamily  bg-white placeholder:text-black placeholder:pr-10
//                   placeholder:text-2xl  py-9 rounded-2xl
//                  w-full
//               "
//             />

//               <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
//                 <Image
//                   src={selectedCurrency === 'USDT' ? Usdt : Sol}
//                   alt={selectedCurrency}
//                   width={36}
//                   height={36}
//                 />
//               </span>
//             </div>
//           </div>


//           {/* YOU GET */}
//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full bg-white rounded-2xl">
//               <Input
//                 type="number"
//                 value={wusleAmount.toFixed(4)}
//                 disabled
//                 placeholder="YOU GET"
//                 className="
//                   fontFamily  text-black text-2xl py-9  pr-14 rounded-2xl
//                   placeholder:text-black placeholder:text-2xl w-full
//                 "
//               />
//               {/* Image inside input on the right */}
//               <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                 <Image
//                   src={Wusle}
//                   alt="WUSLE"
//                   width={40}
//                   height={40}
//                   className="rounded-full py-[6px] border  bg-white border-purple-700"
//                 />
//               </span>
//             </div>
//           </div>

//         </div>


//         {/* Connect wallet / buy / login section */}
//         <div className="mt-5 flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-7 pb-2">
//         {!session?.user ? (
//           <Button
//             onClick={() => setShowLogin(true)}
//             className="w-full sm:w-auto px-6 py-3 text-white font-bold bg-purple-900 hover:bg-purple-700 animate-heartbeat"
//           >
//             CONNECT YOUR WALLET
//           </Button>
//         ) : (
//           <WalletMultiButton
//             style={{
//               fontSize: "16px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontWeight: "bold",
//               color: "white",
//               borderRadius: "50px",
//               background: "#9c23d5",
//               border: "none",
//               cursor: "pointer",
//               transition: "all 0.3s ease-in-out",
//               animation: "heartbeat 0.5s infinite ease-in-out",
//               padding: "10px 20px",
//               textAlign: "center",
//             }}
//             className="w-20 sm:w-auto"
//           >
//             {connected ?  "CONNECTED" : "CONNECT WALLET"}
//           </WalletMultiButton>
//         )}

//         {/* Show BUY NOW only if user & wallet connected */}
//         {session?.user && publicKey && connected && (
//           <Button
//             onClick={handleBuyNow}
//             className="w-20 sm:w-auto px-16 py-6 text-white font-bold bg-purple-600 hover:bg-purple-700 animate-heartbeat rounded-full"
//           >
//             BUY NOW
//           </Button>
//         )}
//       </div>

//       </div>

//       {/* The login modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />

//       {/* Our fancy slip receipt modal */}
//       <ReceiptModal
//         show={showReceipt}
//         slip={slip}
//         onClose={() => setShowReceipt(false)}
//       />
//     </div>
//   );
// }



