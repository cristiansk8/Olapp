'use client'

import { useRef, useEffect, useState, MouseEvent, TouchEvent } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface CategoryCarouselProps {
  categories: Category[]
}

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftState, setScrollLeftState] = useState(0)

  // Duplicar categorías múltiples veces para el loop infinito
  const duplicatedCategories = [...categories, ...categories, ...categories, ...categories, ...categories]

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    const scrollSpeed = 0.5 // Más lento para mejor control

    const animate = () => {
      if (!isPaused && !isDragging) {
        scrollPositionRef.current += scrollSpeed

        const totalWidth = scrollContainer.scrollWidth
        const thirdWidth = totalWidth / 5

        // Loop infinito hacia adelante
        if (scrollPositionRef.current >= thirdWidth * 2) {
          scrollPositionRef.current = thirdWidth
          scrollContainer.scrollLeft = thirdWidth
        } else {
          scrollContainer.scrollLeft = scrollPositionRef.current
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    // Iniciar en el segundo set
    setTimeout(() => {
      const thirdWidth = scrollContainer.scrollWidth / 5
      scrollPositionRef.current = thirdWidth
      scrollContainer.scrollLeft = thirdWidth
    }, 100)

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isPaused, isDragging, categories.length])

  // Mouse events para desktop drag
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setIsPaused(true)
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0))
    setScrollLeftState(scrollRef.current?.scrollLeft || 0)
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      checkAndResetScroll()
      setIsDragging(false)
      setIsPaused(false)
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      checkAndResetScroll()
      setIsDragging(false)
      setIsPaused(false)
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 2 // Velocidad de arrastre
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeftState - walk
    }
  }

  // Touch events para móvil
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setIsPaused(true)
    setStartX(e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0))
    setScrollLeftState(scrollRef.current?.scrollLeft || 0)
  }

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const x = e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 2
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeftState - walk
    }
  }

  const handleTouchEnd = () => {
    if (isDragging) {
      checkAndResetScroll()
      setIsDragging(false)
      setIsPaused(false)
    }
  }

  // Verificar y resetear posición para mantener el loop infinito
  const checkAndResetScroll = () => {
    if (!scrollRef.current) return

    const container = scrollRef.current
    const scrollLeft = container.scrollLeft
    const totalWidth = container.scrollWidth
    const thirdWidth = totalWidth / 5

    // Si está muy a la derecha, mover al inicio del segundo set
    if (scrollLeft >= thirdWidth * 2) {
      scrollPositionRef.current = thirdWidth
      container.scrollLeft = thirdWidth
    }
    // Si está muy a la izquierda, mover al inicio del segundo set
    else if (scrollLeft < thirdWidth - 100) {
      scrollPositionRef.current = thirdWidth * 2 - 100
      container.scrollLeft = thirdWidth * 2 - 100
    } else {
      scrollPositionRef.current = scrollLeft
    }
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="px-4 py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-3xl font-bold text-primary-900 dark:text-white text-center">
          Explora por Categoría
        </h2>
      </div>

      {/* Contenedor del carrusel */}
      <div
        className="relative"
        onMouseEnter={() => {
          setIsPaused(true)
        }}
        onMouseLeave={() => {
          setIsPaused(false)
        }}
      >
        {/* Gradientes laterales para efecto de desvanecimiento */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white via-white to-transparent dark:from-primary-950 dark:via-primary-950 z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white via-white to-transparent dark:from-primary-950 dark:via-primary-950 z-10 pointer-events-none" />

        {/* Carrusel con scroll horizontal y soporte táctil */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-4 cursor-grab active:cursor-grabbing select-none"
          style={{
            scrollBehavior: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {duplicatedCategories.map((category, index) => (
            <a
              key={`${category.id}-${index}`}
              href={`/negocios?categoria=${category.slug}`}
              className="flex-shrink-0 w-36 sm:w-40 bg-white dark:bg-primary-900 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition border border-primary-100 dark:border-primary-800 hover:scale-105 transform group"
              draggable={false}
            >
              <div className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition flex justify-center">
                {category.icon || '📁'}
              </div>
              <h3 className="font-bold text-primary-900 dark:text-white text-center text-xs sm:text-sm leading-tight">
                {category.name}
              </h3>
            </a>
          ))}
        </div>
      </div>

      {/* Indicadores */}
      <p className="text-center text-sm text-primary-500 dark:text-primary-500 mt-4">
        {isDragging ? '👆 Arrastrando' : isPaused ? '⏸️ Pausado' : '▶️ Deslizando automáticamente'}
      </p>
    </section>
  )
}
