// components/Footer.jsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden text-white p-8 flex flex-col items-center text-center bg-black/80">
      {/* Footer Links */}
      <motion.div
        className="relative container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-gray-400 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {["ABOUT", "DOCS", "TERMS", "SOCIALS"].map((title) => (
          <motion.div key={title} variants={fadeIn}>
            <h3 className="font-bold mb-2 text-white">{title}</h3>
            <ul>
              {title === "ABOUT" && (
                <>
                  <li>
                    <a href="#" className="hover:text-white">
                      Tokenomics
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      How to Buy
                    </a>
                  </li>
                </>
              )}
              {title === "DOCS" && (
                <>
                  {/* <li>
                    <a href="#" className="hover:text-white">
                      Whitepaper
                    </a>
                  </li> */}
                  <li>
                    <li>
                      <a
                        href="/Wusle_Audit.pdf"
                        className="hover:text-white"
                        download
                      >
                        Audit
                      </a>
                    </li>
                  </li>
                </>
              )}
              {title === "TERMS" && (
                <>
                  <li>
                    <a href="#" className="hover:text-white">
                      Cookies Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="/Wusle_privacy_policy.pdf"
                      className="hover:text-white"
                      download={true}
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="/Wusle_Terms_and_Condition.pdf"
                      className="hover:text-white"
                      download={true}
                    >
                      Terms of Use
                    </a>
                  </li>
                </>
              )}
              {title === "SOCIALS" && (
                <>
                  <li>
                    <a
                      href="https://www.instagram.com/wusle_official/"
                      className="hover:text-white"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://x.com/wusle_official?s=21"
                      className="hover:text-white"
                    >
                      X
                    </a>
                  </li>
                </>
              )}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        className="relative text-center text-sm text-gray-400 mt-12"
        variants={fadeIn}
      >
        <p>
          Disclaimer: Cryptocurrency may be unregulated in your jurisdiction.
          The value of cryptocurrencies may go down as well as up. Profits may
          be subject to capital gains or other taxes applicable in your
          jurisdiction.
        </p>
        <p className="mt-2 mb-3">© 2024 WUSLE. All Rights Reserved.</p>
        <WalletMultiButton
          style={{
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            color: "black",
            background: "white",
            border: "none",
            borderRadius: "50px",
            cursor: "pointer",
            transition: "all 0.3s ease-in-out",
            animation: "heartbeat 1s infinite ease-in-out",
            padding: "10px 20px", // Adjust padding for better spacing
            textAlign: "center",
          }}
        >
          CONNECT WALLET
        </WalletMultiButton>
      </motion.div>

      {/* Wallet Button */}
    </footer>
  );
};

export default Footer;
