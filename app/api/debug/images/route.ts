import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all post images
    const { data: images, error } = await supabase
      .from('post_images')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    console.log('Post images data:', images)
    console.log('Post images error:', error)

    // Also check if post-images bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    console.log('Storage buckets:', buckets)
    console.log('Buckets error:', bucketsError)

    // Check files in post-images bucket
    let bucketFiles = []
    let bucketError = null
    try {
      const { data: files, error } = await supabase.storage
        .from('post-images')
        .list('', { limit: 100 })
      bucketFiles = files || []
      bucketError = error
      console.log('Files in post-images bucket:', files)
      console.log('Bucket files error:', error)
    } catch (e) {
      console.error('Error listing bucket files:', e)
      bucketError = e
    }

    return NextResponse.json({
      images: images || [],
      buckets: buckets || [],
      bucketFiles,
      imagesError: error,
      bucketsError,
      bucketError
    })

  } catch (error) {
    console.error('Debug images error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}