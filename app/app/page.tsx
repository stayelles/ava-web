'use client'

import { useUserData } from '@/components/app/hooks/useUserData'
import { LoginScreen } from '@/components/app/LoginScreen'
import { AppShell } from '@/components/app/AppShell'

export default function AvaWebApp() {
  const {
    user, loginLoading, loginError, requestOtp, verifyOtp, verifyMfa,
    logout, refreshUser, updatePin, permissions,
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

  return (
    <AppShell
      user={user}
      permissions={permissions}
      onLogout={logout}
      onUpdatePin={updatePin}
      onRefresh={refreshUser}
    />
  )
}
