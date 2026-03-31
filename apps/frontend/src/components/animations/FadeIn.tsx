"use client";
import React from "react";
import { motion } from "framer-motion";

export default function FadeIn({ children }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}