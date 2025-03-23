"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Usdt from "../../assets/Images/usdt.png";
import Sol from "../../assets/Images/sol.png";
import Wusle from "../../assets/Images/logo.jpeg";

import { toast } from "react-hot-toast";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSession } from "next-auth/react";
import LoginModal from "@/components/LoginModal";
import dynamic from "next/dynamic";
import { useIsMobile } from "@/hooks/useIsMobile";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import lottieAnimation from "@/assets/Images/wave.json";

import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import ReceiptModal from "../ReceiptModal";

/* --------------- Types --------------- */
interface StageData {
  stageNumber: number; 
  target: number;   // in USDT
  raised: number;   // USDT raised so far
  startTime: string;
  endTime: string;
  rate: number;     
  listingPrice: number;
}

interface PresaleAPIResponse {
  stages: StageData[];
  currentStage: number;
  endsAt: string;
  wusleRate: number;         // e.g. 0.2 USDT per WUSLE (comes from backend)
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

interface SlipData {
  id: string;
  userId: string;
  walletAddress: string;
  currency: string;     // "USDT" or "SOL"
  amountPaid: number;
  wuslePurchased: number;
  redeemCode: string;
  createdAt: string;
}

export default function PresaleInterface() {
  const { data: session } = useSession();
  const { publicKey, connected, sendTransaction } = useWallet();
  const isMobile6 = useIsMobile(475);

  const [presaleData, setPresaleData] = useState<PresaleAPIResponse | null>(null);
  const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState<number>(0);

  // Payment input
  const [amount, setAmount] = useState<string>("");  // user input
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
  const [wusleAmount, setWusleAmount] = useState<number>(0);

  // Additional states
  const [showLogin, setShowLogin] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [slip, setSlip] = useState<SlipData | null>(null);
  const [userStats, setUserStats] = useState<{ wuslePurchased: number; spent: number } | null>(null);

  const [isSlipGenerating, setIsSlipGenerating] = useState(false);

  // Hard-coded logic: 1 USDT = 0.0075 SOL
  // If presaleData.wusleRate = e.g. 0.2 USDT => 1 WUSLE = 0.2 USDT => 1 WUSLE = 0.2 * 0.0075 = 0.0015 SOL
  const USDT_TO_SOL = 0.0075;

  const epsilon = 1e-8;

  // ─────────────────────────────────────────────────────────────────────────────
  // ENV
  // ─────────────────────────────────────────────────────────────────────────────
  const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "";
  const USDT_MINT = process.env.NEXT_PUBLIC_USDT_MINT || "";
  const SOL_RECEIVER = process.env.NEXT_PUBLIC_SOL_RECEIVER || "";

  // ─────────────────────────────────────────────────────────────────────────────
  // 1) Fetch user stats
  // ─────────────────────────────────────────────────────────────────────────────
  async function refreshUserStats() {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      if (res.ok) {
        setUserStats(data);
      } else {
        toast.error(data.error || "Error fetching user stats");
      }
    } catch (err) {
      console.error("Error fetching user stats:", err);
      toast.error("Unable to fetch user stats!");
    }
  }

  useEffect(() => {
    if (session?.user) {
      refreshUserStats();
    }
  }, [session]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2) Fetch Presale Data
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchPresale() {
      try {
        const res = await fetch("/api/presale");
        const data = await res.json();
        if (res.ok) {
          setPresaleData(data);
        } else {
          toast.error(data.error || "Failed to load presale data");
        }
      } catch (err) {
        console.error("Error fetching presale data:", err);
        toast.error("Error fetching presale data. Check console for details!");
      }
    }

