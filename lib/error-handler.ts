import { toast } from "@/components/ui/use-toast"

export interface AppError extends Error {
  code?: string
  status?: number
  details?: unknown
}

export class APIError extends Error implements AppError {
  code: string
  status: number
  details?: unknown

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message)
    this.name = 'APIError'
    this.code = code
    this.status = status
    this.details = details
  }
}

export class ValidationError extends Error implements AppError {
  code = 'VALIDATION_ERROR'
  details: Record<string, string[]>

  constructor(message: string, details: Record<string, string[]>) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}

export class NetworkError extends Error implements AppError {
  code = 'NETWORK_ERROR'

  constructor(message: string = 'ネットワークエラーが発生しました') {
    super(message)
    this.name = 'NetworkError'
  }
}

// エラーメッセージの日本語化
const errorMessages: Record<string, string> = {
  // Authentication errors
  'Invalid login credentials': 'メールアドレスまたはパスワードが正しくありません',
  'Email not confirmed': 'メールアドレスの確認が完了していません',
  'User already registered': 'このメールアドレスは既に登録されています',
  'User not found': 'ユーザーが見つかりません',
  'For security purposes, you can only request this after': 'セキュリティのため、しばらくお待ちください',
  
  // Database errors
  'duplicate key value violates unique constraint': 'データが重複しています',
  'foreign key constraint': '関連するデータが存在しません',
  'check constraint': '入力値が無効です',
  
  // Network errors
  'Failed to fetch': 'ネットワークエラーが発生しました',
  'NetworkError': 'ネットワークエラーが発生しました',
  'fetch failed': 'データの取得に失敗しました',
  
  // Generic errors
  'Internal Server Error': 'サーバーエラーが発生しました',
  'Bad Request': 'リクエストが無効です',
  'Unauthorized': '認証が必要です',
  'Forbidden': 'アクセス権限がありません',
  'Not Found': 'データが見つかりません',
  'Too Many Requests': 'リクエストが多すぎます。しばらく待ってからやり直してください',
}

export function getLocalizedErrorMessage(error: AppError | Error): string {
  const message = error.message || 'unknown error'
  
  // Check for exact matches first
  if (errorMessages[message]) {
    return errorMessages[message]
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(errorMessages)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }
  
  // Status code based messages
  if ('status' in error && error.status) {
    switch (error.status) {
      case 400: return 'リクエストが無効です'
      case 401: return '認証が必要です'
      case 403: return 'アクセス権限がありません'
      case 404: return 'データが見つかりません'
      case 409: return 'データが競合しています'
      case 429: return 'リクエストが多すぎます'
      case 500: return 'サーバーエラーが発生しました'
      case 502: return 'サーバーに接続できません'
      case 503: return 'サービスが利用できません'
      default: return `エラーが発生しました (${error.status})`
    }
  }
  
  return '予期しないエラーが発生しました'
}

export function handleError(error: unknown, options?: {
  showToast?: boolean
  fallbackMessage?: string
  onError?: (error: AppError) => void
}) {
  const { showToast = true, fallbackMessage, onError } = options || {}
  
  let appError: AppError
  
  if (error instanceof APIError || error instanceof ValidationError || error instanceof NetworkError) {
    appError = error
  } else if (error instanceof Error) {
    appError = new APIError(
      error.message,
      'UNKNOWN_ERROR',
      500,
      error
    )
  } else {
    appError = new APIError(
      fallbackMessage || 'Unknown error occurred',
      'UNKNOWN_ERROR',
      500,
      error
    )
  }
  
  const localizedMessage = getLocalizedErrorMessage(appError)
  
  // Log error for debugging
  console.error('Application Error:', appError.message, {
    code: appError.code,
    status: appError.status,
    details: appError.details,
  })
  
  // Show toast notification
  if (showToast) {
    toast({
      title: "エラーが発生しました",
      description: localizedMessage,
      variant: "destructive",
    })
  }
  
  // Call custom error handler
  if (onError) {
    onError(appError)
  }
  
  return appError
}

// Async wrapper for error handling
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options?: Parameters<typeof handleError>[1]
): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    handleError(error, options)
    return null
  }
}

// React hook for error handling
export function useErrorHandler() {
  return {
    handleError: (error: unknown, options?: Parameters<typeof handleError>[1]) => 
      handleError(error, options),
    withErrorHandling: <T>(
      fn: () => Promise<T>,
      options?: Parameters<typeof handleError>[1]
    ) => withErrorHandling(fn, options),
  }
}