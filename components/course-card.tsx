import Image from "next/image"
import Link from "next/link"
import { BookOpen, ImageIcon } from "lucide-react"

import { IconBadge } from "@/components/icon-badge"
import { CourseProgress } from "@/components/course-progress"

import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "group hover:shadow-sm transition overflow-hidden border rounded-lg p-3",
  {
    variants: {
      size: {
        default: "h-full",
        slider: "w-[300px] h-[300px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type CardVariantsProps = VariantProps<typeof cardVariants>

interface CourseCardProps extends CardVariantsProps {
  id: string
  title: string
  imageUrl: string | null
  chaptersLength: number
  progress: number | null
  category: string | null
}

export const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  progress,
  category,
  size,
}: CourseCardProps) => {
  return (
    <Link href={`/courses/${id}`}>
      <div className={cardVariants({ size })}>
        <div className="relative w-full aspect-video rounded-md overflow-hidden">
          {imageUrl ? (
            <Image fill className="object-cover" alt={title} src={imageUrl} />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-slate-200">
              <ImageIcon className="h-8 w-8 text-slate-600" />
            </div>
          )}
        </div>
        <div className="flex flex-col pt-2">
          <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transition line-clamp-2">
            {title}
          </div>
          <p className="text-xs text-muted-foreground">{category}</p>
          <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
            <div className="flex items-center gap-x-1 text-slate-500">
              <IconBadge size="sm" icon={BookOpen} />
              <span>
                {chaptersLength} {chaptersLength === 1 ? "Chapter" : "Chapters"}
              </span>
            </div>
          </div>
          {progress !== null ? (
            <CourseProgress
              variant={progress === 100 ? "success" : "default"}
              size="sm"
              value={progress}
            />
          ) : ""}
        </div>
      </div>
    </Link>
  )
}
