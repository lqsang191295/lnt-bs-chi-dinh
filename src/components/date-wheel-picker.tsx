"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/utils/twMerge"
import { Calendar, X } from "lucide-react"
import { MIN_YEAR, MAX_YEAR, START_OF_YEAR } from "@/utils/dateUtils"
import { useClickOutside } from "@/utils/useClickOutside"

interface DateWheelPickerProps {
  value: Date
  onChange: (date: Date) => void
  className?: string
  minYear?: number
  maxYear?: number
  placeholder?: string
}

interface WheelProps {
  items: (string | number)[]
  selectedIndex: number
  onSelectionChange: (index: number) => void
  className?: string
  itemHeight?: number
}

const Wheel = ({ items, selectedIndex, onSelectionChange, className, itemHeight = 100 }: WheelProps) => {
  const wheelRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [lastMoveTime, setLastMoveTime] = useState(0)
  const [lastY, setLastY] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const animationRef = useRef<number>(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const scrollToIndex = useCallback(
    (index: number) => {
      if (wheelRef.current) {
        const targetScrollTop = index * itemHeight
        wheelRef.current.scrollTop = targetScrollTop
      }
    },
    [itemHeight],
  )

  useEffect(() => {
    scrollToIndex(selectedIndex)
  }, [selectedIndex, scrollToIndex])

  const animateMomentum = useCallback(
    (initialVelocity: number, startScrollTop: number) => {
      if (!wheelRef.current) return

      setIsAnimating(true)

      let currentVelocity = initialVelocity
      const friction = 0.95
      const minVelocity = 0.5
      let currentScrollTop = startScrollTop

      const animate = () => {
        if (Math.abs(currentVelocity) < minVelocity || !wheelRef.current) {
          const finalIndex = Math.round(currentScrollTop / itemHeight)
          const clampedIndex = Math.max(0, Math.min(items.length - 1, finalIndex))

          setIsAnimating(false)

          onSelectionChange(clampedIndex)

          setTimeout(() => {
            scrollToIndex(clampedIndex)
          }, 0)
          return
        }

        currentScrollTop += currentVelocity
        currentVelocity *= friction

        const maxScroll = (items.length - 1) * itemHeight
        currentScrollTop = Math.max(0, Math.min(maxScroll, currentScrollTop))

        wheelRef.current.scrollTop = currentScrollTop
        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)
    },
    [itemHeight, items.length, onSelectionChange, scrollToIndex],
  )

  const handleScroll = useCallback(() => {
    if (wheelRef.current && !isDragging && !isAnimating) {
      const scrollTop = wheelRef.current.scrollTop
      const index = Math.round(scrollTop / itemHeight)
      const clampedIndex = Math.max(0, Math.min(items.length - 1, index))

      if (clampedIndex !== selectedIndex) {
        onSelectionChange(clampedIndex)
      }
    }
  }, [isDragging, isAnimating, itemHeight, items.length, selectedIndex, onSelectionChange])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    setIsDragging(true)
    setStartY(e.clientY)
    setScrollTop(wheelRef.current?.scrollTop || 0)
    setLastY(e.clientY)
    setLastMoveTime(Date.now())
    setVelocity(0)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !wheelRef.current) return

      const deltaY = e.clientY - startY
      wheelRef.current.scrollTop = scrollTop - deltaY

      const currentTime = Date.now()
      const timeDelta = currentTime - lastMoveTime
      if (timeDelta > 0) {
        const yDelta = e.clientY - lastY
        setVelocity((-yDelta / timeDelta) * 16)
        setLastY(e.clientY)
        setLastMoveTime(currentTime)
      }
    },
    [isDragging, startY, scrollTop, lastY, lastMoveTime],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)

    if (Math.abs(velocity) > 2 && wheelRef.current) {
      animateMomentum(velocity, wheelRef.current.scrollTop)
    } else {
      if (wheelRef.current) {
        const currentScrollTop = wheelRef.current.scrollTop
        const targetIndex = Math.round(currentScrollTop / itemHeight)
        const clampedIndex = Math.max(0, Math.min(items.length - 1, targetIndex))

        onSelectionChange(clampedIndex)
        setTimeout(() => {
          scrollToIndex(clampedIndex)
        }, 0)
      }
    }
  }, [velocity, animateMomentum, itemHeight, items.length, onSelectionChange, scrollToIndex])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setScrollTop(wheelRef.current?.scrollTop || 0)
    setLastY(e.touches[0].clientY)
    setLastMoveTime(Date.now())
    setVelocity(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !wheelRef.current) return

    const deltaY = e.touches[0].clientY - startY
    wheelRef.current.scrollTop = scrollTop - deltaY

    const currentTime = Date.now()
    const timeDelta = currentTime - lastMoveTime
    if (timeDelta > 0) {
      const yDelta = e.touches[0].clientY - lastY
      setVelocity((-yDelta / timeDelta) * 16)
      setLastY(e.touches[0].clientY)
      setLastMoveTime(currentTime)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)

    if (Math.abs(velocity) > 2 && wheelRef.current) {
      animateMomentum(velocity, wheelRef.current.scrollTop)
    } else {
      if (wheelRef.current) {
        const currentScrollTop = wheelRef.current.scrollTop
        const targetIndex = Math.round(currentScrollTop / itemHeight)
        const clampedIndex = Math.max(0, Math.min(items.length - 1, targetIndex))

        onSelectionChange(clampedIndex)
        setTimeout(() => {
          scrollToIndex(clampedIndex)
        }, 0)
      }
    }
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className={cn("relative", className)}>
      <div
        className="absolute left-0 right-0 bg-primary/10 border-y border-primary/20 pointer-events-none z-10"
        style={{
          top: `${itemHeight}px`,
          height: `${itemHeight}px`,
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-background to-transparent pointer-events-none z-20" />
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />

      <div
        ref={wheelRef}
        className="overflow-hidden select-none cursor-grab active:cursor-grabbing"
        style={{ height: `${itemHeight * 3}px` }}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ height: `${itemHeight}px` }} />

        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-center transition-all duration-200 text-center font-medium",
              index === selectedIndex
                ? "text-primary text-lg scale-110"
                : "text-muted-foreground hover:text-foreground",
            )}
            style={{ height: `${itemHeight}px` }}
            onClick={() => onSelectionChange(index)}
          >
            {item}
          </div>
        ))}

        <div style={{ height: `${itemHeight}px` }} />
      </div>
    </div>
  )
}

