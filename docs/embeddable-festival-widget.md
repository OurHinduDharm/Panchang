# OurHinduDharm आगामी व्रत-पर्व विजेट

After deployment, another website can embed the existing approved festival widget using:

```html
<iframe
  src="https://ourhindudharm.github.io/Panchang/embed-festivals.html"
  title="OurHinduDharm आगामी व्रत-पर्व"
  loading="lazy"
  referrerpolicy="no-referrer"
  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
  width="100%"
  height="520"
  style="border:0;max-width:100%;display:block">
</iframe>
```

Use on a different origin from the GitHub Pages host. The iframe scrolls if the list is taller than the chosen height. External links open outside the frame. No host-page script, location permission, account, analytics or new calculation engine is required. The existing festival module and its date/publication rules are reused; the daily Panchang opens as a link rather than running a second astronomical engine inside the iframe.

Verify deployment, mobile sizing, keyboard access, month boundaries and outgoing links before public distribution. This is not a location-specific daily Panchang embed.
