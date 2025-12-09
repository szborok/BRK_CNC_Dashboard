"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "./utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({ value, onChange, placeholder = "Pick a date", disabled, className }, ref) => {
    return (
      <div ref={ref}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
                className
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? (
                value.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-950" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={onChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)

DatePicker.displayName = "DatePicker"
