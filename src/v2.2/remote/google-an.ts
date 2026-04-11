const GoogleAnalytics = {
  init(tag = 'G-3P4NWXWWVZ') {
    const imported = document.createElement('script')
    imported.src = `https://www.googletagmanager.com/gtag/js?id=${tag}`
    document.head.appendChild(imported)

    window.dataLayer = window.dataLayer || []
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args)
    }

    gtag('js', new Date())
    gtag('config', tag)
  },
}

export default GoogleAnalytics
