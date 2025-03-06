// components/PresaleInterface.jsx
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Usdt from "../../assets/Images/usdt.png"; // USDT image
import Sol from "../../assets/Images/sol.png"; // Solana image
import Wusle from "../../assets/Images/logo.jpeg";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "./wallet.css";

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function PresaleInterface() {
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 17,
    minutes: 51,
    seconds: 56,
  });
  const [progress, setProgress] = useState<number>(50);
  const [amount, setAmount] = useState<string>("0");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USDT");
  const [wusleAmount, setWusleAmount] = useState<number>(0);
  const { publicKey } = useWallet();

  const { setVisible } = useWalletModal();

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return {
            ...prev,
            days: prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate WUSLE amount based on the entered amount
  useEffect(() => {
    const rate = 0.0037; // 1 WUSLE = 0.0037 USDT
    const wusle = parseFloat(amount) / rate;
    setWusleAmount(wusle);
  }, [amount]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg sm:max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md">
            $WUSLE PRESALE
          </CardTitle>
          <p className="text-lg sm:text-xl mt-2 text-purple-200 font-semibold">
            IS NOW LIVE!
          </p>
          <p className="text-sm mt-4 text-purple-300 font-medium">STAGE 1/10</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Countdown Timer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
            {Object.entries(countdown).map(([key, value]) => (
              <div
                key={key}
                className="bg-white/20 rounded-lg p-4 backdrop-blur-md hover:scale-105 transition-transform duration-200"
              >
                <div className="text-2xl sm:text-4xl font-bold text-white">
                  {value}
                </div>
                <div className="text-xs sm:text-sm uppercase text-purple-300">
                  {key}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="space-y-4">
            <Progress
              value={progress}
              className="h-2 bg-purple-300/50 rounded-full"
            />
            <div className="flex justify-between text-xs sm:text-sm text-purple-200">
              <span>USDT RAISED</span>
              <span>$2,069,177 / $4,110,000</span>
            </div>
          </div>

          {/* Token Info */}
          <div className="bg-white/20 rounded-lg p-4 sm:p-6 text-center backdrop-blur-md hover:scale-[1.02] transition-transform duration-200">
            <p className="text-purple-200 font-semibold text-sm sm:text-base">
              1 WUSLE = 0.0037 USDT
            </p>
            <p className="text-xs sm:text-sm mt-1 text-purple-300">
              LISTING PRICE: 0.005 USDT
            </p>
          </div>

          {/* Purchase Form */}
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={() => setSelectedCurrency("USDT")}
                variant={selectedCurrency === "USDT" ? "default" : "outline"}
                className="flex items-center justify-center space-x-2 bg-white/20 border-none text-purple-200 hover:bg-white/30 transition-colors duration-200"
              >
                <Image src={Usdt} alt="USDT" width={24} height={24} />
                <span>USDT</span>
              </Button>
              <Button
                onClick={() => setSelectedCurrency("SOL")}
                variant={selectedCurrency === "SOL" ? "default" : "outline"}
                className="flex items-center justify-center space-x-2 bg-white/20 border-none text-purple-200 hover:bg-white/30 transition-colors duration-200"
              >
                <Image src={Sol} alt="Solana" width={24} height={24} />
                <span>SOL</span>
              </Button>
            </div>

            {/* Inputs for Amount and WUSLE */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 w-1/2">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white/20 border-none text-white placeholder-purple-300 backdrop-blur-md hover:bg-white/30 transition-colors duration-200"
                />
                <span className="text-purple-200 text-xl">
                  {selectedCurrency === "USDT" ? (
                    <Image src={Usdt} alt="USDT" width={24} height={24} />
                  ) : selectedCurrency === "SOL" ? (
                    <Image src={Sol} alt="Solana" width={24} height={24} />
                  ) : null}
                </span>
              </div>

              <div className="flex items-center space-x-2 w-1/2">
                <Input
                  type="number"
                  value={wusleAmount.toFixed(4)}
                  disabled
                  className="bg-white/20 border-none text-white placeholder-purple-300 backdrop-blur-md hover:bg-white/30 transition-colors duration-200"
                />
                <span className="text-purple-200 text-xl">
                  <Image
                    src={Wusle}
                    alt="WUSLE"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                </span>
              </div>
            </div>

            {/* Wallet Button */}

            <div className="flex justify-center">
              <WalletMultiButton
                children="CONNECT WALLET"
                className="wallet-adapter-button"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
