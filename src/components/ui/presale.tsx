"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

import Usdt from "../../assets/Images/usdt.png";
import Sol from "../../assets/Images/sol.png";
import Wusle from "../../assets/Images/logo.jpeg";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSession } from "next-auth/react";
import LoginModal from "@/components/LoginModal";

// For real SOL transactions on devnet:
import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

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
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function PresaleInterface() {
  const { data: session } = useSession();
  const { publicKey, connected, sendTransaction } = useWallet();

  // The presale data from /api/presale
  const [presaleData, setPresaleData] = useState<PresaleAPIResponse | null>(null);

  const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState<number>(0);

  const [amount, setAmount] = useState<string>("0");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
  const [wusleAmount, setWusleAmount] = useState<number>(0);

  const [showLogin, setShowLogin] = useState(false);

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

    // optional: poll every 30s
    // const interval = setInterval(() => {
    //   fetchPresale();
    // }, 30000);
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

    // sum completed
    let sumCompleted = 0;
    for (const st of stages) {
      if (st.stageNumber < currentStage) {
        sumCompleted += st.target;
      }
    }
    const partial = active.raised;
    const totalRaisedSoFar = sumCompleted + partial;

    const fraction = (totalRaisedSoFar / totalCap) * 100;
    setProgress(Math.min(Math.max(fraction, 0), 100));
  }, [presaleData]);

  // 3) Local countdown to endsAt
  useEffect(() => {
    if (!presaleData) return;
    let endsAt = new Date(presaleData.endsAt).getTime();

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

  // 4) Recalculate WUSLE from "amount"
  useEffect(() => {
    if (!presaleData) return;
    const rate = presaleData.wusleRate || 0.0037;
    const val = parseFloat(amount || "0") / rate;
    setWusleAmount(isNaN(val) ? 0 : val);
  }, [amount, presaleData]);

  // Markers for the progress bar
  function getStageMarkers() {
    if (!presaleData) return [];
    const { stages } = presaleData;
    if (!stages.length) return [];

    let totalCap = stages.reduce((acc, s) => acc + s.target, 0);
    let cumulative = 0;
    const markers = [];
    for (const st of stages) {
      cumulative += st.target;
      let fraction = (cumulative / totalCap) * 100;
      markers.push({ pct: fraction, label: `Stage ${st.stageNumber}` });
    }
    return markers;
  }

  // Summation for "WUSLE Sold" or "USDT raised" so far
  function stagesTotalRaisedSoFar() {
    if (!presaleData) return 0;
    const { stages, currentStage } = presaleData;
    const active = stages.find((s) => s.stageNumber === currentStage);
    if (!active) return 0;

    let completed = 0;
    for (const st of stages) {
      if (st.stageNumber < currentStage) {
        completed += st.target;
      }
    }
    return completed + active.raised;
  }

  // The buy slip function
  async function handleBuyNow() {
    try {
      // 1) check auth
      if (!session?.user) {
        alert("You must be logged in.");
        return;
      }
      // 2) check wallet
      if (!publicKey || !connected) {
        alert("Connect your wallet first!");
        return;
      }

      const paid = parseFloat(amount || "0");
      if (paid <= 0) {
        alert("Enter a valid amount!");
        return;
      }

      // possibly do SOL devnet transaction if selectedCurrency === "SOL"
      let txSignature = "";
      if (selectedCurrency === "SOL") {
        const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        const receiverAddress = "YOUR_DEVNET_PUBKEY_HERE"; // e.g. "Fc71Hw..."
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
        console.log("Transaction signature:", txSignature);

        // confirm transaction
        const latestBlockHash = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
          signature: txSignature,
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        });
        console.log("SOL devnet transaction confirmed!");
      } else {
        // USDT path => skip on-chain
        console.log("Simulating USDT purchase, no devnet transaction done.");
      }

      // create slip via /api/slip/buy
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
        alert(`Purchase successful!\nRedeem Code: ${data.slip.redeemCode}`);
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
        {/* Title / Stage Info */}
        <div className="text-center mt-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold drop-shadow-lg uppercase tracking-wider text-white">
            $WUSLE PRESALE
          </h2>
          {presaleData && (
            <>
              <p className="text-sm sm:text-base mt-1 text-gray-200 font-bold">
                LIQUIDITY AT LAUNCH: 2,222,222 USDT
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
        <div className="mt-5 px-3">
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
                : 0}
              {" / ???"}
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
        <div className="text-center mt-3 text-sm">
          <span className="text-purple-200 uppercase text-xs">YOUR PURCHASED WUSLE</span>
          <br />
          <span className="font-bold text-xl text-white">0</span>
        </div>

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
              <span className="text-white text-xl">
                <Image
                  src={Wusle}
                  alt="WUSLE"
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              </span>
            </div>
          </div>
        </div>

        {/* Connect wallet / buy / login section */}
        <div className="mt-5 flex flex-col items-center gap-3 pb-2">
          {!session?.user ? (
            <Button
              onClick={() => setShowLogin(true)}
              className="px-6 py-3 text-white font-bold bg-purple-900 hover:bg-purple-700"
            >
              CONNECT YOUR WALLET
            </Button>
          ) : (
            <WalletMultiButton className="wallet-adapter-button text-white font-bold ">
              CONNECT WALLET
            </WalletMultiButton>
          )}

          {/* Show BUY NOW only if user & wallet connected */}
          {session?.user && publicKey && connected && (
            <Button
              onClick={handleBuyNow}
              className="px-16 py-6 text-white font-bold bg-purple-600 hover:bg-purple-700"
            >
              BUY NOW
            </Button>
          )}
        </div>
      </div>

      {/* The login modal */}
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}







// "use client";

// import { useState, useEffect } from "react";
// import { io, Socket } from "socket.io-client";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Progress } from "@/components/ui/progress";
// import Image from "next/image";

// import Usdt from "../../assets/Images/usdt.png";
// import Sol from "../../assets/Images/sol.png";
// import Wusle from "../../assets/Images/logo.jpeg";

// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useSession } from "next-auth/react";
// import LoginModal from "@/components/LoginModal";

// // For real SOL transactions on devnet:
// import {
//   Connection,
//   SystemProgram,
//   Transaction,
//   PublicKey,
//   LAMPORTS_PER_SOL,
// } from "@solana/web3.js";

// interface StageData {
//   stageNumber: number;
//   target: number;
//   raised: number;
//   startTime: string;
//   endTime: string;
//   rate: number;
//   listingPrice: number;
// }

// interface PresalePayload {
//   stages: StageData[];
//   currentStage: number;
//   endsAt: string;
//   wusleRate: number;
//   listingPrice: number;
// }

// interface Countdown {
//   days: number;
//   hours: number;
//   minutes: number;
//   seconds: number;
// }

// export default function PresaleInterface() {
//   const { data: session } = useSession();
//   const { publicKey, connected, sendTransaction } = useWallet();

//   // Real-time presale data from the socket
//   const [presaleData, setPresaleData] = useState<PresalePayload | null>(null);

//   // Local states for countdown, progress, user input
//   const [countdown, setCountdown] = useState<Countdown>({
//     days: 0,
//     hours: 0,
//     minutes: 0,
//     seconds: 0,
//   });
//   const [progress, setProgress] = useState<number>(0);

//   const [amount, setAmount] = useState<string>("0");
//   const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
//   const [wusleAmount, setWusleAmount] = useState<number>(0);

//   // Show login modal
//   const [showLogin, setShowLogin] = useState(false);

//   // --- 1) Initialize Socket.io to get presale data
//   useEffect(() => {
//     fetch("/api/socketio").finally(() => {
//       const socket: Socket = io({
//         path: "/api/socketio",
//         transports: ["websocket"],
//       });

//       socket.on("connect", () => {
//         console.log("Connected to presale socket:", socket.id);
//       });
//       socket.on("presaleInfo", (data: PresalePayload) => {
//         console.log("Received presale info:", data);
//         setPresaleData(data);
//       });
//       socket.on("disconnect", () => {
//         console.log("Disconnected from presale socket");
//       });

//       return () => {
//         socket.disconnect();
//       };
//     });
//   }, []);

//   // --- 2) Progress Bar Calculation
//   useEffect(() => {
//     if (!presaleData) return;
//     const { stages, currentStage } = presaleData;

//     const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
//     const activeStage = stages.find((s) => s.stageNumber === currentStage);
//     if (!activeStage) {
//       setProgress(0);
//       return;
//     }

//     let sumCompleted = 0;
//     for (const st of stages) {
//       if (st.stageNumber < currentStage) {
//         sumCompleted += st.target;
//       }
//     }
//     const partial = activeStage.raised;
//     const totalRaisedSoFar = sumCompleted + partial;

//     const fraction = (totalRaisedSoFar / totalCap) * 100;
//     const clamped = Math.max(0, Math.min(100, fraction));
//     setProgress(Number(clamped.toFixed(2)));
//   }, [presaleData]);

//   // --- 3) Countdown Timer
//   useEffect(() => {
//     if (!presaleData) return;
//     const timer = setInterval(() => {
//       const now = Date.now();
//       const end = new Date(presaleData.endsAt).getTime();
//       const diff = end - now;

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

//   // --- 4) Calculate WUSLE from user "amount" input
//   useEffect(() => {
//     if (!presaleData) return;
//     const rate = presaleData.wusleRate || 0.0037;
//     const val = parseFloat(amount || "0") / rate;
//     setWusleAmount(isNaN(val) ? 0 : val);
//   }, [amount, presaleData]);

//   // Stage markers
//   function getStageMarkers() {
//     if (!presaleData) return [];
//     const totalCap = presaleData.stages.reduce((acc, s) => acc + s.target, 0);
//     let cumulative = 0;
//     const markers: { pct: number; label: string }[] = [];

//     for (const st of presaleData.stages) {
//       cumulative += st.target;
//       const fraction = (cumulative / totalCap) * 100;
//       markers.push({ pct: fraction, label: `Stage ${st.stageNumber}` });
//     }
//     return markers;
//   }

//   // Helper to sum all completed stages + partial
//   function stagesTotalRaisedSoFar(): number {
//     if (!presaleData) return 0;
//     const { stages, currentStage } = presaleData;
//     const active = stages.find((s) => s.stageNumber === currentStage);
//     if (!active) return 0;

//     let completed = 0;
//     for (const st of stages) {
//       if (st.stageNumber < currentStage) {
//         completed += st.target;
//       }
//     }
//     return completed + active.raised;
//   }

//   // --- Buy Now: slip-based system plus on-chain transaction for SOL
//   async function handleBuyNow() {
//     try {
//       if (!session?.user) {
//         alert("You must be logged in first!");
//         return;
//       }
//       if (!publicKey || !connected) {
//         alert("Connect your Solana wallet first!");
//         return;
//       }
//       const paid = parseFloat(amount || "0");
//       if (paid <= 0) {
//         alert("Please enter a valid purchase amount.");
//         return;
//       }

//       // 1) If user selected SOL, do a real devnet transaction
//       let txSignature = "";
//       if (selectedCurrency === "SOL") {
//         // devnet connection
//         const connection = new Connection("https://api.devnet.solana.com", "confirmed");

//         // your devnet receiving address
//         const receiverAddress = "Fc71HwgDJTAfMMd1f7zxZq1feBM67A3pZQQwoFbLWx6G"; // e.g. "GWMJV3..."
//         const receiverPubkey = new PublicKey(receiverAddress);

//         // convert SOL to lamports
//         const lamports = Math.floor(paid * LAMPORTS_PER_SOL);

//         // create transaction
//         const transaction = new Transaction().add(
//           SystemProgram.transfer({
//             fromPubkey: publicKey,
//             toPubkey: receiverPubkey,
//             lamports,
//           })
//         );

//         // sign & send
//         txSignature = await sendTransaction(transaction, connection);
//         console.log("Tx signature:", txSignature);

//         // confirm
//         const latestBlockHash = await connection.getLatestBlockhash();
//         await connection.confirmTransaction({
//           signature: txSignature,
//           blockhash: latestBlockHash.blockhash,
//           lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
//         });
//         console.log("SOL devnet transaction confirmed!");
//       } else {
//         // 2) If user selected USDT, we "simulate" because we don't have SPL code
//         console.log("Simulating USDT purchase, no on-chain transaction performed.");
//       }

//       // how many WUSLE user is buying
//       const w = wusleAmount; // local state

//       // 3) Create slip on server
//       const res = await fetch("/api/slip/buy", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           walletAddress: publicKey.toBase58(),
//           currency: selectedCurrency,
//           amountPaid: paid,
//           wuslePurchased: w,
//           txSignature, // optional
//         }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         alert(`
// Purchase successful!
// Redeem Code: ${data.slip.redeemCode}
// Keep this code safe to claim your WUSLE tokens later!
//         `);
//       } else {
//         alert(data.error || "Error creating slip");
//       }
//     } catch (err) {
//       console.error("handleBuyNow error:", err);
//       alert("Buy slip / transaction error!");
//     }
//   }

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <div
//         className="
//           relative
//           p-4
//           w-full
//           max-w-xl
//           bg-gradient-to-br from-[#5b0396]/70 to-[#8e31c5]/70
//           text-white
//           border border-white/20
//           shadow-[0_0_30px_rgba(128,0,255,0.6)]
//           backdrop-blur-xl
//           [clip-path:polygon(
//             0% 0%,
//             80% 0%,
//             85% 5%,
//             100% 0%,
//             100% 85%,
//             90% 100%,
//             20% 100%,
//             10% 90%,
//             0% 100%
//           )]
//           hover:scale-[1.01]
//           hover:shadow-[0_0_50px_rgba(128,0,255,0.8)]
//           transition-all
//           duration-300
//         "
//       >
//         {/* Header / Presale Info */}
//         <div className="text-center mt-2">
//           <h2 className="text-2xl sm:text-3xl font-extrabold drop-shadow-lg uppercase tracking-wider text-white">
//             $WUSLE PRESALE
//           </h2>
//           {presaleData && (
//             <>
//               <p className="text-sm sm:text-base mt-1 text-gray-200 font-bold">
//                 LIQUIDITY AT LAUNCH: 2,222,222 USDT
//               </p>
//               <p className="text-lg sm:text-xl mt-1 text-purple-100 font-semibold">
//                 IS NOW LIVE!
//               </p>
//               <p className="text-sm mt-1 text-purple-300 font-medium">
//                 STAGE {presaleData.currentStage}/{presaleData.stages.length}
//               </p>
//             </>
//           )}
//         </div>

//         {/* Countdown */}
//         {presaleData ? (
//           <div className="mt-4 grid grid-cols-4 gap-2 text-center px-2">
//             <div className="flex flex-col items-center justify-center bg-white/10
//                             rounded-lg p-2 hover:bg-white/20 transition">
//               <span className="text-2xl sm:text-3xl font-bold">
//                 {countdown.days}
//               </span>
//               <span className="text-[10px] uppercase text-purple-300">Days</span>
//             </div>
//             <div className="flex flex-col items-center justify-center bg-white/10
//                             rounded-lg p-2 hover:bg-white/20 transition">
//               <span className="text-2xl sm:text-3xl font-bold">
//                 {countdown.hours}
//               </span>
//               <span className="text-[10px] uppercase text-purple-300">Hrs</span>
//             </div>
//             <div className="flex flex-col items-center justify-center bg-white/10
//                             rounded-lg p-2 hover:bg-white/20 transition">
//               <span className="text-2xl sm:text-3xl font-bold">
//                 {countdown.minutes}
//               </span>
//               <span className="text-[10px] uppercase text-purple-300">Mins</span>
//             </div>
//             <div className="flex flex-col items-center justify-center bg-white/10
//                             rounded-lg p-2 hover:bg-white/20 transition">
//               <span className="text-2xl sm:text-3xl font-bold">
//                 {countdown.seconds}
//               </span>
//               <span className="text-[10px] uppercase text-purple-300">Secs</span>
//             </div>
//           </div>
//         ) : (
//           <p className="text-center text-white mt-2">Loading Presale Data...</p>
//         )}

//         {/* Progress bar + markers */}
//         <div className="mt-5 px-3">
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
//         </div>

//         {/* WUSLE SOLD / USDT RAISED */}
//         <div className="flex justify-between text-xs sm:text-sm text-purple-200 mt-2 px-3">
//           <div className="flex flex-col">
//             <span className="text-purple-100 font-medium">WUSLE SOLD</span>
//             <span className="font-semibold text-white">
//               {presaleData
//                 ? (
//                     stagesTotalRaisedSoFar() /
//                     (presaleData.wusleRate || 0.0037)
//                   ).toLocaleString(undefined, { maximumFractionDigits: 0 })
//                 : "0"}{" "}
//               / ???
//             </span>
//           </div>
//           <div className="flex flex-col text-right">
//             <span className="text-purple-100 font-medium">USDT RAISED</span>
//             <span className="font-semibold text-white">
//               ${presaleData ? stagesTotalRaisedSoFar().toLocaleString() : "0"}
//             </span>
//           </div>
//         </div>

//         {/* Rate Info */}
//         {presaleData && (
//           <div className="mt-4 mx-3 bg-white/10 rounded-md py-3 px-4 text-center hover:bg-white/20 transition">
//             <p className="text-xs sm:text-sm text-purple-100 mb-1 font-semibold">
//               1 WUSLE = {presaleData.wusleRate.toFixed(4)} USDT
//             </p>
//             <p className="text-[10px] sm:text-xs text-purple-200">
//               LISTING PRICE: {presaleData.listingPrice.toFixed(3)} USDT
//             </p>
//           </div>
//         )}

//         {/* "YOUR PURCHASED WUSLE" placeholder */}
//         <div className="text-center mt-3 text-sm">
//           <span className="text-purple-200 uppercase text-xs">YOUR PURCHASED WUSLE</span>
//           <br />
//           <span className="font-bold text-xl text-white">0</span>
//         </div>

//         {/* Currency selection */}
//         <div className="mt-4 flex items-center justify-center gap-4">
//           <Button
//             onClick={() => setSelectedCurrency("USDT")}
//             variant={selectedCurrency === "USDT" ? "default" : "outline"}
//             className="
//               flex items-center justify-center space-x-2
//               bg-white/20 border-none text-white
//               hover:bg-white/30
//               transition-colors duration-200
//             "
//           >
//             <Image src={Usdt} alt="USDT" width={24} height={24} />
//             <span>USDT</span>
//           </Button>
//           <Button
//             onClick={() => setSelectedCurrency("SOL")}
//             variant={selectedCurrency === "SOL" ? "default" : "outline"}
//             className="
//               flex items-center justify-center space-x-2
//               bg-white/20 border-none text-white
//               hover:bg-white/30
//               transition-colors duration-200
//             "
//           >
//             <Image src={Sol} alt="Sol" width={24} height={24} />
//             <span>SOL</span>
//           </Button>
//         </div>

//         {/* Payment row: "You Pay" / "You Get" */}
//         <div className="mt-4 flex items-center space-x-4 px-4">
//           <div className="flex flex-col w-1/2">
//             <span className="text-[11px] text-purple-200 mb-1">YOU PAY</span>
//             <div className="flex items-center space-x-2">
//               <Input
//                 type="number"
//                 placeholder="0"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className="
//                   bg-white/20 border-none text-white placeholder-purple-300
//                   focus:ring-0
//                   backdrop-blur-md hover:bg-white/30
//                   transition-colors duration-200
//                 "
//               />
//               <span className="text-white text-xl">
//                 {selectedCurrency === "USDT" ? (
//                   <Image src={Usdt} alt="USDT" width={24} height={24} />
//                 ) : (
//                   <Image src={Sol} alt="Sol" width={24} height={24} />
//                 )}
//               </span>
//             </div>
//           </div>
//           <div className="flex flex-col w-1/2">
//             <span className="text-[11px] text-purple-200 mb-1">YOU GET</span>
//             <div className="flex items-center space-x-2">
//               <Input
//                 type="number"
//                 value={wusleAmount.toFixed(4)}
//                 disabled
//                 className="
//                   bg-white/20 border-none text-white placeholder-purple-300
//                   focus:ring-0
//                   backdrop-blur-md hover:bg-white/30
//                   transition-colors duration-200
//                 "
//               />
//               <span className="text-white text-xl">
//                 <Image
//                   src={Wusle}
//                   alt="WUSLE"
//                   width={36}
//                   height={36}
//                   className="rounded-full"
//                 />
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Connect wallet / buy / login section */}
//         <div className="mt-5 flex flex-row items-center justify-center gap-3 pb-2">
//           {!session?.user ? (
//             <Button
//               onClick={() => setShowLogin(true)}
//               className="px-6 py-3 text-white font-bold bg-purple-900 hover:bg-purple-700"
//             >
//               CONNECT YOUR WALLET
//             </Button>
//           ) : (
//             <WalletMultiButton className="wallet-adapter-button text-white font-bold ">
//               CONNECT WALLET
//             </WalletMultiButton>
//           )}

//           {/* Show BUY NOW only if user & wallet connected */}
//           {session?.user && publicKey && connected && (
//             <Button
//               onClick={handleBuyNow}
//               className="px-16 py-6 text-white font-bold bg-purple-600 hover:bg-purple-700"
//             >
//               BUY NOW
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* The login modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
//     </div>
//   );
// }








// "use client";

// import { useState, useEffect } from "react";
// import { io, Socket } from "socket.io-client";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Progress } from "@/components/ui/progress";
// import Image from "next/image";

// import Usdt from "../../assets/Images/usdt.png";
// import Sol from "../../assets/Images/sol.png";
// import Wusle from "../../assets/Images/logo.jpeg";

// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useSession } from "next-auth/react";
// import LoginModal from "@/components/LoginModal";

// // Types
// interface StageData {
//   stageNumber: number;
//   target: number;       
//   raised: number;       
//   startTime: string;    
//   endTime: string;      
//   rate: number;         
//   listingPrice: number;
// }

// interface PresalePayload {
//   stages: StageData[];
//   currentStage: number; 
//   endsAt: string;       
//   wusleRate: number;    
//   listingPrice: number;
// }

// interface Countdown {
//   days: number;
//   hours: number;
//   minutes: number;
//   seconds: number;
// }

// export default function PresaleInterface() {
//   const { data: session } = useSession();
//   const { publicKey } = useWallet();

//   // Full presale data from the socket
//   const [presaleData, setPresaleData] = useState<PresalePayload | null>(null);

//   // Local states
//   const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [progress, setProgress] = useState<number>(0);
//   const [amount, setAmount] = useState<string>("0");
//   const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
//   const [wusleAmount, setWusleAmount] = useState<number>(0);
//   const [showLogin, setShowLogin] = useState(false);

//   // 1) Initialize Socket.io
//   useEffect(() => {
//     fetch("/api/socketio").finally(() => {
//       const socket: Socket = io({ path: "/api/socketio", transports: ["websocket"] });

//       socket.on("connect", () => {
//         console.log("Connected to presale socket:", socket.id);
//       });
//       socket.on("presaleInfo", (data: PresalePayload) => {
//         console.log("Received presale info:", data);
//         setPresaleData(data);
//       });
//       socket.on("disconnect", () => {
//         console.log("Disconnected from presale socket");
//       });

//       return () => {
//         socket.disconnect();
//       };
//     });
//   }, []);

//   // 2) Multi-stage progress bar
//   useEffect(() => {
//     if (!presaleData) return;

//     const { stages, currentStage } = presaleData;
//     const totalCap = stages.reduce((acc, s) => acc + s.target, 0);

//     // Find active stage
//     const activeStage = stages.find((s) => s.stageNumber === currentStage);
//     if (!activeStage) {
//       setProgress(0);
//       return;
//     }

//     let sumOfCompleted = 0;
//     for (const st of stages) {
//       if (st.stageNumber < currentStage) {
//         sumOfCompleted += st.target;
//       }
//     }
//     const partial = activeStage.raised;
//     const totalRaisedSoFar = sumOfCompleted + partial;

//     const fraction = (totalRaisedSoFar / totalCap) * 100;
//     const clamped = Math.max(0, Math.min(100, fraction));
//     setProgress(Number(clamped.toFixed(2)));
//   }, [presaleData]);

//   // 3) Countdown
//   useEffect(() => {
//     if (!presaleData) return;
//     const timer = setInterval(() => {
//       const now = Date.now();
//       const end = new Date(presaleData.endsAt).getTime();
//       const diff = end - now;

//       if (diff <= 0) {
//         setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//       } else {
//         const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//         const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
//         const minutes = Math.floor((diff / (1000 * 60)) % 60);
//         const seconds = Math.floor((diff / 1000) % 60);
//         setCountdown({ days, hours, minutes, seconds });
//       }
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [presaleData]);

