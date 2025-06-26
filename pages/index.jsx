import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { motion } from "framer-motion";
import Modal from "../components/Modal";
import { ethers } from "ethers";

const COMMISSION_MANAGER_ADDRESS = "0xYourCommissionManagerContractAddress";
const COMMISSION_MANAGER_ABI = [
  "function requestCommission(string memory title, string memory description, string memory reference) public payable"
];

export default function Home() {
  const [account, setAccount] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", reference: "" });
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
      } catch (err) {
        console.error("Wallet connection failed", err);
      }
    } else {
      alert("Please install MetaMask (use Monad Testnet RPC)");
    }
  };

  const openCommissionModal = (artistId) => {
    setSelectedArtist(artistId);
    setShowModal(true);
  };

  const submitCommission = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        COMMISSION_MANAGER_ADDRESS,
        COMMISSION_MANAGER_ABI,
        signer
      );

      const tx = await contract.requestCommission(
        form.title,
        form.description,
        form.reference,
        { value: ethers.parseEther("0.1") }
      );

      await tx.wait();
      alert("Commission submitted successfully!");
      setShowModal(false);
      setForm({ title: "", description: "", reference: "" });
    } catch (err) {
      console.error("Commission request failed:", err);
      alert("Failed to submit commission");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#2a003f] via-[#3a0074] to-[#15002b] text-white p-8 font-sans overflow-x-hidden">
      <header className="mb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-6xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent"
        >
          🎨 CommissionConnect
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-purple-300 text-xl max-w-xl mx-auto"
        >
          Discover and commission digital artists on a decentralized platform powered by Monad.
        </motion.p>
      </header>

      <div className="flex justify-center mb-12">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-6 py-3 text-lg font-semibold rounded-full shadow-xl transition-all duration-300" onClick={connectWallet}>
            {account ? `🟢 ${account.slice(0, 6)}... Connected` : "🔗 Connect Wallet"}
          </Button>
        </motion.div>
      </div>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {[1, 2, 3].map((id) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: id * 0.2 }}
          >
            <Card className="bg-purple-800/70 border border-purple-700 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden">
              <CardContent className="p-6">
                <img
                  src={`/artists/sample${id}.jpg`}
                  alt={`Artist ${id} Portfolio`}
                  className="rounded-2xl mb-4 border-4 border-purple-500 hover:scale-105 transition-transform duration-300"
                />
                <h2 className="text-2xl font-bold text-white mb-1">Artist {id}</h2>
                <p className="text-sm text-purple-200 mb-4">Specializes in fantasy portraits & digital realism.</p>
                <Button onClick={() => openCommissionModal(id)} className="w-full bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white font-semibold py-2 rounded-xl transition-all duration-300">
                  ✨ Commission Me
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      <footer className="text-center mt-16 text-purple-400 text-sm">
        © {new Date().getFullYear()} CommissionConnect. Built on Monad Testnet.
      </footer>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 className="text-xl font-bold mb-4">Commission Artist {selectedArtist}</h2>
          <input
            type="text"
            placeholder="Title"
            className="w-full mb-3 p-2 rounded-md text-black"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Description"
            className="w-full mb-3 p-2 rounded-md text-black"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="url"
            placeholder="Reference Image URL (optional)"
            className="w-full mb-4 p-2 rounded-md text-black"
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value })}
          />
          <Button disabled={loading} onClick={submitCommission} className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2 rounded-xl">
            {loading ? "Submitting..." : "🚀 Submit Commission Request"}
          </Button>
        </Modal>
      )}
    </div>
  );
}
