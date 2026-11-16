import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { finishLogin } from '../lib/auth'
import { useSession } from '../lib/session'

/** Consumes the oauth callback fragment, then returns to the cover or the shelf. */
export const CallbackRoute = () => {
  const navigate = useNavigate()
  const { refresh } = useSession()
  const started = useRef(false)

  useEffect(() => {
    if (started.current) {
      return
    }
    started.current = true

    const hash = window.location.hash
    // the fragment carries the authorization code, so drop it from the address bar
    window.history.replaceState(null, '', window.location.pathname + window.location.search)

    const complete = async () => {
      try {
        await finishLogin(hash)
        refresh()
        await navigate('/', { replace: true })
      } catch {
        await navigate('/', { replace: true, state: { loginFailed: true } })
      }
    }

    void complete()
  }, [navigate, refresh])

  return <p className="callback">opening your notebook…</p>
}