    fetchPresale();
    // optional poll
    // const interval = setInterval(fetchPresale, 30000);
    // return () => clearInterval(interval);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3) Progress Bar
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!presaleData) return;
    const { stages, currentStage } = presaleData;
    const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
    const activeStage = stages.find(s => s.stageNumber === currentStage);
    if (!activeStage) {
      setProgress(0);
      return;
    }
    let sumCompleted = 0;
    for (const st of stages) {
      if (st.stageNumber < currentStage) sumCompleted += st.target;
    }
    const totalRaisedSoFar = sumCompleted + activeStage.raised;
    const frac = (totalRaisedSoFar / totalCap) * 100;
    setProgress(Math.min(Math.max(frac, 0), 100));
  }, [presaleData]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4) Countdown
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!presaleData) return;
    if (isPresaleOver) return;
    const endsAtMs = new Date(presaleData.endsAt).getTime();

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = endsAtMs - now;
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

  // ─────────────────────────────────────────────────────────────────────────────
  // 5) total WUSLE sold => USDT-based
  // ─────────────────────────────────────────────────────────────────────────────
  function totalWusleSoldAccurate(): number {
    if (!presaleData) return 0;
    return presaleData.stages.reduce((acc, stage) => {
      const tokens = stage.raised / stage.rate; // e.g. stage.raised= 100 => rate=0.2 => tokens=500
      return acc + Number(tokens.toFixed(8));
    }, 0);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6) leftover WUSLE
  // ─────────────────────────────────────────────────────────────────────────────
  const wusleLeft = useMemo(() => {
    if (!presaleData) return 0;
    const totalSupply = parseFloat(presaleData.totalWusleSupply);
    const sold = totalWusleSoldAccurate();
    const leftover = totalSupply - sold;
    return leftover > 0 ? Number(leftover.toFixed(8)) : 0;
  }, [presaleData]);

  const remainingUsdtValue = useMemo(() => {
    if (!presaleData) return 0;
    const usdtVal = wusleLeft * presaleData.wusleRate;
    return Number(usdtVal.toFixed(4));
  }, [wusleLeft, presaleData]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 7) Is presale over?
  // ─────────────────────────────────────────────────────────────────────────────
  const isPresaleOver = useMemo(() => {
    if (!presaleData) return false;
    return wusleLeft <= epsilon;
  }, [presaleData, wusleLeft]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 8) recalc how many tokens the user gets
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!presaleData) return;

    // if user picks USDT => finalRate= presaleData.wusleRate (e.g. 0.2)
    // if user picks SOL => finalRate= presaleData.wusleRate * 0.0075 (e.g. 0.2*0.0075= 0.0015)
    const rateUSDT = presaleData.wusleRate;
    const rateSOL = rateUSDT * 0.0075;

    const finalRate = selectedCurrency === "SOL" ? rateSOL : rateUSDT;

    const paid = parseFloat(amount || "0");
    const rawTokens = paid / finalRate;
    // round to e.g. 8 decimals so we don't see 0.549999999
    const tokens = Number(rawTokens.toFixed(8));
    setWusleAmount(isNaN(tokens) ? 0 : tokens);
  }, [amount, selectedCurrency, presaleData]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 9) total USDT raised so far
  // ─────────────────────────────────────────────────────────────────────────────
  function stagesTotalRaisedSoFar(): number {
    if (!presaleData) return 0;
    const { stages, currentStage } = presaleData;
    const activeStage = stages.find(s => s.stageNumber === currentStage);
    if (!activeStage) return 0;
    let completed = 0;
    for (const st of stages) {
      if (st.stageNumber < currentStage) completed += st.target;
    }
    return completed + activeStage.raised;
  }

  function getStageMarkers() {
    if (!presaleData) return [];
    const { stages, currentStage } = presaleData;
    const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
    let cumulative = 0;
    return stages.map(st => {
      const pct = (cumulative / totalCap) * 100;
      cumulative += st.target;
      let status: "completed" | "current" | "upcoming" = "upcoming";
      if (st.stageNumber < currentStage) status = "completed";
      else if (st.stageNumber === currentStage) status = "current";
      return { pct, label: st.stageNumber.toString(), status };
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 10) handleBuyNow
  // ─────────────────────────────────────────────────────────────────────────────
  async function handleBuyNow() {
    try {
      if (!presaleData) {
        toast.error("Presale data not loaded");
        return;
      }
      if (isPresaleOver) {
        toast.error("Presale is sold out!");
        return;
      }
      if (!session?.user) {
        toast.error("Please log in first!");
        return;
      }
      if (!publicKey || !connected) {
        toast.error("Connect your wallet first!");
        return;
      }

      const paid = parseFloat(amount || "0");
      if (paid <= 0) {
        toast.error("Invalid amount");
        return;
      }

      const leftover = wusleLeft;
      if (leftover <= epsilon) {
        toast.error("All tokens sold out!");
        return;
      }

      // figure out finalRate again
      const rateUSDT = presaleData.wusleRate; // e.g. 0.2
      const rateSOL = rateUSDT * 0.0075;      // e.g. 0.0015
      const finalRate = (selectedCurrency === "SOL") ? rateSOL : rateUSDT;

      // check if user is over-buying leftover
      const maxPayable = leftover * finalRate;
      if (paid > maxPayable + epsilon) {
        toast.error(
          `Only ${leftover.toFixed(4)} WUSLE left => max ~${maxPayable.toFixed(4)} ${selectedCurrency}`
        );
        return;
      }
      if (wusleAmount > leftover + epsilon) {
        toast.error(`Only ${leftover.toFixed(4)} WUSLE remain. Reduce purchase amount.`);
        return;
      }

      // 1) send transaction
      const connection = new Connection(SOLANA_RPC, "confirmed");
      let txSignature = "";

      if (selectedCurrency === "SOL") {
        const lamports = Math.floor(paid * LAMPORTS_PER_SOL);
        const receiverPubkey = new PublicKey(SOL_RECEIVER);
        try {
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: receiverPubkey,
              lamports,
            })
          );
          txSignature = await sendTransaction(transaction, connection);
        } catch (err: any) {
          if (err?.message?.includes("User rejected")) {
            toast.error("Transaction canceled by user");
          } else {
            toast.error("SOL transaction failed");
            console.error(err);
          }
          return;
        }
      } else {
        // USDT
        try {
          const usdtMintPubKey = new PublicKey(USDT_MINT);
          const recipientPubkey = new PublicKey(SOL_RECEIVER);

          const senderUsdtATA = await getAssociatedTokenAddress(usdtMintPubKey, publicKey);
          const recipientUsdtATA = await getAssociatedTokenAddress(usdtMintPubKey, recipientPubkey);

          const usdtDecimals = 6; // typical for USDT
          const amtInSmallestUnits = Math.floor(paid * 10 ** usdtDecimals);

          const transaction = new Transaction();
          const recipientATAInfo = await connection.getAccountInfo(recipientUsdtATA);
          if (!recipientATAInfo) {
            transaction.add(
              createAssociatedTokenAccountInstruction(
                publicKey,
                recipientUsdtATA,
                recipientPubkey,
                usdtMintPubKey
              )
            );
          }
          transaction.add(
            createTransferInstruction(
              senderUsdtATA,
              recipientUsdtATA,
              publicKey,
              amtInSmallestUnits,
              [],
              TOKEN_PROGRAM_ID
            )
          );
          try {
            txSignature = await sendTransaction(transaction, connection);
          } catch (err: any) {
            if (err?.message?.includes("User rejected")) {
              toast.error("Transaction canceled by user");
            } else {
              toast.error("USDT transaction failed");
              console.error(err);
            }
            return;
          }
        } catch (err: any) {
          toast.error("Preparing USDT transaction failed");
          console.error(err);
          return;
        }
      }

      // 2) confirm transaction
      try {
        const latestBlockHash = await connection.getLatestBlockhash();
        const confirmation = await connection.confirmTransaction({
          signature: txSignature,
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        });
        if (confirmation.value.err) {
          toast.error("Transaction not confirmed on-chain");
          return;
        }
      } catch (err: any) {
        toast.error("Broadcast but not confirmed");
        console.error(err);
        return;
      }

      toast.success(`${selectedCurrency} tx confirmed! Tx: ${txSignature.slice(0, 16)}...`);

      // 3) slip creation
      setIsSlipGenerating(true);
      try {
        // we can do final rounding for the slip
        const finalWusle = Number(wusleAmount.toFixed(6)); // e.g. 6 decimals

        const res = await fetch("/api/slip/buy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: publicKey.toBase58(),
            currency: selectedCurrency,
            amountPaid: paid,
            wuslePurchased: finalWusle,
            txSignature,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setSlip(data.slip);
          setShowReceipt(true);
          refreshUserStats();
        } else {
          toast.error(data.error || "Slip creation error on server");
        }
      } catch (err: any) {
        console.error("Slip creation error:", err);
        toast.error("Slip creation failed on server");
      } finally {
        setIsSlipGenerating(false);
      }
    } catch (outerErr: any) {
      toast.error("Unexpected error, see console");
      console.error(outerErr);
    }
  }

  // dynamic display for the rate
  function displayRate() {
    if (!presaleData) return "...";
    const rateUSDT = presaleData.wusleRate;         // e.g. 0.2
    const rateSOL = rateUSDT * 0.0075;             // e.g. 0.0015
    return (selectedCurrency === "USDT")
      ? `1 WUSLE = ${rateUSDT.toFixed(4)} USDT`
      : `1 WUSLE = ${rateSOL.toFixed(6)} SOL`;
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      {/* Slip generating overlay */}
      {isSlipGenerating && (
        <div className="absolute top-0  w-screen h-screen z-[99999999999] flex items-center justify-center">
          <div className="bg-white text-black font-bold px-6 py-4 rounded-md shadow-md">
            <p className="text-lg">Generating your slip...</p>
            <p className="text-sm mt-1">
              Please wait, do not reload or navigate away.
            </p>
          </div>
        </div>
      )}

      <div className="relative w-full py-4 max-w-[600px] mx-auto bg-gradient-to-br from-purple-900 to-purple-500 rounded-lg transition-all duration-300">
        {/* Title */}
        <div className="text-center mt-2">
          <h2 className="font-bold text-lg sm:text-xl uppercase text-white">
            $WUSLE PRESALE
          </h2>
          {presaleData && (
            <>
              <h2 className="font-bold text-lg sm:text-xl uppercase text-white">
                IS NOW LIVE!
              </h2>
              <h3 className="font-bold text-md sm:text-xl mt-1 text-white">
                STAGE {presaleData.currentStage}/{presaleData.stages.length}
              </h3>
              <p className="text-xs sm:text-lg mt-4 text-gray-200">
                Liquidity At Launch: {presaleData.liquidityAtLaunch} USDT
              </p>
            </>
          )}
        </div>

        {/* Countdown */}
        {presaleData && !isPresaleOver ? (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-black mx-4 md:mx-8">
            {["days", "hours", "minutes", "seconds"].map(unit => (
              <div key={unit} className="flex flex-col items-center">
                <div className="bg-white/40 text-white rounded-lg hover:bg-white/20 transition flex flex-col items-center justify-center w-[70px] h-[60px] sm:w-[90px] sm:h-[70px] md:w-[100px] md:h-[80px] lg:w-[120px] lg:h-[100px]">
                  <span className="font-bold text-xl sm:text-2xl md:text-3xl">
                    {countdown[unit as keyof Countdown]}
                  </span>
                  <span className="text-white text-sm sm:text-base uppercase mt-2">
                    {unit === "days"
                      ? "Days"
                      : unit === "hours"
                      ? "Hrs"
                      : unit === "minutes"
                      ? "Mins"
                      : "Secs"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : presaleData && isPresaleOver ? (
          <p className="text-center text-white mt-2 font-bold text-lg">
            🎉 Presale Sold Out
          </p>
        ) : (
          <p className="text-center text-white mt-2">Loading Presale Data...</p>
        )}

        {/* Progress + Markers */}
        <div className="mt-4 px-2 sm:px-8">
          <div className="relative px-2">
            <div className="relative w-full h-8 mb-0">
              {presaleData &&
                getStageMarkers().map((marker, idx) => {
                  let arrowColor, textColor;
                  if (marker.status === "completed") {
                    arrowColor = "border-t-green-500";
                    textColor = "text-green-500";
                  } else if (marker.status === "current") {
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
                      style={{ left: `calc(${marker.pct}% - 8px)` }}
                    >
                      <span className={`text-xs font-bold mb-1 ${textColor}`}>
                        {marker.label}
                      </span>
                      <div
                        className={`${
                          isMobile6 ? "w-2 h-1" : "w-3 h-1"
                        } border-l-4 border-r-4 border-l-transparent border-r-transparent border-t-8 ${arrowColor}`}
                      />
                    </div>
                  );
                })}
            </div>
            <div
              className={`w-full bg-white/20 rounded-full overflow-hidden ${
                isMobile6 ? "h-5" : "h-4"
              }`}
            >
              <div
                className="h-full bg-purple-200 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* WUSLE Left */}
        {/* {presaleData && !isPresaleOver && (
          <div className="text-center mt-2 text-white text-sm sm:text-base">
            <p>
              Only <span className="font-bold">{wusleLeft.toFixed(4)} WUSLE</span> left (~
              <span className="font-bold"> {remainingUsdtValue.toFixed(4)} USDT</span>)
            </p>
          </div>
        )} */}

        {/* WUSLE Sold / USDT Raised */}
        <div className="flex flex-col gap-1 text-xs sm:text-sm text-purple-200 mt-2 px-4 sm:px-8">
          <div className="flex justify-between items-center">
            <span className="text-white text-sm sm:text-lg md:text-md lg:text-lg">
              WUSLE SOLD
            </span>
            <span className="text-white text-xs sm:text-base md:text-md lg:text-lg">
              {presaleData
                ? totalWusleSoldAccurate().toLocaleString(undefined, {
                    maximumFractionDigits: 4,
                  })
                : 0}{" "}
              / {presaleData ? presaleData.totalWusleSupply : 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white text-xs sm:text-sm md:text-sm">
              USDT RAISED
            </span>
            <span className="text-white text-xs sm:text-sm md:text-sm lg:text-lg">
              $
              {presaleData
                ? stagesTotalRaisedSoFar().toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })
                : "0"}
            </span>
          </div>
        </div>

        {/* Rate Info */}
        {presaleData && (
          <div className="mt-3 sm:mt-4 mx-4 sm:mx-8 py-2 sm:py-4 px-3 sm:px-4 text-center transition bg-white/15 rounded-lg">
            {selectedCurrency === "USDT" ? (
              <p className="text-white mb-1 text-sm sm:text-lg md:text-xl lg:text-2xl">
                1 WUSLE = {presaleData.wusleRate.toFixed(4)} USDT
              </p>
            ) : (
              <p className="text-white mb-1 text-sm sm:text-lg md:text-xl lg:text-2xl">
                1 WUSLE = {(presaleData.wusleRate * 0.0075).toFixed(6)} SOL
              </p>
            )}
            <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg">
              LISTING PRICE: {presaleData.listingPrice.toFixed(3)} USDT
            </p>
          </div>
        )}

        {/* Your Purchased WUSLE */}
        {session?.user && (
          <div className="flex font-bold justify-between items-center mt-3 px-3 text-sm mx-4 sm:mx-14">
            <span className="text-white uppercase text-xs sm:text-md md:text-lg lg:text-xl">
              YOUR PURCHASED WUSLE
            </span>
            <span className="font-bold text-white text-xs sm:text-md md:text-lg lg:text-xl">
              {(userStats?.wuslePurchased ?? 0).toFixed(5)}
            </span>
          </div>
        )}

        {/* Currency Selection */}
        <div className="mt-4 flex mx-4 sm:mx-8 items-center justify-between gap-2">
          <Button
            onClick={() => setSelectedCurrency("USDT")}
            variant={selectedCurrency === "USDT" ? "default" : "outline"}
            className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/2 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
              selectedCurrency === "USDT" ? "border-2 border-black" : "border-none"
            }`}
          >
            <Image src={Usdt} alt="USDT" width={24} height={24} />
            <span>USDT</span>
          </Button>

          <Button
            onClick={() => setSelectedCurrency("SOL")}
            variant={selectedCurrency === "SOL" ? "default" : "outline"}
            className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/2 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
              selectedCurrency === "SOL" ? "border-2 border-black" : "border-none"
            }`}
          >
            <Image src={Sol} alt="Sol" width={24} height={24} />
            <span>SOL</span>
          </Button>
        </div>

        {/* Payment Row */}
        <div className="mt-4 mx-4 sm:mx-12 flex justify-between gap-4 px-4 sm:px-8">
          <div className="flex flex-col w-1/2">
            <div className="relative w-full">
              <Input
                type="number"
                placeholder="YOU PAY"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/20 text-white placeholder:text-white/90 placeholder:pr-10 py-2 sm:py-5 rounded-lgl w-full text-sm sm:text-sm md:text-md placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-lg"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Image
                  src={selectedCurrency === "USDT" ? Usdt : Sol}
                  alt={selectedCurrency}
                  width={24}
                  height={24}
                />
              </span>
            </div>
          </div>
          <div className="flex flex-col w-1/2">
            <div className="relative w-full">
              <Input
                type="number"
                value={wusleAmount.toFixed(4)}
                disabled
                placeholder="YOU GET"
                className="bg-white/20 text-white placeholder:pr-10 py-2 sm:py-5 rounded-lgl w-full text-sm sm:text-sm md:text-md placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-lg"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Image
                  src={Wusle}
                  alt="WUSLE"
                  width={32}
                  height={32}
                  className="rounded-full border bg-white border-purple-700 p-1"
                />
              </span>
            </div>
          </div>
        </div>

        {/* Connect Wallet / Buy Section */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-7 pb-2">
          {!session?.user ? (
            <Button
              onClick={() => setShowLogin(true)}
              className="w-2/3 py-5 text-black font-bold bg-pink-100 hover:bg-purple-900 rounded-lg text-[12px] sm:text-sm md:text-md lg:text-lg"
            >
              CONNECT YOUR WALLET
            </Button>
          ) : (
            <WalletMultiButton
              style={{
                width: "100%",
                maxWidth: "600px",
                padding: "16px",
                color: "black",
                fontWeight: "bold",
                background: "#fce2ff",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                fontSize: "clamp(14px, 2vw, 16px)",
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
              disabled={
                isPresaleOver ||
                parseFloat(amount || "0") <= 0 ||
                isSlipGenerating
              }
              className="w-1/3 px-8 py-6 text-black font-bold bg-pink-100 hover:bg-white/80 rounded-lg text-sm sm:text-base md:text-lg"
            >
              {isPresaleOver ? "SOLD OUT" : "BUY NOW"}
            </Button>
          )}
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />

      {/* Receipt Modal */}
      <ReceiptModal show={showReceipt} slip={slip} onClose={() => setShowReceipt(false)} />
    </div>
  );
}










// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
// import Usdt from "../../assets/Images/usdt.png";
// import Sol from "../../assets/Images/sol.png";
// import Wusle from "../../assets/Images/logo.jpeg";

// import { toast } from "react-hot-toast";

// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useSession } from "next-auth/react";
// import LoginModal from "@/components/LoginModal";
// import dynamic from "next/dynamic";
// import { useIsMobile } from "@/hooks/useIsMobile";

// const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
// import lottieAnimation from "@/assets/Images/wave.json";

// import {
//   Connection,
//   SystemProgram,
//   Transaction,
//   PublicKey,
//   LAMPORTS_PER_SOL,
// } from "@solana/web3.js";

// import {
//   getAssociatedTokenAddress,
//   createTransferInstruction,
//   createAssociatedTokenAccountInstruction,
//   TOKEN_PROGRAM_ID,
// } from "@solana/spl-token";

// import ReceiptModal from "../ReceiptModal";

// /* --------------- Types --------------- */
// interface StageData {
//   stageNumber: number;
//   target: number; // USDT
//   raised: number; // USDT already raised
//   startTime: string;
//   endTime: string;
//   rate: number;    // USDT per WUSLE
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

// export default function PresaleInterface() {
//   const { data: session } = useSession();
//   const { publicKey, connected, sendTransaction } = useWallet();
//   const isMobile6 = useIsMobile(475);

//   const [presaleData, setPresaleData] = useState<PresaleAPIResponse | null>(null);
//   const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [progress, setProgress] = useState<number>(0);

//   // Payment input
//   const [amount, setAmount] = useState<string>("");
//   const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
//   const [wusleAmount, setWusleAmount] = useState<number>(0);

//   // Additional UI states
//   const [showLogin, setShowLogin] = useState(false);
//   const [showReceipt, setShowReceipt] = useState(false);
//   const [slip, setSlip] = useState<SlipData | null>(null);
//   const [userStats, setUserStats] = useState<{ wuslePurchased: number; spent: number } | null>(null);

//   const [isSlipGenerating, setIsSlipGenerating] = useState(false); // overlay state

//   // For small float checks
//   const epsilon = 1e-8;

//   // Env
//   const SOLANA_RPC =
//     process.env.NEXT_PUBLIC_SOLANA_RPC ||
//     "";
//   const USDT_MINT =
//     process.env.NEXT_PUBLIC_USDT_MINT || "";
//   const SOL_RECEIVER =
//     process.env.NEXT_PUBLIC_SOL_RECEIVER || "";

//   // ──────────────────────────────────────────────────────────────────────────
//   // 1) Fetch user stats
//   // ──────────────────────────────────────────────────────────────────────────
//   async function refreshUserStats() {
//     try {
//       const res = await fetch("/api/user");
//       const data = await res.json();
//       if (res.ok) {
//         setUserStats(data);
//       } else {
//         toast.error(data.error || "Error fetching user stats");
//       }
//     } catch (err) {
//       console.error("Error fetching user stats:", err);
//       toast.error("Unable to fetch user stats. The gremlins must be at play!");
//     }
//   }

//   useEffect(() => {
//     if (session?.user) {
//       refreshUserStats();
//     }
//   }, [session]);

//   // ──────────────────────────────────────────────────────────────────────────
//   // 2) Fetch Presale Data
//   // ──────────────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     async function fetchPresale() {
//       try {
//         const res = await fetch("/api/presale");
//         const data = await res.json();
//         if (res.ok) {
//           setPresaleData(data);
//         } else {
//           toast.error(data.error || "Failed to load presale data");
//         }
//       } catch (err) {
//         console.error("Error fetching presale data:", err);
//         toast.error("Error fetching presale data. Check console for details!");
//       }
//     }

//     fetchPresale();
//     // optional periodic refresh
//     // const interval = setInterval(fetchPresale, 30000);
//     // return () => clearInterval(interval);
//   }, []);

//   // ──────────────────────────────────────────────────────────────────────────
//   // 3) Progress Bar Calculation
//   // ──────────────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!presaleData) return;
//     const totalCap = presaleData.stages.reduce((acc, s) => acc + s.target, 0);
//     const active = presaleData.stages.find((s) => s.stageNumber === presaleData.currentStage);

//     if (!active) {
//       setProgress(0);
//       return;
//     }

//     let sumCompleted = 0;
//     for (const st of presaleData.stages) {
//       if (st.stageNumber < presaleData.currentStage) sumCompleted += st.target;
//     }
//     const totalRaisedSoFar = sumCompleted + active.raised;
//     const frac = (totalRaisedSoFar / totalCap) * 100;
//     setProgress(Math.min(Math.max(frac, 0), 100));
//   }, [presaleData]);

//   // ──────────────────────────────────────────────────────────────────────────
//   // 4) Countdown Timer
//   // ──────────────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!presaleData) return;
//     if (isPresaleOver) return;

//     const endsAtMs = new Date(presaleData.endsAt).getTime();
//     const timer = setInterval(() => {
//       const now = Date.now();
//       const diff = endsAtMs - now;
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

//   // ──────────────────────────────────────────────────────────────────────────
//   // 5) Precisely compute total WUSLE sold
//   // ──────────────────────────────────────────────────────────────────────────
//   function totalWusleSoldAccurate(): number {
//     if (!presaleData) return 0;
//     let totalSold = 0;
//     for (const st of presaleData.stages) {
//       const tokensSold = st.raised / st.rate;
//       totalSold += Number(tokensSold.toFixed(8));
//     }
//     return Number(totalSold.toFixed(8));
//   }

//   // ──────────────────────────────────────────────────────────────────────────
//   // 6) WUSLE Left
//   // ──────────────────────────────────────────────────────────────────────────
//   const wusleLeft = useMemo(() => {
//     if (!presaleData) return 0;
//     const supply = parseFloat(presaleData.totalWusleSupply);
//     const sold = totalWusleSoldAccurate();
//     const leftover = supply - sold;
//     const r = Number(leftover.toFixed(8));
//     return r > 0 ? r : 0;
//   }, [presaleData]);

//   const remainingUsdtValue = useMemo(() => {
//     if (!presaleData) return 0;
//     const val = wusleLeft * presaleData.wusleRate;
//     return Number(val.toFixed(4));
//   }, [wusleLeft, presaleData]);

//   // ──────────────────────────────────────────────────────────────────────────
//   // 7) Is Presale Over?
//   // ──────────────────────────────────────────────────────────────────────────
//   const isPresaleOver = useMemo(() => {
//     if (!presaleData) return false;
//     return wusleLeft <= epsilon;
//   }, [presaleData, wusleLeft]);

//   // ──────────────────────────────────────────────────────────────────────────
//   // 8) Recompute the WUSLE user gets when they type an amount
//   // ──────────────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!presaleData) return;
//     const rate = presaleData.wusleRate;
//     const paid = parseFloat(amount || "0");
//     const tokens = paid / rate;
//     setWusleAmount(isNaN(tokens) ? 0 : tokens);
//   }, [amount, presaleData]);

//   // ──────────────────────────────────────────────────────────────────────────
//   // 9) USDT raised so far
//   // ──────────────────────────────────────────────────────────────────────────
//   function stagesTotalRaisedSoFar(): number {
//     if (!presaleData) return 0;
//     const { stages, currentStage } = presaleData;
//     const active = stages.find((s) => s.stageNumber === currentStage);
//     if (!active) return 0;

//     let completed = 0;
//     for (const st of stages) {
//       if (st.stageNumber < currentStage) {
//         completed += st.target; // previous stage = fully sold
//       }
//     }
//     return completed + active.raised;
//   }

//   // For progress bar stage markers
//   function getStageMarkers() {
//     if (!presaleData) return [];
//     const { stages, currentStage } = presaleData;
//     const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
//     let cumulative = 0;

//     return stages.map((st) => {
//       const pct = (cumulative / totalCap) * 100;
//       cumulative += st.target;

//       let status: "completed" | "current" | "upcoming" = "upcoming";
//       if (st.stageNumber < currentStage) {
//         status = "completed";
//       } else if (st.stageNumber === currentStage) {
//         status = "current";
//       }
//       return { pct, label: `${st.stageNumber}`, status };
//     });
//   }

//   // ──────────────────────────────────────────────────────────────────────────
//   // 10) handleBuyNow
//   // ──────────────────────────────────────────────────────────────────────────
//   async function handleBuyNow() {
//     try {
//       if (!presaleData) {
//         toast.error("Presale data not loaded.");
//         return;
//       }
//       if (isPresaleOver) {
//         toast.error("Presale sold out!");
//         return;
//       }
//       if (!session?.user) {
//         toast.error("Please log in first!");
//         return;
//       }
//       if (!publicKey || !connected) {
//         toast.error("Connect your wallet first!");
//         return;
//       }

//       const paid = parseFloat(amount || "0");
//       if (paid <= 0) {
//         toast.error("Enter a valid amount!");
//         return;
//       }

//       const totalSupply = parseFloat(presaleData.totalWusleSupply);
//       const totalSold = totalWusleSoldAccurate();
//       const leftover = totalSupply - totalSold;
//       if (leftover <= epsilon) {
//         toast.error("All tokens sold out!");
//         return;
//       }

//       const maxPayable = leftover * presaleData.wusleRate;
//       if (paid > maxPayable + epsilon) {
//         toast.error(`Only ${leftover.toFixed(4)} tokens left => max ${maxPayable.toFixed(4)} USDT`);
//         return;
//       }
//       if (wusleAmount > leftover + epsilon) {
//         toast.error(`Only ${leftover.toFixed(4)} WUSLE left. Reduce amount.`);
//         return;
//       }

//       // 1) Send transaction
//       const connection = new Connection(SOLANA_RPC, "confirmed");
//       let txSignature = "";

//       if (selectedCurrency === "SOL") {
//         const lamports = Math.floor(paid * LAMPORTS_PER_SOL);
//         const receiverPubkey = new PublicKey(SOL_RECEIVER);
//         try {
//           const transaction = new Transaction().add(
//             SystemProgram.transfer({
//               fromPubkey: publicKey,
//               toPubkey: receiverPubkey,
//               lamports,
//             })
//           );
//           txSignature = await sendTransaction(transaction, connection);
//         } catch (err: any) {
//           if (err?.message?.includes("User rejected")) {
//             toast.error("User rejected transaction");
//           } else {
//             toast.error("SOL transaction failed");
//             console.error(err);
//           }
//           return;
//         }
//       } else {
//         // USDT
//         try {
//           const usdtMintPubKey = new PublicKey(USDT_MINT);
//           const recipientPubkey = new PublicKey(SOL_RECEIVER);

//           const senderUsdtATA = await getAssociatedTokenAddress(usdtMintPubKey, publicKey);
//           const recipientUsdtATA = await getAssociatedTokenAddress(usdtMintPubKey, recipientPubkey);

//           const usdtDecimals = 9;
//           const amtInSmallestUnits = Math.floor(paid * 10 ** usdtDecimals);

//           const transaction = new Transaction();
//           const recipientATAInfo = await connection.getAccountInfo(recipientUsdtATA);
//           if (!recipientATAInfo) {
//             transaction.add(
//               createAssociatedTokenAccountInstruction(
//                 publicKey,
//                 recipientUsdtATA,
//                 recipientPubkey,
//                 usdtMintPubKey
//               )
//             );
//           }
//           transaction.add(
//             createTransferInstruction(
//               senderUsdtATA,
//               recipientUsdtATA,
//               publicKey,
//               amtInSmallestUnits,
//               [],
//               TOKEN_PROGRAM_ID
//             )
//           );
//           try {
//             txSignature = await sendTransaction(transaction, connection);
//           } catch (err: any) {
//             if (err?.message?.includes("User rejected")) {
//               toast.error("User rejected transaction");
//             } else {
//               toast.error("USDT transaction failed");
//               console.error(err);
//             }
//             return;
//           }
//         } catch (err: any) {
//           toast.error("Preparing USDT transaction failed");
//           console.error(err);
//           return;
//         }
//       }

//       // 2) Confirm transaction
//       try {
//         const latestBlockHash = await connection.getLatestBlockhash();
//         const confirmation = await connection.confirmTransaction({
//           signature: txSignature,
//           blockhash: latestBlockHash.blockhash,
//           lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
//         });
//         if (confirmation.value.err) {
//           toast.error("Transaction not confirmed on-chain");
//           return;
//         }
//       } catch (err: any) {
//         toast.error("Broadcasted but not confirmed");
//         console.error(err);
//         return;
//       }

//       toast.success(`${selectedCurrency} tx confirmed! Tx: ${txSignature.slice(0, 16)}...`);

//       // 3) Slip generation
//       setIsSlipGenerating(true);
//       try {
//         const res = await fetch("/api/slip/buy", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             walletAddress: publicKey.toBase58(),
//             currency: selectedCurrency,
//             amountPaid: paid,
//             wuslePurchased: wusleAmount,
//             txSignature,
//           }),
//         });
//         const data = await res.json();
//         if (res.ok) {
//           setSlip(data.slip);
//           setShowReceipt(true);
//           refreshUserStats();
//         } else {
//           toast.error(data.error || "Slip creation error on server");
//         }
//       } catch (err: any) {
//         console.error("Slip creation error:", err);
//         toast.error("Slip creation failed on server");
//       } finally {
//         setIsSlipGenerating(false);
//       }
//     } catch (outerErr: any) {
//       toast.error("Unexpected error, check console");
//       console.error(outerErr);
//     }
//   }

//   // ──────────────────────────────────────────────────────────────────────────
//   // 11) Render
//   // ──────────────────────────────────────────────────────────────────────────
//   return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       {/* Full-screen overlay if slip is generating */}
//       {isSlipGenerating && (
//         <div className="fixed top-0 w-screen h-screen  z-[99999999999] flex items-center justify-center">
//           <div className="bg-white text-black font-bold px-6 py-4 rounded-md shadow-md">
//             <p className="text-lg">Generating your slip...</p>
//             <p className="text-sm mt-1">Please wait, do not reload or navigate away.Otherwisre you will lose your slip</p>
//           </div>
//         </div>
//       )}

//       <div className="relative w-full py-4 max-w-[600px] mx-auto bg-gradient-to-br from-purple-900 to-purple-500 rounded-lg transition-all duration-300">
//         {/* Title / Stage Info */}
//         <div className="text-center mt-2">
//           <h2 className="font-bold text-lg sm:text-xl uppercase text-white">
//             $WUSLE PRESALE
//           </h2>
//           {presaleData && (
//             <>
//               <h2 className="font-bold text-lg sm:text-xl uppercase text-white">
//                 IS NOW LIVE!
//               </h2>
//               <h3 className="font-bold text-md sm:text-xl mt-1 text-white">
//                 STAGE {presaleData.currentStage}/{presaleData.stages.length}
//               </h3>
//               <p className="text-xs sm:text-lg mt-4 text-gray-200">
//                 Liquidity At Launch: {presaleData.liquidityAtLaunch} USDT
//               </p>
//             </>
//           )}
//         </div>

//         {/* Countdown */}
//         {presaleData && !isPresaleOver ? (
//           <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-black mx-4 md:mx-8">
//             {["days", "hours", "minutes", "seconds"].map((unit) => (
//               <div key={unit} className="flex flex-col items-center">
//                 <div className="bg-white/40 text-white rounded-lg hover:bg-white/20 transition flex flex-col items-center justify-center w-[70px] h-[60px] sm:w-[90px] sm:h-[70px] md:w-[100px] md:h-[80px] lg:w-[120px] lg:h-[100px]">
//                   <span className="font-bold text-xl sm:text-2xl md:text-3xl">
//                     {countdown[unit as keyof Countdown]}
//                   </span>
//                   <span className="text-white text-sm sm:text-base uppercase mt-2">
//                     {unit === "days"
//                       ? "Days"
//                       : unit === "hours"
//                       ? "Hrs"
//                       : unit === "minutes"
//                       ? "Mins"
//                       : "Secs"}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : presaleData && isPresaleOver ? (
//           <p className="text-center text-white mt-2 font-bold text-lg">
//             🎉 Presale Sold Out
//           </p>
//         ) : (
//           <p className="text-center text-white mt-2">Loading Presale Data...</p>
//         )}

//         {/* Progress & Stage Markers */}
//         <div className="mt-4 px-2 sm:px-8">
//           <div className="relative px-2">
//             <div className="relative w-full h-8 mb-0">
//               {presaleData &&
//                 getStageMarkers().map((m, idx) => {
//                   let arrowColor, textColor;
//                   if (m.status === "completed") {
//                     arrowColor = "border-t-green-500";
//                     textColor = "text-green-500";
//                   } else if (m.status === "current") {
//                     arrowColor = "border-t-yellow-500";
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
//                       <span className={`text-xs font-bold mb-1 ${textColor}`}>{m.label}</span>
//                       <div
//                         className={`${
//                           isMobile6 ? "w-2 h-1" : "w-3 h-1"
//                         } border-l-4 border-r-4 border-l-transparent border-r-transparent border-t-8 ${arrowColor}`}
//                       />
//                     </div>
//                   );
//                 })}
//             </div>
//             <div
//               className={`w-full bg-white/20 rounded-full overflow-hidden ${
//                 isMobile6 ? "h-5" : "h-4"
//               }`}
//             >
//               <div
//                 className="h-full bg-purple-200 rounded-full transition-all duration-300"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* WUSLE Left */}
//         {presaleData && !isPresaleOver && (
//           <div className="text-center mt-2 text-white text-sm sm:text-base">
//             <p>
//               Only <span className="font-bold">{wusleLeft.toFixed(4)} WUSLE</span> left (~
//               <span className="font-bold"> {remainingUsdtValue.toFixed(4)} USDT</span>)
//             </p>
//           </div>
//         )}

//         {/* WUSLE Sold / USDT Raised */}
//         <div className="flex flex-col gap-1 text-xs sm:text-sm text-purple-200 mt-2 px-4 sm:px-8">
//           <div className="flex justify-between items-center">
//             <span className="text-white text-sm sm:text-lg md:text-md lg:text-lg">WUSLE SOLD</span>
//             <span className="text-white text-xs sm:text-base md:text-md lg:text-lg">
//               {presaleData
//                 ? totalWusleSoldAccurate().toLocaleString(undefined, { maximumFractionDigits: 4 })
//                 : 0}{" "}
//               / {presaleData ? presaleData.totalWusleSupply : 0}
//             </span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-white text-xs sm:text-sm md:text-sm">USDT RAISED</span>
//             <span className="text-white text-xs sm:text-sm md:text-sm lg:text-lg">
//               $
//               {presaleData
//                 ? stagesTotalRaisedSoFar().toLocaleString(undefined, {
//                     maximumFractionDigits: 2,
//                   })
//                 : "0"}
//             </span>
//           </div>
//         </div>

//         {/* Rate Info */}
//         {presaleData && (
//           <div className="mt-3 sm:mt-4 mx-4 sm:mx-8 py-2 sm:py-4 px-3 sm:px-4 text-center transition bg-white/15 rounded-lg">
//             <p className="text-white mb-1 text-sm sm:text-lg md:text-xl lg:text-2xl">
//               1 WUSLE = {presaleData.wusleRate.toFixed(4)} USDT
//             </p>
//             <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg">
//               LISTING PRICE: {presaleData.listingPrice.toFixed(3)} USDT
//             </p>
//           </div>
//         )}

//         {/* Your Purchased WUSLE */}
//         {session?.user && (
//           <div className="flex font-bold justify-between items-center mt-3 px-3 text-sm mx-4 sm:mx-14">
//             <span className="text-white uppercase text-xs sm:text-md md:text-lg lg:text-xl">
//               YOUR PURCHASED WUSLE
//             </span>
//             <span className="font-bold text-white text-xs sm:text-md md:text-lg lg:text-xl">
//               {(userStats?.wuslePurchased ?? 0).toFixed(5)}
//             </span>
//           </div>
//         )}

//         {/* Currency Selection */}
//         <div className="mt-4 flex mx-4 sm:mx-8 items-center justify-between gap-2">
//           <Button
//             onClick={() => setSelectedCurrency("USDT")}
//             variant={selectedCurrency === "USDT" ? "default" : "outline"}
//             className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/2 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
//               selectedCurrency === "USDT" ? "border-2 border-black" : "border-none"
//             }`}
//           >
//             <Image src={Usdt} alt="USDT" width={24} height={24} />
//             <span>USDT</span>
//           </Button>

//           <Button
//             onClick={() => setSelectedCurrency("SOL")}
//             variant={selectedCurrency === "SOL" ? "default" : "outline"}
//             className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/2 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
//               selectedCurrency === "SOL" ? "border-2 border-black" : "border-none"
//             }`}
//           >
//             <Image src={Sol} alt="Sol" width={24} height={24} />
//             <span>SOL</span>
//           </Button>
//         </div>

//         {/* Payment Row */}
//         <div className="mt-4 mx-4 sm:mx-12 flex justify-between gap-4 px-4 sm:px-8">
//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full">
//               <Input
//                 type="number"
//                 placeholder="YOU PAY"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className="bg-white/20 text-white placeholder:text-white/90 placeholder:pr-10 py-2 sm:py-5 rounded-lgl w-full text-sm sm:text-sm md:text-md placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-lg"
//               />
//               <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
//                 <Image
//                   src={selectedCurrency === "USDT" ? Usdt : Sol}
//                   alt={selectedCurrency}
//                   width={24}
//                   height={24}
//                 />
//               </span>
//             </div>
//           </div>
//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full">
//               <Input
//                 type="number"
//                 value={wusleAmount.toFixed(4)}
//                 disabled
//                 placeholder="YOU GET"
//                 className="bg-white/20 text-white placeholder:pr-10 py-2 sm:py-5 rounded-lgl w-full text-sm sm:text-sm md:text-md placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-lg"
//               />
//               <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                 <Image
//                   src={Wusle}
//                   alt="WUSLE"
//                   width={32}
//                   height={32}
//                   className="rounded-full border bg-white border-purple-700 p-1"
//                 />
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Connect Wallet / Buy Section */}
//         <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-7 pb-2">
//           {!session?.user ? (
//             <Button
//               onClick={() => setShowLogin(true)}
//               className="w-1/2 py-5 text-black font-bold bg-pink-100 hover:bg-purple-900 rounded-lg text-sm sm:text-lg md:text-md lg:text-lg"
//             >
//               CONNECT YOUR WALLET
//             </Button>
//           ) : (
//             <WalletMultiButton
//               style={{
//                 width: "100%",
//                 maxWidth: "600px",
//                 padding: "16px",
//                 color: "black",
//                 fontWeight: "bold",
//                 background: "#fce2ff",
//                 borderRadius: "10px",
//                 border: "none",
//                 cursor: "pointer",
//                 transition: "all 0.3s ease-in-out",
//                 fontSize: "clamp(14px, 2vw, 16px)",
//                 textAlign: "center",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 display: "flex",
//               }}
//             >
//               {connected ? "CONNECTED" : "CONNECT WALLET"}
//             </WalletMultiButton>
//           )}

//           {session?.user && publicKey && connected && (
//             <Button
//               onClick={handleBuyNow}
//               disabled={
//                 isPresaleOver ||
//                 parseFloat(amount || "0") <= 0 ||
//                 isSlipGenerating
//               }
//               className="w-1/3 px-8 py-6 text-black font-bold bg-pink-100 hover:bg-white/80 rounded-lg text-sm sm:text-base md:text-lg"
//             >
//               {isPresaleOver ? "SOLD OUT" : "BUY NOW"}
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Login Modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />

//       {/* Receipt Modal */}
//       <ReceiptModal show={showReceipt} slip={slip} onClose={() => setShowReceipt(false)} />
//     </div>
//   );
// }









// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
// import Usdt from "../../assets/Images/usdt.png";
// import Sol from "../../assets/Images/sol.png";
// import Wusle from "../../assets/Images/logo.jpeg";

// import { toast } from "react-hot-toast";

// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useSession } from "next-auth/react";
// import LoginModal from "@/components/LoginModal";
// import dynamic from "next/dynamic";
// import { useIsMobile } from "@/hooks/useIsMobile";

// const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
// import lottieAnimation from "@/assets/Images/wave.json";

// import {
//   Connection,
//   SystemProgram,
//   Transaction,
//   PublicKey,
//   LAMPORTS_PER_SOL,
// } from "@solana/web3.js";

// import {
//   getAssociatedTokenAddress,
//   createTransferInstruction,
//   createAssociatedTokenAccountInstruction,
//   TOKEN_PROGRAM_ID,
// } from "@solana/spl-token";

// import ReceiptModal from "../ReceiptModal";

// /* --------------- Types --------------- */
// interface StageData {
//   stageNumber: number;
//   target: number;     // in USDT
//   raised: number;     // how much USDT we have raised so far
//   startTime: string;
//   endTime: string;
//   rate: number;       // USDT per WUSLE
//   listingPrice: number;
// }

// interface PresaleAPIResponse {
//   stages: StageData[];           // multiple stages
//   currentStage: number;          // which stage is active
//   endsAt: string;                // overall end time
//   wusleRate: number;            // convenience field for the current rate (or matches stage?)
//   listingPrice: number;
//   totalWusleSupply: string;     // total token supply for all stages (in WUSLE)
//   liquidityAtLaunch: string;    // some extra display info
// }

// interface Countdown {
//   days: number;
//   hours: number;
//   minutes: number;
//   seconds: number;
// }

// interface SlipData {
//   id: string;
//   userId: string;
//   walletAddress: string;
//   currency: string;
//   amountPaid: number;       // in USDT or SOL equivalent
//   wuslePurchased: number;   // how many tokens got purchased
//   redeemCode: string;
//   createdAt: string;
// }

// export default function PresaleInterface() {
//   const { data: session } = useSession();
//   const { publicKey, connected, sendTransaction } = useWallet();

//   // Single mobile breakpoint hook (e.g. is < 475px wide)
//   const isMobile6 = useIsMobile(475);

//   const [presaleData, setPresaleData] = useState<PresaleAPIResponse | null>(null);
//   const [countdown, setCountdown] = useState<Countdown>({
//     days: 0,
//     hours: 0,
//     minutes: 0,
//     seconds: 0,
//   });
//   const [progress, setProgress] = useState<number>(0);

//   // User’s input
//   const [amount, setAmount] = useState<string>(""); // user typed how much USDT or SOL they want to pay
//   const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
//   const [wusleAmount, setWusleAmount] = useState<number>(0); // how many WUSLE user gets

//   // UI states
//   const [showLogin, setShowLogin] = useState(false);
//   const [showReceipt, setShowReceipt] = useState(false);
//   const [slip, setSlip] = useState<SlipData | null>(null);

//   // Stats about how many WUSLE the current user has purchased
//   const [userStats, setUserStats] = useState<{ wuslePurchased: number; spent: number } | null>(
//     null
//   );

//   // For float math
//   const epsilon = 1e-8;

//   // ─────────────────────────────────────────────────────────────────────────────
//   // ENV Vars: connection info, addresses, etc.
//   // ─────────────────────────────────────────────────────────────────────────────
//   const SOLANA_RPC =
//     process.env.NEXT_PUBLIC_SOLANA_RPC ||
//     "https://mainnet.helius-rpc.com/?api-key=5a6666c8-29bd-4e56-ac5d-bd70076a0412";
//   const USDT_MINT =
//     process.env.NEXT_PUBLIC_USDT_MINT || "Es9vMFrzaCERaXwz2xQSKz3F8uQDrE17eCJZzz6nA6qT";
//   const SOL_RECEIVER =
//     process.env.NEXT_PUBLIC_SOL_RECEIVER || "Fc71HwgDJTAfMMd1f7zxZq1feBM67A3pZQQwoFbLWx6G";

//   // ─────────────────────────────────────────────────────────────────────────────
//   // 1) Fetch user stats (spent, purchased) after they log in
//   // ─────────────────────────────────────────────────────────────────────────────
//   async function refreshUserStats() {
//     try {
//       const res = await fetch("/api/user");
//       const data = await res.json();
//       if (res.ok) {
//         setUserStats(data);
//       } else {
//         toast.error(data.error || "Error fetching user stats");
//       }
//     } catch (error) {
//       console.error("Error fetching user stats:", error);
//       toast.error("Unable to fetch user stats. The gremlins must be at play!");
//     }
//   }

//   useEffect(() => {
//     if (session?.user) {
//       refreshUserStats();
//     }
//   }, [session]);

//   // ─────────────────────────────────────────────────────────────────────────────
//   // 2) Fetch Presale Data from /api/presale
//   // ─────────────────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     async function fetchPresale() {
//       try {
//         const res = await fetch("/api/presale");
//         const data = await res.json();
//         if (res.ok) {
//           setPresaleData(data);
//         } else {
//           toast.error(data.error || "Failed to load presale data");
//         }
//       } catch (err) {
//         console.error("Error fetching presale data:", err);
//         toast.error("Error fetching presale data. Check console for details!");
//       }
//     }

//     fetchPresale();
//     // Optional: refresh every 30 sec
//     // const interval = setInterval(fetchPresale, 30000);
//     // return () => clearInterval(interval);
//   }, []);

//   // ─────────────────────────────────────────────────────────────────────────────
//   // 3) Compute the progress bar
//   //    Because targets and raised are in USDT, we can do:
//   //    progress = totalRaisedSoFar / totalCapInUSDT * 100
//   // ─────────────────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!presaleData) return;

//     // totalCap = sum of all stage targets (in USDT)
//     const totalCap = presaleData.stages.reduce((acc, s) => acc + s.target, 0);

//     // find the active stage
//     const { currentStage, stages } = presaleData;
//     const active = stages.find((s) => s.stageNumber === currentStage);

//     if (!active) {
//       setProgress(0);
//       return;
//     }

//     // sum up all fully completed stages + the active stage’s “raised”
//     let sumCompleted = 0;
//     for (const st of stages) {
//       // if this stageNumber is less than the current stageNumber, consider it fully sold => i.e. st.target in USDT
//       if (st.stageNumber < currentStage) {
//         sumCompleted += st.target;
//       }
//     }
//     const totalRaisedSoFar = sumCompleted + active.raised;
//     const frac = (totalRaisedSoFar / totalCap) * 100;

//     setProgress(Math.min(Math.max(frac, 0), 100));
//   }, [presaleData]);

//   // ─────────────────────────────────────────────────────────────────────────────
//   // 4) Countdown Timer: only show if not sold out
//   // ─────────────────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!presaleData) return;
//     if (isPresaleOver) return; // if we already consider it sold out, skip the countdown

//     const endsAtMs = new Date(presaleData.endsAt).getTime();
//     const timer = setInterval(() => {
//       const now = Date.now();
//       const diff = endsAtMs - now;
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

//   // ─────────────────────────────────────────────────────────────────────────────
//   // 5) Precisely compute total WUSLE sold so far:
//   //    For each stage:
//   //       tokensSold = raised (USDT) / rate (USDT per WUSLE)
//   //    sum them all
//   // ─────────────────────────────────────────────────────────────────────────────
//   function totalWusleSoldAccurate(): number {
//     if (!presaleData) return 0;
//     let totalSold = 0;

//     for (const st of presaleData.stages) {
//       const exactSold = st.raised / st.rate; // => WUSLE sold in that stage
//       const roundedSold = Number(exactSold.toFixed(8)); // keep ~8 decimals
//       totalSold += roundedSold;
//     }

//     return Number(totalSold.toFixed(8));
//   }

//   // ─────────────────────────────────────────────────────────────────────────────
//   // 6) WUSLE left = totalWusleSupply - totalWusleSold
//   // ─────────────────────────────────────────────────────────────────────────────
//   const wusleLeft = useMemo(() => {
//     if (!presaleData) return 0;
//     const supply = parseFloat(presaleData.totalWusleSupply); // total tokens
//     const sold = totalWusleSoldAccurate();
//     const remaining = supply - sold;
//     const rounded = Number(remaining.toFixed(8));
//     return rounded > 0 ? rounded : 0;
//   }, [presaleData]);

//   // Also, how much USDT that leftover is worth:
//   const remainingUsdtValue = useMemo(() => {
//     if (!presaleData) return 0;
//     return Number((wusleLeft * presaleData.wusleRate));
//   }, [wusleLeft, presaleData]);

//   // ─────────────────────────────────────────────────────────────────────────────
//   // 7) Presale Over? If no WUSLE left => sold out
//   // ─────────────────────────────────────────────────────────────────────────────
//   const isPresaleOver = useMemo(() => {
//     if (!presaleData) return false;
//     return wusleLeft <= epsilon;
//   }, [presaleData, wusleLeft]);

//   // ─────────────────────────────────────────────────────────────────────────────
//   // 8) Whenever user changes `amount`, recalc how many WUSLE they'd get
//   // ─────────────────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!presaleData) return;
//     const rate = presaleData.wusleRate;
//     const paid = parseFloat(amount || "0");
//     const tokens = paid / rate;
//     setWusleAmount(isNaN(tokens) ? 0 : tokens);
//   }, [amount, presaleData]);

//   // ─────────────────────────────────────────────────────────────────────────────
//   // 9) Show total USDT raised so far, for the UI
//   //    We do something similar to the progress bar logic,
//   //    but if you want “fully total USDT,” sum all stage.raised
//   // ─────────────────────────────────────────────────────────────────────────────
//   function stagesTotalRaisedSoFar(): number {
//     if (!presaleData) return 0;
//     const { stages, currentStage } = presaleData;
//     const active = stages.find((s) => s.stageNumber === currentStage);
//     if (!active) return 0;

//     let completed = 0;
//     for (const st of stages) {
//       if (st.stageNumber < currentStage) {
//         completed += st.target; // means previous stages fully sold = target USDT
//       }
//     }
//     return completed + active.raised;
//   }

//   // For the stage marker triangles
//   function getStageMarkers() {
//     if (!presaleData) return [];
//     const { stages, currentStage } = presaleData;
//     if (!stages.length) return [];

//     const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
//     let cumulative = 0;

//     return stages.map((s) => {
//       const pct = (cumulative / totalCap) * 100;
//       cumulative += s.target;

//       let status: "completed" | "current" | "upcoming" = "upcoming";
//       if (s.stageNumber < currentStage) {
//         status = "completed";
//       } else if (s.stageNumber === currentStage) {
//         status = "current";
//       }

//       return { pct, label: `${s.stageNumber}`, status };
//     });
//   }

//   // ─────────────────────────────────────────────────────────────────────────────
//   // 10) handleBuyNow: main purchase logic
//   // ─────────────────────────────────────────────────────────────────────────────
//   async function handleBuyNow() {
//     try {
//       if (!presaleData) {
//         toast.error("Presale data not loaded yet.");
//         return;
//       }

//       if (isPresaleOver) {
//         toast.error("Presale is sold out. No more WUSLE left to grab!");
//         return;
//       }

//       if (!session?.user) {
//         toast.error("Please log in before buying. We have WUSLE, but we also like security!");
//         return;
//       }
//       if (!publicKey || !connected) {
//         toast.error("Connect your wallet first. The blockchain awaits!");
//         return;
//       }

//       const paid = parseFloat(amount || "0");
//       if (paid <= 0) {
//         toast.error("Enter a valid amount. Zero won't buy you any WUSLE!");
//         return;
//       }

//       // Double-check how many tokens remain
//       const totalSupply = parseFloat(presaleData.totalWusleSupply);
//       const totalSold = totalWusleSoldAccurate();
//       const actualWusleLeft = totalSupply - totalSold;
//       if (actualWusleLeft <= epsilon) {
//         toast.error("WUSLE supply exhausted. Presale is sold out.");
//         return;
//       }

//       // The max user can pay to buy the leftover tokens in USDT
//       const maxPayable = actualWusleLeft * presaleData.wusleRate;
//       if (paid > maxPayable + epsilon) {
//         toast.error(
//           `Only ~${actualWusleLeft.toFixed(4)} WUSLE left (max ${maxPayable} ${selectedCurrency}).`
//         );
//         return;
//       }

//       // Also if user tries to get more tokens than remain
//       if (wusleAmount > actualWusleLeft + epsilon) {
//         toast.error(`Only ${actualWusleLeft.toFixed(4)} WUSLE left. Reduce your purchase amount.`);
//         return;
//       }

//       // ───── Prepare to send transaction on Solana ─────
//       const connection = new Connection(SOLANA_RPC, "confirmed");
//       let txSignature = "";

//       // A) If paying with SOL
//       if (selectedCurrency === "SOL") {
//         const lamports = Math.floor(paid * LAMPORTS_PER_SOL);
//         const receiverPubkey = new PublicKey(SOL_RECEIVER);

//         try {
//           const transaction = new Transaction().add(
//             SystemProgram.transfer({
//               fromPubkey: publicKey,
//               toPubkey: receiverPubkey,
//               lamports,
//             })
//           );
//           txSignature = await sendTransaction(transaction, connection);
//         } catch (err: any) {
//           if (err?.message?.includes("User rejected the request")) {
//             toast.error("Transaction cancelled by user.");
//           } else {
//             toast.error("Failed to send SOL transaction. Double-check wallet or network.");
//             console.error("SOL Transaction Error:", err);
//           }
//           return;
//         }
//       }
//       // B) If paying with USDT
//       else {
//         try {
//           const usdtMintPubKey = new PublicKey(USDT_MINT);
//           const recipientPubkey = new PublicKey(SOL_RECEIVER);

//           // sender’s token account
//           const senderUsdtATA = await getAssociatedTokenAddress(usdtMintPubKey, publicKey);
//           // recipient’s token account
//           const recipientUsdtATA = await getAssociatedTokenAddress(usdtMintPubKey, recipientPubkey);

//           const usdtDecimals = 6;
//           const amountInSmallestUnits = Math.floor(paid * 10 ** usdtDecimals);

//           const transaction = new Transaction();
//           const recipientATAInfo = await connection.getAccountInfo(recipientUsdtATA);

//           // Ensure the receiver has a token account for USDT
//           if (!recipientATAInfo) {
//             transaction.add(
//               createAssociatedTokenAccountInstruction(
//                 publicKey,
//                 recipientUsdtATA,
//                 recipientPubkey,
//                 usdtMintPubKey
//               )
//             );
//           }

//           // Transfer USDT
//           transaction.add(
//             createTransferInstruction(
//               senderUsdtATA,
//               recipientUsdtATA,
//               publicKey,
//               amountInSmallestUnits,
//               [],
//               TOKEN_PROGRAM_ID
//             )
//           );

//           try {
//             txSignature = await sendTransaction(transaction, connection);
//           } catch (err: any) {
//             if (err?.message?.includes("User rejected the request")) {
//               toast.error("Transaction cancelled by user.");
//             } else {
//               toast.error("Failed to send USDT transaction. Double-check wallet or network.");
//               console.error("❌ USDT Transaction Error:", err);
//             }
//             return;
//           }
//         } catch (err: any) {
//           console.error("❌ USDT Setup Error:", err);
//           toast.error("Something went wrong preparing the USDT transaction.");
//           return;
//         }
//       }

//       // ─────────────────────────────────────────────────────────────────────────
//       // Confirm the transaction on-chain
//       // ─────────────────────────────────────────────────────────────────────────
//       try {
//         const latestBlockHash = await connection.getLatestBlockhash();
//         const confirmationResult = await connection.confirmTransaction({
//           signature: txSignature,
//           blockhash: latestBlockHash.blockhash,
//           lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
//         });

//         if (confirmationResult.value.err) {
//           toast.error("Transaction not confirmed on-chain. Check your wallet or explorer.");
//           return;
//         }
//       } catch (err: any) {
//         console.error("Transaction confirmation error:", err);
//         toast.error("Transaction broadcasted, but confirmation failed. Check explorer.");
//         return;
//       }

//       toast.success(`${selectedCurrency} transaction confirmed! Tx: ${txSignature.slice(0, 16)}...`);

//       // ─────────────────────────────────────────────────────────────────────────
//       // 8) Create server-side slip record, update DB
//       // ─────────────────────────────────────────────────────────────────────────
//       try {
//         const res = await fetch("/api/slip/buy", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             walletAddress: publicKey.toBase58(),
//             currency: selectedCurrency,
//             amountPaid: paid,
//             wuslePurchased: wusleAmount,
//             txSignature,
//           }),
//         });
//         const data = await res.json();

//         if (res.ok) {
//           setSlip(data.slip);
//           setShowReceipt(true);

//           // re-fetch user stats
//           refreshUserStats();
//         } else {
//           toast.error(data.error || "Error creating slip on the server. Our apologies!");
//         }
//       } catch (serverErr: any) {
//         console.error("Slip creation error:", serverErr);
//         toast.error("Purchase succeeded, but slip creation failed on server.");
//       }
//     } catch (outerErr: any) {
//       console.error("handleBuyNow outer error:", outerErr);
//       toast.error("Uh oh, something unexpected happened. See console for details.");
//     }
//   }

//   // ─────────────────────────────────────────────────────────────────────────────
//   // 11) Render: the UI
//   // ─────────────────────────────────────────────────────────────────────────────
//   return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <div className="relative w-full py-4 max-w-[600px] mx-auto bg-gradient-to-br from-purple-900 to-purple-500 rounded-lg transition-all duration-300">
//         {/* Title / Stage Info */}
//         <div className="text-center mt-2">
//           <h2 className="font-bold text-lg sm:text-xl uppercase text-white">
//             $WUSLE PRESALE
//           </h2>
//           {presaleData && (
//             <>
//               <h2 className="font-bold text-lg sm:text-xl uppercase text-white">
//                 IS NOW LIVE!
//               </h2>
//               <h3 className="font-bold text-md sm:text-xl mt-1 text-white">
//                 STAGE {presaleData.currentStage}/{presaleData.stages.length}
//               </h3>
//               <p className="text-xs sm:text-lg mt-4 text-gray-200">
//                 Liquidity At Launch: {presaleData.liquidityAtLaunch} USDT
//               </p>
//             </>
//           )}
//         </div>

//         {/* Countdown */}
//         {presaleData && !isPresaleOver ? (
//           <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-black mx-4 md:mx-8">
//             {["days", "hours", "minutes", "seconds"].map((unit) => (
//               <div key={unit} className="flex flex-col items-center">
//                 <div className="bg-white/40 text-white rounded-lg hover:bg-white/20 transition flex flex-col items-center justify-center w-[70px] h-[60px] sm:w-[90px] sm:h-[70px] md:w-[100px] md:h-[80px] lg:w-[120px] lg:h-[100px]">
//                   <span className="font-bold text-xl sm:text-2xl md:text-3xl">
//                     {countdown[unit as keyof Countdown]}
//                   </span>
//                   <span className="text-white text-sm sm:text-base uppercase mt-2">
//                     {unit === "days"
//                       ? "Days"
//                       : unit === "hours"
//                       ? "Hrs"
//                       : unit === "minutes"
//                       ? "Mins"
//                       : "Secs"}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : presaleData && isPresaleOver ? (
//           <p className="text-center text-white mt-2 font-bold text-lg">
//             🎉 Presale Sold Out
//           </p>
//         ) : (
//           <p className="text-center text-white mt-2">
//             Loading Presale Data...
//           </p>
//         )}

//         {/* Progress & Stage Markers */}
//         <div className="mt-4 px-2 sm:px-8">
//           <div className="relative px-2">
//             <div className="relative w-full h-8 mb-0">
//               {presaleData &&
//                 getStageMarkers().map((marker, idx) => {
//                   let arrowColor, textColor;
//                   if (marker.status === "completed") {
//                     arrowColor = "border-t-green-500";
//                     textColor = "text-green-500";
//                   } else if (marker.status === "current") {
//                     arrowColor = "border-t-yellow-500";
//                     textColor = "text-yellow-500";
//                   } else {
//                     arrowColor = "border-t-white";
//                     textColor = "text-white";
//                   }
//                   return (
//                     <div
//                       key={idx}
//                       className="absolute flex flex-col items-center"
//                       style={{ left: `calc(${marker.pct}% - 8px)` }}
//                     >
//                       <span className={`text-xs font-bold mb-1 ${textColor}`}>
//                         {marker.label}
//                       </span>
//                       <div
//                         className={`${
//                           isMobile6 ? "w-2 h-1" : "w-3 h-1"
//                         } border-l-4 border-r-4 border-l-transparent border-r-transparent border-t-8 ${arrowColor}`}
//                       />
//                     </div>
//                   );
//                 })}
//             </div>
//             <div
//               className={`w-full bg-white/20 rounded-full overflow-hidden ${
//                 isMobile6 ? "h-5" : "h-4"
//               }`}
//             >
//               <div
//                 className="h-full bg-purple-200 rounded-full transition-all duration-300"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* WUSLE Left (not sold out) */}
//         {presaleData && !isPresaleOver && (
//           <div className="text-center mt-2 text-white text-sm sm:text-base">
//             <p>
//               Only <span className="font-bold">{wusleLeft.toFixed(4)} WUSLE</span> left (~
//               <span className="font-bold"> {remainingUsdtValue} USDT</span>)
//             </p>
//           </div>
//         )}

//         {/* WUSLE Sold / USDT Raised */}
//         <div className="flex flex-col gap-1 text-xs sm:text-sm text-purple-200 mt-2 px-4 sm:px-8">
//           <div className="flex justify-between items-center">
//             <span className="text-white text-sm sm:text-lg md:text-md lg:text-lg">
//               WUSLE SOLD
//             </span>
//             <span className="text-white text-xs sm:text-base md:text-md lg:text-lg">
//               {/* totalWusleSoldAccurate for tokens sold */}
//               {presaleData
//                 ? totalWusleSoldAccurate().toLocaleString(undefined, { maximumFractionDigits: 4 })
//                 : 0}{" "}
//               / {presaleData ? presaleData.totalWusleSupply : 0}
//             </span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-white text-xs sm:text-sm md:text-sm">USDT RAISED</span>
//             <span className="text-white text-xs sm:text-sm md:text-sm lg:text-lg">
//               $
//               {presaleData
//                 ? stagesTotalRaisedSoFar().toLocaleString(undefined, {
//                     maximumFractionDigits: 2,
//                   })
//                 : "0"}
//             </span>
//           </div>
//         </div>

//         {/* Rate Info */}
//         {presaleData && (
//           <div className="mt-3 sm:mt-4 mx-4 sm:mx-8 py-2 sm:py-4 px-3 sm:px-4 text-center transition bg-white/15 rounded-lg">
//             <p className="text-white mb-1 text-sm sm:text-lg md:text-xl lg:text-2xl">
//               1 WUSLE = {presaleData.wusleRate.toFixed(4)} USDT
//             </p>
//             <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg">
//               LISTING PRICE: {presaleData.listingPrice.toFixed(3)} USDT
//             </p>
//           </div>
//         )}

//         {/* Your Purchased WUSLE */}
//         {session?.user && (
//           <div className="flex font-bold justify-between items-center mt-3 px-3 text-sm mx-4 sm:mx-14">
//             <span className="text-white uppercase text-xs sm:text-md md:text-lg lg:text-xl">
//               YOUR PURCHASED WUSLE
//             </span>
//             <span className="font-bold text-white text-xs sm:text-md md:text-lg lg:text-xl">
//               {(userStats?.wuslePurchased ?? 0).toFixed(5)}
//             </span>
//           </div>
//         )}

//         {/* Currency Selection */}
//         <div className="mt-4 flex mx-4 sm:mx-8 items-center justify-between gap-2">
//           <Button
//             onClick={() => setSelectedCurrency("USDT")}
//             variant={selectedCurrency === "USDT" ? "default" : "outline"}
//             className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/2 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
//               selectedCurrency === "USDT" ? "border-2 border-black" : "border-none"
//             }`}
//           >
//             <Image src={Usdt} alt="USDT" width={24} height={24} />
//             <span>USDT</span>
//           </Button>

//           <Button
//             onClick={() => setSelectedCurrency("SOL")}
//             variant={selectedCurrency === "SOL" ? "default" : "outline"}
//             className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/2 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
//               selectedCurrency === "SOL" ? "border-2 border-black" : "border-none"
//             }`}
//           >
//             <Image src={Sol} alt="Sol" width={24} height={24} />
//             <span>SOL</span>
//           </Button>
//         </div>

//         {/* Payment Row */}
//         <div className="mt-4 mx-4 sm:mx-12 flex justify-between gap-4 px-4 sm:px-8">
//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full">
//               <Input
//                 type="number"
//                 placeholder="YOU PAY"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className="bg-white/20 text-white placeholder:text-white/90 placeholder:pr-10 py-2 sm:py-5 rounded-lgl w-full text-sm sm:text-sm md:text-md placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-lg"
//               />
//               <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
//                 <Image
//                   src={selectedCurrency === "USDT" ? Usdt : Sol}
//                   alt={selectedCurrency}
//                   width={24}
//                   height={24}
//                 />
//               </span>
//             </div>
//           </div>
//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full">
//               <Input
//                 type="number"
//                 value={wusleAmount.toFixed(4)}
//                 disabled
//                 placeholder="YOU GET"
//                 className="bg-white/20 text-white placeholder:pr-10 py-2 sm:py-5 rounded-lgl w-full text-sm sm:text-sm md:text-md placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-lg"
//               />
//               <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                 <Image
//                   src={Wusle}
//                   alt="WUSLE"
//                   width={32}
//                   height={32}
//                   className="rounded-full border bg-white border-purple-700 p-1"
//                 />
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Connect Wallet / Buy Section */}
//         <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-7 pb-2">
//           {/* If user not logged in, show our "CONNECT YOUR WALLET" button => Actually it's a login */}
//           {!session?.user ? (
//             <Button
//               onClick={() => setShowLogin(true)}
//               className="w-1/2 py-5 text-black font-bold bg-pink-100 hover:bg-purple-900 rounded-lg text-sm sm:text-lg md:text-md lg:text-lg"
//             >
//               CONNECT YOUR WALLET
//             </Button>
//           ) : (
//             <WalletMultiButton
//               style={{
//                 width: "100%",
//                 maxWidth: "600px",
//                 padding: "16px",
//                 color: "black",
//                 fontWeight: "bold",
//                 background: "#fce2ff",
//                 borderRadius: "10px",
//                 border: "none",
//                 cursor: "pointer",
//                 transition: "all 0.3s ease-in-out",
//                 fontSize: "clamp(14px, 2vw, 16px)",
//                 textAlign: "center",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 display: "flex",
//               }}
//             >
//               {connected ? "CONNECTED" : "CONNECT WALLET"}
//             </WalletMultiButton>
//           )}

//           {session?.user && publicKey && connected && (
//             <Button
//               onClick={handleBuyNow}
//               disabled={isPresaleOver || parseFloat(amount || "0") <= 0}
//               className="w-1/3 px-8 py-6 text-black font-bold bg-pink-100 hover:bg-white/80 rounded-lg text-sm sm:text-base md:text-lg"
//             >
//               {isPresaleOver ? "SOLD OUT" : "BUY NOW"}
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Login Modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />

//       {/* Receipt Modal */}
//       <ReceiptModal show={showReceipt} slip={slip} onClose={() => setShowReceipt(false)} />
//     </div>
//   );
// }






// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
// import Usdt from "../../assets/Images/usdt.png";
// import Sol from "../../assets/Images/sol.png";
// import Wusle from "../../assets/Images/logo.jpeg";

// import { toast } from "react-hot-toast";

// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useSession } from "next-auth/react";
// import LoginModal from "@/components/LoginModal";
// import dynamic from "next/dynamic";
// import { useIsMobile } from "@/hooks/useIsMobile";

// const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
// import lottieAnimation from "@/assets/Images/wave.json";

// import {
//   Connection,
//   SystemProgram,
//   Transaction,
//   PublicKey,
//   LAMPORTS_PER_SOL,
// } from "@solana/web3.js";

// import {
//   getAssociatedTokenAddress,
//   createTransferInstruction,
//   createAssociatedTokenAccountInstruction,
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

// export default function PresaleInterface() {
//   const { data: session } = useSession();
//   const { publicKey, connected, sendTransaction } = useWallet();

//   // Single mobile breakpoint hook
//   const isMobile6 = useIsMobile(475);

//   const [presaleData, setPresaleData] = useState<PresaleAPIResponse | null>(null);
//   const [countdown, setCountdown] = useState<Countdown>({
//     days: 0,
//     hours: 0,
//     minutes: 0,
//     seconds: 0,
//   });
//   const [progress, setProgress] = useState<number>(0);
//   const [amount, setAmount] = useState<string>("");
//   const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
//   const [wusleAmount, setWusleAmount] = useState<number>(0);
//   const [showLogin, setShowLogin] = useState(false);
//   const [showReceipt, setShowReceipt] = useState(false);
//   const [slip, setSlip] = useState<SlipData | null>(null);
//   const [userStats, setUserStats] = useState<{ wuslePurchased: number; spent: number } | null>(
//     null
//   );

//  // 1. READ ENV VARIABLES
//  const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://mainnet.helius-rpc.com/?api-key=5a6666c8-29bd-4e56-ac5d-bd70076a0412";
//  const USDT_MINT = process.env.NEXT_PUBLIC_USDT_MINT || "Es9vMFrzaCERaXwz2xQSKz3F8uQDrE17eCJZzz6nA6qT";
//  const SOL_RECEIVER = process.env.NEXT_PUBLIC_SOL_RECEIVER || "Fc71HwgDJTAfMMd1f7zxZq1feBM67A3pZQQwoFbLWx6G";

//   // Fetch user stats (how much they've spent, etc.)
//   async function refreshUserStats() {
//     try {
//       const res = await fetch("/api/user");
//       const data = await res.json();
//       if (res.ok) {
//         setUserStats(data);
//       } else {
//         toast.error(data.error || "Error fetching user stats");
//       }
//     } catch (error) {
//       console.error("Error fetching user stats:", error);
//       toast.error("Unable to fetch user stats. The gremlins must be at play!");
//     }
//   }

//   useEffect(() => {
//     if (session?.user) {
//       refreshUserStats();
//     }
//   }, [session]);

//   // 2. FETCH PRESALE DATA
//   useEffect(() => {
//     async function fetchPresale() {
//       try {
//         const res = await fetch("/api/presale");
//         const data = await res.json();
//         if (res.ok) {
//           setPresaleData(data);
//         } else {
//           toast.error(data.error || "Failed to load presale data");
//         }
//       } catch (err) {
//         console.error("Error fetching presale data:", err);
//         toast.error("Error fetching presale data. Check console for details!");
//       }
//     }

//     fetchPresale();
//     // If you want periodic refresh:
//     // const interval = setInterval(fetchPresale, 30000);
//     // return () => clearInterval(interval);
//   }, []);

//   // 3. UPDATE PROGRESS BAR
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
//     const totalRaisedSoFar = sumCompleted + active.raised;
//     const frac = (totalRaisedSoFar / totalCap) * 100;
//     setProgress(Math.min(Math.max(frac, 0), 100));
//   }, [presaleData]);

//   // 4. COUNTDOWN TIMER
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

//   // 5. CALCULATE WUSLE AMOUNT
//   useEffect(() => {
//     if (!presaleData) return;
//     const rate = presaleData.wusleRate || 0.0037;
//     const val = parseFloat(amount || "0") / rate;
//     setWusleAmount(isNaN(val) ? 0 : val);
//   }, [amount, presaleData]);

//   function getStageMarkers() {
//     if (!presaleData) return [];
//     const { stages, currentStage } = presaleData;
//     if (!stages.length) return [];
//     const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
//     let cumulative = 0;
//     return stages.map((st) => {
//       const pct = (cumulative / totalCap) * 100;
//       cumulative += st.target;
//       let status = "upcoming";
//       if (st.stageNumber < currentStage) {
//         status = "completed";
//       } else if (st.stageNumber === currentStage) {
//         status = "current";
//       }
//       return { pct, label: `${st.stageNumber}`, status };
//     });
//   }

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

//   // 6. HANDLE BUY TRANSACTION
//   async function handleBuyNow() {
//     try {
//       if (!session?.user) {
//         toast.error("Please log in before buying. We have WUSLE, but we also like security!");
//         return;
//       }
//       if (!publicKey || !connected) {
//         toast.error("Connect your wallet first. The blockchain awaits!");
//         return;
//       }

//       const paid = parseFloat(amount || "0");
//       if (paid <= 0) {
//         toast.error("Enter a valid amount. Zero won't buy you any WUSLE!");
//         return;
//       }

//       // Solana connection
//       const connection = new Connection(SOLANA_RPC, "confirmed");
//       let txSignature = "";

//       // Preliminary checks to ensure user has enough balance
//       if (selectedCurrency === "SOL") {
//         // Check SOL balance
//         // const userBalance = await connection.getBalance(publicKey);
//         const lamports = Math.floor(paid * LAMPORTS_PER_SOL);
//         // if (userBalance < lamports) {
//         //   toast.error("Insufficient SOL balance to complete this transaction.");
//         //   return;
//         // }

//         // Build & send SOL transaction
//         const receiverPubkey = new PublicKey(SOL_RECEIVER);
//         const transaction = new Transaction().add(
//           SystemProgram.transfer({
//             fromPubkey: publicKey,
//             toPubkey: receiverPubkey,
//             lamports,
//           })
//         );

//         try {
//           txSignature = await sendTransaction(transaction, connection);
//         } catch (err: any) {
//           if (err?.message?.includes("User rejected the request")) {
//             toast.error("Transaction cancelled by user.");
//           } else {
//             toast.error("Failed to send SOL transaction. Double-check wallet or network.");
//             console.error("SOL Transaction Error:", err);
//           }
//           return;
//         }
//       }

//       // USDT flow
//       else if (selectedCurrency === "USDT") {
//         // Build & send USDT transaction
//         try {
//           const usdtMintPubKey = new PublicKey(USDT_MINT);
//           const recipientPubkey = new PublicKey(SOL_RECEIVER);

//           const senderUsdtATA = await getAssociatedTokenAddress(usdtMintPubKey, publicKey);
//           const recipientUsdtATA = await getAssociatedTokenAddress(
//             usdtMintPubKey,
//             recipientPubkey
//           );

//           // Check USDT balance
//           const usdtDecimals = 6; // Adjust if different
//           const amountInSmallestUnits = Math.floor(paid * 10 ** usdtDecimals);
//           // const senderTokenAccountInfo = await connection.getTokenAccountBalance(senderUsdtATA);

//           // const userUsdtBalance = parseInt(senderTokenAccountInfo?.value?.amount || "0", 10);
//           // if (userUsdtBalance < amountInSmallestUnits) {
//           //   toast.error("Insufficient USDT balance to complete this transaction.");
//           //   return;
//           // }

//           // Prepare instructions
//           const transaction = new Transaction();
//           const recipientATAInfo = await connection.getAccountInfo(recipientUsdtATA);

//           // Ensure recipient has an associated token account
//           if (!recipientATAInfo) {
//             transaction.add(
//               createAssociatedTokenAccountInstruction(
//                 publicKey, // payer
//                 recipientUsdtATA, // ATA to create
//                 recipientPubkey, // token owner
//                 usdtMintPubKey
//               )
//             );
//           }

//           // Transfer USDT
//           transaction.add(
//             createTransferInstruction(
//               senderUsdtATA,
//               recipientUsdtATA,
//               publicKey,
//               amountInSmallestUnits,
//               [],
//               TOKEN_PROGRAM_ID
//             )
//           );

//           try {
//             txSignature = await sendTransaction(transaction, connection);
//           } catch (err: any) {
//             if (err?.message?.includes("User rejected the request")) {
//               toast.error("Transaction cancelled by user.");
//             } else {
//               toast.error(
//                 "Failed to send USDT transaction. Double-check wallet or network."
//               );
//               console.error("❌ USDT Transaction Error:", err);
//             }
//             return;
//           }
//         } catch (err: any) {
//           console.error("❌ USDT Setup Error:", err);
//           toast.error("Something went wrong preparing the USDT transaction.");
//           return;
//         }
//       }

//       // 7. CONFIRM TRANSACTION
//       try {
//         const latestBlockHash = await connection.getLatestBlockhash();
//         const confirmationResult = await connection.confirmTransaction({
//           signature: txSignature,
//           blockhash: latestBlockHash.blockhash,
//           lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
//         });

//         // If confirmation fails or is not "finalized", we can handle accordingly
//         if (confirmationResult.value.err) {
//           toast.error(
//             "Transaction not confirmed on-chain. Please check your wallet or explorer."
//           );
//           return;
//         }
//       } catch (err: any) {
//         console.error("Transaction confirmation error:", err);
//         toast.error(
//           "Transaction broadcasted, but confirmation failed. Check your wallet or Solana explorer."
//         );
//         return;
//       }

//       toast.success(`${selectedCurrency} transaction confirmed! Tx: ${txSignature.slice(0, 16)}...`);

//       // 8. CREATE SERVER-SIDE SLIP RECORD
//       try {
//         const res = await fetch("/api/slip/buy", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             walletAddress: publicKey.toBase58(),
//             currency: selectedCurrency,
//             amountPaid: paid,
//             wuslePurchased: wusleAmount,
//             txSignature,
//           }),
//         });
//         const data = await res.json();

//         if (res.ok) {
//           setSlip(data.slip);
//           setShowReceipt(true);
//           // Refresh user stats after purchase
//           refreshUserStats();
//         } else {
//           toast.error(data.error || "Error creating slip on the server. Our apologies!");
//         }
//       } catch (serverErr: any) {
//         console.error("Slip creation error:", serverErr);
//         toast.error("Purchase transaction succeeded, but slip creation failed on server.");
//       }
//     } catch (outerErr: any) {
//       console.error("handleBuyNow outer error:", outerErr);
//       toast.error("Uh oh, something unexpected happened. See console for details.");
//     }
//   }

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <div className="relative w-full py-4 max-w-[600px] mx-auto bg-gradient-to-br from-purple-900 to-purple-500 rounded-lg transition-all duration-300">
//         {/* Title / Stage Info */}
//         <div className="text-center mt-2">
//           <h2 className="font-bold text-lg sm:text-xl uppercase text-white">
//             $WUSLE PRESALE
//           </h2>
//           {presaleData && (
//             <>
//               <h2 className="font-bold text-lg sm:text-xl uppercase text-white">IS NOW LIVE!</h2>
//               <h3 className="font-bold text-md sm:text-xl mt-1 text-white">
//                 STAGE {presaleData.currentStage}/{presaleData.stages.length}
//               </h3>
//               <p className="text-xs sm:text-lg mt-4 text-gray-200">
//                 Liquidity At Launch: {presaleData.liquidityAtLaunch} USDT
//               </p>
//             </>
//           )}
//         </div>

//         {/* Countdown */}
//         {presaleData ? (
//           <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-black mx-4 md:mx-8">
//             {["days", "hours", "minutes", "seconds"].map((unit) => (
//               <div key={unit} className="flex flex-col items-center">
//                 <div className="bg-white/40 text-white rounded-lg hover:bg-white/20 transition flex flex-col items-center justify-center w-[70px] h-[60px] sm:w-[90px] sm:h-[70px] md:w-[100px] md:h-[80px] lg:w-[120px] lg:h-[100px]">
//                   <span className="font-bold text-xl sm:text-2xl md:text-3xl">
//                     {countdown[unit as keyof typeof countdown]}
//                   </span>
//                   <span className="text-white text-sm sm:text-base uppercase mt-2">
//                     {unit === "days"
//                       ? "Days"
//                       : unit === "hours"
//                       ? "Hrs"
//                       : unit === "minutes"
//                       ? "Mins"
//                       : "Secs"}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-center text-white mt-2">Loading Presale Data...</p>
//         )}

//         {/* Progress & Stage Markers */}
//         <div className="mt-4 px-2 sm:px-8">
//           <div className="relative px-2">
//             <div className="relative w-full h-8 mb-0">
//               {presaleData &&
//                 getStageMarkers().map((m, idx) => {
//                   let arrowColor, textColor;
//                   if (m.status === "completed") {
//                     arrowColor = "border-t-green-500";
//                     textColor = "text-green-500";
//                   } else if (m.status === "current") {
//                     arrowColor = "border-t-yellow-500";
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
//                       <span className={`text-xs font-bold mb-1 ${textColor}`}>{m.label}</span>
//                       <div
//                         className={`${
//                           isMobile6 ? "w-2 h-1" : "w-3 h-1"
//                         } border-l-4 border-r-4 border-l-transparent border-r-transparent border-t-8 ${arrowColor}`}
//                       />
//                     </div>
//                   );
//                 })}
//             </div>
//             <div
//               className={`w-full bg-white/20 rounded-full overflow-hidden ${
//                 isMobile6 ? "h-5" : "h-4"
//               }`}
//             >
//               <div
//                 className="h-full bg-purple-200 rounded-full transition-all duration-300"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* WUSLE Sold / USDT Raised */}
//         <div className="flex flex-col gap-1 text-xs sm:text-sm text-purple-200 mt-2 px-4 sm:px-8">
//           <div className="flex justify-between items-center">
//             <span className="text-white text-sm sm:text-lg md:text-md lg:text-lg">WUSLE SOLD</span>
//             <span className="text-white text-xs sm:text-base md:text-md lg:text-lg">
//               {presaleData
//                 ? (
//                     stagesTotalRaisedSoFar() / (presaleData.wusleRate || 0.0037)
//                   ).toLocaleString(undefined, { maximumFractionDigits: 0 })
//                 : 0}{" "}
//               / {presaleData ? presaleData.totalWusleSupply : 0}
//             </span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-white text-xs sm:text-sm md:text-sm">
//               USDT RAISED
//             </span>
//             <span className="text-white text-xs sm:text-sm md:text-sm lg:text-lg">
//               ${presaleData ? stagesTotalRaisedSoFar().toLocaleString() : "0"}
//             </span>
//           </div>
//         </div>

//         {/* Rate Info */}
//         {presaleData && (
//           <div className="mt-3 sm:mt-4 mx-4 sm:mx-8 py-2 sm:py-4 px-3 sm:px-4 text-center transition bg-white/15 rounded-lg">
//             <p className="text-white mb-1 text-sm sm:text-lg md:text-xl lg:text-2xl">
//               1 WUSLE = {presaleData.wusleRate.toFixed(4)} USDT
//             </p>
//             <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg">
//               LISTING PRICE: {presaleData.listingPrice.toFixed(3)} USDT
//             </p>
//           </div>
//         )}

//         {/* Your Purchased WUSLE */}
//         {session?.user && (
//           <div className="flex font-bold justify-between items-center mt-3 px-3 text-sm mx-4 sm:mx-14">
//             <span className="text-white uppercase text-xs sm:text-md md:text-lg lg:text-xl">
//               YOUR PURCHASED WUSLE
//             </span>
//             <span className="font-bold text-white text-xs sm:text-md md:text-lg lg:text-xl">
//               {(userStats?.wuslePurchased ?? 0).toFixed(5)}
//             </span>
//           </div>
//         )}

//         {/* Currency Selection */}
//         <div className="mt-4 flex mx-4 sm:mx-8 items-center justify-between gap-2">
//           <Button
//             onClick={() => setSelectedCurrency("USDT")}
//             variant={selectedCurrency === "USDT" ? "default" : "outline"}
//             className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/2 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
//               selectedCurrency === "USDT" ? "border-2 border-black" : "border-none"
//             }`}
//           >
//             <Image src={Usdt} alt="USDT" width={24} height={24} />
//             <span>USDT</span>
//           </Button>

//           <Button
//             onClick={() => setSelectedCurrency("SOL")}
//             variant={selectedCurrency === "SOL" ? "default" : "outline"}
//             className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/2 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
//               selectedCurrency === "SOL" ? "border-2 border-black" : "border-none"
//             }`}
//           >
//             <Image src={Sol} alt="Sol" width={24} height={24} />
//             <span>SOL</span>
//           </Button>
//         </div>

//         {/* Payment Row */}
//         <div className="mt-4 mx-4 sm:mx-12 flex justify-between gap-4 px-4 sm:px-8">
//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full">
//               <Input
//                 type="number"
//                 placeholder="YOU PAY"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className="bg-white/20 text-white placeholder:text-white/90 placeholder:pr-10 py-2 sm:py-5 rounded-lgl w-full text-sm sm:text-sm md:text-md placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-lg"
//               />
//               <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
//                 <Image
//                   src={selectedCurrency === "USDT" ? Usdt : Sol}
//                   alt={selectedCurrency}
//                   width={24}
//                   height={24}
//                 />
//               </span>
//             </div>
//           </div>
//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full">
//               <Input
//                 type="number"
//                 value={wusleAmount.toFixed(4)}
//                 disabled
//                 placeholder="YOU GET"
//                 className="bg-white/20 text-white placeholder:pr-10 py-2 sm:py-5 rounded-lgl w-full text-sm sm:text-sm md:text-md placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-lg"
//               />
//               <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                 <Image
//                   src={Wusle}
//                   alt="WUSLE"
//                   width={32}
//                   height={32}
//                   className="rounded-full border bg-white border-purple-700 p-1"
//                 />
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Connect Wallet / Buy Section */}
//         <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-7 pb-2">
//           {!session?.user ? (
//             <Button
//               onClick={() => setShowLogin(true)}
//               className="w-1/2 py-5 text-black font-bold bg-pink-100 hover:bg-purple-900 rounded-lg text-sm sm:text-lg md:text-md lg:text-lg"
//             >
//               CONNECT YOUR WALLET
//             </Button>
//           ) : (
//             <WalletMultiButton
//               style={{
//                 width: "100%",
//                 maxWidth: "600px",
//                 padding: "16px",
//                 color: "black",
//                 fontWeight: "bold",
//                 background: "#fce2ff",
//                 borderRadius: "10px",
//                 border: "none",
//                 cursor: "pointer",
//                 transition: "all 0.3s ease-in-out",
//                 fontSize: "clamp(14px, 2vw, 16px)",
//                 textAlign: "center",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 display: "flex",
//               }}
//             >
//               {connected ? "CONNECTED" : "CONNECT WALLET"}
//             </WalletMultiButton>
//           )}

//           {session?.user && publicKey && connected && (
//             <Button
//               onClick={handleBuyNow}
//               className="w-1/3 px-8 py-6 text-black font-bold bg-pink-100 hover:bg-white/80 rounded-lg text-sm sm:text-base md:text-lg"
//             >
//               BUY NOW
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Login Modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />

//       {/* Receipt Modal */}
//       <ReceiptModal show={showReceipt} slip={slip} onClose={() => setShowReceipt(false)} />
//     </div>
//   );
// }





// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import Image from "next/image";
// import { useSession } from "next-auth/react";
// import dynamic from "next/dynamic";

// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// /* ----------- Solana + SPL imports ----------- */
// import {
//   Connection,
//   SystemProgram,
//   Transaction,
//   PublicKey,
//   LAMPORTS_PER_SOL,
// } from "@solana/web3.js";

// import {
//   getAssociatedTokenAddress,
//   createTransferInstruction,
//   createAssociatedTokenAccountInstruction,
//   TOKEN_PROGRAM_ID,
// } from "@solana/spl-token";

// /* ----------- Ethers v6 imports ----------- */
// import { BrowserProvider, parseEther } from "ethers";

// /* ----------- Local assets & hooks ----------- */
// import Usdt from "../../assets/Images/usdt.png";
// import Sol from "../../assets/Images/sol.png";
// import Ether from "../../assets/Images/eth.webp"; // ETH logo
// import Wusle from "../../assets/Images/logo.jpeg";
// import { useIsMobile } from "@/hooks/useIsMobile";

// /* ----------- Our components ----------- */
// import LoginModal from "@/components/LoginModal";
// const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
// import lottieAnimation from "@/assets/Images/wave.json";
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

// export default function PresaleInterface() {
//   const { data: session } = useSession();

//   // Solana wallet
//   const { publicKey, connected: solanaConnected, sendTransaction } = useWallet();

//   // Ethereum wallet states
//   const [ethAddress, setEthAddress] = useState("");
//   const [connectedEth, setConnectedEth] = useState(false);

//   const isMobile6 = useIsMobile(475);

//   // Presale data
//   const [presaleData, setPresaleData] = useState<PresaleAPIResponse | null>(null);

//   // UI states
//   const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [progress, setProgress] = useState(0);
//   const [amount, setAmount] = useState("");
//   const [selectedCurrency, setSelectedCurrency] = useState<"USDT" | "SOL" | "ETH">("USDT");
//   const [wusleAmount, setWusleAmount] = useState(0);
//   const [showLogin, setShowLogin] = useState(false);
//   const [showReceipt, setShowReceipt] = useState(false);
//   const [slip, setSlip] = useState<SlipData | null>(null);
//   const [userStats, setUserStats] = useState<{ wuslePurchased: number; spent: number } | null>(null);

//   /* ---------------- Fetch user stats if logged in ---------------- */
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

//   useEffect(() => {
//     if (session?.user) refreshUserStats();
//   }, [session]);

//   /* ---------------- Fetch Presale data from your backend ---------------- */
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
//     // If you want to re-fetch periodically:
//     // const interval = setInterval(fetchPresale, 30000);
//     // return () => clearInterval(interval);
//   }, []);

//   /* ---------------- Update progress bar from presale data ---------------- */
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
//     const totalRaisedSoFar = sumCompleted + active.raised;
//     const frac = (totalRaisedSoFar / totalCap) * 100;
//     setProgress(Math.min(Math.max(frac, 0), 100));
//   }, [presaleData]);

//   /* ---------------- Countdown timer for presale end ---------------- */
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

//   /* ---------------- Calculate WUSLE from user input for any currency ---------------- */
//   useEffect(() => {
//     if (!presaleData) return;
//     const rate = presaleData.wusleRate || 0.0037;
//     const val = parseFloat(amount || "0") / rate;
//     setWusleAmount(isNaN(val) ? 0 : val);
//   }, [amount, presaleData]);

//   /* ---------------- Stage Markers & total raised helper ---------------- */
//   function getStageMarkers() {
//     if (!presaleData) return [];
//     const { stages, currentStage } = presaleData;
//     if (!stages.length) return [];

//     const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
//     let cumulative = 0;

//     return stages.map((st) => {
//       const pct = (cumulative / totalCap) * 100;
//       cumulative += st.target;
//       let status = "upcoming";
//       if (st.stageNumber < currentStage) {
//         status = "completed";
//       } else if (st.stageNumber === currentStage) {
//         status = "current";
//       }
//       return { pct, label: `${st.stageNumber}`, status };
//     });
//   }

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

//   /* ---------------- Connect to ETH wallet using Ethers v6 (MetaMask) ---------------- */
//   async function connectEthWallet() {
//     try {
//       if (!window.ethereum) {
//         alert("MetaMask (or another web3 wallet) was not found in your browser.");
//         return;
//       }
  
//       // Request account access directly via the provider
//       const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
//       if (!accounts || !accounts.length) {
//         throw new Error("No Ethereum accounts found.");
//       }
  
//       // Now create Ethers v6 provider
//       const provider = new BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();
//       const address = await signer.getAddress();
  
//       setEthAddress(address);
//       setConnectedEth(true);
//       console.log("ETH wallet connected:", address);
//     } catch (err: any) {
//       console.error("Error connecting ETH wallet:", err);
//       alert(err.message || "Failed to connect Ethereum wallet.");
//     }
//   }
  

//   /* ---------------- Main Buy function for USDT / SOL (Solana) or ETH (Ethereum) ---------------- */
//   async function handleBuyNow() {
//     if (!session?.user) {
//       alert("You must be logged in to buy.");
//       return;
//     }

//     const paid = parseFloat(amount || "0");
//     if (paid <= 0) {
//       alert("Enter a valid amount to buy!");
//       return;
//     }

//     // SOL or USDT => Use Solana approach
//     if (selectedCurrency === "SOL" || selectedCurrency === "USDT") {
//       if (!publicKey || !solanaConnected) {
//         alert("Connect your Solana wallet first!");
//         return;
//       }

//       try {
//         const connection = new Connection("https://api.devnet.solana.com", "confirmed");
//         let txSignature = "";

//         if (selectedCurrency === "SOL") {
//           // --------------------- SOL Transfer ---------------------
//           const receiverAddress = "Fc71HwgDJTAfMMd1f7zxZq1feBM67A3pZQQwoFbLWx6G"; // Your receiver SOL address
//           const receiverPubkey = new PublicKey(receiverAddress);
//           const lamports = Math.floor(paid * LAMPORTS_PER_SOL);

//           const transaction = new Transaction().add(
//             SystemProgram.transfer({
//               fromPubkey: publicKey,
//               toPubkey: receiverPubkey,
//               lamports,
//             })
//           );

//           txSignature = await sendTransaction(transaction, connection);

//           // Confirm the transaction
//           const latestBlockHash = await connection.getLatestBlockhash();
//           await connection.confirmTransaction({
//             signature: txSignature,
//             blockhash: latestBlockHash.blockhash,
//             lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
//           });
//           console.log("SOL devnet transaction confirmed:", txSignature);
//         } else {
//           // --------------------- USDT (SPL) Transfer ---------------------
//           const USDT_MINT = new PublicKey("EVPcoys7wBBAEecUhAXPbjGiwjVgs8Zz3tbMijqqJxNm"); // devnet minted USDT
//           const recipientPubkey = new PublicKey("Fc71HwgDJTAfMMd1f7zxZq1feBM67A3pZQQwoFbLWx6G");

//           // Associated Token Accounts
//           const senderUsdtATA = await getAssociatedTokenAddress(USDT_MINT, publicKey);
//           const recipientUsdtATA = await getAssociatedTokenAddress(USDT_MINT, recipientPubkey);

//           // USDT typically 6 decimals
//           const usdtDecimals = 6;
//           const amountInSmallestUnits = Math.floor(paid * Math.pow(10, usdtDecimals));

//           const transaction = new Transaction();

//           // If recipient ATA doesn't exist, create it
//           const recipientATAInfo = await connection.getAccountInfo(recipientUsdtATA);
//           if (!recipientATAInfo) {
//             transaction.add(
//               createAssociatedTokenAccountInstruction(
//                 publicKey,
//                 recipientUsdtATA,
//                 recipientPubkey,
//                 USDT_MINT
//               )
//             );
//           }

//           // Transfer instruction
//           transaction.add(
//             createTransferInstruction(
//               senderUsdtATA,
//               recipientUsdtATA,
//               publicKey,
//               amountInSmallestUnits,
//               [],
//               TOKEN_PROGRAM_ID
//             )
//           );

//           txSignature = await sendTransaction(transaction, connection);
//           console.log("USDT devnet transaction signature:", txSignature);

//           // Confirm
//           const latestBlockHash = await connection.getLatestBlockhash();
//           await connection.confirmTransaction({
//             signature: txSignature,
//             blockhash: latestBlockHash.blockhash,
//             lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
//           });
//           console.log("USDT devnet transaction confirmed:", txSignature);
//         }

//         // Once on-chain is confirmed, create your slip
//         const res = await fetch("/api/slip/buy", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             walletAddress: publicKey.toBase58(),
//             currency: selectedCurrency,
//             amountPaid: paid,
//             wuslePurchased: wusleAmount,
//             txSignature,
//           }),
//         });
//         const data = await res.json();
//         if (res.ok) {
//           setSlip(data.slip);
//           setShowReceipt(true);
//         } else {
//           alert(data.error || "Error creating slip");
//         }
//       } catch (err) {
//         console.error("handleBuyNow (SOL/USDT) error:", err);
//         alert("Error with SOL/USDT transaction or slip creation.");
//       }
//     }

//     // ETH => Use Ethereum approach
//     else if (selectedCurrency === "ETH") {
//       if (!connectedEth || !ethAddress) {
//         alert("Connect your ETH wallet first!");
//         return;
//       }

//       try {
//         // Use Ethers v6
//         const provider = new BrowserProvider(window.ethereum);
//         const signer = await provider.getSigner();

//         // The address receiving ETH
//         const receiverAddress = "0xF3A9E226CFbFa60Cdb3b30CbEfC7db120f82266d"; // replace with your own
//         // Convert input amount to wei
//         const txResponse = await signer.sendTransaction({
//           to: receiverAddress,
//           value: parseEther(amount), // parseEther from v6
//         });

//         console.log("ETH transaction sent:", txResponse.hash);

//         // Wait for confirmation
//         const receipt = await txResponse.wait();
//         console.log("ETH transaction confirmed:", receipt.transactionHash);

//         // Once on-chain confirmed, create slip
//         const res = await fetch("/api/slip/buy", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             walletAddress: ethAddress,
//             currency: "ETH",
//             amountPaid: paid,
//             wuslePurchased: wusleAmount,
//             txSignature: receipt.transactionHash,
//           }),
//         });
//         const data = await res.json();
//         if (res.ok) {
//           setSlip(data.slip);
//           setShowReceipt(true);
//         } else {
//           alert(data.error || "Error creating slip");
//         }
//       } catch (err: any) {
//         console.error("handleBuyNow (ETH) error:", err);
//         alert(err.message || "Error with ETH transaction or slip creation.");
//       }
//     }
//   }

//   /* ------------------------------ UI Render ------------------------------ */
//   return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <div className="relative w-full py-4 max-w-[600px] mx-auto bg-gradient-to-br from-purple-900 to-purple-500 rounded-lg transition-all duration-300">
//         {/* Title / Stage Info */}
//         <div className="text-center mt-2">
//           <h2 className="font-bold text-lg sm:text-xl uppercase text-white">
//             $WUSLE PRESALE
//           </h2>
//           {presaleData && (
//             <>
//               <h2 className="font-bold text-lg sm:text-xl uppercase text-white">
//                 IS NOW LIVE!
//               </h2>
//               <h3 className="font-bold text-md sm:text-xl mt-1 text-white">
//                 STAGE {presaleData.currentStage}/{presaleData.stages.length}
//               </h3>
//               <p className="text-xs sm:text-lg mt-4 text-gray-200">
//                 Liquidity At Launch: {presaleData.liquidityAtLaunch} USDT
//               </p>
//             </>
//           )}
//         </div>

//         {/* Countdown */}
//         {presaleData ? (
//           <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-black mx-4 md:mx-8">
//             {["days", "hours", "minutes", "seconds"].map((unit) => (
//               <div key={unit} className="flex flex-col items-center">
//                 <div className="bg-white/40 text-white rounded-lg hover:bg-white/20 transition flex flex-col items-center justify-center w-[70px] h-[60px] sm:w-[90px] sm:h-[70px] md:w-[100px] md:h-[80px] lg:w-[120px] lg:h-[100px]">
//                   <span className="font-bold text-xl sm:text-2xl md:text-3xl">
//                     {countdown[unit as keyof typeof countdown]}
//                   </span>
//                   <span className="text-white text-sm sm:text-base uppercase mt-2">
//                     {unit === "days"
//                       ? "Days"
//                       : unit === "hours"
//                       ? "Hrs"
//                       : unit === "minutes"
//                       ? "Mins"
//                       : "Secs"}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-center text-white mt-2">Loading Presale Data...</p>
//         )}

//         {/* Progress & Stage Markers */}
//         <div className="mt-4 px-2 sm:px-8">
//           <div className="relative px-2">
//             <div className="relative w-full h-8 mb-0">
//               {presaleData &&
//                 getStageMarkers().map((m, idx) => {
//                   let arrowColor, textColor;
//                   if (m.status === "completed") {
//                     arrowColor = "border-t-green-500";
//                     textColor = "text-green-500";
//                   } else if (m.status === "current") {
//                     arrowColor = "border-t-yellow-500";
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
//                         className={`${
//                           isMobile6 ? "w-2 h-1" : "w-3 h-1"
//                         } border-l-4 border-r-4 border-l-transparent border-r-transparent border-t-8 ${arrowColor}`}
//                       />
//                     </div>
//                   );
//                 })}
//             </div>
//             <div
//               className={`w-full bg-white/20 rounded-full overflow-hidden ${
//                 isMobile6 ? "h-5" : "h-4"
//               }`}
//             >
//               <div
//                 className="h-full bg-purple-200 rounded-full transition-all duration-300"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* WUSLE Sold / USDT Raised */}
//         <div className="flex flex-col gap-1 text-xs sm:text-sm text-purple-200 mt-2 px-4 sm:px-8">
//           <div className="flex justify-between items-center">
//             <span className="text-white text-sm sm:text-lg md:text-md lg:text-lg">
//               WUSLE SOLD
//             </span>
//             <span className="text-white text-xs sm:text-base md:text-md lg:text-lg">
//               {presaleData
//                 ? (
//                     stagesTotalRaisedSoFar() /
//                     (presaleData.wusleRate || 0.0037)
//                   ).toLocaleString(undefined, { maximumFractionDigits: 0 })
//                 : 0}{" "}
//               / {presaleData ? presaleData.totalWusleSupply : 0}
//             </span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-white text-xs sm:text-sm md:text-sm">
//               USDT RAISED
//             </span>
//             <span className="text-white text-xs sm:text-sm md:text-sm lg:text-lg">
//               ${presaleData ? stagesTotalRaisedSoFar().toLocaleString() : "0"}
//             </span>
//           </div>
//         </div>

//         {/* Rate Info */}
//         {presaleData && (
//           <div className="mt-3 sm:mt-4 mx-4 sm:mx-8 py-2 sm:py-4 px-3 sm:px-4 text-center transition bg-white/15 rounded-lg">
//             <p className="text-white mb-1 text-sm sm:text-lg md:text-xl lg:text-2xl">
//               1 WUSLE = {presaleData.wusleRate.toFixed(4)} USDT
//             </p>
//             <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg">
//               LISTING PRICE: {presaleData.listingPrice.toFixed(3)} USDT
//             </p>
//           </div>
//         )}

//         {/* Your Purchased WUSLE */}
//         {session?.user && (
//           <div className="flex font-bold justify-between items-center mt-3 px-3 text-sm mx-4 sm:mx-14">
//             <span className="text-white uppercase text-xs sm:text-md md:text-lg lg:text-xl">
//               YOUR PURCHASED WUSLE
//             </span>
//             <span className="font-bold text-white text-xs sm:text-md md:text-lg lg:text-xl">
//               {(userStats?.wuslePurchased ?? 0).toFixed(5)}
//             </span>
//           </div>
//         )}

//         {/* Currency Selection */}
//         <div className="mt-4 flex mx-4 sm:mx-8 items-center justify-between gap-2">
//           <Button
//             onClick={() => setSelectedCurrency("USDT")}
//             variant={selectedCurrency === "USDT" ? "default" : "outline"}
//             className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/3 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
//               selectedCurrency === "USDT" ? "border-2 border-black" : "border-none"
//             }`}
//           >
//             <Image src={Usdt} alt="USDT" width={24} height={24} />
//             <span>USDT</span>
//           </Button>

//           <Button
//             onClick={() => setSelectedCurrency("SOL")}
//             variant={selectedCurrency === "SOL" ? "default" : "outline"}
//             className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/3 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
//               selectedCurrency === "SOL" ? "border-2 border-black" : "border-none"
//             }`}
//           >
//             <Image src={Sol} alt="Sol" width={24} height={24} />
//             <span>SOL</span>
//           </Button>

//           <Button
//             onClick={() => setSelectedCurrency("ETH")}
//             variant={selectedCurrency === "ETH" ? "default" : "outline"}
//             className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/3 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
//               selectedCurrency === "ETH" ? "border-2 border-black" : "border-none"
//             }`}
//           >
//             <Image src={Ether} alt="ETH" width={24} height={24} />
//             <span>ETH</span>
//           </Button>
//         </div>

//         {/* Payment Row */}
//         <div className="mt-4 mx-4 sm:mx-12 flex justify-between gap-4 px-4 sm:px-8">
//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full">
//               <Input
//                 type="number"
//                 placeholder="YOU PAY"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className="bg-white/20 text-white placeholder:text-white/90 placeholder:pr-10 py-2 sm:py-5 rounded-lgl w-full text-sm sm:text-sm md:text-md placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-lg"
//               />
//               <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
//                 {selectedCurrency === "USDT" && (
//                   <Image src={Usdt} alt="USDT" width={24} height={24} />
//                 )}
//                 {selectedCurrency === "SOL" && (
//                   <Image src={Sol} alt="SOL" width={24} height={24} />
//                 )}
//                 {selectedCurrency === "ETH" && (
//                   <Image src={Ether} alt="ETH" width={24} height={24} />
//                 )}
//               </span>
//             </div>
//           </div>

//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full">
//               <Input
//                 type="number"
//                 value={wusleAmount.toFixed(4)}
//                 disabled
//                 placeholder="YOU GET"
//                 className="bg-white/20 text-white placeholder:pr-10 py-2 sm:py-5 rounded-lgl w-full text-sm sm:text-sm md:text-md placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-lg"
//               />
//               <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                 <Image
//                   src={Wusle}
//                   alt="WUSLE"
//                   width={32}
//                   height={32}
//                   className="rounded-full border bg-white border-purple-700 p-1"
//                 />
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Connect Wallet / Buy Buttons */}
//         <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-7 pb-2">
//           {!session?.user ? (
//             <Button
//               onClick={() => setShowLogin(true)}
//               className="w-1/2 py-5 text-black font-bold bg-pink-100 hover:bg-purple-900 rounded-lg text-sm sm:text-lg md:text-md lg:text-lg"
//             >
//               CONNECT YOUR WALLET
//             </Button>
//           ) : (
//             <>
//               {/* If NOT ETH => Show Solana wallet button */}
//               {selectedCurrency !== "ETH" && (
//                 <WalletMultiButton
//                   style={{
//                     width: "100%",
//                     maxWidth: "600px",
//                     padding: "16px",
//                     color: "black",
//                     fontWeight: "bold",
//                     background: "#fce2ff",
//                     borderRadius: "10px",
//                     border: "none",
//                     cursor: "pointer",
//                     transition: "all 0.3s ease-in-out",
//                     fontSize: "clamp(14px, 2vw, 16px)",
//                     textAlign: "center",
//                     justifyContent: "center",
//                     alignItems: "center",
//                     display: "flex",
//                   }}
//                 >
//                   {solanaConnected ? "SOL WALLET CONNECTED" : "CONNECT SOL WALLET"}
//                 </WalletMultiButton>
//               )}

