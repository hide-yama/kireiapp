import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const body = formData.get("body") as string
    const category = formData.get("category") as string
    const place = formData.get("place") as string

    if (!body || !category) {
      return NextResponse.json(
        { error: "Body and category are required" },
        { status: 400 }
      )
    }


    // Get user's active group (assuming user has one group for now)
    const { data: memberData, error: memberError } = await supabase
      .from("family_members")
      .select("group_id")
      .eq("user_id", user.id)
      .single()

    if (memberError || !memberData) {
      return NextResponse.json(
        { error: "User not in any group" },
        { status: 400 }
      )
    }

    // Create post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        group_id: memberData.group_id,
        user_id: user.id,
        body,
        category,
        place: place || null,
      })
      .select()
      .single()

    if (postError) {
      console.error("Post creation error:", postError)
      return NextResponse.json(
        { error: "Failed to create post" },
        { status: 500 }
      )
    }

    // Handle image uploads
    const imageFiles: File[] = []
    const imageDebugInfo: any[] = []
    
    for (let i = 0; i < 4; i++) {
      const file = formData.get(`image_${i}`) as File
      if (file && file.size > 0) {
        imageDebugInfo.push({
          index: i,
          name: file.name,
          size: file.size,
          type: file.type
        })
        imageFiles.push(file)
      }
    }

    const uploadResults: any[] = []
    const uploadErrors: any[] = []

    if (imageFiles.length > 0) {
      const imagePromises = imageFiles.map(async (file, index) => {
        try {
          const fileExt = file.name.split('.').pop()
          const fileName = `${post.id}/${index}.${fileExt}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("post-images")
            .upload(fileName, file)

          if (uploadError) {
            uploadErrors.push({
              index,
              fileName,
              error: uploadError,
              errorMessage: uploadError.message || 'Unknown upload error'
            })
            return null
          }

          uploadResults.push({
            index,
            fileName,
            path: uploadData.path
          })

          // Save image record
          const imageRecord = {
            post_id: post.id,
            storage_path: uploadData.path,
            position: index,
          }
          
          const { data: imageData, error: imageRecordError } = await supabase
            .from("post_images")
            .insert(imageRecord)
            .select()
            .single()

          if (imageRecordError) {
            uploadErrors.push({
              index,
              type: 'database',
              error: imageRecordError,
              errorMessage: imageRecordError.message || 'Unknown database error',
              record: imageRecord
            })
          } else {
            uploadResults.push({
              index,
              type: 'database',
              saved: true,
              data: imageData
            })
          }

          return uploadData
        } catch (error: any) {
          uploadErrors.push({
            index,
            type: 'exception',
            error: error.message || error.toString(),
            stack: error.stack
          })
          return null
        }
      })

      await Promise.all(imagePromises)
    }

    // Return detailed information for debugging
    const response = {
      success: true,
      post,
      debug: {
        imageFilesCount: imageFiles.length,
        imageUploadAttempted: imageFiles.length > 0,
        formDataKeys: Array.from(formData.keys()),
        imageKeys: Array.from(formData.keys()).filter(key => key.startsWith('image_')),
        imageDebugInfo,
        uploadResults,
        uploadErrors
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}