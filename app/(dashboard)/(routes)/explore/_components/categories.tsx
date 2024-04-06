"use client"

import { Category } from "@prisma/client"
import {
  FcMultipleDevices,
  FcFlashOn,
  FcMusic,
  FcCalculator,
  FcWikipedia,
  FcBiomass,
  FcBiotech,
} from "react-icons/fc"
import { IconType } from "react-icons"

import { CategoryItem } from "./category-item"

interface CategoriesProps {
  items: Category[]
}

const iconMap: Record<Category["name"], IconType> = {
  Music: FcMusic,
  Chemistry: FcBiomass,
  Biology: FcBiotech,
  English: FcWikipedia,
  Mathematics: FcCalculator,
  Physics: FcFlashOn,
  Programming: FcMultipleDevices,
}

export const Categories = ({ items }: CategoriesProps) => {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto">
      {items.map((item) => (
        <CategoryItem
          key={item.id}
          label={item.name}
          icon={iconMap[item.name]}
          value={item.id}
        />
      ))}
    </div>
  )
}