//               {/* If ETH => show "Connect ETH Wallet" button */}
//               {selectedCurrency === "ETH" && !connectedEth && (
//                 <Button
//                   onClick={connectEthWallet}
//                   className="w-1/2 py-5 text-black font-bold bg-pink-100 hover:bg-purple-900 rounded-lg text-sm sm:text-lg md:text-md lg:text-lg"
//                 >
//                   CONNECT ETH WALLET
//                 </Button>
//               )}

//               {/* If ETH & connected => show short address */}
//               {selectedCurrency === "ETH" && connectedEth && (
//                 <div className="text-center text-white">
//                   <p>ETH Wallet: {ethAddress.slice(0, 6)}...{ethAddress.slice(-4)}</p>
//                 </div>
//               )}
//             </>
//           )}

//           {/* The BUY NOW button (only if user is logged in). 
//               Disabled if the relevant wallet for that currency is not connected. */}
//           {session?.user && (
//             <Button
//               onClick={handleBuyNow}
//               className="w-1/3 px-8 py-6 text-black font-bold bg-pink-100 hover:bg-white/80 rounded-lg text-sm sm:text-base md:text-lg"
//               disabled={
//                 (selectedCurrency !== "ETH" && !solanaConnected) ||
//                 (selectedCurrency === "ETH" && !connectedEth)
//               }
//             >
//               BUY NOW
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Login Modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />

