export function triggerConfetti(x?: number, y?: number) {
  if (typeof window === "undefined") return;

  const count = 25;
  const colors = ["#8a2be2", "#00f0ff", "#ff007f", "#ec4899", "#6366f1", "#06b6d4"];

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.pointerEvents = "none";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.zIndex = "999999";
  document.body.appendChild(container);

  const posX = x !== undefined ? x : window.innerWidth / 2;
  const posY = y !== undefined ? y : window.innerHeight / 2;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    const size = Math.random() * 6 + 5;
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.position = "absolute";
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = color;
    particle.style.borderRadius = Math.random() > 0.4 ? "50%" : "3px";
    particle.style.left = `${posX}px`;
    particle.style.top = `${posY}px`;
    particle.style.opacity = "1";
    particle.style.transform = "translate(-50%, -50%) scale(1)";

    container.appendChild(particle);

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 120 + 60;
    const destX = Math.cos(angle) * velocity;
    const destY = Math.sin(angle) * velocity + 40; // positive is down, adding a bit of gravity pull

    const anim = particle.animate(
      [
        { transform: "translate(-50%, -50%) translate(0px, 0px) scale(1) rotate(0deg)", opacity: 1 },
        { transform: `translate(-50%, -50%) translate(${destX}px, ${destY}px) scale(0) rotate(${Math.random() * 360 + 180}deg)`, opacity: 0 }
      ],
      {
        duration: Math.random() * 400 + 500,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
      }
    );

    anim.onfinish = () => {
      particle.remove();
    };
  }

  setTimeout(() => {
    container.remove();
  }, 1000);
}
