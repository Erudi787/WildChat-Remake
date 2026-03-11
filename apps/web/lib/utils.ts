import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserAvatarGradient(identifier: string) {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const gradients = [
    "bg-gradient-to-br from-[#800000] to-[#b30000]", // CIT Maroon
    "bg-gradient-to-br from-[#d4af37] to-[#f3e5ab]", // CIT Gold
    "bg-gradient-to-br from-[#8a1538] to-[#ff2f5b]", // Vibrant Red/Maroon
    "bg-gradient-to-br from-[#b8860b] to-[#ffd700]", // Dark Gold to Light Gold
    "bg-gradient-to-br from-[#4a0404] to-[#800000]", // Deep Maroon
    "bg-gradient-to-br from-[#e6a817] to-[#ffda75]", // Amber Gold
  ];

  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}
