const navLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const setActiveLink = (id) => {
  navLinks.forEach((link) => {
    link.setAttribute("aria-current", link.getAttribute("href") === `#${id}`);
  });
};

const getHeaderOffset = () => {
  const header = document.querySelector(".site-header");
  return header ? header.getBoundingClientRect().height : 0;
};

const getCurrentSectionId = () => {
  if (sections.length === 0) {
    return null;
  }

  const scrollBottom = window.scrollY + window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollBottom >= documentHeight - 2) {
    return sections.at(-1).id;
  }

  const probeY =
    window.scrollY + getHeaderOffset() + Math.min(window.innerHeight * 0.32, 220);

  if (probeY < sections[0].offsetTop) {
    return null;
  }

  return sections.reduce((currentId, section) => {
    return section.offsetTop <= probeY ? section.id : currentId;
  }, sections[0].id);
};

let activeLinkFrame = null;
let lockedActiveId = null;
let releaseActiveLockTimer = null;

const releaseActiveLock = () => {
  lockedActiveId = null;
  queueActiveLinkUpdate();
};

const lockActiveLink = (id) => {
  lockedActiveId = id;
  window.clearTimeout(releaseActiveLockTimer);
  releaseActiveLockTimer = window.setTimeout(releaseActiveLock, 1200);
};

const queueActiveLinkUpdate = () => {
  if (activeLinkFrame) {
    return;
  }

  activeLinkFrame = window.requestAnimationFrame(() => {
    activeLinkFrame = null;

    if (lockedActiveId) {
      const target = document.getElementById(lockedActiveId);
      const targetTop = target ? target.offsetTop - getHeaderOffset() : 0;
      const distance = Math.abs(window.scrollY - targetTop);
      const atPageEnd =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

      if (distance > 12 && !(lockedActiveId === sections.at(-1).id && atPageEnd)) {
        return;
      }

      window.clearTimeout(releaseActiveLockTimer);
      releaseActiveLockTimer = window.setTimeout(releaseActiveLock, 120);
      return;
    }

    const id = getCurrentSectionId();

    if (id) {
      setActiveLink(id);
    } else {
      navLinks.forEach((link) => link.setAttribute("aria-current", "false"));
    }
  });
};

if (sections.length > 0) {
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("href").slice(1);
      setActiveLink(id);
      lockActiveLink(id);
    });
  });

  window.addEventListener("scroll", queueActiveLinkUpdate, { passive: true });
  window.addEventListener("resize", queueActiveLinkUpdate);
  window.addEventListener("load", queueActiveLinkUpdate);
  queueActiveLinkUpdate();
}

const revealTargets = Array.from(
  document.querySelectorAll(".hero-copy, .ops-map, .hero-ledger")
);

if ("IntersectionObserver" in window && revealTargets.length > 0) {
  document.documentElement.classList.add("motion-ready");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.14,
    }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
}

const copyButton = document.querySelector("[data-copy-email]");

if (copyButton) {
  const email = copyButton.dataset.copyEmail;
  const defaultLabel = copyButton.textContent;

  copyButton.addEventListener("click", async () => {
    copyButton.dataset.state = "loading";
    copyButton.textContent = "Copying";

    try {
      await navigator.clipboard.writeText(email);
      copyButton.dataset.state = "success";
      copyButton.textContent = "Email copied";
    } catch {
      copyButton.dataset.state = "error";
      copyButton.textContent = "Copy failed";
    }

    window.setTimeout(() => {
      copyButton.dataset.state = "idle";
      copyButton.textContent = defaultLabel;
    }, 1800);
  });
}
