// tunnel.js as the main landing page script

// Load GLTFLoader, DRACOLoader, FontLoader, and TextGeometry scripts
const gltfLoaderScript = document.createElement('script');
gltfLoaderScript.src = 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/js/loaders/GLTFLoader.js';
gltfLoaderScript.onload = () => {
  console.log('GLTFLoader loaded.');
  loadDracoLoader();
};
document.head.appendChild(gltfLoaderScript);

function loadDracoLoader() {
  const dracoLoaderScript = document.createElement('script');
  dracoLoaderScript.src = 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/js/loaders/DRACOLoader.js';
  dracoLoaderScript.onload = () => {
    console.log('DRACOLoader loaded. Loading FontLoader and TextGeometry...');
    loadFontAndTextGeometry();
  };
  document.head.appendChild(dracoLoaderScript);
 
}
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

function loadFontAndTextGeometry() {
  const fontLoaderScript = document.createElement('script');
  fontLoaderScript.src = 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/js/loaders/FontLoader.js';
  fontLoaderScript.onload = () => {
    const textGeometryScript = document.createElement('script');
    textGeometryScript.src = 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/js/geometries/TextGeometry.js';
    textGeometryScript.onload = () => {
      console.log('FontLoader and TextGeometry loaded. Initializing scene...');
      initializeLoadingScreen();
    };
    document.head.appendChild(textGeometryScript);
  };
  document.head.appendChild(fontLoaderScript);
}
// Loading scene:

function initializeLoadingScreen() {
  // Set up the loading screen scene, camera, and renderer
  const loadingScene = new THREE.Scene();
  const loadingCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  loadingCamera.position.set(0, 0, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);
  
  // Create gradient background for loading screen
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
  gradientMesh.position.set(0, 0, 0);
  loadingScene.add(gradientMesh);

  // Create loading screen circle
  const circleGeometry = new THREE.CircleGeometry(1.5, 32);
  const circleMaterial = new THREE.MeshBasicMaterial({ color: 'FFB347' });
  const loadingCircle = new THREE.Mesh(circleGeometry, circleMaterial);
  loadingScene.add(loadingCircle);

  // Add text to loading screen
  let textMesh;
  const loaderText = new THREE.FontLoader();
  loaderText.load('Courier Prime_Regular.json', (font) => {
    const textGeometry = new THREE.TextGeometry('Start', {
      font: font,
      size: 0.4,
      height: 0.1,
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xEC00F0 });
    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-0.9, -0.2, 0.1);
    loadingScene.add(textMesh);
  });

  // Render the loading screen
  function animateLoadingScreen() {
    requestAnimationFrame(animateLoadingScreen);
    renderer.render(loadingScene, loadingCamera);
  }
  animateLoadingScreen();

  // Gyroscope effect for loading screen
  document.addEventListener('mousemove', (event) => {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // Use GSAP to smoothly animate the camera rotation based on mouse movement
    gsap.to(loadingCamera.rotation, {
      x: THREE.MathUtils.degToRad(mouseY * 10),
      y: THREE.MathUtils.degToRad(mouseX * 10),
      duration: 0.5,
      ease: 'power2.out'
    });
  });

  // Click and hold to enter logic
  let holdTimeout;
  renderer.domElement.addEventListener('mousedown', () => {
    holdTimeout = setTimeout(() => {
      document.body.removeChild(renderer.domElement);
      initializeScene();
    }, 2); // User needs to hold click for 2 seconds to enter
  });

  renderer.domElement.addEventListener('mouseup', () => {
    clearTimeout(holdTimeout); // Cancel entering if user releases mouse before 2 seconds
  });

  // Display instruction to click to interact and scroll to display
  setTimeout(() => {
    const interactionInstruction = document.createElement('div');
    interactionInstruction.innerText = 'Click to interact and scroll to display';
    interactionInstruction.style.position = 'fixed';
    interactionInstruction.style.top = '70%';
    interactionInstruction.style.left = '50%';
    interactionInstruction.style.transform = 'translate(-50%, -50%)';
    interactionInstruction.style.fontSize = '20px';
    interactionInstruction.style.color = '#ffffff';
    interactionInstruction.style.zIndex = '1000';
    interactionInstruction.style.opacity = '1';
    document.body.appendChild(interactionInstruction);

    setTimeout(() => {
      interactionInstruction.style.transition = 'opacity 2s';
      interactionInstruction.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(interactionInstruction);
      }, 2000);
    }, 2000);
  }, 4000);
}

