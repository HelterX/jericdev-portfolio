// =============================================
//  SITE — menu, work index, reveal, contact form
// =============================================
(function () {
  var doc = document;

  // ---------- mobile menu ----------
  var btn = doc.querySelector('.menu-btn'), mnav = doc.getElementById('mnav');
  if (btn && mnav) {
    function setMenu(open) {
      mnav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close' : 'Menu';
      doc.body.style.overflow = open ? 'hidden' : ''; doc.body.classList.toggle('menu-open', open);
    }
    btn.addEventListener('click', function () { setMenu(!mnav.classList.contains('open')); });
    mnav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  // ---------- reveal on scroll ----------
  var rv = [].slice.call(doc.querySelectorAll('.rv'));
  if (rv.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  // ---------- work index: preview, filters, grid view ----------
  var work = doc.querySelector('.work');
  var rows = [].slice.call(doc.querySelectorAll('.index .row'));

  // Build cards from the index rows (single source of truth)
  var cardsEl = doc.getElementById('cards');
  if (cardsEl) {
    rows.forEach(function (r) {
      var linked = r.tagName === 'A';
      var a = doc.createElement(linked ? 'a' : 'div');
      a.className = 'card';
      a.dataset.t = r.dataset.t;
      if (linked) { a.href = r.getAttribute('href'); if (/^https?:/.test(a.href)) { a.target = '_blank'; a.rel = 'noopener'; } }
      var name = r.querySelector('.t').textContent;
      var meta = r.querySelectorAll('.m');
      var status = r.querySelector('.s');
      var fig = doc.createElement('figure');
      if (r.dataset.img) {
        var im = doc.createElement('img'); im.src = r.dataset.img; im.alt = name + ' website screenshot'; im.loading = 'lazy'; fig.appendChild(im);
      } else {
        var n = doc.createElement('div'); n.className = 'noimg'; n.textContent = 'Preview on request'; fig.appendChild(n);
      }
      a.appendChild(fig);
      var cap = doc.createElement('div'); cap.className = 'cap';
      var left = doc.createElement('div');
      left.innerHTML = '<h3></h3><p class="meta"></p>';
      left.querySelector('h3').textContent = name;
      left.querySelector('.meta').textContent = meta[0].textContent + (meta[1] ? ' · ' + meta[1].textContent : '');
      var st = doc.createElement('span'); st.className = 's' + (status.classList.contains('dev') ? ' dev' : '');
      st.innerHTML = '<i></i><span></span>'; st.querySelector('span').textContent = status.textContent.trim();
      cap.appendChild(left); cap.appendChild(st); a.appendChild(cap);
      cardsEl.appendChild(a);
    });
  }

  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var peek = doc.getElementById('peek');
  if (peek && fine && rows.length) {
    var img = peek.querySelector('img'), x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    var loop = function () {
      x += (tx - x) * .14; y += (ty - y) * .14;
      peek.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + ((tx - x) * .02) + 'deg)';
      raf = requestAnimationFrame(loop);
    };
    rows.forEach(function (r) {
      r.addEventListener('mouseenter', function (e) {
        var s = r.dataset.img; peek.classList.toggle('none', !s); if (s) img.src = s;
        tx = x = e.clientX + 28; ty = y = e.clientY - 120; peek.classList.add('on'); if (!raf) loop();
      });
      r.addEventListener('mousemove', function (e) { tx = e.clientX + 28; ty = e.clientY - 120; });
      r.addEventListener('mouseleave', function () { peek.classList.remove('on'); });
    });
  }

  function applyFilter(f) {
    rows.forEach(function (r) { r.classList.toggle('hide', f !== 'all' && r.dataset.t !== f); });
    doc.querySelectorAll('.card').forEach(function (c) { c.classList.toggle('hide', f !== 'all' && c.dataset.t !== f); });
  }
  doc.querySelectorAll('.tabs[data-filter] button').forEach(function (b) {
    b.addEventListener('click', function () {
      doc.querySelectorAll('.tabs[data-filter] button').forEach(function (o) { o.classList.remove('on'); });
      b.classList.add('on'); applyFilter(b.dataset.f);
    });
  });
  doc.querySelectorAll('.tabs.views button').forEach(function (b) {
    b.addEventListener('click', function () {
      doc.querySelectorAll('.tabs.views button').forEach(function (o) { o.classList.remove('on'); });
      b.classList.add('on'); if (work) work.dataset.view = b.dataset.v;
    });
  });

  // ---------- contact form (Formspree) ----------
  var send = doc.getElementById('sendBtn');
  if (send) {
    var label = send.textContent;
    send.addEventListener('click', async function () {
      var v = function (id) { return doc.getElementById(id).value.trim(); };
      var name = v('name'), email = v('email'), subject = v('subject'), message = v('message');
      var flash = function (t, ms) { send.textContent = t; setTimeout(function () { send.textContent = label; send.disabled = false; }, ms); };
      if (!name || !email || !subject || !message) { flash('Please fill in every field', 2500); return; }
      send.textContent = 'Sending…'; send.disabled = true;
      try {
        var res = await fetch('https://formspree.io/f/mbdqvkgr', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name, email: email, subject: subject, message: message })
        });
        if (!res.ok) throw new Error('failed');
        ['name', 'email', 'subject', 'message'].forEach(function (id) { doc.getElementById(id).value = ''; });
        flash('Message sent. Thank you.', 3500);
      } catch (e) { flash('Something went wrong. Try email instead.', 3500); }
    });
  }
})();