//   // 4) WUSLE calc
//   useEffect(() => {
//     if (!presaleData) return;
//     const rate = presaleData.wusleRate ?? 0.0037;
//     const val = parseFloat(amount || "0") / rate;
//     setWusleAmount(isNaN(val) ? 0 : val);
//   }, [amount, presaleData]);

//   // Stage markers
//   const getStageMarkers = () => {
//     if (!presaleData) return [];
//     const { stages } = presaleData;
//     if (!stages.length) return [];

//     const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
//     let cumulative = 0;
//     const markers = [];

//     for (const st of stages) {
//       cumulative += st.target;
//       const fraction = (cumulative / totalCap) * 100;
//       markers.push({ pct: fraction, label: `Stage ${st.stageNumber}` });
//     }
//     return markers;
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       {/* Outer wrapper - a fancy neon glow and a zigzag shape */}
//       <div
//         className="
//           relative
//           p-4
//           w-full
//           max-w-xl
//           bg-gradient-to-br from-[#5b0396]/70 to-[#8e31c5]/70
//           text-white
//           border border-white/20
//           shadow-[0_0_30px_rgba(128,0,255,0.6)]
//           backdrop-blur-xl
//           [clip-path:polygon(
//             0% 0%,
//             80% 0%,
//             85% 5%,
//             100% 0%,
//             100% 85%,
//             90% 100%,
//             20% 100%,
//             10% 90%,
//             0% 100%
//           )]
//           hover:scale-[1.01]
//           hover:shadow-[0_0_50px_rgba(128,0,255,0.8)]
//           transition-all
//           duration-300
//         "
//       >
//         {/* Title / Stage Info */}
//         <div className="text-center mt-2">
//           <h2 className="text-2xl sm:text-3xl font-extrabold drop-shadow-lg uppercase tracking-wider text-white">
//             $WUSLE PRESALE
//           </h2>
//           {presaleData && (
//             <>
//               <p className="text-sm sm:text-base mt-1 text-gray-200 font-bold">
//                 LIQUIDITY AT LAUNCH: 2,222,222 USDT
//               </p>
//               <p className="text-lg sm:text-xl mt-1 text-purple-100 font-semibold">
//                 IS NOW LIVE!
//               </p>
//               <p className="text-sm mt-1 text-purple-300 font-medium">
//                 STAGE {presaleData.currentStage}/{presaleData.stages.length}
//               </p>
//             </>
//           )}
//         </div>