function initializeScene() {
  // Set up the scene, camera, and renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 1.5, 0);  // Starting at initial position
  const colors = gradientColors();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  // Set up gradient background
  const gradient = new THREE.Scene();
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
  gradient.add(gradientMesh);
  scene.add(gradientMesh);

  // Resize listener to adjust renderer and camera aspect ratio
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Add lights to the scene
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  // Load the GLTF model (tunnel)
  const loader = new THREE.GLTFLoader();
  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    './scene.gltf',
    (gltf) => {
      console.log('GLTF model loaded.');
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      model.rotation.y = Math.PI / 2;
      model.scale.set(2, 2, 2);
      scene.add(model);

      // Render the scene
      function animate() {
        requestAnimationFrame(animate);
        updateLighting();
        renderer.render(scene, camera);
      }
      animate();
      function updateLighting() {
        const now = new Date();
        const hours = now.getHours();

        // Define warm and cool colors from the sets
        let warmColors = [
          new THREE.Color(0xE0AC69), // Saffronish tone
          new THREE.Color(0xFF8C00)  // Warm orange
        ];
        let coolColors = [
          new THREE.Color(0x1F004B), // Russian Violet
          new THREE.Color(0x600DB5)  // Grape
        ];

        let blendFactor = 0;
        let currentColor;

        // Determine the blend factor based on the time of day
        if (hours >= 6 && hours < 11) {
          // Morning - blend between warm colors (saffronish)
          blendFactor = (hours - 6) / 5;
          currentColor = new THREE.Color().lerpColors(warmColors[0], warmColors[1], blendFactor);
        } else if (hours >= 11 && hours < 16) {
          // Midday - neutral warm tone
          currentColor = warmColors[1];
        } else if (hours >= 16 && hours < 20) {
          // Evening - blend between warm and cool (transition phase)
          blendFactor = (hours - 16) / 4;
          currentColor = new THREE.Color().lerpColors(warmColors[1], coolColors[1], blendFactor);
          //currentColor = new THREE.Color().lerpColors(warmColors[1], coolColors[1], blendFactor);
        } else {
          // Night - blend between cool colors (grape and Russian Violet)
          blendFactor = (hours >= 20) ? (hours - 20) / 4 : (hours + 4) / 4; // From 8 PM to midnight and early morning
          currentColor = new THREE.Color().lerpColors(coolColors[1], coolColors[0], blendFactor);
        }

        // Set the color to ambient and directional light
        ambientLight.color.set(currentColor);
        directionalLight.color.set(currentColor);
      }
// Track if the animation has already been triggered during this entry
let animationTriggered = false;

renderer.domElement.addEventListener('click', (event) => {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(model, true);

    // Check if inside the tunnel
    if (intersects.length > 0) {
        if (!animationTriggered) {
            console.log('Tunnel clicked, starting particle animation and moving camera forward.');
            moveCameraForward();

            setTimeout(() => {
                window.startParticles();
            }, 1000);

            // Mark animation as triggered for this entry
            animationTriggered = true;
        } else {
            console.log('Already inside the tunnel, animation won’t repeat until exit.');
        }
    } else {
        console.log('Clicked outside the tunnel, resetting animation state.');
        // Reset the flag upon exiting the tunnel
        animationTriggered = false;
    }
});

    

      function moveCameraForward() {
        gsap.to(camera.position, {
          z: camera.position.z - 75, // Move to position where Plane 4 would have been
          duration: 3,
          ease: 'power2.inOut'
        });
      }

      // Scroll event listener to move camera between positions in a loop
      const cameraPositions = [
        { x: 0, y: 1.5, z: 0 },
        { x: 0, y: -50, z: 0 },
        { x: 0, y: -100, z: 0 },
        { x: 0, y: -150, z: 0 }
      ];
      let currentPositionIndex = 0;

      window.addEventListener('wheel', (event) => {
        if (event.deltaY > 0) {
          // Scroll down to move camera to next position
          currentPositionIndex = (currentPositionIndex + 1) % cameraPositions.length;
        } else {
          // Scroll up to move camera to previous position
          currentPositionIndex = (currentPositionIndex - 1 + cameraPositions.length) % cameraPositions.length;
        }
        const targetPosition = cameraPositions[currentPositionIndex];
        gsap.to(camera.position, {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          duration: 2,
          ease: 'power2.inOut',
          onUpdate: () => {
            // Gradually adjust ambient light color
            const blendFactor = currentPositionIndex / (cameraPositions.length - 1);
            ambientLight.color.lerpColors(new THREE.Color('#ffffff'), new THREE.Color('#54EFEA'), blendFactor);
          },
          onComplete: () => {
            if (currentPositionIndex === 3) {
              showContactForm();
            } else {
              // Remove contact form if not at position 3
              const existingForm = document.getElementById('contact-form');
              if (existingForm) {
                existingForm.parentElement.removeChild(existingForm);
              }
            }
          }
        });
      });

      // Function to display the contact form at the position of supposed Plane 4
      function showContactForm() {
        console.log('Showing contact form...');
        const contactForm = document.createElement('div');
        contactForm.innerHTML = `
          <div id="contact-form" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 8px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.3); z-index: 1000; visibility: visible;">
            <h2>Contact Us</h2>
            <p>We’d love to hear from you! For any questions, feedback, or inquiries about Visaira, please reach out via email at <a href="mailto:adminvisai@visaira.com">adminvisai@visaira.com</a> or use the contact form below. We’ll get back to you as soon as possible because your thoughts and ideas matter to us.</p>
            <form id="contactForm">
              <label for="name">Name</label><br>
              <input type="text" id="name" name="name" required style="width: 100%; margin-bottom: 10px;"><br>
              <label for="email">Email Address</label><br>
              <input type="email" id="email" name="email" required style="width: 100%; margin-bottom: 10px;"><br>
              <label for="message">Message</label><br>
              <textarea id="message" name="message" required style="width: 100%; height: 100px; margin-bottom: 10px;"></textarea><br>
              <label for="phone">Phone Number</label><br>
              <input type="tel" id="phone" name="phone" style="width: 100%; margin-bottom: 10px;"><br>
              <button type="submit" style="padding: 10px 20px; background-color: #EC00F0; color: white; border: none; cursor: pointer;">Submit</button>
            </form>
          </div>
        `;
        document.body.appendChild(contactForm);
    
        // Add form submission handler
        document.getElementById("contactForm").addEventListener("submit", async function(event) {
            event.preventDefault(); // Prevent default form submission
            
            // Capture form data
            const formData = {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                message: document.getElementById("message").value,
                phone: document.getElementById("phone").value
            };
    
            // Send data to the backend
            try {
                const response = await fetch("/api/contact", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                });
    
                if (response.ok) {
                    console.log("Form submitted successfully");
                    alert("Thank you for your message!");
                    document.body.removeChild(contactForm); // Close the form
                } else {
                    console.error("Form submission failed");
                    alert("There was a problem submitting the form. Please try again.");
                }
            } catch (error) {
                console.error("Network error:", error);
                alert("Network error. Please try again later.");
            }
        });
    }
    
      // Add gyroscope effect using mouse movement for immersive experience using GSAP
      document.addEventListener('mousemove', (event) => {
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

        // Use GSAP to smoothly animate the camera rotation based on mouse movement
        gsap.to(camera.rotation, {
          x: THREE.MathUtils.degToRad(mouseY * 10),
          y: THREE.MathUtils.degToRad(mouseX * 10),
          duration: 0.5,
          ease: 'power2.out'
        });
      });

      // Shake camera function for added effect
      function shakeCamera() {
        const shakeTimeline = gsap.timeline();
        shakeTimeline
          .to(camera.position, { x: '+=0.1', y: '+=0.1', duration: 0.05, ease: 'power2.inOut' })
          .to(camera.position, { x: '-=0.2', y: '-=0.2', duration: 0.1, ease: 'power2.inOut' })
          .to(camera.position, { x: '+=0.1', y: '+=0.1', duration: 0.05, ease: 'power2.inOut' });
      }
    },
    undefined,
    (error) => {
      console.error('An error occurred while loading the GLTF model:', error);
    }
  );

  // Create planes at camera positions 2 and 3 with movie script-like content
  const loaderText = new THREE.FontLoader();
  const planeContents = [
    {
        title: "EXT. INTERNET - :/",
        act: "ACT I",
        description: "Visaira: What’s the deal?\nVisaira is your AI-powered scriptwriting sidekick! \nIt’s here to help content creators like you bring stories to life, \nguiding every twist and turn from script to screen.\nPlus, your scripts are safe and sound—no peeking allowed!"
    },

    {
      title: "INT. OFFICE - :/",
      act: "ACT II",
      description: "Narrator: Who are we?\nWe’re a crew of creatives and tech wizards,\non a mission to supercharge storytellers everywhere. \nThink of us as your backstage crew—quiet, but making magic happen!"
  }
  
  ];

  planeContents.forEach((content, index) => {
    const planeGeometry = new THREE.PlaneGeometry(10, 5);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.2,
      map: new THREE.TextureLoader().load('plane-bg2.png') // Canvas-like texture
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, -50 * (index + 1), -5); // Position each plane at different locations along the negative y-axis with slight z offset
    scene.add(plane);

    // Add text to each plane with typing animation style and blinking cursor
    loaderText.load('Courier Prime_Regular.json', (font) => {
      const fullText = `${content.title}\n${content.act}\n${content.description}`;
      let currentText = '';
      let charIndex = 0;
      const cursorBlinkInterval = 500;

      function typeText() {
        if (charIndex < fullText.length) {
          currentText += fullText.charAt(charIndex);
          charIndex++;

          // Remove old text mesh if it exists
          if (plane.userData.textMesh) {
            plane.remove(plane.userData.textMesh);
          }

          // Create new text mesh with the current typed content
          const textGeometry = new THREE.TextGeometry(currentText + '_', {
            font: font,
            size: 0.25,
            height: 0.05,
            curveSegments: 12,
          });
          const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);
          textMesh.position.set(-4.5, 1, 0.1); // Adjust position to align with the plane
          plane.add(textMesh);

          plane.userData.textMesh = textMesh;

          // Set a slight delay for typing effect
          setTimeout(typeText, 50);
        } else {
          // Blinking cursor effect
          setInterval(() => {
            if (plane.userData.textMesh) {
              const cursorChar = currentText.endsWith('_') ? '' : '_';
              const textGeometry = new THREE.TextGeometry(currentText + cursorChar, {
                font: font,
                size: 0.25,
                height: 0.05,
                curveSegments: 12,
              });
              plane.userData.textMesh.geometry.dispose();
              plane.userData.textMesh.geometry = textGeometry;
            }
          }, cursorBlinkInterval);
        }
      }
      typeText();
    });
  });
}

// Particle system integration - call






// Particle system integration - call external script particle.js
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
