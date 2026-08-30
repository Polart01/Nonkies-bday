/* ================================================================
   EASY SETTINGS — edit names, dates, messages, colours and effects here.
   ================================================================ */
const CONFIG = {
  recipientName: "Nonkie ❤️",
  unlockDate: "2026-08-30T00:00:00+02:00",
  timeZone: "Africa/Johannesburg",
  batchSize: 30,
  slideDuration: 5000,
  title: "Happy Birthday, Nonkie ❤️",
  lockedMessage: "This present will only open at 12 o’clock midnight ❤️",
  heartfeltMessage: `Happy Birthday, my love ❤️

Today is all about celebrating the beautiful person you are and every precious memory we have created together. Every photograph in this timeline carries a moment, a smile, and a part of our journey that I will always treasure.

May this new chapter of your life bring you happiness, peace, love, growth, and countless reasons to smile. You deserve beautiful things today and always.

I hope you enjoy walking through our memories as much as I enjoyed creating this surprise for you. Happy Birthday, Nonkie. You are deeply loved. 🎂🎈❤️`,
  decorations: {
    enabled: true,
    balloons: true,
    bubbles: true,
    hearts: true,
    sparkles: true,
    petals: true,
    confetti: true,
    fairyLights: true,
    flowersAndLeaves: true,
    loveNotes: true,
    intensity: "medium",
    mobileParticleLimit: 18,
    desktopParticleLimit: 35,
    colors: ["#F7A8B8", "#E8B4BC", "#A66A5B", "#D4A373", "#FFF5EE", "#FFFFFF"],
    memoryNotes: [
      "Every picture holds a little piece of us ❤️",
      "The best moments are the ones we share.",
      "Still choosing you, through every chapter.",
      "You make ordinary days feel beautiful.",
      "More laughter, more adventures, more memories."
    ]
  }
};

const $ = (selector) => document.querySelector(selector);
const elements = {
  scene: $("#giftScene"), gift: $("#giftButton"), hint: $("#giftHint"), status: $("#statusMessage"),
  countdown: $("#countdown"), memories: $("#memories"), title: $("#memoryTitle"), letter: $("#heartfeltMessage"),
  timeline: $("#timeline"), empty: $("#emptyState"), counter: $("#memoryCounter"), loadMore: $("#loadMore"),
  sentinel: $("#loadSentinel"), effects: $("#effectsLayer"), lightbox: $("#lightbox"), lightboxImage: $("#lightboxImage"),
  lightboxCaption: $("#lightboxCaption"), lightboxDate: $("#lightboxDate"), audio: $("#audioPlayer"),
  trackTitle: $("#trackTitle"), playlist: $("#playlist"), playPause: $("#playPause")
};

Object.assign(elements, {
  memoryHero: $(".memory-hero"), startBooth: $("#startBooth"), photoBooth: $("#photoBooth"),
  boothStage: $("#boothStage"), boothImage: $("#boothImage"), boothBackdrop: $("#boothBackdrop"),
  boothCaption: $("#boothCaption"), boothDate: $("#boothDate"), boothCounter: $("#boothCounter"),
  boothProgress: $("#boothProgressBar"), boothPlayPause: $("#boothPlayPause")
});

const state = {
  photos: [], songs: [], rendered: 0, activePhoto: 0, activeTrack: 0,
  opened: false, unlocked: false, boothOpen: false, boothPlaying: false,
  slideTimer: 0, transitionTimer: 0
};
const unlockTime = new Date(CONFIG.unlockDate).getTime();

function updateCountdown() {
  const remaining = unlockTime - Date.now();
  if (remaining <= 0 || localStorage.getItem("nonkieBirthdayUnlocked") === "yes") {
    unlockGift();
    return;
  }
  const totalSeconds = Math.floor(remaining / 1000);
  $("#days").textContent = String(Math.floor(totalSeconds / 86400)).padStart(2, "0");
  $("#hours").textContent = String(Math.floor(totalSeconds % 86400 / 3600)).padStart(2, "0");
  $("#minutes").textContent = String(Math.floor(totalSeconds % 3600 / 60)).padStart(2, "0");
  $("#seconds").textContent = String(totalSeconds % 60).padStart(2, "0");
}

function unlockGift() {
  if (state.unlocked) return;
  state.unlocked = true;
  localStorage.setItem("nonkieBirthdayUnlocked", "yes");
  elements.countdown.innerHTML = "<strong>Your surprise is ready ❤️</strong>";
  elements.gift.setAttribute("aria-disabled", "false");
  elements.gift.classList.add("ready");
  elements.hint.textContent = "Tap the present to open it";
}

