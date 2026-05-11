import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';

interface ToastProps {
  message?: string;
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message = 'Salvo com sucesso!', isVisible }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-agro-green-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold">
          <Check size={18} />
          {message}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
