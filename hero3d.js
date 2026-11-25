// =============================================
//  3D HERO — floating website screens (Three.js)
//  Falls back to the flat CSS showcase when WebGL is
//  unavailable or the visitor prefers reduced motion.
// =============================================
(function () {
  var host = document.querySelector('.showcase');
  if (!host || typeof THREE === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Add or reorder screens here. `img` is the page screenshot.
  var SCREENS = [
    { img: 'images/hans1.webp',  url: 'hansdemolition',     x: -1.15, y:  1.0,  z: -0.7, ry:  0.34, rz: -0.05 },
    { img: 'images/the-cool-guys-hvac-heating-cooling-vancouver.webp', url: 'thecoolguyshvac', x: 1.5, y: 0.1, z: 0.1, ry: -0.3, rz: 0.04 },
    { img: 'images/timberwolf-flooring-surrey-langley-bc.webp', url: 'timberwolfflooring', x: -0.8, y: -1.35, z: 0.9, ry: 0.18, rz: -0.02 }
  ];

  var SW = 3.2, SH = 2.1; // screen size in scene units

  var canvas = document.createElement('canvas');
  canvas.className = 'hero3d-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) {
    return; // no WebGL: keep the flat showcase
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  host.insertBefore(canvas, host.firstChild);
  host.classList.add('is-3d');

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  var group = new THREE.Group();
  scene.add(group);

  // ---------- browser-window texture ----------
  function makeTexture(urlLabel, image) {
    var c = document.createElement('canvas');
    c.width = 1280; c.height = 840;
    var x = c.getContext('2d');
    var BAR = 56;

    function draw(img) {
      x.fillStyle = '#1a1612';
      x.fillRect(0, 0, c.width, c.height);
      if (img) {
        // cover, anchored to the top of the screenshot
        var s = Math.max(c.width / img.width, (c.height - BAR) / img.height);
        x.drawImage(img, 0, BAR, img.width * s, img.height * s);
      }
      x.fillStyle = '#1f1a15';
      x.fillRect(0, 0, c.width, BAR);
      ['#ff5f57', '#febc2e', '#28c840'].forEach(function (col, i) {
        x.fillStyle = col;
        x.beginPath(); x.arc(34 + i * 30, BAR / 2, 9, 0, Math.PI * 2); x.fill();
      });
      x.fillStyle = '#2e2822';
      x.beginPath();
      x.roundRect ? x.roundRect(170, 12, 420, 32, 16) : x.rect(170, 12, 420, 32);
      x.fill();
      x.fillStyle = 'rgba(247,243,236,0.55)';
      x.font = '500 20px sans-serif';
      x.textBaseline = 'middle';
      x.fillText(urlLabel, 196, BAR / 2 + 1);
    }

    draw(null);
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    var img = new Image();
    img.onload = function () { draw(img); tex.needsUpdate = true; };
    img.src = image;
    return tex;
  }

  var screens = SCREENS.map(function (d, i) {
    var g = new THREE.Group();
    var edge = new THREE.Mesh(
      new THREE.PlaneGeometry(SW + 0.07, SH + 0.07),
      new THREE.MeshBasicMaterial({ color: 0xD4B073, transparent: true, opacity: 0.55 })
    );
    edge.position.z = -0.015;
    var face = new THREE.Mesh(
      new THREE.PlaneGeometry(SW, SH),
      new THREE.MeshBasicMaterial({ map: makeTexture(d.url, d.img) })
    );
    g.add(edge, face);
    g.position.set(d.x, d.y, d.z);
    g.rotation.set(0, d.ry, d.rz);
    g.userData = { base: new THREE.Vector3(d.x, d.y, d.z), ry: d.ry, ph: i * 2.1, lift: 0, face: face };
    group.add(g);
    return g;
  });

  // ---------- gold dust ----------
  var COUNT = 120, pos = new Float32Array(COUNT * 3);
  for (var i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 14;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
  }
  var pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var dust = new THREE.Points(pg, new THREE.PointsMaterial({
    color: 0xD4B073, size: 0.045, transparent: true, opacity: 0.65, depthWrite: false
  }));
  scene.add(dust);

  // ---------- sizing ----------
  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the whole cluster in frame at any aspect ratio
    var fit = 7.4 / (2 * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect);
    camera.position.set(0, 0, Math.max(9.5, fit));
    camera.updateProjectionMatrix();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
  window.addEventListener('resize', resize);
  resize();

  // ---------- interaction ----------
  var mx = 0, my = 0, tx = 0, ty = 0, hovered = null;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();

  function onMove(e) {
    var r = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    mx = ndc.x; my = -ndc.y;
    ray.setFromCamera(ndc, camera);
    var hit = ray.intersectObjects(screens.map(function (s) { return s.userData.face; }))[0];
    hovered = hit ? hit.object.parent : null;
  }
  function onLeave() { mx = 0; my = 0; hovered = null; }
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerleave', onLeave);

  // ---------- loop (paused when off-screen / tab hidden) ----------
  var visible = true, raf = 0, clock = new THREE.Clock();

  function frame() {
    raf = 0;
    if (!visible || document.hidden) return;
    var t = clock.getElapsedTime();

    // touch devices have no cursor: sway on a timer instead
    var gx = fine ? mx : Math.sin(t * 0.5) * 0.6;
    var gy = fine ? my : Math.cos(t * 0.4) * 0.25;
    tx += (gx - tx) * 0.06;
    ty += (gy - ty) * 0.06;

    group.rotation.y = tx * 0.45 + Math.sin(t * 0.25) * 0.06;
    group.rotation.x = ty * 0.22;

    screens.forEach(function (g) {
      var u = g.userData;
      var target = g === hovered ? 1 : 0;
      u.lift += (target - u.lift) * 0.12;
      g.position.set(
        u.base.x + tx * 0.25 * (u.base.z + 1.2),
        u.base.y + Math.sin(t * 0.9 + u.ph) * 0.09,
        u.base.z + u.lift * 0.6
      );
      g.rotation.y = u.ry * (1 - u.lift * 0.6) + Math.sin(t * 0.5 + u.ph) * 0.03;
      var s = 1 + u.lift * 0.05;
      g.scale.set(s, s, 1);
    });

    dust.rotation.y = t * 0.02 + tx * 0.1;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf) raf = requestAnimationFrame(frame); }

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
    }, { threshold: 0.05 }).observe(host);
  }
  document.addEventListener('visibilitychange', start);
  start();
})();
