import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export interface ImageInterface {
  id: string
  url: string
  title: string
  description: string
  order?: number
  createdAt?: Date
  updatedAt?: Date
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
