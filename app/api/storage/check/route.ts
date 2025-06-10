import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      return NextResponse.json({ 
        error: 'Failed to list buckets', 
        details: bucketsError 
      }, { status: 500 })
    }

    // Check each bucket's files
    const bucketDetails = await Promise.all(
      (buckets || []).map(async (bucket) => {
        const { data: files, error } = await supabase.storage
          .from(bucket.name)
          .list('', { limit: 10 })
        
        return {
          ...bucket,
          fileCount: files?.length || 0,
          files: files?.slice(0, 5) || [],
          error
        }
      })
    )

    return NextResponse.json({
      buckets: bucketDetails,
      totalBuckets: buckets?.length || 0
    })

  } catch (error) {
    console.error('Storage check error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}