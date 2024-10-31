// particle.js

window.startParticles = function() {
    console.log('Starting particle system...');
  
    // Create a canvas for particles
    const particleCanvas = document.createElement('canvas');
    particleCanvas.id = 'particleCanvas';
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
    particleCanvas.style.position = 'absolute';
    particleCanvas.style.top = '0';
    particleCanvas.style.left = '0';
    particleCanvas.style.pointerEvents = 'none';
    document.body.appendChild(particleCanvas);
  
    const ctx = particleCanvas.getContext('2d');
    const particles = [];
    const particleCount = 100;
    const effect = new Effect(ctx, particleCanvas.width, particleCanvas.height);
  
    effect.wrapText('Visaira');
  
    function animateParticles() {
      ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      effect.render();
      window.particleAnimationFrame = requestAnimationFrame(animateParticles);
    }
  
    animateParticles();
  
    // Mouse event listener to push particles away
    window.addEventListener('mousemove', (e) => {
      effect.mouse.x = e.x;
      effect.mouse.y = e.y;
    });
  
    // Scroll event listener to gradually fade out the particle animation when moving back
    window.addEventListener('wheel', (event) => {
      if (event.deltaY > 0) {
        // Gradually fade out particles as the user scrolls back
        gsap.to(particleCanvas, {
          opacity: 0,
          duration: 2,
          onComplete: () => {
            window.stopParticles();
          }
        });
      }
    });
  };
  
  window.stopParticles = function() {
    console.log('Stopping particle system...');
    cancelAnimationFrame(window.particleAnimationFrame);
    const particleCanvas = document.getElementById('particleCanvas');
    if (particleCanvas) {
      particleCanvas.remove();
    }
  };
  
  class Particle {
    constructor(effect, x, y, color) {
      this.effect = effect;
      this.x = x;
      this.y = y;
      this.color = color;
      this.originX = x;
      this.originY = y;
      this.size = this.effect.gap / 2;
      this.friction = Math.random() * 0.6 + 0.15;
      this.ease = Math.random() * 0.1 + 0.05;
    }
    draw() {
      this.effect.context.globalCompositeOperation = 'lighter';

      this.effect.context.fillStyle = this.color;
      this.effect.context.shadowColor = this.color;
      //this.effect.context.shadowBlur = 100;
      this.effect.context.beginPath();
      this.effect.context.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
      this.effect.context.fill();
    }
    update() {
      const dx = this.effect.mouse.x - this.x;
      const dy = this.effect.mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const force = -this.effect.mouse.radius / (distance || 1);
  
      if (distance < this.effect.mouse.radius) {
        const angle = Math.atan2(dy, dx);
        this.x += force * Math.cos(angle);
        this.y += force * Math.sin(angle);
      }
  
      this.x += (this.originX - this.x) * this.ease;
      this.y += (this.originY - this.y) * this.ease;
    }
  }
  
  class Effect {
    constructor(context, canvasWidth, canvasHeight) {
      this.context = context;
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.textX = this.canvasWidth / 2;
      this.textY = this.canvasHeight / 2;
      this.fontSize = 150;
      this.particles = [];
      this.gap = 5;
      this.mouse = {
        radius: 200,
        x: 0,
        y: 0,
      };
    }
    wrapText(text) {
      const gradient = this.context.createLinearGradient(this.textX, this.textY - this.fontSize / 2, this.textX, this.textY + this.fontSize / 2);
      gradient.addColorStop(0, '#498099');
      gradient.addColorStop(0.5, '#FD8083');
      gradient.addColorStop(1, '#ee22f3');
      this.context.fillStyle = gradient;
      this.context.textAlign = 'center';
      this.context.textBaseline = 'middle';
      this.context.lineWidth = 3;
      this.context.strokeStyle = '#30c0b7';
      this.context.font = this.fontSize + 'px ProBono BC';
      this.context.fillText(text, this.textX, this.textY);
      this.context.strokeText(text, this.textX, this.textY);
      this.convertToParticles();
    }
    convertToParticles() {
      const pixels = this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight).data;
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      for (let y = 0; y < this.canvasHeight; y += this.gap) {
        for (let x = 0; x < this.canvasWidth; x += this.gap) {
          const index = (y * this.canvasWidth + x) * 4;
          const alpha = pixels[index + 3];
          if (alpha > 150) {
            const color = `rgb(${pixels[index]}, ${pixels[index + 1]}, ${pixels[index + 2]})`;
            this.particles.push(new Particle(this, x, y, color));
          }
        }
      }
    }
    render() {
      this.particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
    }
  }
  