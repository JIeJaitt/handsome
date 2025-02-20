'use client'

import { useState, useEffect } from 'react'

export default function ThemeProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
        // 检查系统主题偏好
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDarkMode(true)
        }

        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            setDarkMode(e.matches)
        })
    }, [])

    useEffect(() => {
        // 根据darkMode状态添加或移除dark类
        if (darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])

    return (
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    {darkMode ? '🌞' : '🌙'}
                </button>
            </div>
            {children}
        </div>
    )
} 