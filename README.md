# Aerowave Airlines — Agentforce demo site

A single-page help center for **Aerowave Airlines**, a fictional airline. It exists to host a Salesforce Agentforce chat agent ("Claims Concierge") for a recorded product demo, in which travelers file or check trip-disruption claims over chat.

The page is plain HTML, CSS, and vanilla JavaScript, with no framework and no build step.

## What's here

| File | Purpose |
| --- | --- |
| `index.html` | The page, including a marked spot for the Salesforce Embedded Messaging snippet just before `</body>` |
| `styles.css` | Light theme designed for screen recording, responsive down to mobile |
| `script.js` | Wires the "Chat with Claims Concierge" buttons to the chat widget, plus a demo reset helper |

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. The chat widget only loads when the page is served over HTTP and the domain is allowlisted in Salesforce, so opening the file directly won't work.

## Connecting the chat

1. Paste your Embedded Messaging code snippet where `<!-- SALESFORCE EMBEDDED MESSAGING SNIPPET GOES HERE -->` appears in `index.html`.
2. In Salesforce, add each domain that serves the page (for example `http://localhost:8000` and your Netlify URL) to the CORS allowlist and to the deployment's trusted domains.

The chat buttons open the widget once it has loaded. Before that they do nothing, and the widget's own launcher in the bottom-right corner still works.

**Demo reset:** visit the page with `?reset` to clear this site's local and session storage, so the next recording starts with a fresh chat.

## Deploy

The site is static. On Netlify, import the repo with no build command and a publish directory of `/`.

## License

The code in this repository is released under the [MIT License](LICENSE).

Aerowave Airlines is a fictional company, and any resemblance to a real airline is unintended. Salesforce, Agentforce, and related marks are trademarks of Salesforce, Inc. This project is not affiliated with or endorsed by Salesforce. The Embedded Messaging snippet and widget are Salesforce's and are not covered by this repository's license.
