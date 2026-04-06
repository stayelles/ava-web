"use client";

import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import React, { useRef, useState } from "react";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: { name: string; link: string }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Navbar({ children, className }: NavbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    setVisible(value > 100);
  });

  return (
    <motion.div
      ref={ref}
      className={cn("fixed inset-x-0 top-0 z-50 w-full", className)}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, { visible });
        }
        return child;
      })}
    </motion.div>
  );
}

export function NavBody({ children, className, visible }: NavBodyProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        animate={{ backdropFilter: visible ? "blur(12px)" : "none", boxShadow: visible ? "0 0 24px rgba(0,0,0,0.4)" : "none", width: visible ? "60%" : "100%", y: visible ? 10 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        style={{ minWidth: "800px" }}
        className={cn(
          "relative mx-auto hidden h-14 w-full max-w-6xl items-center justify-between rounded-full px-6 md:flex",
          visible
            ? "bg-slate-950/80 border border-white/[0.08]"
            : "bg-transparent",
          className
        )}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function NavItems({ items, className, onItemClick }: NavItemsProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn("flex items-center gap-1 relative", className)}
    >
      {items.map((item, idx) => (
        <a
          key={`nav-item-${idx}`}
          href={item.link}
          onClick={onItemClick}
          onMouseEnter={() => setHovered(idx)}
          className="relative px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-full"
        >
          {hovered === idx && (
            <motion.div
              layoutId="nav-hovered"
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(255,255,255,0.06)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
}

export function MobileNav({ children, className, visible }: MobileNavProps) {
  return (
    <motion.div
      animate={{ backdropFilter: visible ? "blur(12px)" : "none", boxShadow: visible ? "0 0 24px rgba(0,0,0,0.4)" : "none" }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
      className={cn(
        "flex flex-col w-full md:hidden px-4 py-3",
        visible ? "bg-slate-950/90 border-b border-white/[0.06]" : "bg-transparent",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function MobileNavHeader({ children, className }: MobileNavHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {children}
    </div>
  );
}

export function MobileNavMenu({ children, className, isOpen }: MobileNavMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={cn(
            "flex flex-col gap-4 pt-4 pb-2 overflow-hidden",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function MobileNavToggle({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="p-1 text-slate-400 hover:text-white transition-colors">
      {isOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
    </button>
  );
}

export function NavbarLogo() {
  return (
    <a href="/" className="flex items-center gap-2.5 flex-shrink-0">
      <img
        src="/logo.png"
        alt="Ava"
        className="w-8 h-8 rounded-full object-cover"
        style={{ objectPosition: "center 45%", boxShadow: "0 0 12px rgba(225,29,72,0.3)" }}
      />
      <span className="font-black text-white text-base tracking-tight">Ava</span>
    </a>
  );
}

export function NavbarButton({
  href,
  children,
  variant = "primary",
  className,
  onClick,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  onClick?: () => void;
}) {
  const base = "inline-flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all whitespace-nowrap";

  const styles = {
    primary: "bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/25",
    secondary: "border border-white/[0.12] text-slate-300 hover:text-white hover:border-white/20 bg-white/[0.04]",
    ghost: "text-slate-400 hover:text-white",
  };

  const props = { className: cn(base, styles[variant], className), onClick };

  return href ? (
    <a href={href} {...props}>{children}</a>
  ) : (
    <button {...props}>{children}</button>
  );
}
