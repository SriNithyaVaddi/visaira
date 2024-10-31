// Mobile-optimized version of the tunnel animation script
// Not a full script. Probable script
// Load necessary scripts
function loadScriptsSequentially(scripts, callback) {
    if (scripts.length === 0) {
      callback();
      return;
    }
    const script = document.createElement('script');
    script.src = scripts[0];
    script.onload = () => loadScriptsSequentially(scripts.slice(1), callback);
    document.head.appendChild(script);
  }
  
  loadScriptsSequentially([
    'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/js/loaders/GLTFLoader.js',
    'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/js/loaders/DRACOLoader.js',
    'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/js/loaders/FontLoader.js',
    'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/js/geometries/TextGeometry.js'
  ], initializeLoadingScreen);
  
  function gradientColors() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) { // Morning: Warm Tones
      return {
        color1: '#E0AC69', // Saffron Gold
        color2: '#FFC107', // Amber
        fontColor: '#FF8C00', // Dark Orange
        buttonColor: '#FFB347', // Saffron Gold
        buttonTextColor: '#FFFFFF' // White
      };
    } else if (hour >= 12 && hour < 18) { // Afternoon: Gradient Set 1
      return {
        color1: '#1F004B', // Phlox
        color2: '#54EFEA', // Fluorescent Cyan
        fontColor: '#600DB5', // Grape
        buttonColor: '#54EFEA', // Fluorescent Cyan
        buttonTextColor: '#FFFFFF' // White
      };
    } else { // Evening/Night: Cool Tones
      return {
        color1: '#1F004B', // Russian Violet
        color2: '#54EFEA', // Fluorescent Cyan
        fontColor: '#51CCDC', // Robin Egg Blue
        buttonColor: '#1F004B', // Russian Violet
        buttonTextColor: '#FFFFFF' // White
      };
    }
  }
  
  function initializeLoadingScreen() {
    const loadingScene = new THREE.Scene();
    const loadingCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    loadingCamera.position.set(0, 0, 10);
  
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);
  
    const colors = gradientColors();
    const gradientMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color(colors.color1) },
        color2: { value: new THREE.Color(colors.color2) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        void main() {
          gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    const gradientMesh = new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 32), gradientMaterial);
    loadingScene.add(gradientMesh);
  
    const circleGeometry = new THREE.CircleGeometry(1.5, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const loadingCircle = new THREE.Mesh(circleGeometry, circleMaterial);
    loadingScene.add(loadingCircle);
  
    function animateLoadingScreen() {
      requestAnimationFrame(animateLoadingScreen);
      renderer.render(loadingScene, loadingCamera);
    }
    animateLoadingScreen();
  
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
  
    let holdTimeout;
    function handleTouchStart() {
      holdTimeout = setTimeout(() => {
        document.body.removeChild(renderer.domElement);
        initializeScene();
      }, 2000);
    }
  
    function handleTouchEnd() {
      clearTimeout(holdTimeout);
    }
  }
  
  function initializeScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 1.5, 0);
  
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);
  
    const gradientMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color('#1F004B') },
        color2: { value: new THREE.Color('#54EFEA') }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        void main() {
          gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    const gradientMesh = new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 32), gradientMaterial);
    scene.add(gradientMesh);
  
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
  
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
  
    const loader = new THREE.GLTFLoader();
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);
  
    loader.load(
      './scene.gltf',
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        model.rotation.y = Math.PI / 2;
        model.scale.set(2, 2, 2);
        scene.add(model);
        animate();
      },
      undefined,
      (error) => {
        console.error('An error occurred while loading the GLTF model:', error);
      }
    );
  
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
  
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (event) => {
        const rotationX = event.beta / 90;
        const rotationY = event.gamma / 90;
        gsap.to(camera.rotation, {
          x: rotationX,
          y: rotationY,
          duration: 0.5,
          ease: 'power2.out'
        });
      });
    }
  
    // Swipe up and down for scroll functionality
    let startY;
    window.addEventListener('touchstart', (event) => {
      startY = event.touches[0].clientY;
    });
  
    window.addEventListener('touchmove', (event) => {
      const currentY = event.touches[0].clientY;
      const deltaY = startY - currentY;
      
      if (Math.abs(deltaY) > 20) {
        if (deltaY > 0) {
          // Swipe up
          camera.position.y -= 0.1;
        } else {
          // Swipe down
          camera.position.y += 0.1;
        }
        startY = currentY;
      }
    });
  }
  
  // Particle system integration
  const particleScript = document.createElement('script');
  particleScript.src = './particle.js';
  particleScript.onload = () => {
    console.log('Particle script loaded. Ready to start particle system.');
  };
  document.head.appendChild(particleScript);
  
  window.startParticles = function() {
    if (typeof window.initializeParticles === 'function') {
      window.initializeParticles();
    } else {
      console.error('Particle system not initialized. Make sure particle.js is loaded correctly.');
    }
  };
  
  window.stopParticles = function() {
    console.log('Stopping particle system...');
    cancelAnimationFrame(window.particleAnimationFrame);
    const particleCanvas = document.getElementById('particleCanvas');
    if (particleCanvas) {
      particleCanvas.remove();
    }
  };
  