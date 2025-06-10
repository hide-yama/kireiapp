interface CategoryBadgeProps {
  category: string
  size?: "sm" | "md" | "lg"
}

const categoryColors = {
  "料理": "bg-red-100 text-red-800",
  "掃除": "bg-blue-100 text-blue-800", 
  "洗濯": "bg-green-100 text-green-800",
  "買い物": "bg-yellow-100 text-yellow-800",
  "その他": "bg-gray-100 text-gray-800",
}

const sizeClasses = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1 text-sm", 
  lg: "px-4 py-2 text-base",
}

export function CategoryBadge({ category, size = "md" }: CategoryBadgeProps) {
  const colorClass = categoryColors[category as keyof typeof categoryColors] || categoryColors["その他"]
  const sizeClass = sizeClasses[size]

  return (
    <span className={`inline-block rounded-full font-medium ${colorClass} ${sizeClass}`}>
      {category}
    </span>
  )
}