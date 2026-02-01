import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Supabase 세션 업데이트
  const supabaseResponse = await updateSession(request)
  
  const host = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  
  const isAdminDomain = host.startsWith('admin.')
  const isAdminPath = pathname.startsWith('/admin')

  // admin.kfondo.cc 도메인에서만 /admin 경로 허용
  if (isAdminDomain) {
    // admin 도메인에서 /admin 경로가 아니면 /admin으로 리다이렉트
    if (!isAdminPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
    // admin 도메인에서 /admin 경로면 허용
    return supabaseResponse
  }

  // 메인 도메인(www 등)에서 /admin 경로 접근 시 홈으로 리다이렉트
  if (isAdminPath && !isAdminDomain) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 경로에 매칭:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico (파비콘)
     * - public 폴더 내 파일 (*.svg, *.png 등)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