//         {/* Countdown */}
//         {presaleData ? (
//           <div className="mt-4 grid grid-cols-4 gap-2 text-center px-2">
//             <div className="flex flex-col items-center justify-center bg-white/10 
//                             rounded-lg p-2 hover:bg-white/20 transition">
//               <span className="text-2xl sm:text-3xl font-bold">
//                 {countdown.days}
//               </span>
//               <span className="text-[10px] uppercase text-purple-300">Days</span>
//             </div>
//             <div className="flex flex-col items-center justify-center bg-white/10 
//                             rounded-lg p-2 hover:bg-white/20 transition">
//               <span className="text-2xl sm:text-3xl font-bold">
//                 {countdown.hours}
//               </span>
//               <span className="text-[10px] uppercase text-purple-300">Hrs</span>
//             </div>
//             <div className="flex flex-col items-center justify-center bg-white/10 
//                             rounded-lg p-2 hover:bg-white/20 transition">
//               <span className="text-2xl sm:text-3xl font-bold">
//                 {countdown.minutes}
//               </span>
//               <span className="text-[10px] uppercase text-purple-300">Mins</span>
//             </div>
//             <div className="flex flex-col items-center justify-center bg-white/10 
//                             rounded-lg p-2 hover:bg-white/20 transition">
//               <span className="text-2xl sm:text-3xl font-bold">
//                 {countdown.seconds}
//               </span>
//               <span className="text-[10px] uppercase text-purple-300">Secs</span>
//             </div>
//           </div>
//         ) : (
//           <p className="text-center text-white mt-2">Loading Presale Data...</p>
//         )}

