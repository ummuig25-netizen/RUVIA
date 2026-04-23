import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "../lib/utils";

interface Props {
  open: boolean;
  children: ReactNode;
  className?: string;
  onClose?: () => void;
}

export function BottomSheet({ open, children, className, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {onClose && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-[1000]"
              onClick={onClose}
            />
          )}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[1001] bg-card border-t border-card-border rounded-t-3xl shadow-2xl",
              "max-h-[85vh] overflow-y-auto",
              "pb-[env(safe-area-inset-bottom)]",
              className,
            )}
          >
            <div className="flex justify-center pt-3">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
