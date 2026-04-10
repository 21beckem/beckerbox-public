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
    },
  }
}

export default defineConfig({
  plugins: [solid(), preserveLegacyVersionPages()],
})