function lockedGiftReaction() {
  if (state.unlocked) return;
  elements.gift.classList.remove("locked-shake");
  void elements.gift.offsetWidth;
  elements.gift.classList.add("locked-shake");
  elements.status.textContent = CONFIG.lockedMessage;
  createHeartBurst(3, giftOrigin());
  createSparkles(4, giftOrigin());
}

async function openGift() {
  if (!state.unlocked || state.opened) return;
  state.opened = true;
  elements.gift.classList.remove("ready");
  elements.gift.classList.add("opening");
  const origin = giftOrigin();
  createBalloonBurst(Math.ceil(particleLimit() * .35), origin);
  createBubbleBurst(Math.ceil(particleLimit() * .2), origin);
  createHeartBurst(Math.ceil(particleLimit() * .18), origin);
  createSparkles(Math.ceil(particleLimit() * .25), origin);
  createPetalShower(Math.ceil(particleLimit() * .3), origin);
  createConfetti(Math.ceil(particleLimit() * .45), origin);
  await loadManifest();
  setTimeout(() => elements.scene.classList.add("zooming"), 800);
  setTimeout(() => {
    elements.memories.hidden = false;
    const fairyLights = $(".fairy-lights");
    if (fairyLights) fairyLights.hidden = !CONFIG.decorations.fairyLights;
    elements.title.textContent = CONFIG.title;
    elements.letter.textContent = CONFIG.heartfeltMessage;
    preparePhotoBooth();
    setupPlaylist();
    tryStartMusic();
  }, prefersLowMotion() ? 50 : 2200);
}

function preparePhotoBooth() {
  if (!elements.startBooth) return;
  elements.startBooth.disabled = !state.photos.length;
  elements.startBooth.textContent = state.photos.length
    ? `Open Our Photo Booth · ${state.photos.length} Memories ❤️`
    : "Add photos to open the booth";
}

function openPhotoBooth() {
  if (!state.photos.length || state.boothOpen) return;
  state.boothOpen = true;
  state.boothPlaying = true;
  state.activePhoto = 0;
  elements.memoryHero.hidden = true;
  elements.photoBooth.hidden = false;
  elements.memories.classList.add("booth-mode");
  document.body.classList.add("booth-open");
  showBoothPhoto(0, true);
  elements.boothStage.focus({ preventScroll: true });
  tryStartMusic();
}

function closePhotoBooth() {
  clearBoothTimers();
  state.boothOpen = false;
  state.boothPlaying = false;
  elements.photoBooth.hidden = true;
  elements.memoryHero.hidden = false;
  elements.memories.classList.remove("booth-mode");
  document.body.classList.remove("booth-open");
  elements.startBooth.focus({ preventScroll: true });
}

function showBoothPhoto(index, immediate = false) {
  if (!state.photos.length) return;
  clearTimeout(state.transitionTimer);
  clearTimeout(state.slideTimer);
  state.activePhoto = (index + state.photos.length) % state.photos.length;
  const photo = state.photos[state.activePhoto];
  const delay = immediate || prefersLowMotion() ? 0 : 260;
  elements.boothStage.classList.add("changing");
  state.transitionTimer = setTimeout(() => {
    const source = new URL(photo.path, document.baseURI).href;
    elements.boothImage.src = source;
    elements.boothBackdrop.src = source;
    elements.boothImage.alt = photo.alt || photo.caption || "A beautiful memory";
    elements.boothCaption.textContent = photo.caption || "A beautiful memory";
    elements.boothDate.textContent = formatDate(photo.date);
    elements.boothDate.dateTime = photo.date || "";
    elements.boothCounter.textContent = `${state.activePhoto + 1} of ${state.photos.length}`;
    elements.boothStage.classList.remove("changing");
    preloadBoothPhoto(state.activePhoto + 1);
    scheduleNextBoothPhoto();
  }, delay);
}

function preloadBoothPhoto(index) {
  if (!state.photos.length) return;
  const next = state.photos[(index + state.photos.length) % state.photos.length];
  const image = new Image();
  image.src = new URL(next.path, document.baseURI).href;
}

