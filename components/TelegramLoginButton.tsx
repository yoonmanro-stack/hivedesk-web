'use client'

import { useEffect, useRef } from 'react'

interface TelegramLoginButtonProps {
  botName: string
  authUrl: string
}

export default function TelegramLoginButton({ botName, authUrl }: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 기존 위젯 제거 (HMR 대비)
    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', botName)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-auth-url', authUrl)
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-radius', '12')
    script.async = true

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [botName, authUrl])

  return <div ref={containerRef} className="flex justify-center" />
}
