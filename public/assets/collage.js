/* Collage de cartes déplaçables — repris de michaeledmundbrewer.com (modificateur « Drag » Readymag).
   Coordonnées d'origine sur une page de 1024 × 640, converties en % de la carte. */
(function () {
  var BASE_W = 1024, BASE_H = 640;
  var DECALAGE_Y = 54; // la page Readymag est centrée verticalement : 76 px à 1440 × 900
  var CARTES = [{"id":"5df39d","x":315.63,"y":163.63,"w":215,"h":275,"a":-13,"z":313,"drag":true,"t":"img","src":"assets/collage/image-aef10c04-b879-4031-9655-8dfb0bb82c23.jpg","r":8,"iw":219.99599999999998,"ih":274.995,"ix":-2.4444,"iy":0.0},{"id":"5df3a3","x":582.76,"y":215.05,"w":164,"h":288,"a":10,"z":312,"drag":true,"t":"video","src":"assets/collage/v-5df3a3.mp4","poster":"assets/collage/v-5df3a3.jpg","r":8},{"id":"5df3a6","x":852.63,"y":211.63,"w":128,"h":159,"a":8,"z":302,"drag":true,"t":"video","src":"assets/collage/v-5df3a6.mp4","poster":"assets/collage/v-5df3a6.jpg","r":8},{"id":"5df3a7","x":98.63,"y":228.63,"w":143,"h":106,"a":22,"z":306,"drag":true,"t":"img","src":"assets/collage/image-45526d55-a8c8-478f-932f-5af6dbbd2b1c.jpg","r":8,"iw":142.99599999999998,"ih":107.247,"ix":0.0,"iy":-0.6128399999999999},{"id":"5df3a8","x":833.63,"y":219.63,"w":77,"h":77,"a":-20,"z":316,"drag":true,"t":"img","src":"assets/collage/image-046f1717-afd0-4d22-bdd8-ff757622ea01.jpg","r":8,"iw":119.1402,"ih":147.8221,"ix":-21.84237,"iy":-37.94836},{"id":"5df3a9","x":169.63,"y":103.63,"w":284,"h":159,"a":-6,"z":308,"drag":true,"t":"video","src":"assets/collage/v-5df3a9.mp4","poster":"assets/collage/v-5df3a9.jpg","r":8},{"id":"5df3aa","x":668.74,"y":282.56,"w":210,"h":141,"a":-9,"z":315,"drag":true,"t":"img","src":"assets/collage/image-49ebb479-19cc-42ca-be3c-66fab022d26c.jpg","r":8,"iw":212.14049999999997,"ih":143.46617999999998,"ix":-1.08537,"iy":0.0},{"id":"5df3ab","x":807.63,"y":266.63,"w":127,"h":225,"a":-7,"z":303,"drag":true,"t":"img","src":"assets/collage/Image-9f7905fb-6d94-4a55-b767-a8f1b494b4da.gif","r":8,"iw":134.0,"ih":238.252,"ix":0.0,"iy":0.0},{"id":"5df3ac","x":71.63,"y":286.63,"w":151,"h":213,"a":-21,"z":304,"drag":true,"t":"img","src":"assets/collage/image-fcca116b-48a4-4d95-9a48-6d5708b6db61.jpg","r":8,"iw":150.99565,"ih":225.26218,"ix":0.0,"iy":-6.091670000000001},{"id":"5df3ad","x":451.78,"y":58.02,"w":181,"h":270,"a":7,"z":305,"drag":true,"t":"img","src":"assets/collage/image-5b845b42-d001-48d8-8f7d-a964003fa94d.jpg","r":8,"iw":182.15507,"ih":276.01178,"ix":-0.95286,"iy":-6.0347800000000005},{"id":"5df3ae","x":220.63,"y":258.63,"w":123,"h":219,"a":8,"z":307,"drag":true,"t":"video","src":"assets/collage/v-5df3ae.mp4","poster":"assets/collage/v-5df3ae.jpg","r":8},{"id":"f30914","x":621.63,"y":92.63,"w":98,"h":175,"a":-9,"z":309,"drag":true,"t":"video","src":"assets/collage/v-f30914.mp4","poster":"assets/collage/v-f30914.jpg","r":8},{"id":"ccf81d","x":891.63,"y":103.63,"w":80,"h":144,"a":0,"z":328,"drag":true,"t":"video","src":"assets/collage/v-ccf81d.mp4","poster":"assets/collage/v-ccf81d.jpg","r":8},{"id":"4aab6f","x":424.63,"y":188.63,"w":192,"h":235,"a":5,"z":329,"drag":true,"t":"img","src":"assets/collage/image-6814c249-a412-4125-9e0d-879af4e6fde0.jpg","r":8,"iw":192.0024,"ih":240.003,"ix":0.0,"iy":-2.48892},{"id":"ed3fb4","x":49.63,"y":84.63,"w":158,"h":157,"a":-15,"z":330,"drag":true,"t":"video","src":"assets/collage/v-ed3fb4.mp4","poster":"assets/collage/v-ed3fb4.jpg","r":8},{"id":"17ed83","x":260.63,"y":379.63,"w":147,"h":133,"a":-4,"z":337,"drag":true,"t":"video","src":"assets/collage/v-17ed83.mp4","poster":"assets/collage/v-17ed83.jpg","r":8},{"id":"edb9f1","x":183.63,"y":234.63,"w":126,"h":126,"a":20,"z":338,"drag":true,"t":"img","src":"assets/collage/image-5ee42bc4-626d-47e9-be94-791d4b102bd7.jpg","r":8,"iw":126.00359999999999,"ih":126.00359999999999,"ix":0.0,"iy":0.0},{"id":"81d250","x":378.36,"y":103.92,"w":101.58,"h":122.39,"a":-4,"z":319,"drag":true,"t":"img","src":"assets/collage/image-d27c2d80-2c23-468b-afd7-94d92190d78d.jpg","r":8,"iw":101.58192,"ih":151.41456,"ix":0.0,"iy":-14.494589999999999},{"id":"a5bd5f","x":715.63,"y":53.63,"w":208,"h":279,"a":7,"z":311,"drag":true,"t":"img","src":"assets/collage/image-31d03839-d9e0-457f-b028-71dfa3790096.jpg","r":8,"iw":223.62624,"ih":279.5328,"ix":-5.532419999999999,"iy":-0.38824},{"id":"87caa4","x":366.63,"y":251.63,"w":97,"h":126,"a":11,"z":324,"drag":true,"t":"video","src":"assets/collage/v-87caa4.mp4","poster":"assets/collage/v-87caa4.jpg","r":8},{"id":"cd0e7f","x":709.02,"y":340.61,"w":179,"h":100,"a":5,"z":310,"drag":true,"t":"video","src":"assets/collage/v-cd0e7f.mp4","poster":"assets/collage/v-cd0e7f.jpg","r":8},{"id":"f0a09a","x":147.63,"y":292.63,"w":78,"h":140,"a":-9,"z":339,"drag":true,"t":"video","src":"assets/collage/v-f0a09a.mp4","poster":"assets/collage/v-f0a09a.jpg","r":8},{"id":"20dfa2","x":535.63,"y":384.63,"w":178,"h":100,"a":-2,"z":326,"drag":true,"t":"video","src":"assets/collage/v-20dfa2.mp4","poster":"assets/collage/v-20dfa2.jpg","r":8},{"id":"6daeb6","x":257.63,"y":200.63,"w":96,"h":96,"a":-13,"z":336,"drag":true,"t":"video","src":"assets/collage/v-6daeb6.mp4","poster":"assets/collage/v-6daeb6.jpg","r":8},{"id":"439f6d","x":580.63,"y":172.63,"w":86,"h":107,"a":11,"z":323,"drag":true,"t":"video","src":"assets/collage/v-439f6d.mp4","poster":"assets/collage/v-439f6d.jpg","r":8},{"id":"a47614","x":423.63,"y":364.63,"w":111,"h":139,"a":7,"z":325,"drag":true,"t":"video","src":"assets/collage/v-a47614.mp4","poster":"assets/collage/v-a47614.jpg","r":8},{"id":"981651","x":307.63,"y":316.63,"w":137,"h":137,"a":-9,"z":344,"drag":true,"t":"video","src":"assets/collage/v-981651.mp4","poster":"assets/collage/v-981651.jpg","r":8},{"id":"c58422","x":38.86,"y":205.26,"w":68,"h":85,"a":-29,"z":318,"drag":true,"t":"img","src":"assets/collage/image-1137c665-4e14-4caf-938b-dad45141ba33.jpg","r":8,"iw":68.2992,"ih":84.99456,"ix":-0.12648,"iy":0.0},{"id":"ed9268","x":704.37,"y":201.68,"w":94,"h":117.49,"a":-25,"z":314,"drag":true,"t":"img","src":"assets/collage/image-f4e45a92-6d22-4d36-8f59-6734ea5835f7.jpg","r":8,"iw":94.00416,"ih":129.62496,"ix":0.0,"iy":-6.0816},{"id":"bb5b91","x":19.41,"y":352.73,"w":77,"h":107.47,"a":-6,"z":301,"drag":true,"t":"video","src":"assets/collage/v-bb5b91.mp4","poster":"assets/collage/v-bb5b91.jpg","r":8},{"id":"f58f29","x":186.95,"y":76.92,"w":89,"h":110.84,"a":0,"z":327,"drag":true,"t":"video","src":"assets/collage/v-f58f29.mp4","poster":"assets/collage/v-f58f29.jpg","r":8}];

  var zone = document.querySelector('.collage');
  if (!zone) return;
  var zTop = 0;
  var attentes = [];
  var elements = [];

  CARTES.forEach(function (c) {
    var el = document.createElement('div');
    el.className = 'carte' + (c.drag ? ' carte--drag' : '');
    el.style.zIndex = c.z;
    el.style.transform = 'rotate(' + c.a + 'deg)';
    elements.push({ el: el, c: c });
    zTop = Math.max(zTop, c.z);

    if (c.t === 'img') {
      var img = document.createElement('img');
      img.alt = ''; img.draggable = false; img.decoding = 'async';
      attentes.push(new Promise(function (ok) { img.onload = img.onerror = ok; }));
      img.src = c.src;
      el.appendChild(img);
    } else {
      var v = document.createElement('video');
      v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      v.preload = 'auto';
      v.poster = c.poster;
      v.src = c.src;
      attentes.push(new Promise(function (ok) {
        if (v.readyState >= 2) ok(); else { v.addEventListener('loadeddata', ok, { once: true }); v.addEventListener('error', ok, { once: true }); }
      }));
      el.appendChild(v);
      v.play && v.play().catch(function () {});
    }
    zone.appendChild(el);
    if (c.drag) rendreDeplacable(el);
  });

  // Placement en px selon la forme de la zone (recalculé au redimensionnement)
  function placer() {
    var zw = zone.clientWidth, zh = zone.clientHeight;
    var portrait = zh > zw * 1.1;
    var VW = portrait ? 560 : BASE_W, VH = portrait ? 990 : BASE_H;
    var k = portrait ? Math.min(zw / VW, zh / VH) : zw / BASE_W;
    var ox = (zw - VW * k) / 2, oy = portrait ? (zh - VH * k) / 2 : 0;
    elements.forEach(function (o) {
      var c = o.c, x = c.x, y = c.y + DECALAGE_Y;
      if (portrait) {
        var droite = c.x + c.w / 2 >= BASE_W / 2;
        x = c.x - (droite ? BASE_W / 2 : 0) + 24;
        y = c.y - 42 + (droite ? 440 : 0) + 10;
      }
      o.el.style.left = (ox + x * k) + 'px';
      o.el.style.top = (oy + y * k) + 'px';
      o.el.style.width = (c.w * k) + 'px';
      o.el.style.height = (c.h * k) + 'px';
      o.el.style.borderRadius = (c.r * k) + 'px';
      if (c.t === 'img') {
        var im = o.el.firstChild;
        im.style.width = (c.iw * k) + 'px'; im.style.height = (c.ih * k) + 'px';
        im.style.left = (c.ix * k) + 'px'; im.style.top = (c.iy * k) + 'px';
      }
    });
  }
  placer();
  var minuterie;
  window.addEventListener('resize', function () { clearTimeout(minuterie); minuterie = setTimeout(placer, 100); });

  // Le collage apparaît d'un seul fondu quand les médias sont prêts (2,5 s max)
  Promise.race([
    Promise.all(attentes),
    new Promise(function (ok) { setTimeout(ok, 2500); })
  ]).then(function () { zone.classList.add('collage--pret'); });

  function rendreDeplacable(el) {
    var depart = null;
    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      el.style.zIndex = ++zTop;           // la carte saisie passe au premier plan
      el.classList.add('carte--saisie');
      depart = { x: e.clientX, y: e.clientY, left: el.offsetLeft, top: el.offsetTop };
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', function (e) {
      if (!depart) return;
      // le centre de la carte reste dans la zone : impossible de la perdre hors de la page
      var l = depart.left + e.clientX - depart.x, t = depart.top + e.clientY - depart.y;
      var w = el.offsetWidth, h = el.offsetHeight;
      var zr = zone.getBoundingClientRect(), pr = zone.parentElement.getBoundingClientRect();
      var minL = pr.left - zr.left - w / 2, maxL = pr.right - zr.left - w / 2;
      var minT = pr.top - zr.top - h / 2, maxT = pr.bottom - zr.top - h / 2;
      el.style.left = Math.min(maxL, Math.max(minL, l)) + 'px';
      el.style.top = Math.min(maxT, Math.max(minT, t)) + 'px';
    });
    var fin = function () {
      if (!depart) return;
      depart = null;
      el.classList.remove('carte--saisie');
    };
    el.addEventListener('pointerup', fin);
    el.addEventListener('pointercancel', fin);
  }
})();
