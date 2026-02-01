import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 로그인하지 않은 경우 로그인 페이지로
  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white">관리자 대시보드</h1>
          <form action="/admin/auth/signout" method="post">
            <Button variant="outline" type="submit">로그아웃</Button>
          </form>
        </div>

        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle>로그인 성공!</CardTitle>
            <CardDescription>GitHub OAuth 인증이 완료되었습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">사용자 정보:</p>
              <div className="bg-slate-800 rounded-lg p-4 space-y-1">
                <p className="text-sm"><span className="text-slate-400">이메일:</span> <span className="text-white font-mono">{user.email}</span></p>
                <p className="text-sm"><span className="text-slate-400">ID:</span> <span className="text-white font-mono text-xs">{user.id}</span></p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                ✅ 1단계 완료: GitHub 로그인 동작 확인됨
              </p>
              <p className="text-xs text-slate-500 mt-2">
                다음 단계에서 관리자 권한 체크 및 CRUD 기능을 구현합니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
