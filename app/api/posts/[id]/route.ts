import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: post, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (nickname, avatar_url),
        post_images (id, storage_path, position)
      `)
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { body, category, place } = await request.json()

    if (!body || !category) {
      return NextResponse.json(
        { error: "Body and category are required" },
        { status: 400 }
      )
    }

    // Check if user owns the post
    const { data: existingPost, error: checkError } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", id)
      .single()

    if (checkError || !existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    if (existingPost.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Update post
    const { data: updatedPost, error: updateError } = await supabase
      .from("posts")
      .update({
        body,
        category,
        place: place || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Post update error:", updateError)
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, post: updatedPost })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user owns the post and get images
    const { data: existingPost, error: checkError } = await supabase
      .from("posts")
      .select(`
        user_id,
        post_images (storage_path)
      `)
      .eq("id", id)
      .single()

    if (checkError || !existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    if (existingPost.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Delete images from storage
    if (existingPost.post_images && existingPost.post_images.length > 0) {
      const imagePaths = existingPost.post_images.map(img => img.storage_path)
      await supabase.storage
        .from("post-images")
        .remove(imagePaths)
    }

    // Delete post (this will cascade delete post_images records)
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Post deletion error:", deleteError)
      return NextResponse.json(
        { error: "Failed to delete post" },
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