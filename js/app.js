(() => {
  const TOTAL_DAYS = 40;
  const COLORS = ["#3ec6ff", "#ffe566", "#2bb673", "#ff7a59", "#ff5aad", "#8b6cff", "#7dffb3", "#ff9ad5"];
  const LOCKED_EMOJIS = ["✨", "🕯️", "📖", "🙏", "⭐", "🌻", "💧", "🕊️"];

  const els = {
    practices: document.getElementById("practices-list"),
    grid: document.getElementById("days-grid"),
    panel: document.getElementById("day-panel"),
    hero: document.getElementById("panel-hero"),
    toast: document.getElementById("toast"),
    eyebrow: document.getElementById("panel-eyebrow"),
    theme: document.getElementById("panel-theme"),
    scripture: document.getElementById("panel-scripture"),
    summary: document.getElementById("panel-summary"),
    key: document.getElementById("panel-key"),
    virtueTitle: document.getElementById("panel-virtue-title"),
    virtueDetail: document.getElementById("panel-virtue-detail"),
    evilTitle: document.getElementById("panel-evil-title"),
    evilDetail: document.getElementById("panel-evil-detail"),
    prayerTitle: document.getElementById("panel-prayer-title"),
    prayer: document.getElementById("panel-prayer"),
    taskTitle: document.getElementById("panel-task-title"),
    task: document.getElementById("panel-task"),
    reflection: document.getElementById("panel-reflection"),
    closing: document.getElementById("panel-closing"),
    prev: document.getElementById("btn-prev-day"),
    next: document.getElementById("btn-next-day"),
    close: document.getElementById("btn-close-panel"),
  };

  let series = null;
  let daysByNumber = new Map();
  let availableDays = [];
  let selectedDay = null;
  let toastTimer = null;

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2800);
  }

  function renderPractices(list) {
    els.practices.innerHTML = "";
    list.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      els.practices.appendChild(li);
    });
  }

  function renderGrid() {
    els.grid.innerHTML = "";
    const current = series.currentDay || availableDays[availableDays.length - 1] || 1;

    for (let day = 1; day <= TOTAL_DAYS; day += 1) {
      const data = daysByNumber.get(day);
      const hasContent = Boolean(data);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quest-card";
      btn.setAttribute("role", "listitem");
      btn.dataset.day = String(day);

      const color = data?.color || COLORS[(day - 1) % COLORS.length];
      btn.style.setProperty("--card-color", color);

      if (hasContent) {
        btn.classList.add("available");
        if (day === current) btn.classList.add("current");
        btn.setAttribute("aria-label", `Open Day ${day}: ${data.theme}`);
        btn.innerHTML = `
          <span class="emoji" aria-hidden="true">${data.emoji || "✨"}</span>
          <h3>Day ${day}</h3>
          <p>${data.theme}</p>
          <span class="lock-tag">Open</span>
        `;
        btn.addEventListener("click", () => openDay(day));
      } else {
        btn.classList.add("locked");
        btn.setAttribute("aria-label", `Day ${day} coming soon`);
        btn.innerHTML = `
          <span class="emoji" aria-hidden="true">${LOCKED_EMOJIS[(day - 1) % LOCKED_EMOJIS.length]}</span>
          <h3>Day ${day}</h3>
          <p>Coming soon</p>
          <span class="lock-tag">Soon</span>
        `;
        btn.addEventListener("click", () => {
          showToast(`Day ${day} will be added soon. Keep praying.`);
        });
      }

      els.grid.appendChild(btn);
    }
  }

  function openDay(dayNumber) {
    const day = daysByNumber.get(dayNumber);
    if (!day) return;

    selectedDay = dayNumber;
    els.eyebrow.textContent = `Day ${day.day}`;
    els.theme.textContent = day.theme;
    els.scripture.textContent = day.scripture || "";
    els.summary.textContent = day.summary || "";
    els.key.textContent = day.keyThought || "";
    els.virtueTitle.textContent = day.virtue.title;
    els.virtueDetail.textContent = day.virtue.detail;
    els.evilTitle.textContent = day.evil.title;
    els.evilDetail.textContent = day.evil.detail;
    els.prayerTitle.textContent = day.prayer.title || "Today's Prayer";
    els.prayer.textContent = day.prayer.text;
    els.taskTitle.textContent = day.task.title || "Today's Task";
    els.task.textContent = day.task.detail;
    els.closing.textContent = day.closing || "";

    els.hero.style.setProperty("--ch-color", day.color || "#3ec6ff");
    els.hero.style.setProperty("--ch-emoji", `"${day.emoji || "✨"}"`);

    els.reflection.innerHTML = "";
    (day.reflection || []).forEach((point) => {
      const li = document.createElement("li");
      li.textContent = point;
      els.reflection.appendChild(li);
    });

    const idx = availableDays.indexOf(dayNumber);
    els.prev.disabled = idx <= 0;
    els.next.disabled = idx >= availableDays.length - 1;

    els.panel.classList.add("open");
    els.panel.scrollIntoView({ behavior: "smooth", block: "start" });

    document.querySelectorAll(".quest-card").forEach((card) => {
      card.classList.toggle("current", Number(card.dataset.day) === dayNumber);
    });

    history.replaceState(null, "", `#day-${dayNumber}`);
  }

  function closePanel() {
    els.panel.classList.remove("open");
    if (location.hash.startsWith("#day-")) {
      history.replaceState(null, "", "#days");
    }
  }

  function goRelative(step) {
    if (selectedDay == null) return;
    const idx = availableDays.indexOf(selectedDay);
    const next = availableDays[idx + step];
    if (next != null) openDay(next);
  }

  els.prev.addEventListener("click", () => goRelative(-1));
  els.next.addEventListener("click", () => goRelative(1));
  els.close.addEventListener("click", closePanel);

  async function init() {
    try {
      const response = await fetch("data/days.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load days");
      const data = await response.json();

      series = data.series;
      renderPractices(data.dailyPractices || []);

      (data.days || []).forEach((day) => {
        daysByNumber.set(day.day, day);
      });
      availableDays = [...daysByNumber.keys()].sort((a, b) => a - b);

      renderGrid();

      const hashMatch = location.hash.match(/^#day-(\d+)$/);
      if (hashMatch) {
        const dayNum = Number(hashMatch[1]);
        if (daysByNumber.has(dayNum)) openDay(dayNum);
      }
    } catch (error) {
      console.error(error);
      showToast("Unable to load the days. Please refresh the page.");
    }
  }

  init();
})();
