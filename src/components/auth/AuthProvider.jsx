import { AuthContext, useAuthState } from '../../hooks/useAuth'

export default function AuthProvider({ children }) {
  const auth = useAuthState()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}
