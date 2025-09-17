import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function startOfDayIso(date: Date) {
  const d = new Date(date)
  d.setHours(0,0,0,0)
  return d.toISOString()
}

export function endOfDayIso(date: Date) {
  const d = new Date(date)
  d.setHours(23,59,59,999)
  return d.toISOString()
}