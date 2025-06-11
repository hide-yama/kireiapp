import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Get user's group
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

    // Build query
    let query = supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (nickname, avatar_url),
        post_images (id, storage_path, position)
      `)
      .eq("group_id", memberData.group_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq("category", category)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error("Error fetching posts:", error)
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      )
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}