//         {/* Multi-stage progress bar with labeled markers */}
//         <div className="mt-5 px-3">
//           <div className="relative w-full h-4 bg-white/20 rounded-full overflow-hidden">
//             <div
//               className="absolute left-0 top-0 h-full bg-purple-400 transition-all duration-300"
//               style={{ width: `${progress}%` }}
//             />
//             {getStageMarkers().map((m, idx) => (
//               <div
//                 key={idx}
//                 className="absolute flex flex-col items-center"
//                 style={{ left: `${m.pct}%` }}
//               >
//                 {/* marker line */}
//                 <div className="w-[2px] h-6 bg-white 
//                                 translate-x-[-1px] translate-y-[-10px]" />
//                 {/* label: "Stage X" */}
//                 <span
//                   className="text-[10px] text-white mt-1 
//                              whitespace-nowrap translate-x-[-50%]"
//                 >
//                   {m.label}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* "WUSLE SOLD" / "USDT RAISED" */}
//         <div className="flex justify-between text-xs sm:text-sm text-purple-200 mt-2 px-3">
//           <div className="flex flex-col">
//             <span className="text-purple-100 font-medium">WUSLE SOLD</span>
//             <span className="font-semibold text-white">
//               {(stagesTotalRaisedSoFar(presaleData) / (presaleData?.wusleRate || 0.0037))
//                 .toLocaleString(undefined, { maximumFractionDigits: 0 })}
//               {" / ???"}
//             </span>
//           </div>
//           <div className="flex flex-col text-right">
//             <span className="text-purple-100 font-medium">USDT RAISED</span>
//             <span className="font-semibold text-white">
//               $
//               {stagesTotalRaisedSoFar(presaleData).toLocaleString() || "0"}
//             </span>
//           </div>
//         </div>

//         {/* Rate Info */}
//         {presaleData && (
//           <div className="mt-4 mx-3 bg-white/10 rounded-md py-3 px-4 text-center hover:bg-white/20 transition">
//             <p className="text-xs sm:text-sm text-purple-100 mb-1 font-semibold">
//               1 WUSLE = {presaleData.wusleRate.toFixed(4)} USDT
//             </p>
//             <p className="text-[10px] sm:text-xs text-purple-200">
//               LISTING PRICE: {presaleData.listingPrice.toFixed(3)} USDT
//             </p>
//           </div>
//         )}

//         {/* YOUR PURCHASED WUSLE */}
//         <div className="text-center mt-3 text-sm">
//           <span className="text-purple-200 uppercase text-xs">YOUR PURCHASED WUSLE</span>
//           <br />
//           <span className="font-bold text-xl text-white">0</span>
//         </div>

//         {/* Currency selection */}
//         <div className="mt-4 flex items-center justify-center gap-4">
//           <Button
//             onClick={() => setSelectedCurrency("USDT")}
//             variant={selectedCurrency === "USDT" ? "default" : "outline"}
//             className="
//               flex items-center justify-center space-x-2 
//               bg-white/20 border-none text-white
//               hover:bg-white/30
//               transition-colors duration-200
//             "
//           >
//             <Image src={Usdt} alt="USDT" width={24} height={24} />
//             <span>USDT</span>
//           </Button>
//           <Button
//             onClick={() => setSelectedCurrency("SOL")}
//             variant={selectedCurrency === "SOL" ? "default" : "outline"}
//             className="
//               flex items-center justify-center space-x-2 
//               bg-white/20 border-none text-white
//               hover:bg-white/30
//               transition-colors duration-200
//             "
//           >
//             <Image src={Sol} alt="Sol" width={24} height={24} />
//             <span>SOL</span>
//           </Button>
//         </div>

//         {/* Payment row: "You Pay" / "You Get" */}
//         <div className="mt-4 flex items-center space-x-4 px-4">
//           <div className="flex flex-col w-1/2">
//             <span className="text-[11px] text-purple-200 mb-1">YOU PAY</span>
//             <div className="flex items-center space-x-2">
//               <Input
//                 type="number"
//                 placeholder="0"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className="
//                   bg-white/20 border-none text-white placeholder-purple-300
//                   focus:ring-0
//                   backdrop-blur-md hover:bg-white/30 
//                   transition-colors duration-200
//                 "
//               />
//               <span className="text-white text-xl">
//                 {selectedCurrency === "USDT" ? (
//                   <Image src={Usdt} alt="USDT" width={24} height={24} />
//                 ) : (
//                   <Image src={Sol} alt="Sol" width={24} height={24} />
//                 )}
//               </span>
//             </div>
//           </div>
//           <div className="flex flex-col w-1/2">
//             <span className="text-[11px] text-purple-200 mb-1">YOU GET</span>
//             <div className="flex items-center space-x-2">
//               <Input
//                 type="number"
//                 value={wusleAmount.toFixed(4)}
//                 disabled
//                 className="
//                   bg-white/20 border-none text-white placeholder-purple-300
//                   focus:ring-0
//                   backdrop-blur-md hover:bg-white/30 
//                   transition-colors duration-200
//                 "
//               />
//               <span className="text-white text-xl">
//                 <Image
//                   src={Wusle}
//                   alt="WUSLE"
//                   width={36}
//                   height={36}
//                   className="rounded-full"
//                 />
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Connect wallet / Login */}
//         <div className="mt-5 flex justify-center pb-2">
//           {!session?.user ? (
//             <Button
//               onClick={() => setShowLogin(true)}
//               className="wallet-adapter-button px-6 py-3 text-white font-bold bg-purple-600 hover:bg-purple-700"
//             >
//               CONNECT YOUR WALLET
//             </Button>
//           ) : (
//             <WalletMultiButton className="wallet-adapter-button px-6 py-3 text-white font-bold bg-purple-600 hover:bg-purple-700">
//               CONNECT WALLET
//             </WalletMultiButton>
//           )}
//         </div>
//       </div>

