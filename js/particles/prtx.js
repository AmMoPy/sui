/* ========== PARTICLES ANIMATION ========== */
(function() {
  let particlesInitialized = false;
  let drawBackup = null;

  function initParticles(enable) {
    if (particlesInitialized) return;
    
    particlesJS("particles-js", {
      particles: {
        number: { value: 40 },
        color: { value: "#b68484" },
        line_linked: { 
          color: "#b31212",
          enable: enable
        },
        shape: { type: "polygon" },
        opacity: { value: 0.3 },
        size: { value: 3 },
        move: {
          enable: enable,
          speed: 0.5
        }
      },
      interactivity: {
        events: {
          onhover: {
            enable: enable,
            mode: enable ? ["grab"] : []
          },
          onclick: {
            enable: enable,
            mode: enable ? ["push"] : []
          }
        }
      }
    });

    particlesInitialized = true;
  }

  window.updateParticlesAnimation = function(enable) {
    // First initialization
    if (!particlesInitialized) {
      initParticles(enable);
      return;
    }

    // Pause/restore existing instance
    if (window.pJSDom?.[0]?.pJS) {
      const pJS = window.pJSDom[0].pJS;
      
      if (enable) {
        // Restore animation
        if (drawBackup) {
          pJS.fn.vendors.draw = drawBackup;
          drawBackup = null;
        }
        pJS.particles.move.enable = true;
        pJS.interactivity.events.onhover.enable = true;
        pJS.interactivity.events.onclick.enable = true;
        pJS.fn.vendors.draw();
      } else {
        // Freeze animation
        drawBackup = pJS.fn.vendors.draw;
        pJS.fn.vendors.draw = () => {};
        pJS.particles.move.enable = false;
        pJS.interactivity.events.onhover.enable = false;
        pJS.interactivity.events.onclick.enable = false;
      }
    }
  };

  // Full cleanup for SPA navigation
  window.destroyParticles = function() {
    if (window.pJSDom instanceof Array) {
      window.pJSDom.forEach(instance => {
        instance.pJS.fn.vendors.destroypJS();
      });
      window.pJSDom = [];
    }
    particlesInitialized = false;
    drawBackup = null;
  };

  // Initial load
  initParticles(true);
})();