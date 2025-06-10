import { z } from "zod"
import { PostCategory, isValidPostCategory } from "@/types/domain"

const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.expected === "string") {
        return { message: "文字列を入力してください" }
      }
      if (issue.expected === "number") {
        return { message: "数値を入力してください" }
      }
      break
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === "email") {
        return { message: "有効なメールアドレスを入力してください" }
      }
      if (issue.validation === "url") {
        return { message: "有効なURLを入力してください" }
      }
      break
    case z.ZodIssueCode.too_small:
      if (issue.type === "string") {
        return { message: `${issue.minimum}文字以上入力してください` }
      }
      if (issue.type === "array") {
        return { message: `${issue.minimum}個以上選択してください` }
      }
      break
    case z.ZodIssueCode.too_big:
      if (issue.type === "string") {
        return { message: `${issue.maximum}文字以下で入力してください` }
      }
      if (issue.type === "array") {
        return { message: `${issue.maximum}個以下で選択してください` }
      }
      break
    default:
      return { message: ctx.defaultError }
  }
  return { message: ctx.defaultError }
}

z.setErrorMap(customErrorMap)

// 共通バリデーションスキーマ
export const emailSchema = z
  .string()
  .min(1, "メールアドレスを入力してください")
  .email("有効なメールアドレスを入力してください")

export const passwordSchema = z
  .string()
  .min(8, "パスワードは8文字以上で入力してください")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "パスワードは大文字、小文字、数字を含める必要があります"
  )

export const nameSchema = z
  .string()
  .min(1, "名前を入力してください")
  .max(50, "名前は50文字以下で入力してください")

export const nicknameSchema = z
  .string()
  .min(1, "ニックネームを入力してください")
  .max(20, "ニックネームは20文字以下で入力してください")

export const groupNameSchema = z
  .string()
  .min(1, "グループ名を入力してください")
  .max(30, "グループ名は30文字以下で入力してください")

export const invitationCodeSchema = z
  .string()
  .min(1, "招待コードを入力してください")
  .length(8, "招待コードは8文字です")
  .regex(/^[A-Z0-9]+$/, "招待コードは大文字と数字のみです")

export const postBodySchema = z
  .string()
  .min(1, "投稿内容を入力してください")
  .max(1000, "投稿内容は1000文字以下で入力してください")

export const postCategorySchema = z
  .string()
  .refine(isValidPostCategory, "有効なカテゴリを選択してください")
  .transform((val) => val as PostCategory)

export const postPlaceSchema = z
  .string()
  .max(50, "場所は50文字以下で入力してください")
  .optional()

export const commentContentSchema = z
  .string()
  .min(1, "コメントを入力してください")
  .max(500, "コメントは500文字以下で入力してください")

export const fileSchema = z
  .any()
  .refine((file) => file instanceof File, "ファイルを選択してください")
  .refine((file) => file.size <= 5 * 1024 * 1024, "ファイルサイズは5MB以下にしてください")
  .refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    "JPEG、PNG、WebP形式の画像ファイルのみサポートしています"
  )

// 認証フォームスキーマ
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "パスワード確認を入力してください"),
    nickname: nicknameSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  })

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "パスワードを入力してください"),
})

export const profileSchema = z.object({
  nickname: nicknameSchema,
  bio: z.string().max(200, "自己紹介は200文字以下で入力してください").optional(),
})

export const createGroupSchema = z.object({
  name: groupNameSchema,
  description: z.string().max(200, "説明は200文字以下で入力してください").optional(),
})

export const joinGroupSchema = z.object({
  invitationCode: invitationCodeSchema,
})

export const createPostSchema = z.object({
  body: postBodySchema,
  category: postCategorySchema,
  place: postPlaceSchema,
  group_id: z.string().uuid("有効なグループを選択してください"),
  images: z.array(fileSchema).max(4, "画像は最大4枚まで添付できます").optional()
})

export const updatePostSchema = z.object({
  body: postBodySchema.optional(),
  category: postCategorySchema.optional(),
  place: postPlaceSchema.optional(),
})

export const createCommentSchema = z.object({
  post_id: z.string().uuid("有効な投稿を選択してください"),
  content: commentContentSchema,
})

// サーバーサイド用バリデーション
export const serverCreatePostSchema = z.object({
  body: postBodySchema,
  category: z.string().refine(isValidPostCategory, "有効なカテゴリを選択してください"),
  place: z.string().max(50).optional(),
  group_id: z.string().uuid("有効なグループIDが必要です"),
})

export type SignUpFormData = z.infer<typeof signUpSchema>
export type SignInFormData = z.infer<typeof signInSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type CreateGroupFormData = z.infer<typeof createGroupSchema>
export type JoinGroupFormData = z.infer<typeof joinGroupSchema>
export type CreatePostFormData = z.infer<typeof createPostSchema>
export type UpdatePostFormData = z.infer<typeof updatePostSchema>
export type CreateCommentFormData = z.infer<typeof createCommentSchema>
export type ServerCreatePostData = z.infer<typeof serverCreatePostSchema>