"use client";

import { useState } from "react";
import { ethers } from "ethers";

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);

    return accounts[0];
  };

  return { account, connectWallet };
};