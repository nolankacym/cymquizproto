# Cymbiotika Wellness Quiz

An interactive wellness quiz that branches on the user's answers and ends on a
personalized supplement‑plan results page. Built to match the Cymbiotika design
system (Neue Haas Grotesk, brand green `#163f35`).

**`index.html`** at the repo root is a fully self‑contained build — React, the
compiled app, all CSS, brand fonts (woff2), and product images are inlined as
data URIs. No CDN, no network calls, no build step required to serve it.

## Host on GitHub Pages

1. Push this repo to GitHub (see below).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Set branch to **`main`** and folder to **`/ (root)`**, then **Save**.
5. After ~1 minute the site is live at
   `https://<your-username>.github.io/cymbiotika-quiz/`

`.nojekyll` is included so Pages serves the files as‑is.

## Local development (with response capture)

The `src/` folder holds the editable source. Running it through the small Python
server also records completed quizzes and feedback to CSV:

```bash
cd src
python3 server.py 8124
# open http://127.0.0.1:8124
#   completed quizzes -> src/responses.csv
#   feedback          -> src/feedback.csv
```

## Rebuild the static page

The static `index.html` is produced by `src/build/build_artifact.py`, which
inlines React (production), the Babel‑compiled app, CSS, fonts (OTF→woff2), and
product images. Regenerate it after editing the source, then copy the output to
the repo root as `index.html`.

## Note on data capture

GitHub Pages is static‑only — there is no backend. To capture responses into a
Google Sheet, the page POSTs to a **Google Apps Script Web App** bound to the
sheet (`src/google-apps-script.gs`):

1. Open the target Google Sheet → **Extensions → Apps Script**.
2. Paste `src/google-apps-script.gs`, then **Deploy → New deployment → Web app**
   (Execute as: *Me*, Who has access: *Anyone*). Copy the `…/exec` URL.
3. Put that URL in **`sheet-endpoint.txt`** at the repo root, rebuild the page
   (`python3 src/build/build_artifact.py`), and copy `quiz-standalone.html` to
   `index.html`. The script writes to **Responses** and **Feedback** tabs.

If `sheet-endpoint.txt` is absent, the page runs in "artifact mode"
(`window.__ARTIFACT__ = true`) and simply doesn't save.