//       {/* The login modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
//     </div>
//   );
// }

// /**
//  * Helper: sums up total "USDT raised" so far (completed stages + partial for current stage).
//  */
// function stagesTotalRaisedSoFar(presaleData: PresalePayload | null): number {
//   if (!presaleData) return 0;
//   const { stages, currentStage } = presaleData;
//   const active = stages.find((s) => s.stageNumber === currentStage);
//   if (!active) return 0;

//   let completed = 0;
//   for (const st of stages) {
//     if (st.stageNumber < currentStage) {
//       completed += st.target;
//     }
//   }
//   return completed + active.raised;
// }












// "use client";

// import { useState, useEffect } from "react";
// import { io, Socket } from "socket.io-client";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Progress } from "@/components/ui/progress";
// import Image from "next/image";

// import Usdt from "../../assets/Images/usdt.png";
// import Sol from "../../assets/Images/sol.png";
// import Wusle from "../../assets/Images/logo.jpeg";

// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useSession } from "next-auth/react";
// import LoginModal from "@/components/LoginModal";

// // Data from server
// interface StageData {
//   stageNumber: number;
//   target: number;
//   raised: number;       // or 0 if not started, or =target if completed
//   startTime: string;    // might be used for countdown logic
//   endTime: string;      // might be used for countdown
//   rate: number;
//   listingPrice: number;
// }

// interface PresalePayload {
//   stages: StageData[];
//   currentStage: number;    // e.g. 1,2,3...
//   endsAt: string;          
//   wusleRate: number;       
//   listingPrice: number;    
// }

// interface Countdown {
//   days: number;
//   hours: number;
//   minutes: number;
//   seconds: number;
// }

// export default function PresaleInterface() {
//   const { data: session } = useSession();
//   const { publicKey } = useWallet();

//   // We'll store the entire presale payload now
//   const [presaleData, setPresaleData] = useState<PresalePayload | null>(null);

//   const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//   const [progress, setProgress] = useState<number>(0);

//   // Purchase input
//   const [amount, setAmount] = useState<string>("0");
//   const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
//   const [wusleAmount, setWusleAmount] = useState<number>(0);

//   const [showLogin, setShowLogin] = useState(false);

//   // 1) Socket init
//   useEffect(() => {
//     fetch("/api/socketio").finally(() => {
//       const socket: Socket = io({
//         path: "/api/socketio",
//         transports: ["websocket"],
//       });
//       socket.on("connect", () => {
//         console.log("Connected to presale socket:", socket.id);
//       });
//       socket.on("presaleInfo", (data: PresalePayload) => {
//         console.log("Received presale info:", data);
//         setPresaleData(data);
//       });
//       socket.on("disconnect", () => {
//         console.log("Disconnected from presale socket");
//       });
//       return () => socket.disconnect();
//     });
//   }, []);

//   // 2) Compute multi-stage progress
//   //    We do: totalCap = sum of all stage targets
//   //    Then find "already completed" from stages < currentStage => sum of their targets if fully completed
//   //    plus the partial "raised" in the current stage
//   useEffect(() => {
//     if (!presaleData) return;

//     const { stages, currentStage } = presaleData;
//     // 1) sum all stage targets
//     const totalCap = stages.reduce((acc, s) => acc + s.target, 0);

//     // 2) find the active stage object
//     const activeStage = stages.find((s) => s.stageNumber === currentStage);
//     if (!activeStage) {
//       setProgress(0);
//       return;
//     }

//     // 3) sumOfCompleted = sum of targets for stages < currentStage
//     //    because we assume all earlier stages are "fully raised" if we've progressed to stage i
//     let sumOfCompleted = 0;
//     for (const st of stages) {
//       if (st.stageNumber < currentStage) {
//         // that stage is fully completed
//         sumOfCompleted += st.target;
//       }
//     }

//     // partial in active stage: we read activeStage.raised
//     const partial = activeStage.raised; // e.g. 2,069,177 for stage 1

//     // totalRaisedSoFar
//     const totalRaisedSoFar = sumOfCompleted + partial;

//     // 4) fraction => ( totalRaisedSoFar / totalCap ) * 100
//     const fraction = (totalRaisedSoFar / totalCap) * 100;
//     const clamped = Math.max(0, Math.min(100, fraction));
//     setProgress(Number(clamped.toFixed(2)));
//   }, [presaleData]);

//   // 3) local countdown
//   useEffect(() => {
//     if (!presaleData) return;
//     const timer = setInterval(() => {
//       const now = Date.now();
//       const end = new Date(presaleData.endsAt).getTime();
//       const diff = end - now;

//       if (diff <= 0) {
//         setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//       } else {
//         const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//         const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
//         const minutes = Math.floor((diff / (1000 * 60)) % 60);
//         const seconds = Math.floor((diff / 1000) % 60);
//         setCountdown({ days, hours, minutes, seconds });
//       }
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [presaleData]);

//   // 4) WUSLE calc
//   useEffect(() => {
//     if (!presaleData) return;
//     const rate = presaleData.wusleRate ?? 0.0037;
//     const val = parseFloat(amount || "0") / rate;
//     setWusleAmount(isNaN(val) ? 0 : val);
//   }, [amount, presaleData]);

//   // Create stage markers for the entire presale
//   // We'll place them at (cumulative target up to stage i) / totalCap
//   const getStageMarkers = () => {
//     if (!presaleData) return [];
//     const { stages } = presaleData;
//     if (!stages.length) return [];

//     const totalCap = stages.reduce((acc, s) => acc + s.target, 0);
//     let cumulative = 0;
//     const markers = [];

//     // for each stage i
//     for (let i = 0; i < stages.length; i++) {
//       cumulative += stages[i].target;
//       const fraction = (cumulative / totalCap) * 100;
//       markers.push({ pct: fraction, label: stages[i].stageNumber });
//     }
//     return markers;
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <div
//         className="
//           relative
//           p-4
//           w-full
//           max-w-md
//           bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500
//           text-white
//           border border-white/20
//           shadow-xl
//           backdrop-blur-md
//           [clip-path:polygon(
//             0% 0%,
//             85% 0%,
//             90% 5%,
//             100% 0%,
//             100% 90%,
//             95% 100%,
//             10% 100%,
//             5% 95%,
//             0% 100%
//           )]
//         "
//       >
//         {/* Header */}
//         <div className="text-center mb-2">
//           <h2 className="text-2xl sm:text-3xl font-extrabold drop-shadow-md uppercase">
//             $WUSLE Presale
//           </h2>
//           {presaleData && (
//             <>
//               <p className="text-sm sm:text-base mt-2 text-white font-semibold">
//                 Liquidity At Launch: ??? USDT
//               </p>
//               <p className="text-lg sm:text-xl mt-2 text-purple-200 font-semibold">
//                 IS NOW LIVE!
//               </p>
//               <p className="text-sm mt-2 text-purple-300 font-medium">
//                 STAGE {presaleData.currentStage}/
//                 {presaleData.stages.length}
//               </p>
//             </>
//           )}
//         </div>

//         {/* Countdown */}
//         {presaleData ? (
//           <div className="mt-2 grid grid-cols-4 gap-2 text-center">
//             <div className="flex flex-col items-center justify-center bg-white/10 rounded-md p-2">
//               <span className="text-2xl sm:text-3xl font-bold">
//                 {countdown.days}
//               </span>
//               <span className="text-xs uppercase text-purple-300">Days</span>
//             </div>
//             <div className="flex flex-col items-center justify-center bg-white/10 rounded-md p-2">
//               <span className="text-2xl sm:text-3xl font-bold">
//                 {countdown.hours}
//               </span>
//               <span className="text-xs uppercase text-purple-300">Hrs</span>
//             </div>
//             <div className="flex flex-col items-center justify-center bg-white/10 rounded-md p-2">
//               <span className="text-2xl sm:text-3xl font-bold">
//                 {countdown.minutes}
//               </span>
//               <span className="text-xs uppercase text-purple-300">Mins</span>
//             </div>
//             <div className="flex flex-col items-center justify-center bg-white/10 rounded-md p-2">
//               <span className="text-2xl sm:text-3xl font-bold">
//                 {countdown.seconds}
//               </span>
//               <span className="text-xs uppercase text-purple-300">Secs</span>
//             </div>
//           </div>
//         ) : (
//           <p className="text-center text-white mt-2">Loading Presale Data...</p>
//         )}

