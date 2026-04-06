export const SUPABASE_URL = 'https://bmcvyvyjqxehwmkddtya.supabase.co'
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtY3Z5dnlqcXhlaHdta2RkdHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NTMwMDcsImV4cCI6MjA2MjUyOTAwN30.Q4OppbvjThogFPlldXjkx5WlbI7FkVvClClThEL6ejY'

export const SUPABASE_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

export const GEMINI_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025'
export const GEMINI_VOICE = 'Kore'
export const WS_BASE =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent'

export const GUMROAD_URL = 'https://woonixltd.gumroad.com/l/ava-pro'

export const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  fr: 'Parle UNIQUEMENT en français. Sois naturelle, chaleureuse et concise.',
  en: 'Speak ONLY in English. Be natural, warm and concise.',
  tr: 'YALNIZCA Türkçe konuş. Doğal, sıcak ve özlü ol.',
  de: 'Sprich NUR auf Deutsch. Sei natürlich, warm und prägnant.',
}

export const SYSTEM_INSTRUCTION = (language: string, webSearch: boolean) =>
  `Tu es Ava, une assistante IA vocale disponible sur navigateur. Tu es chaleureuse, intelligente et utile. Réponds de manière concise et naturelle. Tu peux aider avec des questions, conseils, rédaction, traductions, explications, et plus. Tu n'as pas accès à l'ordinateur de l'utilisateur.${webSearch ? " Tu as accès à Google Search pour des informations en temps réel." : ""}
${LANGUAGE_INSTRUCTIONS[language] ?? LANGUAGE_INSTRUCTIONS.fr}
PRIORITÉ ABSOLUE : sois rapide, naturelle et chaleureuse.`
