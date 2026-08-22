'use client'

import { LoginScreen } from '@/components/app/LoginScreen'
import { useUserData } from '@/components/app/hooks/useUserData'
import { AvaOpsDashboard } from '@/components/ops/AvaOpsDashboard'

export default function AvaOpsPage() {
  const {
    user, loginLoading, loginError, requestOtp, verifyOtp, verifyMfa, logout,
  } = useUserData()

  if (!user) {
    return (
      <LoginScreen
        loading={loginLoading}
        error={loginError}
        onOtpRequest={requestOtp}
        onOtpVerify={verifyOtp}
        onMfaVerify={verifyMfa}
      />
    )
  }

  return <AvaOpsDashboard user={user} onLogout={logout} />
}
