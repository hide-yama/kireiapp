import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create post-images bucket if it doesn't exist
    const { data: existingBucket, error: checkError } = await supabase.storage.getBucket('post-images')
    
    if (!existingBucket) {
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('post-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })

      if (createError) {
        console.error('Error creating post-images bucket:', createError)
        return NextResponse.json({ 
          error: 'Failed to create storage bucket', 
          details: createError 
        }, { status: 500 })
      }

      console.log('Created post-images bucket:', newBucket)
      return NextResponse.json({ 
        message: 'Storage bucket created successfully',
        bucket: newBucket 
      })
    }

    return NextResponse.json({ 
      message: 'Storage bucket already exists',
      bucket: existingBucket 
    })

  } catch (error) {
    console.error('Storage setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}