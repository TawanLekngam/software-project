"use client"

import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { useRouter } from "next/navigation"
import axios from "axios"
import { useState } from "react"
import toast from "react-hot-toast"
import { Category } from "@prisma/client"

interface SelectCategoryProps {
  courseId: string
  initialCategory: string | null
  category: Category[]
}

export const SelectCategory = ({
  courseId,
  category,
  initialCategory,
}: SelectCategoryProps) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(initialCategory || "")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const onSelect = async (selectedCategory: Category) => {
    try {
      console.log(selectedCategory.id)
      setIsLoading(true)
      await axios.patch(`/api/courses/${courseId}`, {
        categoryId: selectedCategory.id,
      })
      toast.success("Category selected")

      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }
  return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {value
              ? category.find((category) => category.id === value)?.name ||
                "Select Category..."
              : "Select Catergory..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search Category..." />
            <CommandEmpty>No Category found.</CommandEmpty>
            <CommandGroup>
              {category.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.id}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                    onSelect(category)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === category.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
  )
}
