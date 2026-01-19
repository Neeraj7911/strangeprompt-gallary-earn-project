import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, googleProvider, firestore } from './config'

const APP_NAME = 'StrangePrompt'

export async function signUpWithEmail({ email, password, displayName }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName) {
    await updateFirebaseProfile(credential.user, { displayName })
  }

  await setDoc(
    doc(firestore, 'users', credential.user.uid),
    {
      email,
      displayName: displayName || credential.user.displayName || 'Creator',
      createdAt: serverTimestamp(),
      role: 'creator',
      bio: '',
      totalLikes: 0,
      totalViews: 0,
      totalCopies: 0,
      totalShares: 0,
      earningPoints: 0,
      avatarUrl: '',
      country: '',
      upiId: '',
      aadhaarNumber: '',
      headline: '',
      website: '',
      profileCompletionStatus: false,
    },
    { merge: true },
  )

  return credential.user
}

export function signInWithEmail({ email, password }) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signInWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider)

  await setDoc(
    doc(firestore, 'users', credential.user.uid),
    {
      email: credential.user.email,
      displayName: credential.user.displayName || 'Creator',
      photoURL: credential.user.photoURL || '',
      role: 'creator',
      createdAt: serverTimestamp(),
      bio: '',
      totalLikes: 0,
      totalViews: 0,
      totalCopies: 0,
      totalShares: 0,
      earningPoints: 0,
      avatarUrl: credential.user.photoURL || '',
      country: '',
      upiId: '',
      aadhaarNumber: '',
      headline: '',
      website: '',
      profileCompletionStatus: false,
    },
    { merge: true },
  )

  return credential.user
}

export function logoutUser() {
  return signOut(auth)
}

export async function updateAuthDisplayName(displayName) {
  if (!auth.currentUser) throw new Error('Not authenticated')
  await updateFirebaseProfile(auth.currentUser, { displayName })
  return auth.currentUser
}

export async function changeUserPassword({ currentPassword, newPassword }) {
  if (!auth.currentUser || !auth.currentUser.email) {
    throw new Error('Password change not available for this account.')
  }
  const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword)
  await reauthenticateWithCredential(auth.currentUser, credential)
  await updatePassword(auth.currentUser, newPassword)
  return auth.currentUser
}

export { APP_NAME }
