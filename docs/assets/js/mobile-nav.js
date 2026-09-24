// Abre/fecha o menu mobile (hamburguer)
const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileNav = document.getElementById("mobileNav");
const closeNav = document.getElementById("closeNav");

hamburgerBtn.addEventListener("click", () => mobileNav.classList.add("open"));
closeNav.addEventListener("click", () => mobileNav.classList.remove("open"));
mobileNav.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => mobileNav.classList.remove("open"));
});
