import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas = document.querySelector('[data-nv-logo-three]');
if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
try {
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 7.8);

  const group = new THREE.Group();
  group.rotation.x = -0.08;
  group.rotation.y = 0.12;
  scene.add(group);

  const coralShape = new THREE.Shape();
  coralShape.moveTo(90,385);
  coralShape.lineTo(90,210);
  coralShape.bezierCurveTo(90,107,169,54,247,54);
  coralShape.bezierCurveTo(310,54,346,82,346,124);
  coralShape.bezierCurveTo(259,136,220,184,220,255);
  coralShape.lineTo(220,292);
  coralShape.bezierCurveTo(220,342,169,369,90,385);

  const plumShape = new THREE.Shape();
  plumShape.moveTo(221,194);
  plumShape.bezierCurveTo(296,201,338,267,355,338);
  plumShape.bezierCurveTo(369,283,363,246,332,215);
  plumShape.bezierCurveTo(315,197,325,175,348,154);
  plumShape.bezierCurveTo(382,122,387,78,413,46);
  plumShape.bezierCurveTo(447,6,486,-15,540,-15);
  plumShape.lineTo(540,249);
  plumShape.bezierCurveTo(540,340,493,402,411,402);
  plumShape.bezierCurveTo(300,402,231,318,221,194);

  const extrude = {depth:60, bevelEnabled:true, bevelSegments:4, steps:1, bevelSize:5, bevelThickness:5, curveSegments:28};
  const coralGeo = new THREE.ExtrudeGeometry(coralShape, extrude);
  const plumGeo = new THREE.ExtrudeGeometry(plumShape, extrude);

  const coralMat = new THREE.MeshPhysicalMaterial({
    color:0xe87762, roughness:0.26, metalness:0.14, clearcoat:0.7, clearcoatRoughness:0.2
  });
  const plumMat = new THREE.MeshPhysicalMaterial({
    color:0x35243f, roughness:0.25, metalness:0.20, clearcoat:0.72, clearcoatRoughness:0.18
  });

  const coral = new THREE.Mesh(coralGeo, coralMat);
  const plum = new THREE.Mesh(plumGeo, plumMat);
  coral.position.z = -2;
  plum.position.z = 1;
  group.add(coral, plum);

  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(39, 48, 32),
    new THREE.MeshPhysicalMaterial({color:0xf08a72, roughness:0.2, metalness:0.08, clearcoat:0.85, clearcoatRoughness:0.16})
  );
  nucleus.position.set(374,162,44);
  group.add(nucleus);

  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  const modelScale = 0.0094;
  // Center the geometry before animating so it turns around its own center.
  coralGeo.translate(-center.x, -center.y, -center.z);
  plumGeo.translate(-center.x, -center.y, -center.z);
  nucleus.position.sub(center);
  group.scale.set(modelScale,-modelScale,modelScale);
  group.position.set(0, 0, 0);
  const baseY = group.position.y;

  scene.add(new THREE.HemisphereLight(0xffeee8,0x211126,2.2));
  const key = new THREE.DirectionalLight(0xffd6c8,4.2);
  key.position.set(-3,4,6);
  scene.add(key);
  const rim = new THREE.PointLight(0xa46f9a,5.5,14);
  rim.position.set(4,-1,5);
  scene.add(rim);

  let tx=0, ty=0, rx=0, ry=0;
  const brand = canvas.closest('.nv-brand-3d');
  brand?.addEventListener('pointermove', e=>{
    const r=brand.getBoundingClientRect();
    tx=((e.clientX-r.left)/r.width-.5);
    ty=((e.clientY-r.top)/r.height-.5);
  }, {passive:true});
  brand?.addEventListener('pointerleave', ()=>{tx=0;ty=0;}, {passive:true});

  const resize=()=>{
    const r=canvas.getBoundingClientRect();
    const w=Math.max(1,r.width), h=Math.max(1,r.height);
    renderer.setSize(w,h,false);
    camera.aspect=w/h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize',resize,{passive:true});

  const clock=new THREE.Clock();
  const loop=()=>{
    const t=clock.getElapsedTime();
    rx += ((-ty*.16)-rx)*.06;
    ry += ((tx*.20)-ry)*.06;
    group.rotation.x = -0.08 + rx + Math.sin(t*.9)*0.13;
    group.rotation.y = 0.24 + ry + Math.sin(t*.85)*0.40;
    group.position.y = baseY + Math.sin(t*.8)*0.025;
    renderer.render(scene,camera);
    requestAnimationFrame(loop);
  };
  renderer.render(scene,camera);
  canvas.closest('.nv-brand-icon3d')?.classList.add('is-three-ready');
  loop();
} catch (error) {
  console.warn('Núcleo Vivo 3D logo fallback active.', error);
}
}