//         {/* Multi-stage progress bar */}
//         <div className="mt-4 mb-2 px-2">
//           <div className="relative w-full h-3 bg-white/20 rounded-full overflow-hidden">
//             {/* fill */}
//             <div
//               className="absolute left-0 top-0 h-full bg-purple-400 transition-all duration-300"
//               style={{ width: `${progress}%` }}
//             />
//             {/* stage markers */}
//             {getStageMarkers().map((m, idx) => (
//               <div key={idx} className="absolute" style={{ left: `${m.pct}%` }}>
//                 <div className="w-[2px] h-5 bg-white translate-x-[-1px] translate-y-[-5px]" />
//                 <div
//                   className="text-xs text-white translate-x-[-50%] mt-1"
//                   style={{ transform: "translateY(1.2rem)" }}
//                 >
//                   {m.label}
//                 </div>
//               </div>
//             ))}
//           </div>
//           {/* Example of USDT raised, etc. */}
//           {/* If you want partial per stage, you'd do extra logic or just show total raised so far */}
//         </div>

//         {presaleData && (
//           <div className="mt-3 mx-2 bg-white/10 rounded-md py-2 px-3 text-center">
//             <p className="text-xs sm:text-sm text-gray-200 mb-1">
//               1 WUSLE = {presaleData.wusleRate.toFixed(4)} USDT
//             </p>
//             <p className="text-xs sm:text-sm text-gray-300">
//               LISTING PRICE: {presaleData.listingPrice.toFixed(3)} USDT
//             </p>
//           </div>
//         )}

//         {/* your purchased WUSLE (example) */}
//         <div className="text-center mt-2 text-sm">
//           <span className="text-gray-200">YOUR PURCHASED WUSLE</span>
//           <br />
//           <span className="font-bold text-lg text-white">0</span>
//         </div>

//         {/* Currency buttons */}
//         <div className="mt-3 flex items-center justify-center gap-4">
//           <Button
//             onClick={() => setSelectedCurrency("USDT")}
//             variant={selectedCurrency === "USDT" ? "default" : "outline"}
//             className="flex items-center justify-center space-x-2 bg-white/20 border-none text-white hover:bg-white/30 transition-colors duration-200"
//           >
//             <Image src={Usdt} alt="USDT" width={24} height={24} />
//             <span>USDT</span>
//           </Button>
//           <Button
//             onClick={() => setSelectedCurrency("SOL")}
//             variant={selectedCurrency === "SOL" ? "default" : "outline"}
//             className="flex items-center justify-center space-x-2 bg-white/20 border-none text-white hover:bg-white/30 transition-colors duration-200"
//           >
//             <Image src={Sol} alt="Sol" width={24} height={24} />
//             <span>SOL</span>
//           </Button>
//         </div>

//         {/* Payment row */}
//         <div className="mt-3 flex items-center space-x-4 px-2">
//           <div className="flex items-center space-x-2 w-1/2">
//             <Input
//               type="number"
//               placeholder="Enter amount"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               className="bg-white/20 border-none text-white placeholder-purple-300
//                          backdrop-blur-md hover:bg-white/30 transition-colors duration-200"
//             />
//             <span className="text-purple-200 text-xl">
//               {selectedCurrency === "USDT" ? (
//                 <Image src={Usdt} alt="USDT" width={24} height={24} />
//               ) : (
//                 <Image src={Sol} alt="Sol" width={24} height={24} />
//               )}
//             </span>
//           </div>
//           <div className="flex items-center space-x-2 w-1/2">
//             <Input
//               type="number"
//               value={wusleAmount.toFixed(4)}
//               disabled
//               className="bg-white/20 border-none text-white placeholder-purple-300
//                          backdrop-blur-md hover:bg-white/30 transition-colors duration-200"
//             />
//             <span className="text-purple-200 text-xl">
//               <Image
//                 src={Wusle}
//                 alt="WUSLE"
//                 width={40}
//                 height={40}
//                 className="rounded-full"
//               />
//             </span>
//           </div>
//         </div>

//         {/* Connect wallet / Login */}
//         <div className="mt-4 flex justify-center pb-2">
//           {!session?.user ? (
//             <Button onClick={() => setShowLogin(true)} className="wallet-adapter-button">
//               CONNECT YOUR WALLET
//             </Button>
//           ) : (
//             <WalletMultiButton className="wallet-adapter-button">
//               CONNECT WALLET
//             </WalletMultiButton>
//           )}
//         </div>
//       </div>

//       {/* The login modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
//     </div>
//   );
// }









// // components/PresaleInterface.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { io, Socket } from "socket.io-client";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Progress } from "@/components/ui/progress";
// import Image from "next/image";

// import Usdt from "../../assets/Images/usdt.png"; // USDT image
// import Sol from "../../assets/Images/sol.png";   // Solana image
// import Wusle from "../../assets/Images/logo.jpeg";

// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// import { useSession } from "next-auth/react";
// import LoginModal from "@/components/LoginModal";

// interface PresaleInfo {
//   stage: number;
//   totalStages: number;
//   endsAt: string;      // ISO string from server
//   raised: number;
//   target: number;
//   wusleRate: number;   // e.g. 0.0037
//   listingPrice: number;// e.g. 0.005
// }

// interface Countdown {
//   days: number;
//   hours: number;
//   minutes: number;
//   seconds: number;
// }

// export default function PresaleInterface() {
//   const { data: session } = useSession();
//   const { publicKey } = useWallet();

//   // We'll store real-time presale data from the server
//   const [presaleInfo, setPresaleInfo] = useState<PresaleInfo | null>(null);

//   // A local countdown to presaleInfo.endsAt
//   const [countdown, setCountdown] = useState<Countdown>({
//     days: 0,
//     hours: 0,
//     minutes: 0,
//     seconds: 0,
//   });

//   // This is for the USDT progress bar
//   const [progress, setProgress] = useState<number>(0);

//   // User input for purchase
//   const [amount, setAmount] = useState<string>("0");
//   const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
//   const [wusleAmount, setWusleAmount] = useState<number>(0);

//   // Control login modal
//   const [showLogin, setShowLogin] = useState(false);

//   // 1) Initialize Socket.io
//   useEffect(() => {
//     // Must load /api/socketio to bootstrap the server
//     fetch("/api/socketio").finally(() => {
//       console.log("Connecting to presale socket...");
      
//       const socket: Socket = io({
//         path: "/api/socketio",
//         transports: ["websocket"],
//       });

//       socket.on("connect", () => {
//         console.log("Connected to presale socket:", socket.id);
//       });

//       // Listen for "presaleInfo" from the server
//       socket.on("presaleInfo", (data: PresaleInfo) => {
//         console.log("Received presale info:", data);
//         setPresaleInfo(data);
//       });

//       socket.on("disconnect", () => {
//         console.log("Disconnected from presale socket");
//       });

//       return () => {
//         socket.disconnect();
//       };
//     });
//   }, []);

//   // 2) Recalc progress each time we get new presale data
//   useEffect(() => {
//     if (!presaleInfo) return;
//     const fraction = presaleInfo.raised / presaleInfo.target;
//     const clamped = Math.min(Math.max(fraction, 0), 1) * 100;
//     setProgress(Number(clamped.toFixed(2)));
//   }, [presaleInfo]);

//   // 3) Local countdown timer to "presaleInfo.endsAt"
//   useEffect(() => {
//     if (!presaleInfo) return;
//     const interval = setInterval(() => {
//       const now = Date.now();
//       const end = new Date(presaleInfo.endsAt).getTime();
//       const diff = end - now;

//       if (diff <= 0) {
//         // stage or presale ended
//         setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//       } else {
//         const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//         const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
//         const minutes = Math.floor((diff / (1000 * 60)) % 60);
//         const seconds = Math.floor((diff / 1000) % 60);
//         setCountdown({ days, hours, minutes, seconds });
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [presaleInfo]);

//   // 4) Recalculate WUSLE amount when user changes the "amount"
//   useEffect(() => {
//     const rate = presaleInfo?.wusleRate ?? 0.0037; // fallback if not loaded
//     const val = parseFloat(amount || "0") / rate;
//     setWusleAmount(isNaN(val) ? 0 : val);
//   }, [amount, presaleInfo]);

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <Card className="w-full max-w-lg sm:max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500">
//         <CardHeader className="text-center">
//           <CardTitle className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md">
//             $WUSLE PRESALE
//           </CardTitle>
//           {/* If presaleInfo loaded, show stage and "is live" */}
//           {presaleInfo && (
//             <>
//               <p className="text-lg sm:text-xl mt-2 text-purple-200 font-semibold">
//                 IS NOW LIVE!
//               </p>
//               <p className="text-sm mt-4 text-purple-300 font-medium">
//                 STAGE {presaleInfo.stage}/{presaleInfo.totalStages}
//               </p>
//             </>
//           )}
//         </CardHeader>

