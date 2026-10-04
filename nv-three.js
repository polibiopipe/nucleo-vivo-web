
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const host = document.querySelector('[data-nv-three]');
if (host && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 7.2);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  const group = new THREE.Group();
  group.position.set(1.95, -0.05, 0);
  scene.add(group);

  const coreGeometry = new THREE.IcosahedronGeometry(1.32, 5);
  const positions = coreGeometry.attributes.position;
  const pos = positions.array;
  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i], y = pos[i + 1], z = pos[i + 2];
    const n = 1 + 0.12 * Math.sin(x * 4.5 + y * 2.1) + 0.07 * Math.cos(z * 6.2);
    pos[i] *= n; pos[i + 1] *= n; pos[i + 2] *= n;
  }
  positions.needsUpdate = true;
  coreGeometry.computeVertexNormals();

  const core = new THREE.Mesh(
    coreGeometry,
    new THREE.MeshPhysicalMaterial({
      color: 0x6d3b78,
      roughness: 0.34,
      metalness: 0.08,
      transparent: true,
      opacity: 0.42,
      transmission: 0.08,
      clearcoat: 0.55,
      clearcoatRoughness: 0.5
    })
  );
  group.add(core);

  const wire = new THREE.Mesh(
    coreGeometry,
    new THREE.MeshBasicMaterial({ color: 0xd5b9da, wireframe: true, transparent: true, opacity: 0.12 })
  );
  wire.scale.setScalar(1.012);
  group.add(wire);

  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xf0dfe8, transparent: true, opacity: 0.19 });
  const rings = [
    new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.013, 8, 180), ringMaterial),
    new THREE.Mesh(new THREE.TorusGeometry(2.18, 0.009, 8, 180), ringMaterial.clone()),
    new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.007, 8, 180), ringMaterial.clone())
  ];
  rings[0].rotation.set(1.2, 0.2, 0.4);
  rings[1].rotation.set(0.35, 1.05, -0.2);
  rings[2].rotation.set(0.7, -0.55, 0.8);
  rings[1].material.opacity = 0.12;
  rings[2].material.opacity = 0.07;
  rings.forEach(r => group.add(r));

  const count = window.innerWidth < 700 ? 380 : 760;
  const particlesGeo = new THREE.BufferGeometry();
  const particlesPos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const radius = 1.7 + Math.random() * 2.8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    particlesPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    particlesPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    particlesPos[i * 3 + 2] = radius * Math.cos(phi);
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlesPos, 3));
  const particles = new THREE.Points(
    particlesGeo,
    new THREE.PointsMaterial({ color: 0xf5eef6, size: 0.018, transparent: true, opacity: 0.42, depthWrite: false })
  );
  group.add(particles);

  scene.add(new THREE.AmbientLight(0xffffff, 1.4));
  const lightA = new THREE.DirectionalLight(0xffdfec, 3.2);
  lightA.position.set(4, 3, 5);
  scene.add(lightA);
  const lightB = new THREE.PointLight(0x825090, 7.5, 12);
  lightB.position.set(-3, -2, 3);
  scene.add(lightB);

  let pointerX = 0, pointerY = 0, scrollY = 0;
  const onPointer = (e) => {
    pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  const onScroll = () => { scrollY = window.scrollY || 0; };
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  const resize = () => {
    const rect = host.getBoundingClientRect();
    const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    group.position.x = w < 760 ? 1.15 : 1.95;
    group.scale.setScalar(w < 760 ? 0.72 : 1);
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const clock = new THREE.Clock();
  let raf;
  const animate = () => {
    const t = clock.getElapsedTime();
    core.rotation.x = t * 0.11 + pointerY * 0.07;
    core.rotation.y = t * 0.15 + pointerX * 0.10;
    wire.rotation.copy(core.rotation);
    particles.rotation.y = -t * 0.018;
    particles.rotation.x = t * 0.009;
    rings[0].rotation.z = t * 0.08;
    rings[1].rotation.x = 0.35 - t * 0.04;
    rings[2].rotation.y = -0.55 + t * 0.025;
    group.position.y = -0.05 + Math.sin(t * 0.65) * 0.055 - Math.min(scrollY, 700) * 0.00008;
    group.rotation.z += ((pointerX * 0.025) - group.rotation.z) * 0.025;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  };
  animate();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else animate();
  });
}