//       {/* Receipt Modal */}
//       <ReceiptModal show={showReceipt} slip={slip} onClose={() => setShowReceipt(false)} />
//     </div>
//   );
// }




// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
// import Usdt from "../../assets/Images/usdt.png";
// import Sol from "../../assets/Images/sol.png";
// import Wusle from "../../assets/Images/logo.jpeg";

// import { toast } from "react-hot-toast";

// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useSession } from "next-auth/react";
// import LoginModal from "@/components/LoginModal";
// import dynamic from "next/dynamic";
// import { useIsMobile } from "@/hooks/useIsMobile";

// const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
// import lottieAnimation from "@/assets/Images/wave.json";

// import {
//   Connection,
//   SystemProgram,
//   Transaction,
//   PublicKey,
//   LAMPORTS_PER_SOL,
// } from "@solana/web3.js";

// import {
//   getAssociatedTokenAddress,
//   createTransferInstruction,
//   createAssociatedTokenAccountInstruction,
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

// export default function PresaleInterface() {
//   const { data: session } = useSession();
//   const { publicKey, connected, sendTransaction } = useWallet();

//   // Single mobile breakpoint hook
//   const isMobile6 = useIsMobile(475);

//   const [presaleData, setPresaleData] = useState<PresaleAPIResponse | null>(null);
//   const [countdown, setCountdown] = useState<Countdown>({
//     days: 0,
//     hours: 0,
//     minutes: 0,
//     seconds: 0,
//   });
//   const [progress, setProgress] = useState<number>(0);
//   const [amount, setAmount] = useState<string>("");
//   const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
//   const [wusleAmount, setWusleAmount] = useState<number>(0);
//   const [showLogin, setShowLogin] = useState(false);
//   const [showReceipt, setShowReceipt] = useState(false);
//   const [slip, setSlip] = useState<SlipData | null>(null);
//   const [userStats, setUserStats] = useState<{ wuslePurchased: number; spent: number } | null>(
//     null
//   );

