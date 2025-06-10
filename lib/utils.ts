import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { PostCategory, isValidPostCategory } from "@/types/domain"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 日付を日本語フォーマットで表示
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * 日付を相対時間で表示（例：2時間前、1日前）
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "たった今"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分前`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}時間前`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}日前`
  }

  return formatDate(dateString)
}

/**
 * ファイルサイズを人間が読みやすい形式に変換
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * カテゴリの色を取得
 */
export function getCategoryColor(category: PostCategory): string {
  const colorMap: Record<PostCategory, string> = {
    '料理': 'bg-orange-100 text-orange-800',
    '掃除': 'bg-blue-100 text-blue-800',
    '洗濯': 'bg-purple-100 text-purple-800',
    '買い物': 'bg-green-100 text-green-800',
    'その他': 'bg-gray-100 text-gray-800',
  }
  
  return colorMap[category] || colorMap['その他']
}

/**
 * カテゴリのアイコンを取得
 */
export function getCategoryIcon(category: PostCategory): string {
  const iconMap: Record<PostCategory, string> = {
    '料理': '🍳',
    '掃除': '🧹',
    '洗濯': '👕',
    '買い物': '🛒',
    'その他': '📝',
  }
  
  return iconMap[category] || iconMap['その他']
}

/**
 * 文字列を安全にPostCategoryに変換
 */
export function safeParseCategory(value: string): PostCategory | null {
  return isValidPostCategory(value) ? value : null
}

/**
 * 招待コードを生成
 */
export function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * URLの安全性をチェック
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    // Supabaseのストレージドメインのみ許可
    const allowedDomains = [
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', ''),
    ].filter(Boolean)
    
    return allowedDomains.some(domain => urlObj.hostname === domain)
  } catch {
    return false
  }
}

/**
 * エラーメッセージを日本語化
 */
export function getJapaneseErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error
  
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message
    
    // よくあるエラーメッセージの日本語化
    const errorMap: Record<string, string> = {
      'Invalid email or password': 'メールアドレスまたはパスワードが正しくありません',
      'User already registered': 'このメールアドレスは既に登録されています',
      'Network request failed': 'ネットワークエラーが発生しました',
      'Unauthorized': '認証が必要です',
      'Forbidden': 'アクセス権限がありません',
      'Not found': 'データが見つかりません',
    }
    
    for (const [english, japanese] of Object.entries(errorMap)) {
      if (message.includes(english)) {
        return japanese
      }
    }
    
    return message
  }
  
  return '予期しないエラーが発生しました'
}

/**
 * デバウンス関数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * 配列をページング
 */
export function paginate<T>(
  array: T[],
  page: number,
  limit: number
): { data: T[]; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean } {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const data = array.slice(startIndex, endIndex)
  const totalPages = Math.ceil(array.length / limit)
  
  return {
    data,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  }
}