export const DateWheelPickerPopup = ({
  isOpen,
  onClose,
  value,
  onChange,
  minYear = MIN_YEAR,
  maxYear = MAX_YEAR,
}: {
  isOpen: boolean
  onClose: () => void
  value: Date
  onChange: (date: Date) => void
  minYear?: number
  maxYear?: number
}) => {
  const [tempValue, setTempValue] = useState(value)
  
  // Sử dụng click outside để đóng popup
  const popupRef = useClickOutside<HTMLDivElement>(() => {
    if (isOpen) {
      onClose()
    }
  }, isOpen)

  useEffect(() => {
    if (isOpen) {
      setTempValue(value)
    }
  }, [isOpen, value])

  const currentDay = tempValue.getDate()
  const currentMonth = tempValue.getMonth()
  const currentYear = tempValue.getFullYear()

  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const months = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ]
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const availableDays = days.slice(0, daysInMonth)

  const handleDayChange = (dayIndex: number) => {
    const newDay = availableDays[dayIndex]
    const newDate = new Date(currentYear, currentMonth, newDay)
    setTempValue(newDate)
  }

  const handleMonthChange = (monthIndex: number) => {
    const newDate = new Date(currentYear, monthIndex, currentDay)
    const daysInNewMonth = new Date(currentYear, monthIndex + 1, 0).getDate()
    if (currentDay > daysInNewMonth) {
      newDate.setDate(daysInNewMonth)
    }
    setTempValue(newDate)
  }

  const handleYearChange = (yearIndex: number) => {
    const newYear = years[yearIndex]
    const newDate = new Date(newYear, currentMonth, currentDay)
    const daysInNewMonth = new Date(newYear, currentMonth + 1, 0).getDate()
    if (currentDay > daysInNewMonth) {
      newDate.setDate(daysInNewMonth)
    }
    setTempValue(newDate)
  }

  const handleConfirm = () => {
    onChange(tempValue)
    onClose()
  }

  const handleCancel = () => {
    setTempValue(value)
    onClose()
  }

  const dayIndex = availableDays.findIndex((day) => day === currentDay)
  const monthIndex = currentMonth
  const yearIndex = years.findIndex((year) => year === currentYear)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div ref={popupRef} className="bg-background rounded-lg border shadow-lg w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Chọn ngày</h3>
          <button onClick={handleCancel} className="p-1 hover:bg-muted rounded-sm transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Wheel Picker */}
        <div className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-xs font-medium text-muted-foreground mb-2 text-center">Ngày</div>
              <Wheel items={availableDays} selectedIndex={Math.max(0, dayIndex)} onSelectionChange={handleDayChange} />
            </div>

            <div className="flex-1">
              <div className="text-xs font-medium text-muted-foreground mb-2 text-center">Tháng</div>
              <Wheel items={months} selectedIndex={monthIndex} onSelectionChange={handleMonthChange} />
            </div>

            <div className="flex-1">
              <div className="text-xs font-medium text-muted-foreground mb-2 text-center">Năm</div>
              <Wheel items={years} selectedIndex={Math.max(0, yearIndex)} onSelectionChange={handleYearChange} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  )
}

export const useDateWheelPicker = (initialValue: Date = START_OF_YEAR) => {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState(initialValue)

  const openPicker = () => setIsOpen(true)
  const closePicker = () => setIsOpen(false)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return {
    value,
    setValue,
    isOpen,
    openPicker,
    closePicker,
    formatDate,
  }
}

export const DateWheelPicker = ({
  value,
  onChange,
  className,
  minYear = 1950,
  maxYear = 2050,
  placeholder = "Chọn ngày",
}: DateWheelPickerProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className={cn("relative", className)}>
      {/* Text Field */}
      <div
        className="flex items-center gap-2 px-3 py-2 border border-input bg-background rounded-md cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-sm">{value ? formatDate(value) : placeholder}</span>
      </div>

      <DateWheelPickerPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        value={value}
        onChange={onChange}
        minYear={minYear}
        maxYear={maxYear}
      />
    </div>
  )
}
