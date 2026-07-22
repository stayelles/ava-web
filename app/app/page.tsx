'use client'

import { useUserData } from '@/components/app/hooks/useUserData'
import { LoginScreen } from '@/components/app/LoginScreen'
import { AppShell } from '@/components/app/AppShell'

export default function AvaWebApp() {
  const {
    user, loginLoading, loginError, login, logout,
    refreshUser, updatePin, permissions, decrementCredits, trackVoiceTime,
    customApiKey, saveApiKey, removeApiKey, incrementTextMessages,
    registerRequest, registerVerify, requestPinReset, confirmPinReset,
  } = useUserData()

  if (!user) {
    return (
      <LoginScreen
        onLogin={login}
        loading={loginLoading}
        error={loginError}
        onRegisterRequest={registerRequest}
        onRegisterVerify={registerVerify}
        onPinResetRequest={requestPinReset}
        onPinResetConfirm={confirmPinReset}
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
      onSaveApiKey={saveApiKey}
      onRemoveApiKey={removeApiKey}
      onIncrementTextMessages={incrementTextMessages}
    />
  )
}
