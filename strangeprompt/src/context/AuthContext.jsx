import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import toast from 'react-hot-toast'
import { auth } from '../firebase/config'
import {
  APP_NAME,
  logoutUser,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from '../firebase/auth'
import {
  fetchUserProfile,
  ensureUserHasUsername,
  scheduleNotification,
  updateUserProfile,
} from '../firebase/firestore'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      try {
        if (currentUser) {
          const userDoc = await fetchUserProfile(currentUser.uid)
          const ensuredProfile = await ensureUserHasUsername({
            userId: currentUser.uid,
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            existingProfile: userDoc,
          })
          setProfile(ensuredProfile)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error('Failed to load user profile', error)
        setProfile(null)
      } finally {
        setInitializing(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return null
    try {
      await auth.currentUser?.reload()
      setUser(auth.currentUser)
    } catch (error) {
      console.error('Failed to reload auth user', error)
    }
    const snapshot = await fetchUserProfile(user.uid)
    const ensuredProfile = await ensureUserHasUsername({
      userId: user.uid,
      displayName: user.displayName || '',
      email: user.email || '',
      existingProfile: snapshot,
    })
    setProfile(ensuredProfile)
    return ensuredProfile
  }, [user])

  const signUp = useCallback(
    async ({ email, password, displayName }) => {
      const newUser = await signUpWithEmail({ email, password, displayName })
      toast.success(`Account created. Welcome ${displayName || 'creator'}!`)

      await scheduleNotification({
        userId: newUser.uid,
        type: 'welcome',
        message: `Welcome to ${APP_NAME}! Start uploading your images and prompts to share with the community and earn from views.`,
      })

      await refreshProfile()
      return newUser
    },
    [refreshProfile],
  )

  const signIn = useCallback(async ({ email, password }) => {
    const credential = await signInWithEmail({ email, password })
    toast.success('Signed in')
    await refreshProfile()
    return credential.user
  }, [refreshProfile])

  const signInGoogle = useCallback(async () => {
    const credential = await signInWithGoogle()
    toast.success('Signed in with Google')
    await refreshProfile()
    return credential
  }, [refreshProfile])

  const signOut = useCallback(async () => {
    await logoutUser()
    toast.success('Signed out')
    setProfile(null)
  }, [])

  const updateProfileDetails = useCallback(
    async (payload) => {
      if (!user) throw new Error('Not authenticated')
      await updateUserProfile(user.uid, payload)
      toast.success('Profile updated')
      await refreshProfile()
    },
    [refreshProfile, user],
  )

  const value = useMemo(
    () => ({
      user,
      profile,
      initializing,
      isAuthenticated: Boolean(user),
      signUp,
      signIn,
      signInGoogle,
      signOut,
      refreshProfile,
      updateProfile: updateProfileDetails,
    }),
    [initializing, profile, signIn, signInGoogle, signOut, signUp, updateProfileDetails, user, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
