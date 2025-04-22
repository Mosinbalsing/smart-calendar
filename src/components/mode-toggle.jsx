"use client"

import { Moon, Sun } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

// Create a fallback theme hook if next-themes is not available
const useThemeFallback = () => {
  const [theme, setThemeState] = useState('light')
  
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      // Try to get theme from localStorage
      const savedTheme = localStorage.getItem('smart-calendar-theme')
      if (savedTheme) {
        setThemeState(savedTheme)
        document.documentElement.classList.toggle('dark', savedTheme === 'dark')
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setThemeState(prefersDark ? 'dark' : 'light')
        document.documentElement.classList.toggle('dark', prefersDark)
      }
    }
  }, [])

  const setTheme = (newTheme) => {
    setThemeState(newTheme)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart-calendar-theme', newTheme)
      
      if (newTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.classList.toggle('dark', prefersDark)
      } else {
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
      }
    }
  }

  return { theme, setTheme }
}

export function ModeToggle() {
  const [mounted, setMounted] = useState(false)
  
  // Try to use next-themes if available, otherwise use fallback
  let themeHook
  try {
    // Dynamic import to avoid reference error
    themeHook = require('next-themes').useTheme
  } catch (e) {
    themeHook = useThemeFallback
  }
  
  const { theme, setTheme } = themeHook()

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="opacity-0">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <span className="mr-2">💻</span>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
