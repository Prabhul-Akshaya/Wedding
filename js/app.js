if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

const $ = (id) => document.getElementById(id);
let wedding = null;
let galleryImages = [];
let galleryIndex = 0;
let countdownTimer = null;

async function loadWeddingData() {
  try {
    const response = await fetch("wedding.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load wedding.json");
    wedding = await response.json();
    applyTheme();
    renderAll();
    initInteractions();
    $("loader").classList.add("hidden");
  } catch (error) {
    console.error(error);
    $("loader").innerHTML = "<strong>Unable to load invitation.</strong><span>Please check wedding.json.</span>";
  }
}

function applyTheme() {
  const root = document.documentElement;
  const theme = wedding.theme || {};
  for (const [key, value] of Object.entries(theme)) {
    root.style.setProperty(`--${key}`, value);
  }
  document.title = `${wedding.couple?.displayName || "Wedding"} | Wedding Invitation`;
  document.querySelector('meta[name="description"]').content =
    `Wedding invitation for ${wedding.couple?.displayName || "our special day"}`;
}

function text(id, value, fallback = "") {
  const el = $(id);
  if (el) el.textContent = value ?? fallback;
}

function renderAll() {
  const c = wedding.couple || {};
  const d = wedding.date || {};
  const l = wedding.location || {};
  const inv = wedding.invitation || {};
  const families = wedding.families || {};

  $("heroBg").style.backgroundImage =
    `url("${c.heroImage || "images/couple.jpg"}")`;
  $("coupleImage").style.backgroundImage =
    `linear-gradient(rgba(30,10,15,.15),rgba(30,10,15,.45)),url("${c.coupleImage || "images/couple-2.jpg"}")`;

  text("heroTitle", inv.title, "Together with their families");
  text("brideName", c.bride, "Bride Name");
  text("groomName", c.groom, "Groom Name");
  text("heroDate", [d.day, d.display, d.time].filter(Boolean).join(" • "));
  text("heroLocation", [l.venue, l.city].filter(Boolean).join(" • "));

  text("inviteTitle", inv.title, "Together with their families");
  text("inviteMessage", inv.message);
  text("brideFamily", families.bride);
  text("groomFamily", families.groom);

  text("storyTitle", wedding.story?.title || "Our Story");
  renderStory();
  renderEvents();
  renderGallery();
  renderVenue();
  renderRSVP();
  renderFooter();
  startCountdown();
  initMusic();
}

function renderStory() {
  const story = wedding.story || {};
  const section = $("story");
  if (story.enabled === false) { section.classList.add("hidden"); return; }
  $("storyBody").innerHTML = "";
  (story.paragraphs || []).forEach(paragraph => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    $("storyBody").appendChild(p);
  });
}

function iconFor(event) {
  return ({ring:"♢",heart:"♥",party:"✦",flower:"❧",default:"✦"})[event.icon] || "✦";
}

function renderEvents() {
  const events = wedding.events || [];
  const list = $("eventList");
  list.innerHTML = "";
  if (!events.length) { $("events").classList.add("hidden"); return; }
  $("events").classList.remove("hidden");

  events.forEach(event => {
    const article = document.createElement("article");
    article.className = "event-card";
    article.innerHTML = `
      <div class="event-icon">${iconFor(event)}</div>
      <h3>${escapeHtml(event.name || "Wedding Event")}</h3>
      <div class="event-meta">${escapeHtml(event.date || "")}${event.time ? " • " + escapeHtml(event.time) : ""}</div>
      <p><strong>${escapeHtml(event.venue || "")}</strong><br>${escapeHtml(event.address || "")}</p>
      ${event.description ? `<p>${escapeHtml(event.description)}</p>` : ""}
      ${event.mapUrl ? `<a class="map-btn" href="${safeUrl(event.mapUrl)}" target="_blank" rel="noopener">View Location ↗</a>` : ""}
    `;
    list.appendChild(article);
  });
}

function renderGallery() {
  const grid = $("galleryGrid");
  grid.innerHTML = "";
  galleryImages = (wedding.gallery || []).filter(Boolean);
  if (!galleryImages.length) { $("gallery").classList.add("hidden"); return; }
  $("gallery").classList.remove("hidden");

  galleryImages.forEach((src, index) => {
    const button = document.createElement("button");
    button.className = "gallery-item";
    button.type = "button";
    button.setAttribute("aria-label", `Open photo ${index + 1}`);
    const img = document.createElement("img");
    img.src = src;
    img.alt = `${wedding.couple?.displayName || "Wedding"} photo ${index + 1}`;
    img.loading = "lazy";
    img.onerror = () => button.remove();
    button.appendChild(img);
    button.addEventListener("click", () => openLightbox(index));
    grid.appendChild(button);
  });
}

function renderVenue() {
  const l = wedding.location || {};
  text("venueName", l.venue, "Wedding Venue");
  text("venueAddress", [l.address, l.city].filter(Boolean).join(", "));
  const image = $("venueImage");
  if (wedding.venueImage) {
    image.src = wedding.venueImage;
    image.onerror = () => image.closest(".venue-image-wrap").classList.add("hidden");
  } else {
    image.closest(".venue-image-wrap").classList.add("hidden");
  }
  const map = $("mapLink");
  if (l.mapUrl) map.href = safeUrl(l.mapUrl);
  else map.classList.add("hidden");
}