//   // 1. READ ENV VARIABLES
//   const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://mainnet.helius-rpc.com/?api-key=5a6666c8-29bd-4e56-ac5d-bd70076a0412";
//   const USDT_MINT = process.env.NEXT_PUBLIC_USDT_MINT || "Es9vMFrzaCERaXwz2xQSKz3F8uQDrE17eCJZzz6nA6qT";
//   const SOL_RECEIVER = process.env.NEXT_PUBLIC_SOL_RECEIVER || "Fc71HwgDJTAfMMd1f7zxZq1feBM67A3pZQQwoFbLWx6G";


//   async function refreshUserStats() {
//     try {
//       const res = await fetch("/api/user");
//       const data = await res.json();
//       if (res.ok) {
//         setUserStats(data);
//       } else {
//         toast.error(data.error || "Error fetching user stats");
//       }
//     } catch (error) {
//       console.error("Error fetching user stats:", error);
//       toast.error("Unable to fetch user stats. The gremlins must be at play!");
//     }
//   }

//   useEffect(() => {
//     if (session?.user) {
//       refreshUserStats();
//     }
//   }, [session]);

//   // 2. FETCH PRESALE DATA
//   useEffect(() => {
//     async function fetchPresale() {
//       try {
//         const res = await fetch("/api/presale");
//         const data = await res.json();
//         if (res.ok) {
//           setPresaleData(data);
//         } else {
//           toast.error(data.error || "Failed to load presale data");
//         }
//       } catch (err) {
//         console.error("Error fetching presale data:", err);
//         toast.error("Error fetching presale data. Check console for details!");
//       }
//     }

