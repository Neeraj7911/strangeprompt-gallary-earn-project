import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { firestore } from './config'
import { deriveSlugFromTitle, normalizeSlug } from '../utils/slug'

const imagesCollection = collection(firestore, 'images')
const usersCollection = collection(firestore, 'users')
const USERNAME_MAX_LENGTH = 24
const USERNAME_MAX_ATTEMPTS = 40
const USERNAME_MAX_CHANGES = 5
const SHARE_SLUG_SUFFIX_ATTEMPTS = 6

async function doesShareSlugExist(slug) {
  if (!slug) return false
  const slugQuery = query(
    imagesCollection,
    where('shareSlug', '==', slug),
    where('status', '==', 'approved'),
    limit(1),
  )
  const snapshot = await getDocs(slugQuery)
  return !snapshot.empty
}

async function findAvailableShareSlug(baseSlug) {
  const base = normalizeSlug(baseSlug)
  if (!base) return null
  let candidate = base
  for (let attempt = 0; attempt < SHARE_SLUG_SUFFIX_ATTEMPTS; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await doesShareSlugExist(candidate)
    if (!exists) {
      return candidate
    }
    const suffix = attempt < 3 ? (attempt + 2).toString(36) : Math.random().toString(36).slice(2, 5)
    candidate = normalizeSlug(`${base}-${suffix}`)
  }
  return normalizeSlug(`${base}-${Date.now().toString(36).slice(-4)}`)
}

async function resolveShareSlug({ desiredSlug, prompt }) {
  const normalizedDesired = normalizeSlug(desiredSlug)
  if (normalizedDesired) {
    const exists = await doesShareSlugExist(normalizedDesired)
    if (exists) {
      throw new Error('That share link is already in use. Choose a different slug.')
    }
    return normalizedDesired
  }

  const fallback = deriveSlugFromTitle(prompt)
  const available = await findAvailableShareSlug(fallback)
  return available || fallback
}

function buildSearchKeywords(prompt = '', tags = []) {
  const composed = `${prompt} ${tags.join(' ')}`
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
  const unique = new Set(
    composed
      .split(' ')
      .filter(Boolean)
      .map((token) => token.slice(0, 40)),
  )
  tags.forEach((tag) => unique.add(tag.toLowerCase()))
  return Array.from(unique).slice(0, 40)
}

export async function saveImageMetadata({
  prompt,
  tags = [],
  category = 'Explore',
  imageUrl,
  storagePath,
  creator,
  creatorProfile = null,
  width = null,
  height = null,
  shareSlug = '',
}) {
  const resolvedShareSlug = await resolveShareSlug({ desiredSlug: shareSlug, prompt })

  const payload = {
    prompt,
    tags,
    category,
    imageUrl,
    storagePath,
    creatorId: creator.uid,
    creatorName: creator.displayName || 'Creator',
    creatorPhoto: creator.photoURL || '',
    creatorUsername: creatorProfile?.username || null,
    likes: 0,
    views: 0,
    copies: 0,
    shares: 0,
    status: 'pending',
    approvedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    searchKeywords: buildSearchKeywords(prompt, tags),
    dimensions: { width, height },
    shareSlug: resolvedShareSlug,
  }

  const imageDoc = await addDoc(imagesCollection, payload)

  await setDoc(
    doc(usersCollection, creator.uid),
    {
      lastUploadAt: serverTimestamp(),
      totalUploads: increment(1),
    },
    { merge: true },
  )

  return { id: imageDoc.id, ...payload }
}

export function fetchPopularImages({ category, searchTerm, pageSize = 20, lastVisible }) {
  const conditions = []
  conditions.push(where('status', '==', 'approved'))
  if (category && category !== 'Explore') {
    conditions.push(where('category', '==', category))
  }
  if (searchTerm) {
    conditions.push(where('searchKeywords', 'array-contains', searchTerm.toLowerCase()))
  }
  conditions.push(orderBy('likes', 'desc'))
  conditions.push(orderBy('views', 'desc'))
  conditions.push(limit(pageSize))
  if (lastVisible) {
    conditions.push(startAfter(lastVisible))
  }
  const q = query(imagesCollection, ...conditions)
  return getDocs(q)
}