function scheduleNextBoothPhoto() {
  clearTimeout(state.slideTimer);
  elements.boothProgress.style.animation = "none";
  void elements.boothProgress.offsetWidth;
  if (!state.boothPlaying || document.hidden) return;
  elements.boothProgress.style.animation = `boothProgress ${CONFIG.slideDuration}ms linear forwards`;
  state.slideTimer = setTimeout(() => showBoothPhoto(state.activePhoto + 1), CONFIG.slideDuration);
}

function setBoothPlaying(playing) {
  state.boothPlaying = playing;
  elements.boothPlayPause.textContent = playing ? "⏸" : "▶";
  elements.boothPlayPause.setAttribute("aria-label", playing ? "Pause slideshow" : "Play slideshow");
  scheduleNextBoothPhoto();
}

function toggleBoothPlaying() { setBoothPlaying(!state.boothPlaying); }
function nextBoothPhoto() { showBoothPhoto(state.activePhoto + 1); }
function previousBoothPhoto() { showBoothPhoto(state.activePhoto - 1); }
function clearBoothTimers() { clearTimeout(state.slideTimer); clearTimeout(state.transitionTimer); }

async function loadManifest() {
  try {
    const response = await fetch("media-manifest.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
    const data = await response.json();
    state.photos = Array.isArray(data.photos) ? data.photos.sort(compareMedia) : [];
    state.songs = Array.isArray(data.music) ? data.music : [];
  } catch (error) {
    console.warn(error);
    elements.status.textContent = "The surprise opened, but the memory list could not be loaded.";
  }
}

function compareMedia(a, b) {
  if (!a.date && !b.date) return (a.path || "").localeCompare(b.path || "");
  if (!a.date) return 1;
  if (!b.date) return -1;
  return a.date.localeCompare(b.date) || (a.path || "").localeCompare(b.path || "");
}

function renderNextBatch() {
  if (!state.photos.length) { elements.empty.hidden = false; elements.loadMore.hidden = true; updateCounter(); return; }
  elements.empty.hidden = true;
  const batch = state.photos.slice(state.rendered, state.rendered + CONFIG.batchSize);
  const fragment = document.createDocumentFragment();
  batch.forEach((photo, offset) => {
    const index = state.rendered + offset;
    if (index > 0 && index % 8 === 0 && CONFIG.decorations.loveNotes) fragment.appendChild(createLoveNote(index));
    fragment.appendChild(createMemoryCard(photo, index));
  });
  elements.timeline.appendChild(fragment);
  state.rendered += batch.length;
  elements.loadMore.hidden = state.rendered >= state.photos.length;
  updateCounter();
}

function createMemoryCard(photo, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "memory-card";
  button.classList.toggle("side-right", index % 2 === 1);
  button.dataset.index = index;
  button.setAttribute("aria-label", `Open memory: ${photo.caption || "Our beautiful memory"}`);
  const frame = document.createElement("span"); frame.className = "frame";
  const image = document.createElement("img");
  image.src = photo.thumbnail || photo.path;
  image.alt = photo.alt || photo.caption || `A memory with ${CONFIG.recipientName}`;
  image.loading = "lazy"; image.decoding = "async";
  image.addEventListener("error", () => { image.alt = "This memory image could not be loaded"; frame.classList.add("image-error"); });
  const meta = document.createElement("span"); meta.className = "memory-meta";
  const caption = document.createElement("strong"); caption.textContent = photo.caption || "A beautiful memory";
  const time = document.createElement("time"); time.dateTime = photo.date || ""; time.textContent = formatDate(photo.date);
  frame.appendChild(image); meta.append(caption, time); button.append(frame, meta);
  decorateMemoryFrame(button, index);
  button.addEventListener("click", () => openLightbox(index));
  revealObserver.observe(button);
  return button;
}

function createLoveNote(index) {
  const note = document.createElement("aside");
  note.className = "timeline-note";
  note.setAttribute("aria-label", "A little love note");
  const notes = CONFIG.decorations.memoryNotes;
  note.textContent = notes[Math.floor(index / 8 - 1) % notes.length];
  const ribbon = document.createElement("i");
  ribbon.className = "note-ribbon";
  note.appendChild(ribbon);
  return note;
}

function updateCounter() {
  elements.counter.textContent = `${state.rendered.toLocaleString()} of ${state.photos.length.toLocaleString()} memories`;
}

function formatDate(date) {
  if (!date) return "More beautiful memories";
  return new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

function openLightbox(index) {
  state.activePhoto = index;
  updateLightbox();
  elements.lightbox.showModal();
  document.body.classList.add("lightbox-open");
  const origin = { x: innerWidth / 2, y: innerHeight / 2 };
  const choices = [createBubbleBurst, createHeartBurst, createSparkles, createPetalShower, createBalloonBurst];
  choices[Math.floor(Math.random() * choices.length)](Math.min(12, particleLimit()), origin);
}
function updateLightbox() {
  const photo = state.photos[state.activePhoto]; if (!photo) return;
  elements.lightboxImage.src = photo.path;
  elements.lightboxImage.alt = photo.alt || photo.caption || "A beautiful memory";
  elements.lightboxCaption.textContent = photo.caption || "A beautiful memory";
  elements.lightboxDate.textContent = formatDate(photo.date);
  elements.lightboxDate.dateTime = photo.date || "";
}
function movePhoto(direction) { if (!state.photos.length) return; state.activePhoto = (state.activePhoto + direction + state.photos.length) % state.photos.length; updateLightbox(); }
function closeLightbox() { elements.lightbox.close(); document.body.classList.remove("lightbox-open"); }

function setupPlaylist() {
  elements.playlist.replaceChildren();
  if (!state.songs.length) return;
  state.songs.forEach((song, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button"); button.type = "button"; button.textContent = song.title || fileTitle(song.path);
    button.addEventListener("click", () => selectTrack(index, true)); item.appendChild(button); elements.playlist.appendChild(item);
  });
  selectTrack(0, false);
}
function fileTitle(path = "") { return decodeURIComponent(path.split("/").pop().replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")); }
function selectTrack(index, autoplay) {
  if (!state.songs.length) return;
  state.activeTrack = (index + state.songs.length) % state.songs.length;
  const song = state.songs[state.activeTrack]; elements.audio.src = song.path; elements.trackTitle.textContent = song.title || fileTitle(song.path);
  [...elements.playlist.children].forEach((item, i) => item.classList.toggle("active", i === state.activeTrack));
  if (autoplay) elements.audio.play().catch(() => {});
}
function togglePlay() { if (!state.songs.length) return; elements.audio.paused ? elements.audio.play().catch(() => {}) : elements.audio.pause(); }
function tryStartMusic() { if (state.songs.length) elements.audio.play().catch(() => { elements.playPause.textContent = "▶"; }); }

function particleLimit() { return innerWidth < 700 ? CONFIG.decorations.mobileParticleLimit : CONFIG.decorations.desktopParticleLimit; }
function decorationEnabled(type) {
  const map = { balloon: "balloons", bubble: "bubbles", heart: "hearts", spark: "sparkles", petal: "petals", confetti: "confetti" };
  return CONFIG.decorations.enabled && CONFIG.decorations[map[type]] !== false;
}
function giftOrigin() {
  const box = elements.gift.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height * .55 };
}
function randomColor() { return CONFIG.decorations.colors[Math.floor(Math.random() * CONFIG.decorations.colors.length)]; }
function createParticles(type, amount = 10, origin = null) {
  if (!decorationEnabled(type) || prefersLowMotion() || document.hidden) return;
  const count = Math.min(amount, particleLimit());
  for (let i = 0; i < count; i++) {
    const node = document.createElement("i");
    node.className = `particle ${type}`;
    const startX = origin ? origin.x + Math.random() * 70 - 35 : Math.random() * innerWidth;
    const startY = origin ? origin.y + Math.random() * 40 - 20 : innerHeight + 30;
    node.style.left = `${startX}px`; node.style.top = `${startY}px`;
    node.style.setProperty("--x", `${Math.random() * 60 - 30}px`);
    node.style.setProperty("--drift", `${Math.random() * 180 - 90}px`);
    node.style.setProperty("--rise", `-${Math.max(innerHeight * .75, startY + 100)}px`);
    node.style.setProperty("--duration", `${2.7 + Math.random() * 3.4}s`);
    node.style.setProperty("--delay", `${Math.random() * .35}s`);
    node.style.setProperty("--size", `${15 + Math.random() * 29}px`);
    node.style.setProperty("--color", randomColor());
    node.style.setProperty("--rotation", `${Math.random() * 540 - 270}deg`);
    elements.effects.appendChild(node);
    node.addEventListener("animationend", () => node.remove(), { once: true });
    setTimeout(() => node.remove(), 7500);
  }
}
function createEffectBurst(amount = 10, types = ["heart"], origin = null) {
  const active = types.filter(decorationEnabled);
  if (!active.length) return;
  for (let i = 0; i < amount; i++) createParticles(active[i % active.length], 1, origin);
}
function createBalloonBurst(amount = 10, origin = null) { createParticles("balloon", amount, origin); }
function createBubbleBurst(amount = 10, origin = null) { createParticles("bubble", amount, origin); }
function createHeartBurst(amount = 10, origin = null) { createParticles("heart", amount, origin); }
function createSparkles(amount = 10, origin = null) { createParticles("spark", amount, origin); }
function createPetalShower(amount = 10, origin = null) { createParticles("petal", amount, origin); }
function createConfetti(amount = 10, origin = null) { createParticles("confetti", amount, origin); }
function clearTemporaryDecorations() { elements.effects.replaceChildren(); }

function createAmbientDecorations() {
  const layer = $("#ambientDecorations");
  if (!layer || !CONFIG.decorations.enabled || prefersLowMotion()) return;
  layer.replaceChildren();
  const count = Math.min(innerWidth < 700 ? 12 : 22, particleLimit());
  for (let i = 0; i < count; i++) {
    const dust = document.createElement("i");
    dust.className = i % 4 === 0 ? "ambient-star" : "ambient-dust";
    dust.style.left = `${5 + Math.random() * 90}%`; dust.style.top = `${5 + Math.random() * 85}%`;
    dust.style.setProperty("--ambient-delay", `${Math.random() * -8}s`); dust.style.setProperty("--ambient-duration", `${5 + Math.random() * 7}s`);
    layer.appendChild(dust);
  }
}

function decorateMemoryFrame(card, index) {
  if (!CONFIG.decorations.enabled) return;
  card.dataset.ornament = ["heart", "star", "ribbon", "rose"][index % 4];
  if (!CONFIG.decorations.flowersAndLeaves || index % 3 !== 0) return;
  const frame = card.querySelector(".frame");
  frame.appendChild(createBotanicalSvg(index % 2 === 0 ? "left" : "right"));
}

function createBotanicalSvg(side) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 100 140"); svg.setAttribute("aria-hidden", "true");
  svg.classList.add("botanical", `botanical-${side}`);
  const stem = document.createElementNS(ns, "path"); stem.setAttribute("d", "M48 138 C45 100 65 75 54 40 C50 26 52 13 61 3"); stem.setAttribute("fill", "none"); stem.setAttribute("stroke", "#8e765c"); stem.setAttribute("stroke-width", "3");
  svg.appendChild(stem);
  [[52,104,-28],[61,81,25],[52,58,-30],[59,35,26]].forEach(([x,y,r]) => {
    const leaf = document.createElementNS(ns, "ellipse"); leaf.setAttribute("cx", x); leaf.setAttribute("cy", y); leaf.setAttribute("rx", "10"); leaf.setAttribute("ry", "20"); leaf.setAttribute("fill", "#9f9b72"); leaf.setAttribute("transform", `rotate(${r} ${x} ${y})`); svg.appendChild(leaf);
  });
  for (let i = 0; i < 6; i++) { const petal = document.createElementNS(ns, "ellipse"); petal.setAttribute("cx", "61"); petal.setAttribute("cy", "10"); petal.setAttribute("rx", "9"); petal.setAttribute("ry", "16"); petal.setAttribute("fill", i % 2 ? "#f7a8b8" : "#e8b4bc"); petal.setAttribute("transform", `rotate(${i * 60} 61 10) translate(0 -8)`); svg.appendChild(petal); }
  const centre = document.createElementNS(ns, "circle"); centre.setAttribute("cx", "61"); centre.setAttribute("cy", "10"); centre.setAttribute("r", "6"); centre.setAttribute("fill", "#d4a373"); svg.appendChild(centre);
  return svg;
}
function prefersLowMotion() { return document.body.classList.contains("low-motion") || matchMedia("(prefers-reduced-motion: reduce)").matches; }

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("visible"); revealObserver.unobserve(entry.target); } }), { rootMargin: "100px" });
const loadObserver = new IntersectionObserver(entries => { if (entries[0].isIntersecting && !elements.memories.hidden && state.rendered < state.photos.length) renderNextBatch(); }, { rootMargin: "500px" });
loadObserver.observe(elements.sentinel);

