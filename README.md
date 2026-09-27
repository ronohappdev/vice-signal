# Vice Signal

**A fictional underground street-media experience, powered by [React Image Editor](https://github.com/unlayer/react-image-editor).**

Built for Unlayer's **[#BuiltWithImageEditor](https://x.com/hashtag/BuiltWithImageEditor?src=hashtag_click) Challenge** — a GTA VI-inspired experience where players accept an underground "signal job," customize a photo using a full-featured in-browser image editor, and watch their creation go live on a neon-lit Vice City billboard.

---

## The Concept

Somewhere in the city, an anonymous network is looking for someone to broadcast a message. You're that someone.

**Vice Signal** casts the player as a freelance operator for a street-level media network. Each "mission" is a photo that needs to be customized — edited, marked up, stylized — before it's transmitted and displayed on a live billboard downtown. It's a small, self-contained narrative loop built entirely around a single core mechanic: **editing an image and watching the result go public.**

---

## How It Satisfies the Challenge

| Requirement                                          | How Vice Signal delivers it                                                                                                                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **GTA VI-inspired experience**                       | Vice City-style neon aesthetic, mission-briefing structure, in-world "operator" framing, synthwave visual language (skyline, moonlight, magenta glow, CRT scanlines).                      |
| **React Image Editor as a core part of the project** | The editor isn't a bolted-on feature — it _is_ the mission. The entire narrative arc (accept job → edit photo → transmit → go live) exists to give the editor a purpose.                   |
| **Let users edit/customize at least one visual**     | Users can upload their own photo and edit it with the full Unlayer toolset (crop, filters, draw, text, shapes, stickers, frames, and optionally the AI Assistant) before it's "broadcast." |
| **Public GitHub repo + deployment**                  | Standard Next.js App Router project, deployable to Vercel in one step.                                                                                                                     |

---

## User Flow

1. **Landing** — In-world framing: a private, encrypted transmission has come through. Player accepts the job.
2. **Job Selection** — Player picks from available "signal jobs" (currently one live mission, two visually present but locked "coming soon" slots to imply a larger world).
3. **Photo Upload** — Player uploads their own photo (JPG/PNG/WEBP, up to 8MB) or skips and uses the default mission image.
4. **Editor** — The uploaded (or default) image loads into React Image Editor. Full toolset available: crop/rotate/straighten, resize, filters, draw, text, shapes, stickers, frames, and the AI Assistant (if enabled on the connected Unlayer project).
5. **Transmitting** — A short animated "routing broadcast" sequence with a progress bar and staged status updates, to sell the idea that the edit is being sent somewhere.
6. **Deployed / Billboard** — The edited image renders inside an animated in-world billboard (complete with power-on lighting sequence, scanlines, and a magenta color-grade overlay), alongside options to **download** the result or **share** it via the native Web Share API.

Mission completion is persisted to `localStorage`, so refreshing the page after finishing a mission returns the player straight to their live billboard rather than resetting the flow.

---

## Core Features

- **Full Unlayer Image Editor integration** — not a cropped-down demo; all eight tools are available (crop, resize, filter, draw, text, shapes, stickers, frame), plus optional AI Assistant chat-based editing.
- **User photo upload** — client-side file validation (type + size), instant preview, and a graceful fallback to a default mission image if the player skips upload.
- **Download & native share** — the finished billboard image can be saved directly (`<a download>`) or shared through the device's native share sheet (`navigator.share`), including sharing the actual image file where supported, with clipboard-copy and "unsupported" fallbacks for browsers/desktops without Web Share.
- **Mission persistence** — completed missions survive a page refresh via `localStorage`, so the billboard reveal isn't lost on reload.
- **Fully animated transmission sequence** — a staged, timed progress animation between "editing" and "live," reinforcing the narrative rather than just jumping straight to a result.
- **Dynamic OG image** — an auto-generated Open Graph preview image (`opengraph-image.tsx`) so shared links render a branded preview card instead of a blank link.

---

## Tech Stack

- **[Next.js](https://nextjs.org/)** (App Router, Turbopack dev server)
- **[React Image Editor](https://github.com/unlayer/react-image-editor)** (`@unlayer/react-image-editor`) — the core editing engine
- **TypeScript**
- **Tailwind CSS** — all styling, no separate CSS files
- **Web Share API** / **Clipboard API** — native share/download flow, no third-party sharing SDK

No backend, no database. Mission state is client-only (`localStorage`); the "billboard" is a client-rendered screen, not a real remote broadcast — this is a fictional narrative device, not a claim of real transmission infrastructure.

---

## Running Locally

```bash
git clone https://github.com/<your-username>/vice-signal.git
cd vice-signal
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Environment / Configuration

The Image Editor is configured with an Unlayer `projectId` in `app/page.tsx`:

```tsx
options={{
  projectId: 289665,
  theme: "light",
  features: {
    ai: { enabled: true, assistant: true },
  },
}}
```

To use your own Unlayer project (recommended before deploying your own copy), replace `289665` with your project ID from the [Unlayer console](https://console.unlayer.com/). The AI Assistant chat panel will only appear if that feature is enabled on the connected project — the editor works fully without it.

---

## Deployment

This project deploys as-is to [Vercel](https://vice-signal.vercel.app/):

```bash
vercel
```

After deploying, update two placeholders:

1. **`app/layout.tsx`** — replace the placeholder `metadataBase` URL with your real deployed domain, so Open Graph and Twitter card images resolve correctly:
   ```tsx
   metadataBase: new URL("https://your-actual-domain.vercel.app"),
   ```
2. Confirm `public/opengraph-image.png` / the generated `/opengraph-image` route and `favicon.ico` are present and resolving — a missing OG image won't break the build, but link previews (Slack, X, Discord) will silently fail to show it.

---

## Project Structure

```
app/
  layout.tsx            → Root layout, metadata, fonts, theming
  page.tsx               → The entire app: all five screens as one client component
  opengraph-image.tsx    → Dynamically generated OG/social preview image
  globals.css            → Tailwind base styles
public/
  images/street-race.jpg → Default mission image
```

The whole experience deliberately lives in a single `page.tsx` as a screen-state machine (`useState<Screen>`) rather than separate routes — this keeps mission state (uploaded photo, edited result, transmission progress) trivially shareable across screens without prop-drilling through routing.

---

## Known Limitations

- Mission state persistence covers the final image (`dataUrl`) but not the raw edited `Blob` — after a page refresh, "Share" falls back to link-sharing rather than file-sharing, since blobs aren't JSON-serializable for `localStorage`.
- Only one mission ("Midnight Run") is actually playable; "Club Opening" and "New Business" are intentionally locked to imply a larger world without requiring more content for the challenge scope.
- The Web Share API's file-sharing capability requires a secure context (HTTPS) and is primarily supported on mobile Safari/Chrome — desktop browsers will fall back to link-sharing or clipboard-copy.

---

## Credits

Built with [React Image Editor](https://github.com/unlayer/react-image-editor) by [Unlayer](https://unlayer.com/), for the **#BuiltWithImageEditor** challenge.

Not affiliated with or endorsed by Rockstar Games or Take-Two Interactive. "GTA VI" references are aesthetic homage only.
