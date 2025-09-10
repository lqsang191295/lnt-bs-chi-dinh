"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography } from "@mui/material"
import { CalendarToday as CalendarIcon, Close as CloseIcon } from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import { MIN_YEAR, MAX_YEAR, START_OF_YEAR } from "@/utils/dateUtils"

// Styled components
const DateFieldContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 1.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'border-color 0.2s',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    opacity: 0.8
  }
}))

const WheelContainer = styled(Box)({
  position: 'relative'
})

const SelectionHighlight = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  backgroundColor: theme.palette.primary.main,
  opacity: 0.1,
  border: `1px solid ${theme.palette.primary.main}`,
  borderLeft: 'none',
  borderRight: 'none',
  pointerEvents: 'none',
  zIndex: 10
}))

const GradientOverlay = styled(Box)({
  position: 'absolute',
  left: 0,
  right: 0,
  height: 40,
  pointerEvents: 'none',
  zIndex: 20
})

const ScrollContainer = styled(Box)({
  overflow: 'hidden',
  userSelect: 'none',
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing'
  }
})

const WheelItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSelected'
})<{ isSelected: boolean }>(({ theme, isSelected }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  textAlign: 'center',
  fontWeight: 500,
  color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
  fontSize: isSelected ? '1.125rem' : '1rem',
  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
  '&:hover': {
    color: theme.palette.text.primary
  }
}))

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
    <WheelContainer className={className}>
      <SelectionHighlight
        sx={{
          top: `${itemHeight}px`,
          height: `${itemHeight}px`,
        }}
      />

      <GradientOverlay 
        sx={{ 
          top: 0,
          background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)'
        }} 
      />
      <GradientOverlay 
        sx={{ 
          bottom: 0,
          background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)'
        }} 
      />

      <ScrollContainer
        ref={wheelRef}
        sx={{ height: `${itemHeight * 3}px` }}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Box sx={{ height: `${itemHeight}px` }} />

        {items.map((item, index) => (
          <WheelItem
            key={index}
            isSelected={index === selectedIndex}
            sx={{ height: `${itemHeight}px` }}
            onClick={() => onSelectionChange(index)}
          >
            {item}
          </WheelItem>
        ))}

        <Box sx={{ height: `${itemHeight}px` }} />
      </ScrollContainer>
    </WheelContainer>
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

  return (
    <Dialog
      open={isOpen}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 2 },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" sx={{fontWeight:"bold"}}>Chọn ngày</Typography>
        <IconButton onClick={handleCancel} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, py: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mb: 1, color: 'text.secondary', fontWeight:"bold" }}>
              Ngày
            </Typography>
            <Wheel items={availableDays} selectedIndex={Math.max(0, dayIndex)} onSelectionChange={handleDayChange} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mb: 1, color: 'text.secondary', fontWeight:"bold" }}>
              Tháng
            </Typography>
            <Wheel items={months} selectedIndex={monthIndex} onSelectionChange={handleMonthChange} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mb: 1, color: 'text.secondary', fontWeight:"bold" }}>
              Năm
            </Typography>
            <Wheel items={years} selectedIndex={Math.max(0, yearIndex)} onSelectionChange={handleYearChange} />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleConfirm} variant="contained" fullWidth sx={{pt:"20px", pb:"20px", fontSize:"1.2rem"}}>
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
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

// Giữ nguyên tên và interface để không cần thay đổi nơi import
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
    <Box className={className} sx={{ position: 'relative' }}>
      <DateFieldContainer onClick={() => setIsOpen(true)}>
        <CalendarIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        <Typography variant="body2" sx={{ flex: 1 }}>
          {value ? formatDate(value) : placeholder}
        </Typography>
      </DateFieldContainer>

      <DateWheelPickerPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        value={value}
        onChange={onChange}
        minYear={minYear}
        maxYear={maxYear}
      />
    </Box>
  )
}