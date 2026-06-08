import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, props: any) {
  const params = await props.params
  return handleProxy(req, params.path || [])
}

export async function POST(req: NextRequest, props: any) {
  const params = await props.params
  return handleProxy(req, params.path || [])
}

export async function PUT(req: NextRequest, props: any) {
  const params = await props.params
  return handleProxy(req, params.path || [])
}

export async function DELETE(req: NextRequest, props: any) {
  const params = await props.params
  return handleProxy(req, params.path || [])
}

async function handleProxy(req: NextRequest, path: string[]) {
  // If the backend runs on port 3000 under /api, we direct it there.
  // We make this configurable via BACKEND_API_URL.
  const backendBaseUrl = process.env.BACKEND_API_URL || 'http://localhost:3000/api'
  
  // Clean backslashes / double-slashes
  const subPath = path.join('/')
  const url = `${backendBaseUrl.replace(/\/+$/, '')}/${subPath}${req.nextUrl.search}`

  const headers = new Headers()
  req.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    if (!['host', 'connection', 'content-length', 'cookie'].includes(lowerKey)) {
      headers.set(key, value)
    }
  })

  // Next.js runtime headers injection can be placed here if needed.
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
      // Avoid browser mismatch issues with content-encoding or keep-alive
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
    console.error('[-] Proxy connection error forwarding to:', url, error)
    return NextResponse.json(
      { error: 'Backend unreachable. Please verify if your separate backend is running.', details: error.message },
      { status: 502 }
    )
  }
}
