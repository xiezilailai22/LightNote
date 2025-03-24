"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TagInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  tags: string[]
  setTags: React.Dispatch<React.SetStateAction<string[]>>
  placeholder?: string
  maxTags?: number
  maxLength?: number
  onTagAdd?: (tag: string) => void
  onTagRemove?: (tag: string) => void
  disabled?: boolean
}

export function TagInput({
  tags,
  setTags,
  placeholder = "添加标签...",
  maxTags = 10,
  maxLength = 20,
  onTagAdd,
  onTagRemove,
  disabled = false,
  className,
  ...props
}: TagInputProps) {
  const [input, setInput] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  // 处理输入改变
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.includes(",")) {
      // 当输入逗号时，添加标签
      const newTag = value.replace(",", "").trim()
      if (newTag && !tags.includes(newTag) && newTag.length <= maxLength) {
        addTag(newTag)
      }
      setInput("")
    } else {
      setInput(value)
    }
  }

  // 处理按键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault()
      if (tags.length < maxTags && input.length <= maxLength) {
        addTag(input.trim())
        setInput("")
      }
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      // 当输入为空且按下退格键时，删除最后一个标签
      removeTag(tags[tags.length - 1])
    }
  }

  // 添加标签
  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < maxTags) {
      const newTags = [...tags, tag]
      setTags(newTags)
      onTagAdd?.(tag)
    }
  }

  // 删除标签
  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag)
    setTags(newTags)
    onTagRemove?.(tag)
  }

  // 点击容器时聚焦输入框
  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 rounded-md border border-input bg-transparent p-1.5 text-sm focus-within:ring-1 focus-within:ring-ring",
        className
      )}
      onClick={handleContainerClick}
    >
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 px-2 py-1">
          {tag}
          <button
            type="button"
            className="ml-1 rounded-full outline-none focus:ring-2 disabled:cursor-not-allowed"
            onClick={() => removeTag(tag)}
            disabled={disabled}
          >
            <X size={14} />
            <span className="sr-only">删除标签</span>
          </button>
        </Badge>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={tags.length < maxTags ? placeholder : ""}
        className="flex-1 border-0 bg-transparent p-1 outline-none placeholder:text-muted-foreground focus:ring-0 disabled:cursor-not-allowed"
        disabled={disabled || tags.length >= maxTags}
        {...props}
      />
    </div>
  )
} 