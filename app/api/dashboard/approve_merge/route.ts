import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { task_id, branch_name } = data
    if (!task_id || !branch_name) {
      return NextResponse.json({ error: 'task_id and branch_name are required' }, { status: 400 })
    }

    // Call the bridge's /api/approve_merge endpoint
    const response = await fetch('http://localhost:4000/api/approve_merge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task_id, branch_name }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      try {
        const errorJson = JSON.parse(errorText)
        return NextResponse.json({ error: errorJson.error || 'Bridge error' }, { status: response.status })
      } catch {
        return NextResponse.json({ error: `Bridge error: ${errorText}` }, { status: response.status })
      }
    }

    const resData = await response.json()
    return NextResponse.json(resData)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
