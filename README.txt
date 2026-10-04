localhost studio — portfolio site
=================================
Static site. HTML + CSS + vanilla JS. No build step, no dependencies.

RUN LOCALLY
  cd localhost-portfolio
  python3 -m http.server 8080
  open http://localhost:8080

Note: open it through a local server, not by double-clicking index.html.
fetch() of data/projects.json is blocked on file:// (there is a projects.js
fallback, so it still works, but the server path is cleaner).

DEPLOY
  Drag this whole folder into Netlify / Vercel / Cloudflare Pages, or push to
  GitHub Pages. Nothing to compile.

STRUCTURE
  index.html                  markup
  assets/css/styles.css       all styles
  assets/js/app.js            grid, filters, music
  assets/audio/bg.mp3         background track (autoplays)
  assets/img/logo/*.png       company logos (720x220, transparent)
  assets/img/*.jpg            festival thumbnails only
  data/projects.json          the content — edit this
  data/projects.js            same data as a fallback for file://

ADDING A PROJECT
Append an object to data/projects.json, then mirror it into data/projects.js
(prefix `window.PROJECTS = ` and add a trailing semicolon).

  {
   "title": "Introducing Foo",
   "desc":  "one line about it",
   "tags":  ["Launch Video"],
   "views": "120k views",          // optional, shows in the card footer
   "category": "Launch Video",     // drives the filter chips
   "href":  "https://x.com/...",   // where the card sends people
   "mode":  "logo",                // "logo" = brand tile, "thumb" = still frame
   "brand": "Foo",                 // text fallback if there's no logo file
   "tile":  "light",               // "light" = cream tile, "dark" = black tile
   "logo":  "assets/img/logo/foo-com.png"
  }

  Pick "dark" when the logo artwork is white/light, "light" when it's dark.
  For "mode": "thumb", supply "img": "assets/img/your-thumb.jpg" instead of
  logo/brand/tile. Thumbnails get the green dither wash automatically.

BEHAVIOUR
  - No video plays on the site. Every card is an <a target="_blank"> that
    opens the post on X / Instagram / LinkedIn.
  - Music: the track is armed on load. Where the browser allows real autoplay
    it starts immediately. Chrome/Safari block unmuted autoplay, so the track
    starts muted and already rolling, then fades up the instant the visitor
    moves the mouse, scrolls, taps or presses a key. Practically: sound is on
    within the first second of anyone actually using the page. The SOUND
    toggle in the nav turns it off, and once turned off it stays off. It also
    pauses on a hidden tab.
  - Fonts: Gambarino (display) + Instrument Sans (body) + Switzer (labels),
    same stack as localhosthq.com, loaded from Fontshare and Google Fonts.

SWAPPING THE MUSIC
  Replace assets/audio/bg.mp3 with any mp3 of the same name.
