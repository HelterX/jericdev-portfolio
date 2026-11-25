// =============================================
//  AI CHAT WIDGET
//  Talks to the Cloudflare Worker in /portfolio-chat-worker.
//  Set CHAT_ENDPOINT to your deployed Worker URL.
// =============================================
(() => {
  const CHAT_ENDPOINT = window.JERIC_CHAT_ENDPOINT || ''; // e.g. 'https://jeric-portfolio-chat.<your-subdomain>.workers.dev'
  const CONTACT_EMAIL = 'tabbogajeric0811@gmail.com';
  const MAX_HISTORY = 12;

  const SUGGESTIONS = [
    'What services do you offer?',
    'Can you build my GoHighLevel site?',
    'How does pricing work?',
    'How do I get started?'
  ];

  const GREETING =
    "Hi, I'm JericBot, Jeric's AI assistant. Ask me about his services, past work, or how to start a project.";

  // ---------- build UI ----------
  const root = document.createElement('div');
  root.className = 'chat';
  root.innerHTML = `
    <button class="chat__launcher" type="button" aria-label="Open chat" aria-expanded="false">
      <span class="chat__launcher-icon chat__launcher-icon--open"><i class="fa-solid fa-comment-dots"></i></span>
      <span class="chat__launcher-icon chat__launcher-icon--close"><i class="fa-solid fa-xmark"></i></span>
      <span class="chat__launcher-label">Ask JericBot</span>
    </button>
    <section class="chat__panel" role="dialog" aria-label="Chat with JericBot" aria-hidden="true">
      <header class="chat__head">
        <div class="chat__avatar"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
        <div class="chat__title">
          <strong>JericBot</strong>
          <span><i class="chat__dot"></i> AI assistant for Jeric's portfolio</span>
        </div>
        <button class="chat__close" type="button" aria-label="Close chat"><i class="fa-solid fa-xmark"></i></button>
      </header>
      <div class="chat__messages" aria-live="polite"></div>
      <div class="chat__chips"></div>
      <form class="chat__form" autocomplete="off">
        <input class="chat__input" type="text" maxlength="1000" placeholder="Type your question..." aria-label="Your message" />
        <button class="chat__send" type="submit" aria-label="Send"><i class="fa-solid fa-arrow-up"></i></button>
      </form>
      <p class="chat__note">AI replies can be wrong. For quotes, email Jeric directly.</p>
    </section>`;
  document.body.appendChild(root);

  const launcher = root.querySelector('.chat__launcher');
  const panel = root.querySelector('.chat__panel');
  const messagesEl = root.querySelector('.chat__messages');
  const chipsEl = root.querySelector('.chat__chips');
  const form = root.querySelector('.chat__form');
  const input = root.querySelector('.chat__input');
  const sendBtn = root.querySelector('.chat__send');

  let history = [];
  let busy = false;
  let greeted = false;

  // ---------- helpers ----------
  const escapeHtml = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Minimal, safe formatting: escape first, then links, bold, line breaks.
  function format(text) {
    let html = escapeHtml(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(
      /\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g,
      '<a href="mailto:$1">$1</a>'
    );
    html = html.replace(
      /(^|[\s(])((?:https?:\/\/)[^\s<)]+)/g,
      '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>'
    );
    return html.replace(/\n/g, '<br>');
  }

  function addMessage(role, text) {
    const el = document.createElement('div');
    el.className = `chat__msg chat__msg--${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'chat__bubble';
    bubble.innerHTML = format(text);
    el.appendChild(bubble);
    messagesEl.appendChild(el);
    scrollDown();
    return bubble;
  }

  function addTyping() {
    const el = document.createElement('div');
    el.className = 'chat__msg chat__msg--bot chat__typing';
    el.innerHTML = '<div class="chat__bubble"><i></i><i></i><i></i></div>';
    messagesEl.appendChild(el);
    scrollDown();
    return el;
  }

  function scrollDown() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setBusy(state) {
    busy = state;
    sendBtn.disabled = state;
    input.disabled = state;
    if (!state) input.focus();
  }

  function renderChips() {
    chipsEl.innerHTML = '';
    SUGGESTIONS.forEach((q) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chat__chip';
      b.textContent = q;
      b.addEventListener('click', () => send(q));
      chipsEl.appendChild(b);
    });
  }

  function fallbackReply() {
    return (
      `I can't reach my AI brain right now. Jeric replies within 24 hours: email ${CONTACT_EMAIL} ` +
      `or message him on WhatsApp at +63 929 329 6006.`
    );
  }

  // ---------- open / close ----------
  function toggle(open) {
    const isOpen = open ?? !root.classList.contains('chat--open');
    root.classList.toggle('chat--open', isOpen);
    launcher.setAttribute('aria-expanded', String(isOpen));
    launcher.setAttribute('aria-label', isOpen ? 'Close chat' : 'Open chat');
    panel.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen) {
      if (!greeted) {
        greeted = true;
        addMessage('bot', GREETING);
        renderChips();
      }
      setTimeout(() => input.focus(), 250);
    }
  }

  launcher.addEventListener('click', () => toggle());
  root.querySelector('.chat__close').addEventListener('click', () => toggle(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('chat--open')) toggle(false);
  });

  // ---------- send ----------
  async function send(text) {
    text = text.trim();
    if (!text || busy) return;
    chipsEl.innerHTML = '';
    addMessage('user', text);
    input.value = '';
    history.push({ role: 'user', content: text });
    history = history.slice(-MAX_HISTORY);
    setBusy(true);

    const typing = addTyping();
    let bubble = null;
    let reply = '';

    try {
      if (!CHAT_ENDPOINT) throw new Error('not-configured');

      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });

      if (!res.ok || !res.body) {
        let msg = '';
        try { msg = (await res.json()).error || ''; } catch {}
        throw new Error(msg || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      outer: while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop();

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue;
          const data = part.slice(6);
          if (data === '[DONE]') break outer;
          const evt = JSON.parse(data);
          if (evt.error) throw new Error(evt.error);
          if (evt.refusal && !reply) {
            reply = `I can't help with that one. For anything about Jeric's work, ask away, or email ${CONTACT_EMAIL}.`;
          }
          if (evt.t) {
            if (!bubble) { typing.remove(); bubble = addMessage('bot', ''); }
            reply += evt.t;
            bubble.innerHTML = format(reply);
            scrollDown();
          }
        }
      }

      if (!reply) throw new Error('empty');
      if (!bubble) { typing.remove(); addMessage('bot', reply); }
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      typing.remove();
      const friendly =
        err && err.message && !/^(not-configured|empty|HTTP|Failed|NetworkError|Load failed)/.test(err.message)
          ? err.message + ` You can also email ${CONTACT_EMAIL}.`
          : fallbackReply();
      if (bubble) {
        bubble.innerHTML = format(reply + '\n\n' + friendly);
      } else {
        addMessage('bot', friendly);
      }
      // Drop the unanswered user turn so history keeps alternating.
      if (history.length && history[history.length - 1].role === 'user') history.pop();
    } finally {
      setBusy(false);
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    send(input.value);
  });
})();
