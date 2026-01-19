import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { storage } from './config'

export function uploadImageFile({ file, userId, onProgress }) {
  const fileExtension = file.name.split('.').pop()
  const storagePath = `uploads/${userId}/${Date.now()}.${fileExtension}`
  const storageRef = ref(storage, storagePath)
  const uploadTask = uploadBytesResumable(storageRef, file, {
    cacheControl: 'public, max-age=31536000',
    customMetadata: {
      owner: userId,
    },
  })

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          onProgress(progress)
        }
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        resolve({ downloadURL, storagePath })
      },
    )
  })
}