export function listenToRecentUploads(callback, take = 12, onError) {
  const q = query(
    imagesCollection,
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
    limit(take),
  )
  try {
    return onSnapshot(q, callback, onError)
  } catch (err) {
    if (typeof onError === 'function') onError(err)
    else console.error('listenToRecentUploads error', err)
    return () => {}
  }
}

export function subscribeToApprovedImages({ category = 'Explore', take = 48 } = {}, onNext, onError) {
  const constraints = [orderBy('createdAt', 'desc')]
  if (category && category !== 'Explore') {
    constraints.push(where('category', '==', category))
  }
  if (take) {
    constraints.push(limit(take))
  }
  const q = query(imagesCollection, where('status', '==', 'approved'), ...constraints)
  try {
    return onSnapshot(q, onNext, onError)
  } catch (err) {
    if (typeof onError === 'function') onError(err)
    else console.error('subscribeToApprovedImages error', err)
    return () => {}
  }
}

export async function toggleLike({ imageId, userId }) {
  const imageRef = doc(imagesCollection, imageId)
  const likeRef = doc(firestore, `images/${imageId}/likes/${userId}`)

  return runTransaction(firestore, async (transaction) => {
    const imageSnap = await transaction.get(imageRef)
    if (!imageSnap.exists()) throw new Error('Image not found')
    const ownerId = imageSnap.data().creatorId
    const ownerRef = doc(usersCollection, ownerId)
    const likeSnap = await transaction.get(likeRef)

    if (likeSnap.exists()) {
      transaction.delete(likeRef)
      transaction.update(imageRef, {
        likes: increment(-1),
        updatedAt: serverTimestamp(),
      })
      transaction.set(ownerRef, { totalLikes: increment(-1) }, { merge: true })
      return false
    }

    transaction.set(likeRef, { userId, createdAt: serverTimestamp() })
    transaction.update(imageRef, {
      likes: increment(1),
      updatedAt: serverTimestamp(),
    })
    transaction.set(ownerRef, { totalLikes: increment(1) }, { merge: true })
    return true
  })
}

export async function incrementCopy(imageId) {
  const imageRef = doc(imagesCollection, imageId)
  const snapshot = await getDoc(imageRef)
  if (!snapshot.exists()) return
  const { creatorId } = snapshot.data()
  await updateDoc(imageRef, {
    copies: increment(1),
    updatedAt: serverTimestamp(),
  })
  if (creatorId) {
    await setDoc(
      doc(usersCollection, creatorId),
      {
        totalCopies: increment(1),
        earningPoints: increment(5),
      },
      { merge: true },
    )
  }
}

export async function incrementShare(imageId) {
  const imageRef = doc(imagesCollection, imageId)
  const snapshot = await getDoc(imageRef)
  if (!snapshot.exists()) return
  const { creatorId } = snapshot.data()
  await updateDoc(imageRef, { shares: increment(1), updatedAt: serverTimestamp() })
  if (creatorId) {
    await setDoc(
      doc(usersCollection, creatorId),
      {
        totalShares: increment(1),
        earningPoints: increment(2),
      },
      { merge: true },
    )
  }
}

export async function incrementView(imageId) {
  const imageRef = doc(imagesCollection, imageId)
  const snapshot = await getDoc(imageRef)
  if (!snapshot.exists()) return
  const { creatorId } = snapshot.data()
  await updateDoc(imageRef, { views: increment(1), updatedAt: serverTimestamp() })
  if (creatorId) {
    await setDoc(
      doc(usersCollection, creatorId),
      {
        totalViews: increment(1),
        earningPoints: increment(0.2),
      },
      { merge: true },
    )
  }
}

export async function scheduleNotification({ userId, type, imageId = null, message }) {
  if (!userId) return null
  const notificationsCollection = collection(firestore, 'users', userId, 'notifications')
  const docRef = await addDoc(notificationsCollection, {
    type,
    imageId,
    message,
    createdAt: serverTimestamp(),
    read: false,
  })
  return docRef
}

