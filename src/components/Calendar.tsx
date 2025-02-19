'use client'

import { useState, useEffect } from 'react'

interface Todo {
    id: string
    content: string
    completed: boolean
}

interface DayTodos {
    [key: string]: Todo[] // 格式：'2024-03-21': Todo[]
}

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [todos, setTodos] = useState<DayTodos>({})
    const [newTodo, setNewTodo] = useState('')
    const [isAddingTodo, setIsAddingTodo] = useState(false)

    // 从 localStorage 加载待办事项
    useEffect(() => {
        const savedTodos = localStorage.getItem('calendar-todos')
        if (savedTodos) {
            setTodos(JSON.parse(savedTodos))
        }
    }, [])

    // 保存待办事项到 localStorage
    useEffect(() => {
        localStorage.setItem('calendar-todos', JSON.stringify(todos))
    }, [todos])

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0]
    }

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    }

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    }

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        setSelectedDate(newDate)
        setIsAddingTodo(false)
    }

    const handleAddTodo = () => {
        if (!selectedDate || !newTodo.trim()) return

        const dateStr = formatDate(selectedDate)
        const newTodoItem = {
            id: Date.now().toString(),
            content: newTodo.trim(),
            completed: false
        }

        setTodos(prev => ({
            ...prev,
            [dateStr]: [...(prev[dateStr] || []), newTodoItem]
        }))

        setNewTodo('')
        setIsAddingTodo(false)
    }

    const handleToggleTodo = (dateStr: string, todoId: string) => {
        setTodos(prev => ({
            ...prev,
            [dateStr]: prev[dateStr].map(todo =>
                todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
            )
        }))
    }

    const handleDeleteTodo = (dateStr: string, todoId: string) => {
        setTodos(prev => ({
            ...prev,
            [dateStr]: prev[dateStr].filter(todo => todo.id !== todoId)
        }))
    }

    // 生成日历网格
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            {/* 日历头部 */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={handlePrevMonth}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                    ←
                </button>
                <h3 className="text-lg font-semibold">
                    {currentDate.toLocaleString('zh-CN', { year: 'numeric', month: 'long' })}
                </h3>
                <button
                    onClick={handleNextMonth}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                    →
                </button>
            </div>

            {/* 星期表头 */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-sm text-gray-500 dark:text-gray-400">
                {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                    <div key={day}>{day}</div>
                ))}
            </div>

            {/* 日历网格 */}
            <div className="grid grid-cols-7 gap-1">
                {Array(firstDay).fill(null).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8" />
                ))}
                {days.map(day => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                    const dateStr = formatDate(date)
                    const hasTodos = todos[dateStr]?.length > 0
                    const isSelected = selectedDate && formatDate(selectedDate) === dateStr

                    return (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className={`h-8 flex items-center justify-center text-sm rounded-full
                                ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                                ${hasTodos ? 'font-bold' : ''}`}
                        >
                            {day}
                        </button>
                    )
                })}
            </div>

            {/* 待办事项区域 */}
            {selectedDate && (
                <div className="mt-4 border-t dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">
                            {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                        </h4>
                        <button
                            onClick={() => setIsAddingTodo(true)}
                            className="text-blue-500 hover:text-blue-600 text-sm"
                        >
                            添加待办
                        </button>
                    </div>

                    {isAddingTodo && (
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newTodo}
                                onChange={(e) => setNewTodo(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                                placeholder="输入待办事项..."
                                className="flex-1 px-2 py-1 border dark:border-gray-600 rounded dark:bg-gray-700"
                            />
                            <button
                                onClick={handleAddTodo}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                添加
                            </button>
                        </div>
                    )}

                    <ul className="space-y-2">
                        {todos[formatDate(selectedDate)]?.map(todo => (
                            <li key={todo.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => handleToggleTodo(formatDate(selectedDate), todo.id)}
                                    className="rounded dark:bg-gray-700"
                                />
                                <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                                    {todo.content}
                                </span>
                                <button
                                    onClick={() => handleDeleteTodo(formatDate(selectedDate), todo.id)}
                                    className="text-red-500 hover:text-red-600 text-sm"
                                >
                                    删除
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
} 