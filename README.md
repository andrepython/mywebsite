# XR-SWISSINVEST website

Production-ready Node.js wrapper for the multilingual XR-SWISSINVEST website.

## Requirements

- Node.js 24 or 25
- npm 11+

## Local use

```bash
npm ci
npm start
```

Open <http://localhost:3000>. The health check is available at
<http://localhost:3000/health>.

## Infomaniak deployment

Upload the project files excluding the entries in `.gitignore`, then configure:

- Runtime: Node.js
- Node version: 24 (preferred, LTS) or 25
- Execution folder: `./` (the folder containing `package.json`)
- Build command: `npm ci --omit=dev`
- Start command: `npm start`
- Listening port in Infomaniak Manager: `3000`
- Optional environment variable: `PORT=3000`
- Health-check path: `/health`

The port configured in Infomaniak Manager must match the application port.
The server defaults to port `3000`, listens on `0.0.0.0`, and accepts a
different value through `process.env.PORT`.

Before uploading, run:

```bash
npm ci
npm run check
npm test
npm run verify:deploy
```

## Files required in production

- `package.json`
- `package-lock.json`
- `server.js`
- `Swiss-Invest v2.dc.html`
- `support.js`
- `assets/logo-light.svg`
- `assets/logo-dark.svg`

The `uploads`, `outputs`, `screenshots`, `.thumbnail`, and `.DS_Store` files are
development artifacts and should not be uploaded.

## Compatibility

The server uses stable built-in Node APIs and has no server-side framework.
`package.json` explicitly supports Node.js 24 and 25. React 18.3.1 is installed
by npm and served locally to the browser, avoiding a runtime dependency on a
third-party JavaScript CDN.
