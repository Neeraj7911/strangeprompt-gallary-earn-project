import { useEffect } from 'react'

export default function AdsLoader() {
  useEffect(() => {
    try {
      const s1 = document.createElement('script')
      s1.src = 'https://pl28380193.effectivegatecpm.com/d7/cd/9b/d7cd9b717963719c3ff3fb8fb0bbeef8.js'
      s1.async = true
      document.body.appendChild(s1)

      const inline = document.createElement('script')
      inline.text = `try { atOptions = { key: '7a88de1307ae4a8ee8d9076768dec5b6', format: 'iframe', height: 60, width: 468, params: {} } } catch (e) {}`
      document.body.appendChild(inline)

      const s2 = document.createElement('script')
      s2.src = 'https://www.highperformanceformat.com/7a88de1307ae4a8ee8d9076768dec5b6/invoke.js'
      s2.async = true
      document.body.appendChild(s2)

      return () => {
        try {
          s1.remove()
          inline.remove()
          s2.remove()
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore injection errors
    }
  }, [])

  return null
}