//         <CardContent className="space-y-6">
//           {/* Countdown or loading */}
//           {presaleInfo ? (
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
//               <div className="bg-white/20 rounded-lg p-4 backdrop-blur-md hover:scale-105 transition-transform duration-200">
//                 <div className="text-2xl sm:text-4xl font-bold text-white">
//                   {countdown.days}
//                 </div>
//                 <div className="text-xs sm:text-sm uppercase text-purple-300">
//                   days
//                 </div>
//               </div>
//               <div className="bg-white/20 rounded-lg p-4 backdrop-blur-md hover:scale-105 transition-transform duration-200">
//                 <div className="text-2xl sm:text-4xl font-bold text-white">
//                   {countdown.hours}
//                 </div>
//                 <div className="text-xs sm:text-sm uppercase text-purple-300">
//                   hours
//                 </div>
//               </div>
//               <div className="bg-white/20 rounded-lg p-4 backdrop-blur-md hover:scale-105 transition-transform duration-200">
//                 <div className="text-2xl sm:text-4xl font-bold text-white">
//                   {countdown.minutes}
//                 </div>
//                 <div className="text-xs sm:text-sm uppercase text-purple-300">
//                   mins
//                 </div>
//               </div>
//               <div className="bg-white/20 rounded-lg p-4 backdrop-blur-md hover:scale-105 transition-transform duration-200">
//                 <div className="text-2xl sm:text-4xl font-bold text-white">
//                   {countdown.seconds}
//                 </div>
//                 <div className="text-xs sm:text-sm uppercase text-purple-300">
//                   secs
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <p className="text-center text-white">Loading Presale Data...</p>
//           )}

//           {/* Progress Bar */}
//           <div className="space-y-4">
//             <Progress
//               value={progress}
//               className="h-2 bg-purple-300/50 rounded-full"
//             />
//             {presaleInfo && (
//               <div className="flex justify-between text-xs sm:text-sm text-purple-200">
//                 <span>USDT RAISED</span>
//                 <span>
//                   ${presaleInfo.raised.toLocaleString()} / $
//                   {presaleInfo.target.toLocaleString()}
//                 </span>
//               </div>
//             )}
//           </div>

//           {/* Token Info */}
//           {presaleInfo && (
//             <div className="bg-white/20 rounded-lg p-4 sm:p-6 text-center backdrop-blur-md hover:scale-[1.02] transition-transform duration-200">
//               <p className="text-purple-200 font-semibold text-sm sm:text-base">
//                 1 WUSLE = {presaleInfo.wusleRate.toFixed(4)} USDT
//               </p>
//               <p className="text-xs sm:text-sm mt-1 text-purple-300">
//                 LISTING PRICE: {presaleInfo.listingPrice.toFixed(4)} USDT
//               </p>
//             </div>
//           )}

//           {/* Currency Select */}
//           <div className="flex items-center justify-center space-x-4">
//             <Button
//               onClick={() => setSelectedCurrency("USDT")}
//               variant={selectedCurrency === "USDT" ? "default" : "outline"}
//               className="flex items-center justify-center space-x-2 bg-white/20 border-none text-purple-200 hover:bg-white/30 transition-colors duration-200"
//             >
//               <Image src={Usdt} alt="USDT" width={24} height={24} />
//               <span>USDT</span>
//             </Button>
//             <Button
//               onClick={() => setSelectedCurrency("SOL")}
//               variant={selectedCurrency === "SOL" ? "default" : "outline"}
//               className="flex items-center justify-center space-x-2 bg-white/20 border-none text-purple-200 hover:bg-white/30 transition-colors duration-200"
//             >
//               <Image src={Sol} alt="Solana" width={24} height={24} />
//               <span>SOL</span>
//             </Button>
//           </div>

//           {/* Purchase Inputs */}
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-2 w-1/2">
//               <Input
//                 type="number"
//                 placeholder="Enter amount"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className="bg-white/20 border-none text-white placeholder-purple-300 backdrop-blur-md hover:bg-white/30 transition-colors duration-200"
//               />
//               <span className="text-purple-200 text-xl">
//                 {selectedCurrency === "USDT" ? (
//                   <Image src={Usdt} alt="USDT" width={24} height={24} />
//                 ) : (
//                   <Image src={Sol} alt="Solana" width={24} height={24} />
//                 )}
//               </span>
//             </div>
//             <div className="flex items-center space-x-2 w-1/2">
//               <Input
//                 type="number"
//                 value={wusleAmount.toFixed(4)}
//                 disabled
//                 className="bg-white/20 border-none text-white placeholder-purple-300 backdrop-blur-md hover:bg-white/30 transition-colors duration-200"
//               />
//               <span className="text-purple-200 text-xl">
//                 <Image
//                   src={Wusle}
//                   alt="WUSLE"
//                   width={50}
//                   height={50}
//                   className="rounded-full"
//                 />
//               </span>
//             </div>
//           </div>

//           {/* Auth / Wallet Section */}
//           {!session?.user ? (
//             <div className="flex justify-center">
//               <Button
//                 onClick={() => setShowLogin(true)}
//                 className="wallet-adapter-button"
//               >
//                 LOGIN
//               </Button>
//             </div>
//           ) : (
//             <div className="flex justify-center">
//               <WalletMultiButton className="wallet-adapter-button">
//                 CONNECT WALLET
//               </WalletMultiButton>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* The login modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
//     </div>
//   );
// }










// // components/PresaleInterface.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Progress } from "@/components/ui/progress";
// import Image from "next/image";

// import Usdt from "../../assets/Images/usdt.png"; // USDT
// import Sol from "../../assets/Images/sol.png";  // Solana
// import Wusle from "../../assets/Images/logo.jpeg";

// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// import { useSession } from "next-auth/react";
// import LoginModal from "@/components/LoginModal";

// interface Countdown {
//   days: number;
//   hours: number;
//   minutes: number;
//   seconds: number;
// }

// export default function PresaleInterface() {
//   const { data: session } = useSession();

//   const [countdown, setCountdown] = useState<Countdown>({
//     days: 0,
//     hours: 17,
//     minutes: 51,
//     seconds: 56,
//   });
//   const [progress, setProgress] = useState<number>(50);
//   const [amount, setAmount] = useState<string>("0");
//   const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
//   const [wusleAmount, setWusleAmount] = useState<number>(0);

//   const [showLogin, setShowLogin] = useState(false);
//   const { publicKey } = useWallet();

