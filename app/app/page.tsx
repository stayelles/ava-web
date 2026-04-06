'use client'

import { useUserData } from '@/components/app/hooks/useUserData'
import { LoginScreen } from '@/components/app/LoginScreen'
import { AppShell } from '@/components/app/AppShell'

export default function AvaWebApp() {
  const { user, loginLoading, loginError, login, logout, refreshUser, updatePin } = useUserData()

  if (!user) {
    return (
      <LoginScreen
        onLogin={login}
        loading={loginLoading}
        error={loginError}
      />
    )
  }

  return (
    <AppShell
      user={user}
      onLogout={logout}
      onUpdatePin={updatePin}
      onRefresh={refreshUser}
    />
  )
}
