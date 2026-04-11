import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import solid from 'vite-plugin-solid'

function preserveLegacyVersionPages(): Plugin {
  let projectRoot = process.cwd()
  let outputDir = 'dist'

  return {
    name: 'preserve-legacy-version-pages',
    configResolved(config) {
      projectRoot = config.root
      outputDir = config.build.outDir
    },
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url || (req.method !== 'GET' && req.method !== 'HEAD')) {
          next()
          return
        }

        const requestUrl = new URL(req.url, 'http://localhost')
        const { pathname, search } = requestUrl

        if (pathname === '/v2.2') {
          req.url = '/v2.2/'
          next()
          return
        }

        if (pathname === '/v2.2/host') {
          req.url = '/v2.2/host/'
          next()
          return
        }

        if (pathname.startsWith('/v2.2/')) {
          const mappedPath = pathname.endsWith('/') ? `/src${pathname}index.html` : `/src${pathname}`
          const mappedFilePath = path.resolve(projectRoot, `.${mappedPath}`)

          if (fs.existsSync(mappedFilePath)) {
            req.url = `${mappedPath}${search}`
            next()
            return
          }
        }

        if (pathname === '/' || !pathname.endsWith('/')) {
          next()
          return
        }

        const indexFilePath = path.resolve(projectRoot, `.${pathname}index.html`)

        if (fs.existsSync(indexFilePath)) {
          req.url = `${pathname}index.html${search}`
        }

        next()
      })
    },
    closeBundle() {
      const distRoot = path.resolve(projectRoot, outputDir)

      for (const entry of fs.readdirSync(projectRoot, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
          continue
        }

        const sourceDir = path.join(projectRoot, entry.name)
        const indexFilePath = path.join(sourceDir, 'index.html')

        if (!entry.name.startsWith('v') || !fs.existsSync(indexFilePath)) {
          continue
        }

        const targetDir = path.join(distRoot, entry.name)
        fs.rmSync(targetDir, { recursive: true, force: true })
        fs.cpSync(sourceDir, targetDir, { recursive: true })
      }

      const sharedRootAssets = ['fontawesome', 'webfonts']
      for (const dirName of sharedRootAssets) {
        const sourcePath = path.join(projectRoot, dirName)
        const targetPath = path.join(distRoot, dirName)

        if (!fs.existsSync(sourcePath)) {
          continue
        }

        fs.rmSync(targetPath, { recursive: true, force: true })
        fs.cpSync(sourcePath, targetPath, { recursive: true })
      }

      const v22Source = path.join(projectRoot, 'src', 'v2.2')
      const v22Dist = path.join(distRoot, 'v2.2')
      if (!fs.existsSync(v22Source)) {
        return
      }

      const staticPaths = [
        'css',
        'img',
        'js',
        'manifest.webmanifest',
        'installation.html',
        'license-input.html',
        path.join('host', 'fonts'),
        path.join('host', 'pointer.css'),
        path.join('host', 'fake-electron.js'),
        path.join('host', 'qrcode.min.js'),
      ]

      for (const relativePath of staticPaths) {
        const sourcePath = path.join(v22Source, relativePath)
        const targetPath = path.join(v22Dist, relativePath)

        if (!fs.existsSync(sourcePath)) {
          continue
        }

        fs.rmSync(targetPath, { recursive: true, force: true })
        const sourceStats = fs.statSync(sourcePath)
        if (sourceStats.isDirectory()) {
          fs.cpSync(sourcePath, targetPath, { recursive: true })
        } else {
          fs.mkdirSync(path.dirname(targetPath), { recursive: true })
          fs.copyFileSync(sourcePath, targetPath)
        }
      }

      const builtV22Root = path.join(distRoot, 'src', 'v2.2')
      const builtRemoteIndex = path.join(builtV22Root, 'index.html')
      const builtHostIndex = path.join(builtV22Root, 'host', 'index.html')

      if (fs.existsSync(builtRemoteIndex)) {
        fs.mkdirSync(v22Dist, { recursive: true })
        fs.copyFileSync(builtRemoteIndex, path.join(v22Dist, 'index.html'))
      }

      if (fs.existsSync(builtHostIndex)) {
        fs.mkdirSync(path.join(v22Dist, 'host'), { recursive: true })
        fs.copyFileSync(builtHostIndex, path.join(v22Dist, 'host', 'index.html'))
      }
    },
  }
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(process.cwd(), 'index.html'),
        'v2.2/index': path.resolve(process.cwd(), 'src/v2.2/index.html'),
        'v2.2/host/index': path.resolve(process.cwd(), 'src/v2.2/host/index.html'),
        'v2.2/installation': path.resolve(process.cwd(), 'src/v2.2/installation.html'),
        'v2.2/license-input': path.resolve(process.cwd(), 'src/v2.2/license-input.html'),
      },
    },
  },
  plugins: [solid(), preserveLegacyVersionPages()],
})
