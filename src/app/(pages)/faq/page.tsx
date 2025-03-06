"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import FooterBg from "../../../assets/Images/FotterEarth.jpeg";

interface FAQ {
  question: string;
  answer: string;
}


const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const faqVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

const faqs: FAQ[] = [
  {
    question: "What is WUSLE?",
    answer:
      "WUSLE is a revolutionary platform designed to bring innovation to the cryptocurrency space.",
  },
  {
    question: "How do I buy tokens?",
    answer:
      "You can buy tokens through our platform using supported cryptocurrencies or fiat methods.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we use state-of-the-art encryption to ensure your data and transactions are secure.",
  },
];

const FAQSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="relative h-[150vh] text-white p-8 flex flex-col items-center text-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={FooterBg}
          alt="Background"
          fill
          className="object-cover opacity-100"
        />
      </div>

      {/* FAQ Content Card with Glass Effect */}
      <motion.div
        className="relative z-10 bg-white bg-opacity-20 backdrop-blur-sm mt-[30rem] text-gray-900 max-w-4xl mx-auto flex flex-col justify-center p-8 rounded-3xl shadow-xl border border-gray-300"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h3
          className="text-center text-6xl font-bold mb-8 text-white"
          variants={fadeIn}
        >
          FAQs
        </motion.h3>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-white bg-opacity-20 backdrop-blur-lg text-gray-900 rounded-2xl shadow-lg p-6 border border-gray-300"
              variants={fadeIn}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-lg font-semibold flex justify-between items-center focus:outline-none text-slate-800"
              >
                {faq.question}
                <span>{activeIndex === index ? "−" : "+"}</span>
              </button>
              <motion.div
                variants={faqVariants}
                initial="hidden"
                animate={activeIndex === index ? "visible" : "hidden"}
                className="overflow-hidden text-base mt-4 text-slate-800"
              >
                <p>{faq.answer}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default FAQSection;
