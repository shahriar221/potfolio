const navLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const setActiveLink = (id) => {
  navLinks.forEach((link) => {
    link.setAttribute("aria-current", link.getAttribute("href") === `#${id}`);
  });
};

if ("IntersectionObserver" in window && sections.length > 0) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        setActiveLink(visible.target.id);
      }
    },
    {
      rootMargin: "-28% 0px -58% 0px",
      threshold: [0.15, 0.35, 0.6],
    }
  );

  sections.forEach((section) => navObserver.observe(section));
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
