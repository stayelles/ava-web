'use client'

import { useUserData } from '@/components/app/hooks/useUserData'
import { useConfig } from '@/components/app/hooks/useConfig'
import { LoginScreen } from '@/components/app/LoginScreen'
import { AppShell } from '@/components/app/AppShell'

export default function AvaWebApp() {
  const {
    user, loginLoading, loginError, login, logout,
    refreshUser, updatePin, permissions, decrementCredits, trackVoiceTime,
    customApiKey, saveApiKey, removeApiKey, incrementTextMessages,
  } = useUserData()

  // Fetch shared Gemini key from Edge Function — never baked into bundle
  const sharedGeminiKey = useConfig(user?.id)

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
      permissions={permissions}
      onLogout={logout}
      onUpdatePin={updatePin}
      onRefresh={refreshUser}
      onDecrementCredits={decrementCredits}
      onTrackVoiceTime={trackVoiceTime}
      customApiKey={customApiKey}
      sharedGeminiKey={sharedGeminiKey}
      onSaveApiKey={saveApiKey}
      onRemoveApiKey={removeApiKey}
      onIncrementTextMessages={incrementTextMessages}
    />
  )
}
