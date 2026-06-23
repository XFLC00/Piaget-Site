const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

function closeMenu() {
  if (!menuButton || !mobileMenu) return;
  menuButton.setAttribute("aria-expanded", "false");
  mobileMenu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    mobileMenu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll("[data-accordion] .faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const panel = item?.querySelector(".faq-panel");
    const isExpanded = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!isExpanded));
    if (panel) {
      panel.hidden = isExpanded;
    }
  });
});

const mapOutput = document.querySelector("[data-map-output]");

document.querySelectorAll("[data-map-label]").forEach((pin) => {
  pin.addEventListener("click", () => {
    if (mapOutput) {
      mapOutput.value = pin.dataset.mapLabel || pin.textContent.trim();
    }
  });
});

const programTabs = Array.from(document.querySelectorAll("[data-program-tab]"));
const programPanels = Array.from(document.querySelectorAll("[data-program-panel]"));

function setActiveProgram(program) {
  programTabs.forEach((tab) => {
    const isActive = tab.dataset.programTab === program;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  programPanels.forEach((panel) => {
    const isActive = panel.dataset.programPanel === program;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
}

programTabs.forEach((tab, index) => {
  const activate = () => setActiveProgram(tab.dataset.programTab);

  tab.addEventListener("mouseenter", activate);
  tab.addEventListener("focus", activate);
  tab.addEventListener("click", activate);
  tab.addEventListener("keydown", (event) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(event.key)) return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (index + direction + programTabs.length) % programTabs.length;
    programTabs[nextIndex].focus();
  });
});

const secretarySchedule = {
  1: { day: "segunda-feira", hours: "14:00-16:00", start: 14 * 60, end: 16 * 60 },
  2: { day: "terça-feira", hours: "10:00-12:00", start: 10 * 60, end: 12 * 60 },
  3: { day: "quarta-feira", hours: "14:00-16:00", start: 14 * 60, end: 16 * 60 },
  4: { day: "quinta-feira", hours: "10:00-12:00", start: 10 * 60, end: 12 * 60 },
  5: { day: "sexta-feira", hours: "16:00-18:00", start: 16 * 60, end: 18 * 60 },
};

const weekdayIndex = {
  domingo: 0,
  "segunda-feira": 1,
  "terça-feira": 2,
  "quarta-feira": 3,
  "quinta-feira": 4,
  "sexta-feira": 5,
  sábado: 6,
};

function setText(selector, text) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = text;
  });
}

function getLisbonDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("pt-PT", {
    timeZone: "Europe/Lisbon",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  const weekday = String(parts.weekday || "").toLowerCase();

  return {
    dayIndex: weekdayIndex[weekday] ?? date.getDay(),
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function findNextSecretarySlot(dayIndex) {
  for (let offset = 1; offset <= 7; offset += 1) {
    const nextDay = (dayIndex + offset) % 7;
    const slot = secretarySchedule[nextDay];

    if (slot) {
      return slot;
    }
  }

  return null;
}

function updateSecretaryStatus() {
  const { dayIndex, minutes } = getLisbonDateParts();
  const todaySlot = secretarySchedule[dayIndex];
  const nextSlot = findNextSecretarySlot(dayIndex);
  const statusCards = document.querySelectorAll(".secretary-status");

  let status = "Sem atendimento presencial.";
  let isOpen = false;

  if (todaySlot) {
    if (minutes < todaySlot.start) {
      status = `Ainda encerrada. Abre às ${todaySlot.hours.split("-")[0]}.`;
    } else if (minutes >= todaySlot.start && minutes < todaySlot.end) {
      status = `Aberta agora. Encerra às ${todaySlot.hours.split("-")[1]}.`;
      isOpen = true;
    } else {
      status = nextSlot
        ? `Encerrada. Próximo atendimento: ${nextSlot.day}, ${nextSlot.hours}.`
        : "Encerrada.";
    }
  } else if (nextSlot) {
    status = `Encerrada. Próximo atendimento: ${nextSlot.day}, ${nextSlot.hours}.`;
  }

  setText("[data-secretary-hours]", todaySlot ? todaySlot.hours : "Encerrado");
  setText("[data-secretary-status]", status);

  statusCards.forEach((card) => {
    card.classList.toggle("is-open", isOpen);
    card.classList.toggle("is-closed", !isOpen);
  });
}

updateSecretaryStatus();
window.setInterval(updateSecretaryStatus, 60 * 1000);

const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();

    formStatus.textContent = name
      ? `Pedido registado para ${name}.`
      : "Pedido registado.";
    contactForm.reset();
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});
