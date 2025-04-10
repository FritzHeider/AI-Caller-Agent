// Path: /frontend/pages/api/crm-logs.ts

import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'

// Initialize Supabase client using env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // use service role key if private
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase
    .from('crm_logs')
    .select('*')
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Supabase fetch error:', error)
    return res.status(500).json({ error: 'Failed to fetch logs from Supabase.' })
  }

  return res.status(200).json(data)
}
