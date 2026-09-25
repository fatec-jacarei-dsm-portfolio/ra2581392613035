const langPT = document.getElementById("langPT");
const langEN = document.getElementById("langEN");
let currentLang = "pt";

function setLanguage(lang) {
  currentLang = lang;
  langPT.classList.toggle("active", lang === "pt");
  langEN.classList.toggle("active", lang === "en");
  document.querySelectorAll("[data-pt]").forEach((el) => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
}

langPT.addEventListener("click", () => setLanguage("pt"));
langEN.addEventListener("click", () => setLanguage("en"));