function renderRSVP() {
  const r = wedding.rsvp || {};
  if (r.enabled === false) { $("rsvp").classList.add("hidden"); return; }
  text("rsvpMessage", r.message);
  text("rsvpDeadline", r.deadline);
  text("rsvpContact", r.contactName || r.phone || "");
  const link = $("whatsappLink");
  if (r.whatsapp) {
    const number = String(r.whatsapp).replace(/[^\d]/g, "");
    const couple = wedding.couple?.displayName || "";
    const message = (r.messageTemplate || "Hello! I would like to RSVP for {couple}.")
      .replaceAll("{couple}", couple);
    link.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  } else link.classList.add("hidden");
}

function renderFooter() {
  const c = wedding.couple || {};
  text("footerText", wedding.footer?.text || "Made with love");
  text("footerCouple", c.displayName || `${c.bride || ""} & ${c.groom || ""}`);
  text("closingBride", c.bride);
  text("closingGroom", c.groom);
  text("closingDate", wedding.date?.display);
}

function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);
  const target = new Date(wedding.date?.iso).getTime();
  if (Number.isNaN(target)) return;
  const update = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      ["days","hours","minutes","seconds"].forEach(id => text(id, "00"));
      text("countdownMessage", "The celebration has begun.");
      clearInterval(countdownTimer);
      return;
    }
    const day = 86400000, hour = 3600000, minute = 60000;
    text("days", String(Math.floor(diff / day)).padStart(2,"0"));
    text("hours", String(Math.floor((diff % day) / hour)).padStart(2,"0"));
    text("minutes", String(Math.floor((diff % hour) / minute)).padStart(2,"0"));
    text("seconds", String(Math.floor((diff % minute) / 1000)).padStart(2,"0"));
  };
  update();
  countdownTimer = setInterval(update, 1000);
}

function initInteractions() {
  const topbar = $("topbar");
  window.addEventListener("scroll", () => topbar.classList.toggle("scrolled", scrollY > 30), {passive:true});

  const btn = $("menuBtn"), nav = $("nav");
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open"); document.body.classList.remove("menu-open");
    btn.setAttribute("aria-expanded","false");
  }));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    });
  }, {threshold:.12});
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  $("lightboxClose").onclick = closeLightbox;
  $("lightboxPrev").onclick = () => changeLightbox(-1);
  $("lightboxNext").onclick = () => changeLightbox(1);
  $("lightbox").addEventListener("click", e => { if (e.target.id === "lightbox") closeLightbox(); });
  document.addEventListener("keydown", e => {
    if ($("lightbox").classList.contains("hidden")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") changeLightbox(-1);
    if (e.key === "ArrowRight") changeLightbox(1);
  });
}

function openLightbox(index) {
  galleryIndex = index;
  $("lightbox").classList.remove("hidden");
  updateLightbox();
  document.body.classList.add("menu-open");
}
function closeLightbox() {
  $("lightbox").classList.add("hidden");
  document.body.classList.remove("menu-open");
}
function changeLightbox(delta) {
  galleryIndex = (galleryIndex + delta + galleryImages.length) % galleryImages.length;
  updateLightbox();
}
function updateLightbox() {
  const src = galleryImages[galleryIndex];
  $("lightboxImage").src = src;
  $("lightboxImage").alt = `Wedding photo ${galleryIndex + 1}`;
  text("lightboxCounter", `${galleryIndex + 1} / ${galleryImages.length}`);
}

function initMusic() {

  const config = wedding.music || {};
  const btn = $("musicBtn");
  const audio = $("weddingAudio");

  if (!config.enabled || !config.file) {
    btn.classList.add("hidden");
    return;
  }

  audio.src = config.file;
  audio.loop = config.loop !== false;

  btn.classList.remove("hidden");

  // Start / stop music from the music button
  btn.onclick = async () => {
    if (audio.paused) {
      try {
        await audio.play();
        btn.classList.add("playing");
        btn.textContent = "❚❚";
      } catch (err) {
        console.log("Music could not be played:", err);
      }
    } else {
      audio.pause();
      btn.classList.remove("playing");
      btn.textContent = "♫";
    }
  };

  // Start music on the first user interaction anywhere on the page
  const startMusicOnInteraction = async () => {

    if (!audio.paused) return;

    try {
      await audio.play();

      btn.classList.add("playing");
      btn.textContent = "❚❚";

      // We only need this once
      document.removeEventListener("click", startMusicOnInteraction);
      document.removeEventListener("touchstart", startMusicOnInteraction);
      document.removeEventListener("pointerdown", startMusicOnInteraction);

    } catch (err) {
      console.log("Waiting for another interaction to start music:", err);
    }
  };

  document.addEventListener("click", startMusicOnInteraction);
  document.addEventListener("touchstart", startMusicOnInteraction, { passive: true });
  document.addEventListener("pointerdown", startMusicOnInteraction);

  audio.addEventListener("ended", () => {
    btn.classList.remove("playing");
    btn.textContent = "♫";
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}
function safeUrl(url) {
  try {
    const parsed = new URL(url, window.location.href);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.href;
  } catch {}
  return "#";
}

loadWeddingData();
