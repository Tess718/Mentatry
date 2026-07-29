import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import crypto from "crypto";

export function generateJoinCode(length: number = 6): string {
  // Unambiguous uppercase alphanumeric characters
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(crypto.randomInt(chars.length));
  }
  return code;
}
