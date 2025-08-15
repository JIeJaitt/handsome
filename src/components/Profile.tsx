'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

type ProfileProps = {
    postsCount: number
    categoriesCount: number
    tagsCount: number
}

export default function Profile({ postsCount, categoriesCount, tagsCount }: ProfileProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const umbrellaAngle = useRef(-Math.PI * 0.25)
    const umbrellaX = useRef(0)
    const umbrellaY = useRef(0)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = 256
        canvas.height = 256

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2

        // 调整雨伞位置以配合新角度
        umbrellaX.current = centerX - 20  // 更靠右
        umbrellaY.current = centerY - 30  // 稍微下移

        // 雨滴数组
        const raindrops: {
            x: number
            y: number
            speed: number
            length: number
            blocked: boolean
        }[] = []

        // 减少雨滴数量，调整大小
        for (let i = 0; i < 80; i++) {
            raindrops.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: 2 + Math.random() * 3,
                length: 10 + Math.random() * 4,
                blocked: false
            })
        }

        let animationFrameId: number

        function isUnderUmbrella(x: number, y: number) {
            const dx = x - umbrellaX.current
            const dy = y - umbrellaY.current

            const rotatedX = dx * Math.cos(-umbrellaAngle.current) - dy * Math.sin(-umbrellaAngle.current)
            const rotatedY = dx * Math.sin(-umbrellaAngle.current) + dy * Math.cos(-umbrellaAngle.current)

            // 优化遮挡区域判定
            return rotatedY < 0 && Math.abs(rotatedX) < 65 && rotatedY > -50
        }

        function animate() {
            if (!ctx || !canvas) return

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // 更柔和的摆动，基础角度更大
            const time = Date.now() / 1000
            const swayAngle = Math.sin(time * 1.2) * 0.03
            umbrellaAngle.current = -Math.PI * 0.35 + swayAngle

            // 绘制雨滴
            ctx.strokeStyle = '#60A5FA'
            ctx.lineWidth = 1
            raindrops.forEach(drop => {
                const rainAngle = Math.PI * 0.15

                // 检查雨滴是否被雨伞挡住
                drop.blocked = isUnderUmbrella(drop.x, drop.y)

                // 被挡住的雨滴直接跳过不绘制
                if (!drop.blocked) {
                    const endX = drop.x + Math.sin(rainAngle) * drop.length
                    const endY = drop.y + Math.cos(rainAngle) * drop.length

                    ctx.beginPath()
                    ctx.moveTo(drop.x, drop.y)
                    ctx.lineTo(endX, endY)
                    ctx.stroke()
                }

                // 更新雨滴位置
                drop.x += drop.speed * Math.sin(rainAngle)
                drop.y += drop.speed * Math.cos(rainAngle)

                // 重置超出画布的雨滴
                if (drop.y > canvas.height || drop.x > canvas.width) {
                    drop.y = -drop.length
                    drop.x = Math.random() * canvas.width * 0.7
                    drop.blocked = false
                }
            })

            // 绘制雨伞
            ctx.save()
            ctx.translate(umbrellaX.current, umbrellaY.current)
            ctx.rotate(umbrellaAngle.current)

            // 绘制雨伞顶部
            ctx.beginPath()
            ctx.strokeStyle = '#4B5563'
            ctx.lineWidth = 2.5
            ctx.arc(0, 0, 65, Math.PI, 0)

            // 半透明的雨伞面
            ctx.fillStyle = 'rgba(75, 85, 99, 0.15)'
            ctx.fill()
            ctx.stroke()

            // 绘制雨伞支架
            ctx.beginPath()
            ctx.moveTo(-50, 0)
            ctx.lineTo(50, 0)
            ctx.stroke()

            // 绘制雨伞柄
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(-35, 45)
            ctx.stroke()

            ctx.restore()

            animationFrameId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                    <canvas
                        ref={canvasRef}
                        className="absolute -top-16 -left-16 z-10 pointer-events-none"
                        width={256}
                        height={256}
                    />
                    <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700">
                        <Image
                            src="/images/avatar.png"
                            alt="Avatar"
                            width={128}
                            height={128}
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                </div>
                <h2 className="text-xl font-bold mb-2">JIeJaitt</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm text-center mb-4">
                    这里是个人简介，热爱技术，热爱生活...
                </p>
                <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div>文章 {postsCount}</div>
                    <div>分类 {categoriesCount}</div>
                    <div>标签 {tagsCount}</div>
                </div>
            </div>
        </div>
    )
}