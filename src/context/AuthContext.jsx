import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isPro, setIsPro] = useState(false)
  const [plan, setPlan] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  async function checkProStatus(userId) {
    try {
      const res = await fetch(`/api/pro-status?user_id=${userId}`)
      const data = await res.json()
      setIsPro(data.isPro)
      setPlan(data.plan)
    } catch {
      setIsPro(false)
      setPlan(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) checkProStatus(u.id)
      else setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) checkProStatus(u.id)
      else { setIsPro(false); setPlan(null) }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Mark loading done once we've checked pro status
  useEffect(() => {
    if (user !== null) setAuthLoading(false)
    // also clear loading if user is null (handled above)
  }, [isPro, user])

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setIsPro(false)
    setPlan(null)
  }

  return (
    <AuthContext.Provider value={{ user, isPro, plan, authLoading, logout, checkProStatus }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