//     fetchPresale();
//     // If you want periodic refresh:
//     // const interval = setInterval(fetchPresale, 30000);
//     // return () => clearInterval(interval);
//   }, []);

//   // 3. UPDATE PROGRESS BAR
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
//     const totalRaisedSoFar = sumCompleted + active.raised;
//     const frac = (totalRaisedSoFar / totalCap) * 100;
//     setProgress(Math.min(Math.max(frac, 0), 100));
//   }, [presaleData]);

//   // 4. COUNTDOWN TIMER
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

//   // 5. CALCULATE WUSLE AMOUNT
//   useEffect(() => {
//     if (!presaleData) return;
//     const rate = presaleData.wusleRate || 0.0037;
//     const val = parseFloat(amount || "0") / rate;
//     setWusleAmount(isNaN(val) ? 0 : val);
//   }, [amount, presaleData]);

//   function getStageMarkers() {
//     if (!presaleData) return [];
//     const { stages, currentStage } = presaleData;
//     if (!stages.length) return [];
//     const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
//     let cumulative = 0;
//     return stages.map((st) => {
//       const pct = (cumulative / totalCap) * 100;
//       cumulative += st.target;
//       let status = "upcoming";
//       if (st.stageNumber < currentStage) {
//         status = "completed";
//       } else if (st.stageNumber === currentStage) {
//         status = "current";
//       }
//       return { pct, label: `${st.stageNumber}`, status };
//     });
//   }

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

//   // 6. HANDLE BUY TRANSACTION
//   async function handleBuyNow() {
//     try {
//       if (!session?.user) {
//         toast.error("Please log in before buying. We have WUSLE but we also like security!");
//         return;
//       }
//       if (!publicKey || !connected) {
//         toast.error("Connect your wallet first. The blockchain awaits!");
//         return;
//       }

//       const paid = parseFloat(amount || "0");
//       if (paid <= 0) {
//         toast.error("Enter a valid amount. Zero won't buy you any WUSLE!");
//         return;
//       }

//       // Solana connection
//       const connection = new Connection(SOLANA_RPC, "confirmed");
//       let txSignature = "";

//       console.log(SOLANA_RPC,USDT_MINT,SOL_RECEIVER);
      

//       // 6a. SOL flow
//       if (selectedCurrency === "SOL") {
//         const receiverPubkey = new PublicKey(SOL_RECEIVER);
//         const lamports = Math.floor(paid * LAMPORTS_PER_SOL);

//         const transaction = new Transaction().add(
//           SystemProgram.transfer({
//             fromPubkey: publicKey,
//             toPubkey: receiverPubkey,
//             lamports,
//           })
//         );
//         txSignature = await sendTransaction(transaction, connection);
//       }

//       // 6b. USDT flow
//       else if (selectedCurrency === "USDT") {
//         try {
//           const usdtMintPubKey = new PublicKey(USDT_MINT);
//           const recipientPubkey = new PublicKey(SOL_RECEIVER);

//           const senderUsdtATA = await getAssociatedTokenAddress(usdtMintPubKey, publicKey);
//           const recipientUsdtATA = await getAssociatedTokenAddress(
//             usdtMintPubKey,
//             recipientPubkey
//           );

//           const usdtDecimals = 6; // Adjust if different
//           const amountInSmallestUnits = Math.floor(paid * 10 ** usdtDecimals);

//           const transaction = new Transaction();

//           // Ensure recipient has an associated token account
//           const recipientATAInfo = await connection.getAccountInfo(recipientUsdtATA);
//           if (!recipientATAInfo) {
//             transaction.add(
//               createAssociatedTokenAccountInstruction(
//                 publicKey, // payer
//                 recipientUsdtATA, // ATA to create
//                 recipientPubkey, // token owner
//                 usdtMintPubKey
//               )
//             );
//           }

//           // Transfer USDT
//           transaction.add(
//             createTransferInstruction(
//               senderUsdtATA,
//               recipientUsdtATA,
//               publicKey,
//               amountInSmallestUnits,
//               [],
//               TOKEN_PROGRAM_ID
//             )
//           );

//           txSignature = await sendTransaction(transaction, connection);
//         } catch (err: any) {
//           console.error("❌ USDT Transaction Error:", err);
//           toast.error("Transaction failed! Something spilled in the blockchain engine.");
//           return;
//         }
//       }

//       // 7. CONFIRM TRANSACTION
//       const latestBlockHash = await connection.getLatestBlockhash();
//       await connection.confirmTransaction({
//         signature: txSignature,
//         blockhash: latestBlockHash.blockhash,
//         lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
//       });

//       toast.success(`${selectedCurrency} transaction confirmed! 🎉 Tx: ${txSignature.slice(0, 16)}...`);

//       // 8. CREATE SERVER-SIDE SLIP RECORD
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
//         // Refresh user stats after purchase
//         refreshUserStats();
//       } else {
//         toast.error(data.error || "Error creating slip on the server. Our apologies!");
//       }
//     } catch (err: any) {
//       console.error("handleBuyNow error:", err);
//       toast.error("Uh oh, transaction or slip creation failed. Check console for details.");
//     }
//   }

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <div className="relative w-full py-4 max-w-[600px] mx-auto bg-gradient-to-br from-purple-900 to-purple-500 rounded-lg transition-all duration-300">
//         {/* Title / Stage Info */}
//         <div className="text-center mt-2">
//           <h2 className="font-bold text-lg sm:text-xl uppercase text-white">
//             $WUSLE PRESALE
//           </h2>
//           {presaleData && (
//             <>
//               <h2 className="font-bold text-lg sm:text-xl uppercase text-white">IS NOW LIVE!</h2>
//               <h3 className="font-bold text-md sm:text-xl mt-1 text-white">
//                 STAGE {presaleData.currentStage}/{presaleData.stages.length}
//               </h3>
//               <p className="text-xs sm:text-lg mt-4 text-gray-200">
//                 Liquidity At Launch: {presaleData.liquidityAtLaunch} USDT
//               </p>
//             </>
//           )}
//         </div>

//         {/* Countdown */}
//         {presaleData ? (
//           <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-black mx-4 md:mx-8">
//             {["days", "hours", "minutes", "seconds"].map((unit) => (
//               <div key={unit} className="flex flex-col items-center">
//                 <div className="bg-white/40 text-white rounded-lg hover:bg-white/20 transition flex flex-col items-center justify-center w-[70px] h-[60px] sm:w-[90px] sm:h-[70px] md:w-[100px] md:h-[80px] lg:w-[120px] lg:h-[100px]">
//                   <span className="font-bold text-xl sm:text-2xl md:text-3xl">
//                     {countdown[unit as keyof typeof countdown]}
//                   </span>
//                   <span className="text-white text-sm sm:text-base uppercase mt-2">
//                     {unit === "days"
//                       ? "Days"
//                       : unit === "hours"
//                       ? "Hrs"
//                       : unit === "minutes"
//                       ? "Mins"
//                       : "Secs"}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-center text-white mt-2">Loading Presale Data...</p>
//         )}

//         {/* Progress & Stage Markers */}
//         <div className="mt-4 px-2 sm:px-8">
//           <div className="relative px-2">
//             <div className="relative w-full h-8 mb-0">
//               {presaleData &&
//                 getStageMarkers().map((m, idx) => {
//                   let arrowColor, textColor;
//                   if (m.status === "completed") {
//                     arrowColor = "border-t-green-500";
//                     textColor = "text-green-500";
//                   } else if (m.status === "current") {
//                     arrowColor = "border-t-yellow-500";
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
//                       <span className={`text-xs font-bold mb-1 ${textColor}`}>{m.label}</span>
//                       <div
//                         className={`${
//                           isMobile6 ? "w-2 h-1" : "w-3 h-1"
//                         } border-l-4 border-r-4 border-l-transparent border-r-transparent border-t-8 ${arrowColor}`}
//                       />
//                     </div>
//                   );
//                 })}
//             </div>
//             <div
//               className={`w-full bg-white/20 rounded-full overflow-hidden ${
//                 isMobile6 ? "h-5" : "h-4"
//               }`}
//             >
//               <div
//                 className="h-full bg-purple-200 rounded-full transition-all duration-300"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* WUSLE Sold / USDT Raised */}
//         <div className="flex flex-col gap-1 text-xs sm:text-sm text-purple-200 mt-2 px-4 sm:px-8">
//           <div className="flex justify-between items-center">
//             <span className="text-white text-sm sm:text-lg md:text-md lg:text-lg">WUSLE SOLD</span>
//             <span className="text-white text-xs sm:text-base md:text-md lg:text-lg">
//               {presaleData
//                 ? (
//                     stagesTotalRaisedSoFar() / (presaleData.wusleRate || 0.0037)
//                   ).toLocaleString(undefined, { maximumFractionDigits: 0 })
//                 : 0}{" "}
//               / {presaleData ? presaleData.totalWusleSupply : 0}
//             </span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-white text-xs sm:text-sm md:text-sm">
//               USDT RAISED
//             </span>
//             <span className="text-white text-xs sm:text-sm md:text-sm lg:text-lg">
//               ${presaleData ? stagesTotalRaisedSoFar().toLocaleString() : "0"}
//             </span>
//           </div>
//         </div>

//         {/* Rate Info */}
//         {presaleData && (
//           <div className="mt-3 sm:mt-4 mx-4 sm:mx-8 py-2 sm:py-4 px-3 sm:px-4 text-center transition bg-white/15 rounded-lg">
//             <p className="text-white mb-1 text-sm sm:text-lg md:text-xl lg:text-2xl">
//               1 WUSLE = {presaleData.wusleRate.toFixed(4)} USDT
//             </p>
//             <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg">
//               LISTING PRICE: {presaleData.listingPrice.toFixed(3)} USDT
//             </p>
//           </div>
//         )}

//         {/* Your Purchased WUSLE */}
//         {session?.user && (
//           <div className="flex font-bold justify-between items-center mt-3 px-3 text-sm mx-4 sm:mx-14">
//             <span className="text-white uppercase text-xs sm:text-md md:text-lg lg:text-xl">
//               YOUR PURCHASED WUSLE
//             </span>
//             <span className="font-bold text-white text-xs sm:text-md md:text-lg lg:text-xl">
//               {(userStats?.wuslePurchased ?? 0).toFixed(5)}
//             </span>
//           </div>
//         )}

