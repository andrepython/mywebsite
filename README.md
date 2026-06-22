# André Python — Personal Academic Website

A Node.js website with an animated Fuller-projection background, designed for
Infomaniak's free Cloud Sites hosting via Git deployment.

## Features

- 🌍 Interactive Fuller (Dymaxion-inspired) map background with particle effects
- 🌊 Animated ocean wave rings and subtle triangulation grid
- 🖱️ Click any continent to reveal the corresponding content tab
- 📱 Responsive – portrait layout for mobile, landscape for desktop
- ⚡ Express.js + compression + Helmet security headers

## Project Structure

```
andrepython/
├── server.js            ← Express entry point
├── package.json
├── .gitignore
└── public/
    ├── index.html       ← Single-page app shell
    ├── css/
    │   └── style.css
    └── js/
        ├── globe.js     ← Fuller projection canvas + particles
        └── app.js       ← Tab routing and interactions
```

## Local Development

```bash
npm install
npm run dev      # node --watch (Node 18+)
# or
npm start
```

Visit http://localhost:3000

## Infomaniak Deployment (Free Plan)

### 1. Create a Node.js application on Infomaniak

1. Log in to your [Infomaniak Manager](https://manager.infomaniak.com)
2. Go to **Cloud Sites** → your hosting → **Applications** → **Add**
3. Choose **Node.js**, select version **20** or **22** (Node 24 when available)
4. Set the **start file** to `server.js`
5. Set the **public directory** to `public`

### 2. Deploy via Git

```bash
# Add the Infomaniak remote (shown in your hosting panel)
git init
git remote add infomaniak <your-infomaniak-git-url>
git add .
git commit -m "Initial deployment"
git push infomaniak main
```

Infomaniak will automatically run `npm install` and `npm start`.

### 3. Environment

- PORT is set automatically by Infomaniak; the server reads `process.env.PORT`
- No database or environment variables required for the free plan

## Content Tabs → Continent Map

| Continent   | Tab       |
|-------------|-----------|
| Europe      | Welcome   |
| Asia        | Research  |
| Africa      | Terrorism & Conflict |
| Americas    | Blog      |
| Oceania     | Teaching  |
| Antarctica  | About     |

## Customisation

- Edit `public/index.html` to update text content
- Continent polygons are in `public/js/globe.js` → `PROJ` object
- Colour palette is in `public/css/style.css` → `:root` variables
