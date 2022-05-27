import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  contractABI,
  contractAddress,
  erc20_ABI,
  usdt_token,
} from "../utils/constants";
import { shortenNumber } from "../utils/shortenNumber";
export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  console.log({
    provider,
    signer,
    transactionContract,
  });

  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrenAccount] = useState("");
  const [currentBalance, setCurrenBalance] = useState(0);
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(0);

  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAccountBalance = async (account) => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(usdt_token, erc20_ABI, signer);
    const tokenBalance = await contract.balanceOf(account);
    console.log({ adasdas: Number(ethers.utils.formatEther(tokenBalance)) });
    setCurrenBalance(
      shortenNumber(Number(ethers.utils.formatEther(tokenBalance)), 3)
    );
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrenAccount(accounts[0]);
      } else {
        console.log("No account found");
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object.");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrenAccount(accounts[0]);
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object.");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);
      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208",
            value: parsedAmount._hex,
          },
        ],
      });
      const transactionHash = await transactionContract.addToBlockChain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );

      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      setIsLoading(false);
      console.log(`Success - ${transactionHash.hash}`);
      const transactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(transactionCount.toNumber());
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object.");
    }
  };

  useEffect(() => {
    if (!currentAccount) {
      checkIfWalletIsConnected();
    } else {
      getAccountBalance(currentAccount);
    }
  }, [currentAccount]);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        setCurrenAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        isLoading,
        currentBalance,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