elements.gift.addEventListener("click", () => state.unlocked ? openGift() : lockedGiftReaction());
elements.scene.addEventListener("click", event => { if (event.target === elements.scene && !state.unlocked) lockedGiftReaction(); });
elements.loadMore.addEventListener("click", renderNextBatch);
$("#closeLightbox").addEventListener("click", closeLightbox); $("#previousPhoto").addEventListener("click", () => movePhoto(-1)); $("#nextPhoto").addEventListener("click", () => movePhoto(1));
elements.lightbox.addEventListener("click", event => { if (event.target === elements.lightbox) closeLightbox(); });
document.addEventListener("keydown", event => {
  if (state.boothOpen) {
    if (event.key === "ArrowLeft") previousBoothPhoto();
    if (event.key === "ArrowRight") nextBoothPhoto();
    if (event.key === " " || event.key === "Spacebar") { event.preventDefault(); toggleBoothPlaying(); }
    if (event.key === "Escape") closePhotoBooth();
    return;
  }
  if (!elements.lightbox.open) return;
  if (event.key === "ArrowLeft") movePhoto(-1);
  if (event.key === "ArrowRight") movePhoto(1);
});
let touchStart = 0; elements.lightbox.addEventListener("touchstart", e => touchStart = e.changedTouches[0].clientX, { passive:true }); elements.lightbox.addEventListener("touchend", e => { const change = e.changedTouches[0].clientX - touchStart; if (Math.abs(change) > 55) movePhoto(change > 0 ? -1 : 1); }, { passive:true });
$("#playerToggle").addEventListener("click", event => { const panel = $("#playerPanel"); panel.hidden = !panel.hidden; event.currentTarget.setAttribute("aria-expanded", String(!panel.hidden)); });
elements.playPause.addEventListener("click", togglePlay); $("#previousTrack").addEventListener("click", () => selectTrack(state.activeTrack - 1, true)); $("#nextTrack").addEventListener("click", () => selectTrack(state.activeTrack + 1, true));
$("#muteButton").addEventListener("click", event => { elements.audio.muted = !elements.audio.muted; event.currentTarget.textContent = elements.audio.muted ? "🔇" : "🔊"; });
$("#volume").addEventListener("input", event => elements.audio.volume = Number(event.target.value)); elements.audio.volume = .7;
elements.audio.addEventListener("play", () => { elements.playPause.textContent = "⏸"; elements.playPause.setAttribute("aria-label", "Pause music"); }); elements.audio.addEventListener("pause", () => { elements.playPause.textContent = "▶"; elements.playPause.setAttribute("aria-label", "Play music"); }); elements.audio.addEventListener("ended", () => selectTrack(state.activeTrack + 1, true));
$("#performanceToggle").addEventListener("click", event => { document.body.classList.toggle("low-motion"); clearTemporaryDecorations(); event.currentTarget.textContent = document.body.classList.contains("low-motion") ? "Full-motion mode" : "Low-motion mode"; });
elements.startBooth.addEventListener("click", openPhotoBooth);
$("#exitBooth").addEventListener("click", closePhotoBooth);
$("#boothPrevious").addEventListener("click", previousBoothPhoto);
$("#boothNext").addEventListener("click", nextBoothPhoto);
elements.boothPlayPause.addEventListener("click", toggleBoothPlaying);
let boothDidSwipe = false;
elements.boothStage.addEventListener("click", () => { if (!boothDidSwipe) nextBoothPhoto(); });
elements.boothImage.addEventListener("error", () => {
  elements.boothCaption.textContent = "This memory could not be loaded — moving to the next one…";
  clearTimeout(state.slideTimer);
  state.slideTimer = setTimeout(nextBoothPhoto, 1000);
});
let boothTouchStart = 0;
elements.boothStage.addEventListener("touchstart", event => { boothTouchStart = event.changedTouches[0].clientX; }, { passive: true });
elements.boothStage.addEventListener("touchend", event => {
  const change = event.changedTouches[0].clientX - boothTouchStart;
  if (Math.abs(change) > 55) {
    boothDidSwipe = true;
    change > 0 ? previousBoothPhoto() : nextBoothPhoto();
    setTimeout(() => { boothDidSwipe = false; }, 400);
  }
}, { passive: true });
document.addEventListener("visibilitychange", () => {
  document.body.classList.toggle("tab-hidden", document.hidden);
  if (!state.boothOpen) return;
  if (document.hidden) clearTimeout(state.slideTimer);
  else scheduleNextBoothPhoto();
});

createAmbientDecorations();
updateCountdown();
setInterval(updateCountdown, 1000);
