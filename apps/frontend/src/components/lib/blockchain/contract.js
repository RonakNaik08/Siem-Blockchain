import { ethers } from "ethers";
import ABI from "./abi.json";

export const getContract = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    ABI,
    signer
  );
};