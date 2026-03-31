"use client";

import { motion } from "framer-motion";
import React from "react";
export default function SlideUp({ children }: any) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}