//   // Countdown effect
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCountdown((prev) => {
//         if (prev.seconds > 0) {
//           return { ...prev, seconds: prev.seconds - 1 };
//         } else if (prev.minutes > 0) {
//           return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
//         } else if (prev.hours > 0) {
//           return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
//         } else if (prev.days > 0) {
//           return {
//             ...prev,
//             days: prev.days - 1,
//             hours: 23,
//             minutes: 59,
//             seconds: 59,
//           };
//         }
//         return prev;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   // Calculate WUSLE from amount
//   useEffect(() => {
//     const rate = 0.0037; 
//     const wusle = parseFloat(amount || "0") / rate;
//     setWusleAmount(isNaN(wusle) ? 0 : wusle);
//   }, [amount]);

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <Card className="w-full max-w-lg sm:max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500">
//         <CardHeader className="text-center">
//           <CardTitle className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md">
//             $WUSLE PRESALE
//           </CardTitle>
//           <p className="text-lg sm:text-xl mt-2 text-purple-200 font-semibold">
//             IS NOW LIVE!
//           </p>
//           <p className="text-sm mt-4 text-purple-300 font-medium">STAGE 1/10</p>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           {/* Countdown */}
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
//             {Object.entries(countdown).map(([key, value]) => (
//               <div
//                 key={key}
//                 className="bg-white/20 rounded-lg p-4 backdrop-blur-md hover:scale-105 transition-transform duration-200"
//               >
//                 <div className="text-2xl sm:text-4xl font-bold text-white">
//                   {value}
//                 </div>
//                 <div className="text-xs sm:text-sm uppercase text-purple-300">
//                   {key}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Progress */}
//           <div className="space-y-4">
//             <Progress value={progress} className="h-2 bg-purple-300/50 rounded-full" />
//             <div className="flex justify-between text-xs sm:text-sm text-purple-200">
//               <span>USDT RAISED</span>
//               <span>$2,069,177 / $4,110,000</span>
//             </div>
//           </div>

//           {/* Token Info */}
//           <div className="bg-white/20 rounded-lg p-4 sm:p-6 text-center backdrop-blur-md hover:scale-[1.02] transition-transform duration-200">
//             <p className="text-purple-200 font-semibold text-sm sm:text-base">
//               1 WUSLE = 0.0037 USDT
//             </p>
//             <p className="text-xs sm:text-sm mt-1 text-purple-300">
//               LISTING PRICE: 0.005 USDT
//             </p>
//           </div>

//           {/* Currency Select */}
//           <div className="flex items-center justify-center space-x-4">
//             <Button
//               onClick={() => setSelectedCurrency("USDT")}
//               variant={selectedCurrency === "USDT" ? "default" : "outline"}
//               className="flex items-center justify-center space-x-2 bg-white/20 border-none text-purple-200 hover:bg-white/30 transition-colors duration-200"
//             >
//               <Image src={Usdt} alt="USDT" width={24} height={24} />
//               <span>USDT</span>
//             </Button>
//             <Button
//               onClick={() => setSelectedCurrency("SOL")}
//               variant={selectedCurrency === "SOL" ? "default" : "outline"}
//               className="flex items-center justify-center space-x-2 bg-white/20 border-none text-purple-200 hover:bg-white/30 transition-colors duration-200"
//             >
//               <Image src={Sol} alt="Solana" width={24} height={24} />
//               <span>SOL</span>
//             </Button>
//           </div>

//           {/* Input fields */}
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-2 w-1/2">
//               <Input
//                 type="number"
//                 placeholder="Enter amount"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className="bg-white/20 border-none text-white placeholder-purple-300 backdrop-blur-md hover:bg-white/30 transition-colors duration-200"
//               />
//               <span className="text-purple-200 text-xl">
//                 {selectedCurrency === "USDT" ? (
//                   <Image src={Usdt} alt="USDT" width={24} height={24} />
//                 ) : (
//                   <Image src={Sol} alt="Solana" width={24} height={24} />
//                 )}
//               </span>
//             </div>
//             <div className="flex items-center space-x-2 w-1/2">
//               <Input
//                 type="number"
//                 value={wusleAmount.toFixed(4)}
//                 disabled
//                 className="bg-white/20 border-none text-white placeholder-purple-300 backdrop-blur-md hover:bg-white/30 transition-colors duration-200"
//               />
//               <span className="text-purple-200 text-xl">
//                 <Image src={Wusle} alt="WUSLE" width={50} height={50} className="rounded-full" />
//               </span>
//             </div>
//           </div>

//           {/* Auth / Wallet Section */}
//           {!session?.user ? (
//             <div className="flex justify-center">
//               <Button
//                 onClick={() => setShowLogin(true)}
//                 className="wallet-adapter-button"
//               >
//                 LOGIN
//               </Button>
//             </div>
//           ) : (
//             <div className="flex justify-center">
//               <WalletMultiButton
//                 children="CONNECT WALLET"
//                 className="wallet-adapter-button"
//               />
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* The login modal */}
//       <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
//     </div>
//   );
// }












// // components/PresaleInterface.jsx
// "use client";
// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Progress } from "@/components/ui/progress";
// import Image from "next/image";
// import Usdt from "../../assets/Images/usdt.png"; // USDT image
// import Sol from "../../assets/Images/sol.png"; // Solana image
// import Wusle from "../../assets/Images/logo.jpeg";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { useWalletModal } from "@solana/wallet-adapter-react-ui";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import "./wallet.css";

// interface Countdown {
//   days: number;
//   hours: number;
//   minutes: number;
//   seconds: number;
// }

// export default function PresaleInterface() {
//   const [countdown, setCountdown] = useState<Countdown>({
//     days: 0,
//     hours: 17,
//     minutes: 51,
//     seconds: 56,
//   });
//   const [progress, setProgress] = useState<number>(50);
//   const [amount, setAmount] = useState<string>("0");
//   const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
//   const [wusleAmount, setWusleAmount] = useState<number>(0);
//   const { publicKey } = useWallet();

//   const { setVisible } = useWalletModal();

//   // Countdown timer effect
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCountdown((prev) => {
//         if (prev.seconds > 0) {
//           return { ...prev, seconds: prev.seconds - 1 };
//         } else if (prev.minutes > 0) {
//           return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
//         } else if (prev.hours > 0) {
//           return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
//         } else if (prev.days > 0) {
//           return {
//             ...prev,
//             days: prev.days - 1,
//             hours: 23,
//             minutes: 59,
//             seconds: 59,
//           };
//         }
//         return prev;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   // Calculate WUSLE amount based on the entered amount
//   useEffect(() => {
//     const rate = 0.0037; // 1 WUSLE = 0.0037 USDT
//     const wusle = parseFloat(amount) / rate;
//     setWusleAmount(wusle);
//   }, [amount]);

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <Card className="w-full max-w-lg sm:max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500">
//         <CardHeader className="text-center">
//           <CardTitle className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md">
//             $WUSLE PRESALE
//           </CardTitle>
//           <p className="text-lg sm:text-xl mt-2 text-purple-200 font-semibold">
//             IS NOW LIVE!
//           </p>
//           <p className="text-sm mt-4 text-purple-300 font-medium">STAGE 1/10</p>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           {/* Countdown Timer */}
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
//             {Object.entries(countdown).map(([key, value]) => (
//               <div
//                 key={key}
//                 className="bg-white/20 rounded-lg p-4 backdrop-blur-md hover:scale-105 transition-transform duration-200"
//               >
//                 <div className="text-2xl sm:text-4xl font-bold text-white">
//                   {value}
//                 </div>
//                 <div className="text-xs sm:text-sm uppercase text-purple-300">
//                   {key}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Progress Bar */}
//           <div className="space-y-4">
//             <Progress
//               value={progress}
//               className="h-2 bg-purple-300/50 rounded-full"
//             />
//             <div className="flex justify-between text-xs sm:text-sm text-purple-200">
//               <span>USDT RAISED</span>
//               <span>$2,069,177 / $4,110,000</span>
//             </div>
//           </div>

//           {/* Token Info */}
//           <div className="bg-white/20 rounded-lg p-4 sm:p-6 text-center backdrop-blur-md hover:scale-[1.02] transition-transform duration-200">
//             <p className="text-purple-200 font-semibold text-sm sm:text-base">
//               1 WUSLE = 0.0037 USDT
//             </p>
//             <p className="text-xs sm:text-sm mt-1 text-purple-300">
//               LISTING PRICE: 0.005 USDT
//             </p>
//           </div>

//           {/* Purchase Form */}
//           <div className="space-y-6">
//             <div className="flex items-center justify-center space-x-4">
//               <Button
//                 onClick={() => setSelectedCurrency("USDT")}
//                 variant={selectedCurrency === "USDT" ? "default" : "outline"}
//                 className="flex items-center justify-center space-x-2 bg-white/20 border-none text-purple-200 hover:bg-white/30 transition-colors duration-200"
//               >
//                 <Image src={Usdt} alt="USDT" width={24} height={24} />
//                 <span>USDT</span>
//               </Button>
//               <Button
//                 onClick={() => setSelectedCurrency("SOL")}
//                 variant={selectedCurrency === "SOL" ? "default" : "outline"}
//                 className="flex items-center justify-center space-x-2 bg-white/20 border-none text-purple-200 hover:bg-white/30 transition-colors duration-200"
//               >
//                 <Image src={Sol} alt="Solana" width={24} height={24} />
//                 <span>SOL</span>
//               </Button>
//             </div>

//             {/* Inputs for Amount and WUSLE */}
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-2 w-1/2">
//                 <Input
//                   type="number"
//                   placeholder="Enter amount"
//                   value={amount}
//                   onChange={(e) => setAmount(e.target.value)}
//                   className="bg-white/20 border-none text-white placeholder-purple-300 backdrop-blur-md hover:bg-white/30 transition-colors duration-200"
//                 />
//                 <span className="text-purple-200 text-xl">
//                   {selectedCurrency === "USDT" ? (
//                     <Image src={Usdt} alt="USDT" width={24} height={24} />
//                   ) : selectedCurrency === "SOL" ? (
//                     <Image src={Sol} alt="Solana" width={24} height={24} />
//                   ) : null}
//                 </span>
//               </div>

//               <div className="flex items-center space-x-2 w-1/2">
//                 <Input
//                   type="number"
//                   value={wusleAmount.toFixed(4)}
//                   disabled
//                   className="bg-white/20 border-none text-white placeholder-purple-300 backdrop-blur-md hover:bg-white/30 transition-colors duration-200"
//                 />
//                 <span className="text-purple-200 text-xl">
//                   <Image
//                     src={Wusle}
//                     alt="WUSLE"
//                     width={50}
//                     height={50}
//                     className="rounded-full"
//                   />
//                 </span>
//               </div>
//             </div>

//             {/* Wallet Button */}

//             <div className="flex justify-center">
//               <WalletMultiButton
//                 children="CONNECT WALLET"
//                 className="wallet-adapter-button"
//               />
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