export function subscribeToUserUploads(userId, callback, options = {}) {
  if (!userId) return () => {}
  const {
    includeAllStatuses = false,
    limitTo = null,
    onError = (error) => console.error('subscribeToUserUploads', error),
  } = options
  const constraints = [where('creatorId', '==', userId)]
  if (!includeAllStatuses) {
    constraints.push(where('status', '==', 'approved'))
  }
  constraints.push(orderBy('createdAt', 'desc'))
  if (typeof limitTo === 'number' && limitTo > 0) {
    constraints.push(limit(limitTo))
  }
  const q = query(imagesCollection, ...constraints)
  try {
    return onSnapshot(q, callback, onError)
  } catch (err) {
    if (typeof onError === 'function') onError(err)
    else console.error('subscribeToUserUploads error', err)
    return () => {}
  }
}

export function subscribeToUserLikes(userId, callback) {
  if (!userId) return () => {}
  const likesGroup = collectionGroup(firestore, 'likes')
  const q = query(likesGroup, where('userId', '==', userId))
  try {
    return onSnapshot(q, callback)
  } catch (err) {
    console.error('subscribeToUserLikes error', err)
    return () => {}
  }
}

export function subscribeToFollowStatus(targetUserId, followerId, callback) {
  if (!targetUserId || !followerId) return () => {}
  const followRef = doc(firestore, 'users', targetUserId, 'followers', followerId)
  try {
    return onSnapshot(followRef, (snapshot) => {
      callback(Boolean(snapshot?.exists()))
    })
  } catch (err) {
    console.error('subscribeToFollowStatus error', err)
    return () => {}
  }
}

export async function toggleFollowUser({ targetUserId, follower }) {
  if (!targetUserId) throw new Error('Missing target user ID')
  if (!follower?.uid) throw new Error('Missing follower credentials')

  const followRef = doc(firestore, 'users', targetUserId, 'followers', follower.uid)

  return runTransaction(firestore, async (transaction) => {
    const existing = await transaction.get(followRef)

    if (existing.exists()) {
      transaction.delete(followRef)
      return false
    }

    transaction.set(followRef, {
      followerId: follower.uid,
      displayName: follower.displayName || '',
      photoURL: follower.photoURL || '',
      createdAt: serverTimestamp(),
    })
    return true
  })
}

export function subscribeToNotifications(userId, callback) {
  const notificationsCollection = collection(firestore, 'users', userId, 'notifications')
  const q = query(notificationsCollection, orderBy('createdAt', 'desc'), limit(20))
  try {
    return onSnapshot(q, callback)
  } catch (err) {
    console.error('subscribeToNotifications error', err)
    return () => {}
  }
}

export async function fetchNotificationsPage({ userId, limitTo = 5, startAfterDoc = null }) {
  if (!userId) {
    return { items: [], cursorDoc: null, hasMore: false }
  }

  const notificationsCollection = collection(firestore, 'users', userId, 'notifications')
  const constraints = [orderBy('createdAt', 'desc')]
  if (startAfterDoc) {
    constraints.push(startAfter(startAfterDoc))
  }
  constraints.push(limit(limitTo + 1))

  const snapshot = await getDocs(query(notificationsCollection, ...constraints))
  const limitedDocs = snapshot.docs.slice(0, limitTo)
  const items = limitedDocs.map((docSnapshot) => {
    const data = docSnapshot.data()
    const createdAt = data.createdAt?.toDate?.() || null
    return {
      id: docSnapshot.id,
      ...data,
      createdAt,
    }
  })
  const cursorDoc = limitedDocs.length ? limitedDocs[limitedDocs.length - 1] : startAfterDoc
  const hasMore = snapshot.docs.length > limitTo

  return { items, cursorDoc, hasMore }
}

export async function purgeOldNotifications({ userId, olderThanDays = 60, batchSize = 50 }) {
  if (!userId) return 0
  const notificationsCollection = collection(firestore, 'users', userId, 'notifications')
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
  const cutoffTimestamp = Timestamp.fromDate(cutoffDate)
  let totalDeleted = 0

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const outdatedQuery = query(
      notificationsCollection,
      where('createdAt', '<', cutoffTimestamp),
      limit(batchSize),
    )
    // eslint-disable-next-line no-await-in-loop
    const snapshot = await getDocs(outdatedQuery)
    if (snapshot.empty) break
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(snapshot.docs.map((docSnapshot) => deleteDoc(docSnapshot.ref)))
    totalDeleted += snapshot.size
    if (snapshot.size < batchSize) break
  }

  return totalDeleted
}

