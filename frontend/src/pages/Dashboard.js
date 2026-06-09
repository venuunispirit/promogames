import React from "react";
import { motion } from "framer-motion";

const cards = [
  { title: "Clients", value: 12 },
  { title: "Documents", value: 45 },
  { title: "Invoices", value: 8 },
];

function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="backdrop-blur-xl bg-white/10 border border-white/10 p-6 rounded-xl hover:scale-105 hover:shadow-xl transition duration-300"
          >
            <h2 className="text-gray-300">{card.title}</h2>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
          </motion.div>
        ))}

      </div>
    </div>
  );
}

export default Dashboard;