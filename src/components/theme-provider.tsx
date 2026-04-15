"use client"

import * as React from "react"
import { useEffect } from "react"

interface ThemeContextType {
  theme: string
  setTheme: (theme: string) => void
  resolvedTheme: string
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

const ThemeContext = React.createContext<ThemeContextType | null>(null)

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props 
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = React.useState('')

  useEffect(() => {
    const root = window.document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const handleMediaChange = () => {
      const nextTheme = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
      setResolvedTheme(nextTheme)
      root.classList.remove('light', 'dark')
      root.classList.add(nextTheme)
    }

    handleMediaChange()
    media.addEventListener('change', handleMediaChange)

    return () => media.removeEventListener('change', handleMediaChange)
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    if (disableTransitionOnChange) {
      root.classList.add('no-transition')
      window.setTimeout(() => root.classList.remove('no-transition'), 200)
    }
  }, [theme, disableTransitionOnChange])

  function handleSetTheme(nextTheme: string) {
    localStorage.setItem('theme', nextTheme)
    setTheme(nextTheme)
  }

  React.useEffect(() => {
    const root = window.document.documentElement
    const themeFromStorage = localStorage.getItem('theme') as string | null

    if (themeFromStorage) {
      handleSetTheme(themeFromStorage)
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    handleSetTheme(enableSystem ? 'system' : 'light')
  }, [])

  const contextValue = {
    theme,
    setTheme: handleSetTheme,
    resolvedTheme
  }

  return (
    <ThemeContext.Provider value={contextValue} {...props}>
      {children}
    </ThemeContext.Provider>
  )
}