//         {/* Currency Selection */}
//         <div className="mt-4 flex mx-4 sm:mx-8 items-center justify-between gap-2">
//           <Button
//             onClick={() => setSelectedCurrency("USDT")}
//             variant={selectedCurrency === "USDT" ? "default" : "outline"}
//             className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/2 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
//               selectedCurrency === "USDT" ? "border-2 border-black" : "border-none"
//             }`}
//           >
//             <Image src={Usdt} alt="USDT" width={24} height={24} />
//             <span>USDT</span>
//           </Button>

//           <Button
//             onClick={() => setSelectedCurrency("SOL")}
//             variant={selectedCurrency === "SOL" ? "default" : "outline"}
//             className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/2 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
//               selectedCurrency === "SOL" ? "border-2 border-black" : "border-none"
//             }`}
//           >
//             <Image src={Sol} alt="Sol" width={24} height={24} />
//             <span>SOL</span>
//           </Button>
//         </div>

//         {/* Payment Row */}
//         <div className="mt-4 mx-4 sm:mx-12 flex justify-between gap-4 px-4 sm:px-8">
//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full">
//               <Input
//                 type="number"
//                 placeholder="YOU PAY"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className="bg-white/20 text-white placeholder:text-white/90 placeholder:pr-10 py-2 sm:py-5 rounded-lgl w-full text-sm sm:text-sm md:text-md placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-lg"
//               />
//               <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
//                 <Image
//                   src={selectedCurrency === "USDT" ? Usdt : Sol}
//                   alt={selectedCurrency}
//                   width={24}
//                   height={24}
//                 />
//               </span>
//             </div>
//           </div>
//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full">
//               <Input
//                 type="number"
//                 value={wusleAmount.toFixed(4)}
//                 disabled
//                 placeholder="YOU GET"
//                 className="bg-white/20 text-white placeholder:pr-10 py-2 sm:py-5 rounded-lgl w-full text-sm sm:text-sm md:text-md placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-lg"
//               />
//               <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                 <Image
//                   src={Wusle}
//                   alt="WUSLE"
//                   width={32}
//                   height={32}
//                   className="rounded-full border bg-white border-purple-700 p-1"
//                 />
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Connect Wallet / Buy Section */}
//         <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-7 pb-2">
//           {!session?.user ? (
//             <Button
//               onClick={() => setShowLogin(true)}
//               className="w-1/2 py-5 text-black font-bold bg-pink-100 hover:bg-purple-900 rounded-lg text-sm sm:text-lg md:text-md lg:text-lg"
//             >
//               CONNECT YOUR WALLET
//             </Button>
//           ) : (
//             <WalletMultiButton
//               style={{
//                 width: "100%",
//                 maxWidth: "600px",
//                 padding: "16px",
//                 color: "black",
//                 fontWeight: "bold",
//                 background: "#fce2ff",
//                 borderRadius: "10px",
//                 border: "none",
//                 cursor: "pointer",
//                 transition: "all 0.3s ease-in-out",
//                 fontSize: "clamp(14px, 2vw, 16px)",
//                 textAlign: "center",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 display: "flex",
//               }}
//             >
//               {connected ? "CONNECTED" : "CONNECT WALLET"}
//             </WalletMultiButton>
//           )}

//           {session?.user && publicKey && connected && (
//             <Button
//               onClick={handleBuyNow}
//               className="w-1/3 px-8 py-6 text-black font-bold bg-pink-100 hover:bg-white/80 rounded-lg text-sm sm:text-base md:text-lg"
//             >
//               BUY NOW
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Login Modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />

//       {/* Receipt Modal */}
//       <ReceiptModal show={showReceipt} slip={slip} onClose={() => setShowReceipt(false)} />
//     </div>
//   );
// }







// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
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

// import {
//   Connection,
//   SystemProgram,
//   Transaction,
//   PublicKey,
//   LAMPORTS_PER_SOL,
// } from "@solana/web3.js";

// import {
//   getAssociatedTokenAddress,
//   createTransferInstruction,
//   createAssociatedTokenAccountInstruction, // ← Add this line
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

// export default function PresaleInterface() {
//   const { data: session } = useSession();
//   const { publicKey, connected, sendTransaction } = useWallet();

//   // Single mobile breakpoint hook
//   const isMobile6 = useIsMobile(475);

//   const [presaleData, setPresaleData] = useState<PresaleAPIResponse | null>(null);
//   const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [progress, setProgress] = useState<number>(0);
//   const [amount, setAmount] = useState<string>("");
//   const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
//   const [wusleAmount, setWusleAmount] = useState<number>(0);
//   const [showLogin, setShowLogin] = useState(false);
//   const [showReceipt, setShowReceipt] = useState(false);
//   const [slip, setSlip] = useState<SlipData | null>(null);
//   const [userStats, setUserStats] = useState<{ wuslePurchased: number; spent: number } | null>(null);

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

//   useEffect(() => {
//     if (session?.user) {
//       refreshUserStats();
//     }
//   }, [session]);

//   // Fetch presale data
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
//     // Uncomment below to poll every 30 seconds if needed.
//     // const interval = setInterval(fetchPresale, 30000);
//     // return () => clearInterval(interval);
//   }, []);

//   // Update progress bar
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
//     const totalRaisedSoFar = sumCompleted + active.raised;
//     const frac = (totalRaisedSoFar / totalCap) * 100;
//     setProgress(Math.min(Math.max(frac, 0), 100));
//   }, [presaleData]);

//   // Countdown timer
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

//   // Calculate WUSLE amount based on user input
//   useEffect(() => {
//     if (!presaleData) return;
//     const rate = presaleData.wusleRate || 0.0037;
//     const val = parseFloat(amount || "0") / rate;
//     setWusleAmount(isNaN(val) ? 0 : val);
//   }, [amount, presaleData]);

//   function getStageMarkers() {
//     if (!presaleData) return [];
//     const { stages, currentStage } = presaleData;
//     if (!stages.length) return [];
//     const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
//     let cumulative = 0;
//     return stages.map((st) => {
//       const pct = (cumulative / totalCap) * 100;
//       cumulative += st.target;
//       let status = "upcoming";
//       if (st.stageNumber < currentStage) {
//         status = "completed";
//       } else if (st.stageNumber === currentStage) {
//         status = "current";
//       }
//       return { pct, label: `${st.stageNumber}`, status };
//     });
//   }
  
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
//           try {
//             const USDT_MINT = new PublicKey("EVPcoys7wBBAEecUhAXPbjGiwjVgs8Zz3tbMijqqJxNm");
//             const recipientPubkey = new PublicKey("Fc71HwgDJTAfMMd1f7zxZq1feBM67A3pZQQwoFbLWx6G");
        
//             const senderUsdtATA = await getAssociatedTokenAddress(USDT_MINT, publicKey);
//             const recipientUsdtATA = await getAssociatedTokenAddress(USDT_MINT, recipientPubkey);
        
//             const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        
//             console.log("Sender USDT ATA:", senderUsdtATA.toBase58());
//             console.log("Recipient USDT ATA:", recipientUsdtATA.toBase58());
        
//             const usdtDecimals = 6; // Confirm this matches mint
//             const amountInSmallestUnits = Math.floor(paid * Math.pow(10, usdtDecimals));
//             console.log("Amount (smallest units):", amountInSmallestUnits);
        
//             const transaction = new Transaction();
        
//             const recipientATAInfo = await connection.getAccountInfo(recipientUsdtATA);
//             if (!recipientATAInfo) {
//               console.log("Recipient ATA missing, adding ATA creation instruction...");
//               transaction.add(
//                 createAssociatedTokenAccountInstruction(
//                   publicKey, // payer
//                   recipientUsdtATA, // ATA to create
//                   recipientPubkey, // token owner
//                   USDT_MINT
//                 )
//               );
//             } else {
//               console.log("Recipient ATA exists.");
//             }
        
//             transaction.add(
//               createTransferInstruction(
//                 senderUsdtATA,
//                 recipientUsdtATA,
//                 publicKey,
//                 amountInSmallestUnits,
//                 [],
//                 TOKEN_PROGRAM_ID
//               )
//             );
        
//             console.log("Transaction constructed, sending...");
//             txSignature = await sendTransaction(transaction, connection);
//             console.log("✅ USDT Transaction Signature:", txSignature);
        
//             const latestBlockHash = await connection.getLatestBlockhash();
//             await connection.confirmTransaction({
//               signature: txSignature,
//               blockhash: latestBlockHash.blockhash,
//               lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
//             });
        
//             console.log("✅ USDT Transaction Confirmed:", txSignature);
//           } catch (err: any) {
//             console.error("❌ USDT Transaction Error:", err);
//             alert("Transaction failed: " + err.message);
//             return;
//           }
//         }
        

//       const latestBlockHash = await connection.getLatestBlockhash();
//       await connection.confirmTransaction({
//         signature: txSignature,
//         blockhash: latestBlockHash.blockhash,
//         lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
//       });
//       console.log(`${selectedCurrency} devnet transaction confirmed!`);

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
//       <div className="relative w-full py-4 max-w-[600px] mx-auto bg-gradient-to-br from-purple-900 to-purple-500 rounded-lg transition-all duration-300">
//         {/* Title / Stage Info */}
//         <div className="text-center mt-2">
//           <h2 className="font-bold text-lg sm:text-xl uppercase text-white">
//             $WUSLE PRESALE
//           </h2>
//           {presaleData && (
//             <>
//               <h2 className="font-bold text-lg sm:text-xl uppercase text-white">
//                 IS NOW LIVE!
//               </h2>
//               <h3 className="font-bold text-md sm:text-xl mt-1 text-white">
//                 STAGE {presaleData.currentStage}/{presaleData.stages.length}
//               </h3>
//               <p className="text-xs sm:text-lg mt-4 text-gray-200">
//                 Liquidity At Launch: {presaleData.liquidityAtLaunch} USDT
//               </p>
//             </>
//           )}
//         </div>

//         {/* Countdown */}
//         {presaleData ? (
//           <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-black mx-4 md:mx-8">
//             {["days", "hours", "minutes", "seconds"].map((unit) => (
//               <div key={unit} className="flex flex-col items-center">
//                 <div className="bg-white/40 text-white rounded-lg hover:bg-white/20 transition flex flex-col items-center justify-center w-[70px] h-[60px] sm:w-[90px] sm:h-[70px] md:w-[100px] md:h-[80px] lg:w-[120px] lg:h-[100px]">
//                   <span className="font-bold text-xl sm:text-2xl md:text-3xl">
//                     {countdown[unit as keyof typeof countdown]}
//                   </span>
//                   <span className="text-white text-sm sm:text-base uppercase mt-2">
//                     {unit === "days" ? "Days" : unit === "hours" ? "Hrs" : unit === "minutes" ? "Mins" : "Secs"}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-center text-white mt-2">Loading Presale Data...</p>
//         )}

//         {/* Progress & Stage Markers */}
//         <div className="mt-4 px-2 sm:px-8">
//           <div className="relative px-2">
//             <div className="relative w-full h-8 mb-0">
//               {presaleData &&
//                 getStageMarkers().map((m, idx) => {
//                   let arrowColor, textColor;
//                   if (m.status === "completed") {
//                     arrowColor = "border-t-green-500";
//                     textColor = "text-green-500";
//                   } else if (m.status === "current") {
//                     arrowColor = "border-t-yellow-500";
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
//                         className={`${isMobile6 ? "w-2 h-1" : "w-3 h-1"} border-l-4 border-r-4 border-l-transparent border-r-transparent border-t-8 ${arrowColor}`}
//                       />
//                     </div>
//                   );
//                 })}
//             </div>
//             <div className={`w-full bg-white/20 rounded-full overflow-hidden ${isMobile6 ? "h-5" : "h-4"}`}>
//               <div className="h-full bg-purple-200 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
//             </div>
//           </div>
//         </div>

//         {/* WUSLE Sold / USDT Raised */}
//         <div className="flex flex-col gap-1 text-xs sm:text-sm text-purple-200 mt-2 px-4 sm:px-8">
//           <div className="flex justify-between items-center">
//             <span className="text-white text-sm sm:text-lg md:text-md lg:text-lg">WUSLE SOLD</span>
//             <span className="text-white text-xs sm:text-base md:text-md lg:text-lg">
//               {presaleData
//                 ? (
//                     stagesTotalRaisedSoFar() / (presaleData.wusleRate || 0.0037)
//                   ).toLocaleString(undefined, { maximumFractionDigits: 0 })
//                 : 0}{" "}
//               / {presaleData ? presaleData.totalWusleSupply : 0}
//             </span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-white text-xs sm:text-sm md:text-sm">USDT RAISED</span>
//             <span className="text-white text-xs sm:text-sm md:text-sm lg:text-lg">
//               ${presaleData ? stagesTotalRaisedSoFar().toLocaleString() : "0"}
//             </span>
//           </div>
//         </div>

//         {/* Rate Info */}
//         {presaleData && (
//           <div className="mt-3 sm:mt-4 mx-4 sm:mx-8 py-2 sm:py-4 px-3 sm:px-4 text-center transition bg-white/15 rounded-lg">
//             <p className="text-white mb-1 text-sm sm:text-lg md:text-xl lg:text-2xl">
//               1 WUSLE = {presaleData.wusleRate.toFixed(4)} USDT
//             </p>
//             <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg">
//               LISTING PRICE: {presaleData.listingPrice.toFixed(3)} USDT
//             </p>
//           </div>
//         )}

//         {/* Your Purchased WUSLE */}
//         {session?.user && (
//           <div className="flex font-bold justify-between items-center mt-3 px-3 text-sm mx-4 sm:mx-14">
//             <span className="text-white uppercase text-xs sm:text-md md:text-lg lg:text-xl">
//               YOUR PURCHASED WUSLE
//             </span>
//             <span className="font-bold text-white text-xs sm:text-md md:text-lg lg:text-xl">
//               {(userStats?.wuslePurchased ?? 0).toFixed(5)}
//             </span>
//           </div>
//         )}

//         {/* Currency Selection */}
//         <div className="mt-4 flex mx-4 sm:mx-8 items-center justify-between gap-2">
//           <Button
//             onClick={() => setSelectedCurrency("USDT")}
//             variant={selectedCurrency === "USDT" ? "default" : "outline"}
//             className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/2 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
//               selectedCurrency === "USDT" ? "border-2 border-black" : "border-none"
//             }`}
//           >
//             <Image src={Usdt} alt="USDT" width={24} height={24} />
//             <span>USDT</span>
//           </Button>

//           <Button
//             onClick={() => setSelectedCurrency("SOL")}
//             variant={selectedCurrency === "SOL" ? "default" : "outline"}
//             className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/2 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
//               selectedCurrency === "SOL" ? "border-2 border-black" : "border-none"
//             }`}
//           >
//             <Image src={Sol} alt="Sol" width={24} height={24} />
//             <span>SOL</span>
//           </Button>
//         </div>

//         {/* Payment Row */}
//         <div className="mt-4 mx-4 sm:mx-12 flex justify-between gap-4 px-4 sm:px-8">
//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full">
//               <Input
//                 type="number"
//                 placeholder="YOU PAY"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className="bg-white/20 text-white placeholder:text-white/90 placeholder:pr-10 py-2 sm:py-5 rounded-lgl w-full text-sm sm:text-sm md:text-md placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-lg"
//               />
//               <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
//                 <Image src={selectedCurrency === 'USDT' ? Usdt : Sol} alt={selectedCurrency} width={24} height={24} />
//               </span>
//             </div>
//           </div>
//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full">
//               <Input
//                 type="number"
//                 value={wusleAmount.toFixed(4)}
//                 disabled
//                 placeholder="YOU GET"
//                 className="bg-white/20 text-white placeholder:pr-10 py-2 sm:py-5 rounded-lgl w-full text-sm sm:text-sm md:text-md placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-lg"
//               />
//               <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                 <Image src={Wusle} alt="WUSLE" width={32} height={32} className="rounded-full border bg-white border-purple-700 p-1" />
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Connect Wallet / Buy Section */}
//         <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-7 pb-2">
//           {!session?.user ? (
//             <Button
//               onClick={() => setShowLogin(true)}
//               className="w-1/2 py-5 text-black font-bold bg-pink-100 hover:bg-purple-900 rounded-lg text-sm sm:text-lg md:text-md lg:text-lg"
//             >
//               CONNECT YOUR WALLET
//             </Button>
//           ) : (
//             <WalletMultiButton
//               style={{
//                 width: "100%",
//                 maxWidth: "600px",
//                 padding: "16px",
//                 color: "black",
//                 fontWeight: "bold",
//                 background: "#fce2ff",
//                 borderRadius: "10px",
//                 border: "none",
//                 cursor: "pointer",
//                 transition: "all 0.3s ease-in-out",
//                 fontSize: "clamp(14px, 2vw, 16px)",
//                 textAlign: "center",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 display: "flex",
//               }}
//             >
//               {connected ? "CONNECTED" : "CONNECT WALLET"}
//             </WalletMultiButton>
//           )}

//           {session?.user && publicKey && connected && (
//             <Button
//               onClick={handleBuyNow}
//               className="w-1/3 px-8 py-6 text-black font-bold bg-pink-100 hover:bg-white/80 rounded-lg text-sm sm:text-base md:text-lg"
//             >
//               BUY NOW
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Login Modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />

//       {/* Receipt Modal */}
//       <ReceiptModal show={showReceipt} slip={slip} onClose={() => setShowReceipt(false)} />
//     </div>
//   );
// }















// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
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

// import {
//   Connection,
//   SystemProgram,
//   Transaction,
//   PublicKey,
//   LAMPORTS_PER_SOL,
// } from "@solana/web3.js";

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

// export default function PresaleInterface() {
//   const { data: session } = useSession();
//   const { publicKey, connected, sendTransaction } = useWallet();

//   // We'll keep only one mobile hook for specific breakpoints used in inline styles
//   const isMobile6 = useIsMobile(475);

//   const [presaleData, setPresaleData] = useState<PresaleAPIResponse | null>(null);
//   const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [progress, setProgress] = useState<number>(0);
//   const [amount, setAmount] = useState<string>("");
//   const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
//   const [wusleAmount, setWusleAmount] = useState<number>(0);
//   const [showLogin, setShowLogin] = useState(false);
//   const [showReceipt, setShowReceipt] = useState(false);
//   const [slip, setSlip] = useState<SlipData | null>(null);
//   const [userStats, setUserStats] = useState<{ wuslePurchased: number; spent: number } | null>(null);

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

//   useEffect(() => {
//     if (session?.user) {
//       refreshUserStats();
//     }
//   }, [session]);

//   // Fetch presale data
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
//     // Uncomment below to poll every 30 seconds if needed.
//     // const interval = setInterval(fetchPresale, 30000);
//     // return () => clearInterval(interval);
//   }, []);

//   // Update progress bar
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
//     const totalRaisedSoFar = sumCompleted + active.raised;
//     const frac = (totalRaisedSoFar / totalCap) * 100;
//     setProgress(Math.min(Math.max(frac, 0), 100));
//   }, [presaleData]);

//   // Countdown timer
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

//   // Calculate WUSLE amount based on user input
//   useEffect(() => {
//     if (!presaleData) return;
//     const rate = presaleData.wusleRate || 0.0037;
//     const val = parseFloat(amount || "0") / rate;
//     setWusleAmount(isNaN(val) ? 0 : val);
//   }, [amount, presaleData]);

//   function getStageMarkers() {
//     if (!presaleData) return [];
//     const { stages, currentStage } = presaleData;
//     if (!stages.length) return [];
//     const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
//     let cumulative = 0;
//     return stages.map((st) => {
//       const pct = (cumulative / totalCap) * 100;
//       cumulative += st.target;
//       let status = "upcoming";
//       if (st.stageNumber < currentStage) {
//         status = "completed";
//       } else if (st.stageNumber === currentStage) {
//         status = "current";
//       }
//       return { pct, label: `${st.stageNumber}`, status };
//     });
//   }
  
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
//         const USDT_MINT = new PublicKey("INSERT_YOUR_USDT_MINT_ADDRESS_HERE");
//         const recipientPubkey = new PublicKey("INSERT_USDT_RECEIVER_ADDRESS_HERE");
//         const senderUsdtATA = await getAssociatedTokenAddress(USDT_MINT, publicKey);
//         const recipientUsdtATA = await getAssociatedTokenAddress(USDT_MINT, recipientPubkey);
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

//       const latestBlockHash = await connection.getLatestBlockhash();
//       await connection.confirmTransaction({
//         signature: txSignature,
//         blockhash: latestBlockHash.blockhash,
//         lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
//       });
//       console.log(`${selectedCurrency} devnet transaction confirmed!`);

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
//       <div className="relative w-full py-4 max-w-[600px] mx-auto bg-gradient-to-br from-purple-900 to-purple-500 rounded-lg transition-all duration-300">
//         {/* Title / Stage Info */}
//         <div className="text-center mt-2">
//           <h2 className="font-bold text-lg sm:text-xl uppercase text-white">
//             $WUSLE PRESALE
//           </h2>
//           {presaleData && (
//             <>
//               <h2 className="font-bold text-lg sm:text-xl uppercase text-white">
//                 IS NOW LIVE!
//               </h2>
//               <h3 className="font-bold text-md sm:text-xl mt-1 text-white">
//                 STAGE {presaleData.currentStage}/{presaleData.stages.length}
//               </h3>
//               <p className="text-xs sm:text-lg mt-4 text-gray-200">
//                 Liquidity At Launch: {presaleData.liquidityAtLaunch} USDT
//               </p>
//             </>
//           )}
//         </div>

