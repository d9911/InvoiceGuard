import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return handleDirectProxy(req)
}

export async function POST(req: NextRequest) {
  return handleDirectProxy(req)
}

export async function PUT(req: NextRequest) {
  return handleDirectProxy(req)
}

export async function DELETE(req: NextRequest) {
  return handleDirectProxy(req)
}

async function handleDirectProxy(req: NextRequest) {
  const backendBaseUrl = process.env.BACKEND_API_URL || 'http://localhost:3000/api'
  
  // Try to read dynamic endpoint from search params e.g. /api/proxy?endpoint=auth/login
  const { searchParams } = new URL(req.url)
  const endpoint = searchParams.get('endpoint') || ''
  
  const url = `${backendBaseUrl.replace(/\/+$/, '')}/${endpoint}`

  const headers = new Headers()
  req.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    if (!['host', 'connection', 'content-length', 'cookie'].includes(lowerKey)) {
      headers.set(key, value)
    }
  })

  let body: any = null
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      body = await req.arrayBuffer()
    } catch (e) {
      body = null
    }
  }

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      body: body,
      cache: 'no-store',
    })

    const responseData = await response.arrayBuffer()
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase()
      if (!['transfer-encoding', 'connection', 'content-encoding'].includes(lowerKey)) {
        responseHeaders.set(key, value)
      }
    })

    return new NextResponse(responseData, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error: any) {
    console.error('[-] Proxy direct execution error forwarding to:', url, error)
    return NextResponse.json(
      { error: 'Backend unreachable. Please verify if your separate backend is running.', details: error.message },
      { status: 502 }
    )
  }
}
