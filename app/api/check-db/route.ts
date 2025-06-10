import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // List of tables that should exist from our migration
    const expectedTables = [
      'profiles',
      'family_groups', 
      'family_members',
      'posts',
      'post_images',
      'likes',
      'comments',
      'notifications'
    ]
    
    const tableStatus: Record<string, boolean> = {}
    
    // Check each table by attempting a simple query
    for (const tableName of expectedTables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        tableStatus[tableName] = !error
        
        if (error) {
          console.log(`Table ${tableName} check failed:`, error.message)
        }
      } catch (err) {
        tableStatus[tableName] = false
        console.log(`Table ${tableName} check error:`, err)
      }
    }
    
    const allTablesExist = Object.values(tableStatus).every(exists => exists)
    
    return NextResponse.json({
      success: true,
      allTablesExist,
      tableStatus,
      message: allTablesExist 
        ? 'All expected database tables exist and are accessible'
        : 'Some database tables are missing or not accessible'
    })
  } catch (error) {
    console.error('Database check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check database tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}