export async function fetchTopCopies({ limitTo = 5 } = {}) {
  try {
    const constraints = [where('status', '==', 'approved'), orderBy('copies', 'desc')]
    if (limitTo) constraints.push(limit(limitTo))
    const q = query(imagesCollection, ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
  } catch (err) {
    // Firestore may require a composite index for this query in some projects.
    // Fall back to a best-effort client-side filter: fetch more docs ordered by copies
    // and then filter for approved status. This avoids a hard runtime error.
    // Log the original error so developers can create the recommended index.
    // eslint-disable-next-line no-console
    console.warn('fetchTopCopies primary query failed, falling back to client filter:', err)
    const fallbackLimit = Math.max(limitTo * 6, 20)
    const q = query(imagesCollection, orderBy('copies', 'desc'), limit(fallbackLimit))
    const snapshot = await getDocs(q)
    const items = snapshot.docs
      .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
      .filter((d) => d.status === 'approved')
      .slice(0, limitTo)
    return items
  }
}

export async function reportImage({ imageId, reason, reporterId }) {
  const reportsCollection = collection(firestore, 'reports')
  await addDoc(reportsCollection, {
    imageId,
    reason,
    reporterId: reporterId || null,
    createdAt: serverTimestamp(),
    status: 'open',
  })
}

export function subscribeToReports(onNext, onError) {
  const reportsCollection = collection(firestore, 'reports')
  const q = query(reportsCollection, orderBy('createdAt', 'desc'), limit(200))
  try {
    return onSnapshot(q, onNext, onError)
  } catch (err) {
    if (typeof onError === 'function') onError(err)
    else console.error('subscribeToReports error', err)
    return () => {}
  }
}

  export async function markNotificationsRead(userId) {
    if (!userId) return 0
    try {
      const notificationsCollection = collection(firestore, 'users', userId, 'notifications')
      const q = query(notificationsCollection, where('read', '==', false), limit(200))
      const snapshot = await getDocs(q)
      if (snapshot.empty) return 0
      await Promise.all(snapshot.docs.map((docSnap) => updateDoc(docSnap.ref, { read: true })))
      return snapshot.size
    } catch (err) {
      console.error('markNotificationsRead', err)
      return 0
    }
  }

export async function resolveReport(reportId, { status = 'resolved', moderatorId = null, note = '' } = {}) {
  if (!reportId) return
  const ref = doc(firestore, 'reports', reportId)
  await updateDoc(ref, {
    status,
    moderatorId: moderatorId || null,
    note: note || null,
    resolvedAt: serverTimestamp(),
  })
}

export async function fetchImageById(imageId) {
  if (!imageId) return null
  const snap = await getDoc(doc(imagesCollection, imageId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function fetchUserProfile(userId) {
  const snapshot = await getDoc(doc(usersCollection, userId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function resolveUserIdByUsername(handle) {
  const normalized = normalizeUsernameSource(handle)
  if (!normalized) return null
  const usernameDoc = await getDoc(doc(firestore, 'usernames', normalized))
  if (!usernameDoc.exists()) return null
  const data = usernameDoc.data() || {}
  return data.userId || data.uid || null
}

export async function fetchUserProfileByUsername(handle) {
  const userId = await resolveUserIdByUsername(handle)
  if (!userId) return null
  return fetchUserProfile(userId)
}

export async function updateUserProfile(userId, payload) {
  await setDoc(
    doc(usersCollection, userId),
    {
      ...payload,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function bumpEarningsForAction(userId, amount = 0.05) {
  if (!userId) return
  await setDoc(
    doc(usersCollection, userId),
    {
      earningPoints: increment(amount),
      lastEarningBoostAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function recordRedirectForImage(imageId, amount = 0.05) {
  if (!imageId) return null
  try {
    const snap = await getDoc(doc(imagesCollection, imageId))
    if (!snap.exists()) return null
    const data = snap.data()
    const creatorId = data?.creatorId
    if (!creatorId) return null
    const redirectsCollection = collection(firestore, 'users', creatorId, 'redirects')
    await addDoc(redirectsCollection, {
      imageId,
      amount,
      processed: false,
      createdAt: serverTimestamp(),
    })
    return { creatorId }
  } catch (err) {
    console.error('recordRedirectForImage', err)
    return null
  }
}

function normalizeUsernameSource(value = '') {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildUsernameCandidates(base, userId) {
  const resolvedBase = base && base.length >= 3 ? base.slice(0, USERNAME_MAX_LENGTH) : `creator-${userId.slice(0, 6).toLowerCase()}`
  const sanitizedBase = normalizeUsernameSource(resolvedBase).slice(0, USERNAME_MAX_LENGTH)
  const fallback = sanitizedBase && sanitizedBase.length >= 3 ? sanitizedBase : `creator-${userId.slice(0, 6).toLowerCase()}`
  const candidates = []
  for (let attempt = 0; attempt < USERNAME_MAX_ATTEMPTS; attempt += 1) {
    const suffix = attempt === 0 ? '' : `-${attempt + 1}`
    const trimmedBase = fallback.slice(0, Math.max(3, USERNAME_MAX_LENGTH - suffix.length))
    candidates.push(`${trimmedBase}${suffix}`)
  }
  return candidates
}

async function applyUsernameCandidate({ userId, candidate, recordChange }) {
  return runTransaction(firestore, async (transaction) => {
    const userRef = doc(usersCollection, userId)
    const usernameRef = doc(firestore, 'usernames', candidate)

    const userSnap = await transaction.get(userRef)
    const userData = userSnap.exists() ? userSnap.data() : {}
    const currentUsername = userData.username || null
    const changeCount = userData.usernameChangeCount || 0

    if (recordChange && currentUsername && currentUsername !== candidate && changeCount >= USERNAME_MAX_CHANGES) {
      throw new Error('USERNAME_LIMIT')
    }

    const usernameSnap = await transaction.get(usernameRef)
    if (usernameSnap.exists() && usernameSnap.data()?.userId !== userId) {
      throw new Error('USERNAME_TAKEN')
    }

    if (currentUsername && currentUsername !== candidate) {
      const currentRef = doc(firestore, 'usernames', currentUsername)
      transaction.delete(currentRef)
    }

    const shouldResetCount = !currentUsername && !recordChange
    const nextCount = recordChange && currentUsername !== candidate ? changeCount + 1 : changeCount

    transaction.set(usernameRef, { userId, claimedAt: serverTimestamp() })
    transaction.set(
      userRef,
      {
        username: candidate,
        usernameLower: candidate,
        usernameChangeCount: shouldResetCount ? 0 : nextCount,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )

    return candidate
  })
}

async function claimUsernameInternal({ userId, requested, recordChange }) {
  const base = normalizeUsernameSource(requested)
  const candidates = buildUsernameCandidates(base, userId)

  for (const candidate of candidates) {
    try {
      const assigned = await applyUsernameCandidate({ userId, candidate, recordChange })
      return assigned
    } catch (error) {
      if (error.message === 'USERNAME_TAKEN') {
        continue
      }
      if (error.message === 'USERNAME_LIMIT') {
        throw new Error('Username change limit reached.')
      }
      throw error
    }
  }

  throw new Error('Unable to assign username. Try a different one.')
}

export async function ensureUserHasUsername({ userId, displayName = '', email = '', existingProfile = null }) {
  if (!userId) return existingProfile
  const profile = existingProfile || (await fetchUserProfile(userId))
  if (profile?.username) {
    return profile
  }

  const fallbackSource = profile?.displayName || displayName || (email ? email.split('@')[0] : '')
  await claimUsernameInternal({ userId, requested: fallbackSource || `creator-${userId.slice(0, 6)}`, recordChange: false })
  return fetchUserProfile(userId)
}

export async function updateUsername(userId, requestedUsername) {
  if (!userId) throw new Error('Not authenticated')
  if (!requestedUsername || !requestedUsername.trim()) {
    throw new Error('Username cannot be empty.')
  }
  const trimmed = requestedUsername.trim()
  const assigned = await claimUsernameInternal({ userId, requested: trimmed, recordChange: true })
  return assigned
}
