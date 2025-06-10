import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const postId = formData.get("postId") as string
    const file = formData.get("image") as File
    const position = parseInt(formData.get("position") as string)

    if (!postId || !file || isNaN(position)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify user owns the post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    if (post.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Upload image to storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${postId}/${Date.now()}_${position}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(fileName, file)

    if (uploadError) {
      console.error("Image upload error:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      )
    }

    // Save image record
    const { data: imageRecord, error: imageRecordError } = await supabase
      .from("post_images")
      .insert({
        post_id: postId,
        storage_path: uploadData.path,
        position,
      })
      .select()
      .single()

    if (imageRecordError) {
      console.error("Image record error:", imageRecordError)
      // Clean up uploaded file
      await supabase.storage
        .from("post-images")
        .remove([uploadData.path])
      
      return NextResponse.json(
        { error: "Failed to save image record" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      image: imageRecord,
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${uploadData.path}`
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get("imageId")

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      )
    }

    // Get image info and verify ownership
    const { data: imageData, error: imageError } = await supabase
      .from("post_images")
      .select(`
        storage_path,
        posts!inner(user_id)
      `)
      .eq("id", imageId)
      .single()

    if (imageError || !imageData) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      )
    }

    if (imageData.posts.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("post-images")
      .remove([imageData.storage_path])

    if (storageError) {
      console.error("Storage deletion error:", storageError)
    }

    // Delete record
    const { error: deleteError } = await supabase
      .from("post_images")
      .delete()
      .eq("id", imageId)

    if (deleteError) {
      console.error("Image record deletion error:", deleteError)
      return NextResponse.json(
        { error: "Failed to delete image record" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}