//         {/* (Optional) Lottie Animation */}
//         {/* <div className="w-full max-w-40 sm:max-w-52 mx-auto mb-4">
//           <Lottie animationData={lottieAnimation} loop={true} />
//         </div> */}

//         {/* Countdown */}
//         {presaleData ? (
//           <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-black mx-4 md:mx-8">
//             {["days", "hours", "minutes", "seconds"].map((unit) => (
//               <div key={unit} className="flex flex-col items-center">
//                 <div className="bg-white/40 text-white rounded-lg hover:bg-white/20 transition flex flex-col items-center justify-center w-[70px] h-[60px] sm:w-[90px] sm:h-[70px] md:w-[100px] md:h-[80px] lg:w-[120px] lg:h-[100px]">
//                   <span className="font-bold text-xl sm:text-2xl md:text-3xl">
//                     {countdown[unit as keyof typeof countdown]}
//                   </span>
//                   <span className="text-white text-sm sm:text-base uppercase mt-2">
//                     {unit === "days" ? "Days" : unit === "hours" ? "Hrs" : unit === "minutes" ? "Mins" : "Secs"}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-center text-white mt-2">Loading Presale Data...</p>
//         )}

//         {/* Progress & Stage Markers */}
//         <div className="mt-4 px-2 sm:px-8">
//           <div className="relative px-2">
//             <div className="relative w-full h-8 mb-0">
//               {presaleData &&
//                 getStageMarkers().map((m, idx) => {
//                   let arrowColor, textColor;
//                   if (m.status === "completed") {
//                     arrowColor = "border-t-green-500";
//                     textColor = "text-green-500";
//                   } else if (m.status === "current") {
//                     arrowColor = "border-t-yellow-500";
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
//                         className={`${isMobile6 ? "w-2 h-1" : "w-3 h-1"} border-l-4 border-r-4 border-l-transparent border-r-transparent border-t-8 ${arrowColor}`}
//                       />
//                     </div>
//                   );
//                 })}
//             </div>
//             <div className={`w-full bg-white/20 rounded-full overflow-hidden ${isMobile6 ? "h-5" : "h-4"}`}>
//               <div className="h-full bg-purple-200 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
//             </div>
//           </div>
//         </div>

//         {/* WUSLE Sold / USDT Raised */}
//         <div className="flex flex-col gap-1 text-xs sm:text-sm text-purple-200 mt-2 px-4 sm:px-8">
//           <div className="flex justify-between items-center">
//             <span className="text-white text-sm sm:text-lg md:text-md lg:text-lg">WUSLE SOLD</span>
//             <span className="text-white text-xs sm:text-base md:text-md lg:text-lg">
//               {presaleData
//                 ? (
//                     stagesTotalRaisedSoFar() / (presaleData.wusleRate || 0.0037)
//                   ).toLocaleString(undefined, { maximumFractionDigits: 0 })
//                 : 0}{" "}
//               / {presaleData ? presaleData.totalWusleSupply : 0}
//             </span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-white text-xs sm:text-sm md:text-sm">USDT RAISED</span>
//             <span className="text-white text-xs sm:text-sm md:text-sm lg:text-lg">
//               ${presaleData ? stagesTotalRaisedSoFar().toLocaleString() : "0"}
//             </span>
//           </div>
//         </div>

//         {/* Rate Info */}
//         {presaleData && (
//           <div className="mt-3 sm:mt-4 mx-4 sm:mx-8 py-2 sm:py-4 px-3 sm:px-4 text-center transition bg-white/15 rounded-lg">
//             <p className="text-white mb-1 text-sm sm:text-lg md:text-xl lg:text-2xl">
//               1 WUSLE = {presaleData.wusleRate.toFixed(4)} USDT
//             </p>
//             <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg">
//               LISTING PRICE: {presaleData.listingPrice.toFixed(3)} USDT
//             </p>
//           </div>
//         )}

//         {/* Your Purchased WUSLE */}
//         {session?.user && (
//           <div className="flex font-bold justify-between items-center mt-3 px-3 text-sm mx-4 sm:mx-14">
//             <span className="text-white uppercase text-xs sm:text-md md:text-lg lg:text-xl">
//               YOUR PURCHASED WUSLE
//             </span>
//             <span className="font-bold text-white text-xs sm:text-md md:text-lg lg:text-xl">
//               {(userStats?.wuslePurchased ?? 0).toFixed(5)}
//             </span>
//           </div>
//         )}

//         {/* Currency Selection */}
//         <div className="mt-4 flex mx-4 sm:mx-8 items-center justify-between gap-2">
//           <Button
//             onClick={() => setSelectedCurrency("USDT")}
//             variant={selectedCurrency === "USDT" ? "default" : "outline"}
//             className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/2 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
//               selectedCurrency === "USDT" ? "border-2 border-black" : "border-none"
//             }`}
//           >
//             <Image src={Usdt} alt="USDT" width={24} height={24} />
//             <span>USDT</span>
//           </Button>

//           <Button
//             onClick={() => setSelectedCurrency("SOL")}
//             variant={selectedCurrency === "SOL" ? "default" : "outline"}
//             className={`flex items-center justify-center space-x-2 py-3 sm:py-5 rounded-lg w-1/2 bg-white/20 text-black hover:bg-white/30 transition-colors duration-200 text-sm sm:text-sm md:text-md lg:text-lg ${
//               selectedCurrency === "SOL" ? "border-2 border-black" : "border-none"
//             }`}
//           >
//             <Image src={Sol} alt="Sol" width={24} height={24} />
//             <span>SOL</span>
//           </Button>
//         </div>

//         {/* Payment Row */}
//         <div className="mt-4 mx-4 sm:mx-12 flex justify-between gap-4 px-4 sm:px-8">
//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full">
//               <Input
//                 type="number"
//                 placeholder="YOU PAY"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className="bg-white/20 text-white placeholder:text-white/90 placeholder:pr-10 py-2 sm:py-5 rounded-lgl w-full text-sm sm:text-sm md:text-md placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-lg"
//               />
//               <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
//                 <Image src={selectedCurrency === 'USDT' ? Usdt : Sol} alt={selectedCurrency} width={24} height={24} />
//               </span>
//             </div>
//           </div>
//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full">
//               <Input
//                 type="number"
//                 value={wusleAmount.toFixed(4)}
//                 disabled
//                 placeholder="YOU GET"
//                 className="bg-white/20 text-white placeholder:pr-10 py-2 sm:py-5 rounded-lgl w-full text-sm sm:text-sm md:text-md placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-lg"
//               />
//               <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                 <Image src={Wusle} alt="WUSLE" width={32} height={32} className="rounded-full border bg-white border-purple-700 p-1" />
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Connect Wallet / Buy Section */}
//         <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-7 pb-2">
//           {!session?.user ? (
//             <Button
//               onClick={() => setShowLogin(true)}
//               className="w-1/2 py-5 text-black font-bold bg-pink-100 hover:bg-purple-900 rounded-lg text-sm sm:text-lg md:text-md lg:text-lg"
//             >
//               CONNECT YOUR WALLET
//             </Button>
//           ) : (
//             <WalletMultiButton
//               style={{
//                 width: "100%",
//                 maxWidth: "600px",
//                 padding: "16px",
//                 color: "black",
//                 fontWeight: "bold",
//                 background: "#fce2ff",
//                 borderRadius: "10px",
//                 border: "none",
//                 cursor: "pointer",
//                 transition: "all 0.3s ease-in-out",
//                 fontSize: "clamp(14px, 2vw, 16px)",
//                 textAlign: "center",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 display: "flex",
//               }}
//             >
//               {connected ? "CONNECTED" : "CONNECT WALLET"}
//             </WalletMultiButton>
//           )}

//           {session?.user && publicKey && connected && (
//             <Button
//               onClick={handleBuyNow}
//               className="w-1/3 px-8 py-6 text-black font-bold bg-pink-100 hover:bg-white/80 rounded-lg text-sm sm:text-base md:text-lg"
//             >
//               BUY NOW
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Login Modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />

//       {/* Receipt Modal */}
//       <ReceiptModal show={showReceipt} slip={slip} onClose={() => setShowReceipt(false)} />
//     </div>
//   );
// }


















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
//   const isMobile2 = useIsMobile(768);
//   const isMobile3 = useIsMobile(700);
//   const isMobile4 = useIsMobile(600);
//   const isMobile5 = useIsMobile(560);

//   const isMobile6 = useIsMobile(475);

//   // The presale data from /api/presale
//   const [presaleData, setPresaleData] = useState<PresaleAPIResponse | null>(null);

//   // Countdown, progress, user input
//   const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [progress, setProgress] = useState<number>(0);

//   const [amount, setAmount] = useState<string>("");
//   const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
//   const [wusleAmount, setWusleAmount] = useState<number>(0);

//   const [showLogin, setShowLogin] = useState(false);

//   // For receipt modal
//   const [showReceipt, setShowReceipt] = useState(false);
//   const [slip, setSlip] = useState<SlipData | null>(null);

//   // At the top of your component:
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
//   function getStageMarkers() {
//     if (!presaleData) return [];
//     const { stages, currentStage } = presaleData;
//     if (!stages.length) return [];
//     const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
    
//     let cumulative = 0;
//     return stages.map((st) => {
//       const pct = (cumulative / totalCap) * 100;
//       cumulative += st.target;
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
//     <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
//       <div
//         className="
//           relative
//           py-10 sm:py-20
//           p-2 sm:p-4
//           w-full
//           max-w-[700px]
//           bgStunColor
//           presale-card
//           transition-all
//           duration-300
//         "
//       >
//         {/* Title / Stage Info */}
//         <div className="text-center mt-2">
//           <h2 className="fontFamily text-xl sm:text-3xl uppercase text-white">
//             $WUSLE PRESALE
//           </h2>
//           {presaleData && (
//             <>
//               <h2 className="fontFamily text-xl sm:text-3xl uppercase text-white">
//                 IS NOW LIVE!
//               </h2>
//               <h3 className="fontFamily text-md sm:text-xl font-extrabold mt-1 text-white">
//                 STAGE {presaleData.currentStage}/{presaleData.stages.length}
//               </h3>
//               <p className="fontFamilyText text-xs sm:text-lg mt-4 text-gray-200">
//                 Liquidity At Launch: {presaleData.liquidityAtLaunch} USDT
//               </p>
//             </>
//           )}
//         </div>
//         {/* Lottie Animation */}
//         <div className="w-full max-w-40 sm:max-w-52 mx-auto mb-4">
//           <Lottie animationData={lottieAnimation} loop={true} />
//         </div>

//         {/* Countdown */}
//         {presaleData ? (
//           <div className={`mt-4 grid text-center grid-cols-4  text-black ${isMobile6 ? "mx 8" : "mx-12"}`}>
//             {["days", "hours", "minutes", "seconds"].map((unit) => (
//               <div key={unit} className="flex flex-col items-center">
//                 <div className={`bg-white rounded-2xl hover:bg-white/20 transition flex items-center justify-center ${
//                   isMobile2
//                     ? isMobile3
//                       ? isMobile4
//                         ? isMobile5
//                           ? isMobile6
//                             ? "w-[60px] h-[50px]"
//                             : "w-[70px] h-[60px]"
//                           : "w-[90px] h-[60px]"
//                         : "w-[100px] h-[80px]"
//                       : "w-[120px] h-[100px]"
//                     : "w-[120px] h-[100px]"
//                 }`}>
//                   <span className="fontFamily text-3xl sm:text-[48px]">
//                     {countdown[unit as keyof typeof countdown]}
//                   </span>
//                 </div>
//                 <span className="fontFamilyText text-white text-[16px] sm:text-[25px] uppercase mt-2">
//                   {unit === "days" ? "Days" : unit === "hours" ? "Hrs" : unit === "minutes" ? "Mins" : "Secs"}
//                 </span>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-center text-white mt-2">Loading Presale Data...</p>
//         )}

//         {/* Progress + Markers */}
//         <div className="mt-4 px-2 sm:px-3">
//           <div className="relative px-2">
//             {/* Markers row */}
//             <div className="relative w-full h-8 mb-0">
//               {presaleData &&
//                 getStageMarkers().map((m, idx) => {
//                   let arrowColor;
//                   let textColor;
//                   if (m.status === "completed") {
//                     arrowColor = "border-t-green-500";
//                     textColor = "text-green-500";
//                   } else if (m.status === "current") {
//                     arrowColor = "border-t-yellow-500";
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
//                           ${isMobile6 ? "w-2 h-1" : "w-3 h-1"}
//                           border-l-4 border-r-4
//                           border-l-transparent border-r-transparent
//                           border-t-8 ${arrowColor}
//                         `}
//                       />
//                     </div>
//                   );
//                 })}
//             </div>
//             {/* Progress bar */}
//             <div className={`w-full  bg-white/20 rounded-full overflow-hidden ${isMobile6 ? "h-5" : "h-10"}`}>
//               <div
//                 className="h-full bg-purple-200 rounded-full transition-all duration-300"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* WUSLE SOLD / USDT RAISED */}
//         <div className="flex flex-col gap-1 text-xs sm:text-sm text-purple-200 mt-2 px-3">
//           <div className="flex justify-between">
//             <span className={`fontFamilyText text-white ${isMobile6 ? "text-sm" : (isMobile4 ? "text-[17px]" : "text-2xl")}`}>WUSLE SOLD</span>
//             <span className={`fontFamily text-white  ${isMobile6 ? "text-[12px]" : (isMobile4 ? "text-[15px]" : "text-xl")}`}>
//               {presaleData
//                 ? (
//                     stagesTotalRaisedSoFar() /
//                     (presaleData.wusleRate || 0.0037)
//                   ).toLocaleString(undefined, { maximumFractionDigits: 0 })
//                 : 0}{" "}
//               / {presaleData ? presaleData.totalWusleSupply : 0}
//             </span>
//           </div>
//           <div className="flex justify-between">
//             <span className={`fontFamilyText text-white ${isMobile6 ? "text-xs" : (isMobile4 ? "text-xs" : "text-sm")}`}>USDT RAISED</span>
//             <span className={`fontFamilyText text-white ${isMobile6 ? "text-xs" : (isMobile4 ? "text-md" : "text-xl")}`}>
//               ${presaleData ? stagesTotalRaisedSoFar().toLocaleString() : "0"}
//             </span>
//           </div>
//         </div>

//         {/* Rate Info */}
//         {presaleData && (
//           <div className="mt-3 sm:mt-4 mx-2 sm:mx-3 py-2 sm:py-3 px-3 sm:px-4 text-center transition">
//             <p className={`fontFamilyText   text-white mb-1 ${isMobile6 ? "text-sm" : (isMobile4 ? "text-[18px]" : "text-2xl")}`}>
//               1 WUSLE = {presaleData.wusleRate.toFixed(4)} USDT
//             </p>
//             <p className={`fontFamilyText  text-white ${isMobile6 ? "text-[10px]" : (isMobile4 ? "text-[13px]" : "text-lg")}`}>
//               LISTING PRICE: {presaleData.listingPrice.toFixed(3)} USDT
//             </p>
//           </div>
//         )}

//         {/* "YOUR PURCHASED WUSLE" placeholder */}
//         {session?.user  && (
//           <div className="flex justify-between items-center mt-3 px-3 text-sm">
//             <span className={`fontFamilyText text-white uppercase ${isMobile6 ? "text-xs" : (isMobile4 ? "text-[18px]" : "text-2xl")}`}>
//               YOUR PURCHASED WUSLE
//             </span>
//             <span className={`fontFamily  text-white ${isMobile6 ? "text-xs" : (isMobile4 ? "text-[18px]" : "text-2xl")}`}>
//               {(userStats?.wuslePurchased ?? 0).toFixed(5)}
//             </span>
//           </div>
//         )}

//         {/* Currency selection */}
//         <div className="mt-4 flex items-center justify-between gap-2 px-4 sm:px-8">
//           <Button
//             onClick={() => setSelectedCurrency("USDT")}
//             variant={selectedCurrency === "USDT" ? "default" : "outline"}
//             className={`
//               fontFamily  flex items-center justify-center space-x-2 py-6 sm:py-9 rounded-2xl
//               bg-white text-black hover:bg-white/30 transition-colors duration-200 w-1/2
//               ${selectedCurrency === "USDT" ? "border-2 border-black" : "border-none"}
//              ${isMobile6 ? "text-sm" : (isMobile4 ? "text-[18px]" : "text-2xl")}` }
//           >
//             <Image src={Usdt} alt="USDT" width={isMobile6 ? 30 : 36} height={isMobile6 ? 30 : 36} />
//             <span>USDT</span>
//           </Button>
//           <Button
//             onClick={() => setSelectedCurrency("SOL")}
//             variant={selectedCurrency === "SOL" ? "default" : "outline"}
//             className={`
//               fontFamily flex items-center justify-center space-x-2 py-6 sm:py-9 rounded-2xl
//               bg-white text-black hover:bg-white/30 transition-colors duration-200 w-1/2
//               ${selectedCurrency === "SOL" ? "border-2 border-black" : "border-none"}
//               ${isMobile6 ? "text-sm" : (isMobile4 ? "text-[18px]" : "text-2xl")}`}
//           >
//             <Image src={Sol} alt="Sol" width={isMobile6 ? 28 : 36} height={isMobile6 ? 28 : 36} />
//             <span>SOL</span>
//           </Button>
//         </div>

//         {/* Payment row */}
//         <div className="mt-4 flex justify-between gap-4 px-4 sm:px-8">
//           {/* YOU PAY */}
//           <div className="flex flex-col w-1/2">
//             <div className="relative w-full">
//               <Input
//                 type="number"
//                 placeholder="YOU PAY"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className={`
//                   fontFamily bg-white placeholder:text-black placeholder:pr-10
//                    py-6 sm:py-9 rounded-2xl
//                   w-full
//                  ${isMobile6 ? "text-sm placeholder:text-[10px]" : (isMobile4 ? "text-[18px] placeholder:text-xl" : "text-2xl placeholder:text-xl")}`}
//               />
//               <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
//                 <Image
//                   src={selectedCurrency === 'USDT' ? Usdt : Sol}
//                   alt={selectedCurrency}
//                   width={isMobile6 ? 24 : 36} height={isMobile6 ? 24 : 36}
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
//                 className={`
//                   fontFamily text-black  py-6 sm:py-9 pr-14 rounded-2xl
//                   placeholder:text-black  w-full
//                  ${isMobile6 ? "placeholder:text-[10px]" : (isMobile4 ? "placeholder:text-xl" : "placeholder:text-xl")}`}
//               />
//               <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                 <Image
//                   src={Wusle}
//                   alt="WUSLE"
//                   width={isMobile6 ? 24 : 36} height={isMobile6 ? 24 : 36}
//                   className={`rounded-full  border bg-white border-purple-700 ${isMobile6 ? "py-[2px]" : (isMobile4 ? "py-[6px]" : "py-[6px]")}`}
//                 />
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Connect wallet / buy / login section */}
//         <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-7 pb-2">
//           {!session?.user ? (
//             <Button
//               onClick={() => setShowLogin(true)}
//               className={`fontFamily w-[90%] py-8 text-black font-bold bg-white hover:bg-purple-900 rounded-2xl ${isMobile6 ? "text-sm" : (isMobile4 ? "text-[18px]" : "text-2xl")}`}
//             >
//               CONNECT YOUR WALLET
//             </Button>
//           ) : (
//             <WalletMultiButton
//               style={{
//                 fontFamily: "", // Replace if needed
//                 width: isMobile6
//                 ? "250px"
//                 : isMobile5
//                   ? "350px"
//                   : isMobile4
//                     ? "400px"
//                     : isMobile3
//                       ? "450px"
//                       : isMobile2
//                         ? "500px"
//                         : isMobile
//                           ? "550px"
//                           : "600px",
//                 padding: "32px 0", // py-8 = 32px top/bottom
//                 color: "black",
//                 fontWeight: "bold",
//                 background: "white",
//                 borderRadius: "16px", // rounded-2xl ≈ 16px
//                 border: "none",
//                 cursor: "pointer",
//                 transition: "all 0.3s ease-in-out",
//                 fontSize: isMobile6
//                   ? "14px" // text-sm ≈ 14px
//                   : isMobile4
//                     ? "18px"
//                     : "24px", // text-2xl ≈ 24px
//                 textAlign: "center",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 display: "flex",
//               }}
//             >
//               {connected ? "CONNECTED" : "CONNECT WALLET"}
//             </WalletMultiButton>

//           )}

//           {session?.user && publicKey && connected && (
//             <Button
//               onClick={handleBuyNow}
//               className="w-full sm:w-auto px-8 py-4 text-white font-bold bg-purple-600 hover:bg-purple-700 animate-heartbeat rounded-full text-sm sm:text-base"
//             >
//               BUY NOW
//             </Button>
//           )}
//         </div>
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



