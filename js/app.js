(function () {
  "use strict";

  var SUBJECTS = window.SUBJECTS || [];
  var TESTS = window.TESTS || [];
  var app = document.getElementById("app");
  var STORAGE_KEY = "ucheba-results-v1";
  var NAME = "Ульяна";
  var HELLO = [
    "Я улитка Тиша. Выбирай предмет — будем учиться вместе!",
    "Даже улитка доползёт до вершины, если не останавливаться. Поехали!",
    "Сегодня отличный день, чтобы решить пару задачек!",
    "Каждый решённый тест — это новая звёздочка. Соберём побольше?"
  ];

  // ---------- Хранение результатов (в браузере ребёнка) ----------
  function loadResults() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveResult(testId, correct, total) {
    var all = loadResults();
    var prev = all[testId];
    var stars = starsFor(correct, total);
    if (!prev || stars > prev.stars || (stars === prev.stars && correct > prev.correct)) {
      all[testId] = { correct: correct, total: total, stars: stars, date: new Date().toISOString() };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch (e) {}
    }
  }
  function starsFor(correct, total) {
    var p = total ? correct / total : 0;
    if (p >= 0.9) return 3;
    if (p >= 0.7) return 2;
    if (p >= 0.5) return 1;
    return 0;
  }
  function updateStarsTotal(P) {
    P = P || DEFAULT_PROFILE;
    var el = document.getElementById("starsTotal");
    if (P.cards) {
      var n = 0, c = loadCards(P.key);
      Object.keys(c).forEach(function (k) { n += c[k]; });
      el.textContent = "🃏 " + n;
      el.title = "Коллекция карточек футболистов";
      return;
    }
    var all = loadResults(), sum = 0;
    Object.keys(all).forEach(function (k) {
      var t = testById(k);
      if (!t || !profileKey(t.subject)) sum += all[k].stars || 0;   // звёзды только своего раздела
    });
    el.textContent = "⭐ " + sum;
    el.title = "Всего звёзд";
  }

  // ---------- Коллекция карточек (для профилей с cards) ----------
  function cardsKey(key) { return "ucheba-cards-" + key; }
  function loadCards(key) {
    try { return JSON.parse(localStorage.getItem(cardsKey(key))) || {}; } catch (e) { return {}; }
  }
  function addCards(key, names) {
    var c = loadCards(key);
    names.forEach(function (n) { c[n] = (c[n] || 0) + 1; });
    try { localStorage.setItem(cardsKey(key), JSON.stringify(c)); } catch (e) {}
  }
  // {Холанд: 5, Роналду: 4} -> «5 Холандов · 4 Роналду»
  function cardsText(P, counts) {
    return Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).map(function (n) {
      var forms = P.cards.filter(function (f) { return f[0] === n; })[0] || [n, n, n];
      return counts[n] + " " + plural(counts[n], forms[0], forms[1], forms[2]);
    }).join(" · ");
  }

  // ---------- Утилиты ----------
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function normalize(s) {
    return String(s).toLowerCase().replace(/ё/g, "е").replace(/,/g, ".")
      .replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "")
      .replace(/(\d)\s+(?=\d)/g, "$1"); // «45 300» = «45300»
  }
  // Проверка ответа, введённого с клавиатуры
  function isRightInput(val, answer) {
    var user = normalize(val);
    return [].concat(answer).some(function (a) {
      var right = normalize(a);
      if (user === right) return true;
      // для числовых ответов разрешаем дописать единицы: «36 км» = «36»
      if (/^-?\d+(\.\d+)?$/.test(right)) {
        var m = user.match(/^(-?\d+(?:\.\d+)?)\s*[a-zа-я. ]*$/);
        return !!m && parseFloat(m[1]) === parseFloat(right);
      }
      return false;
    });
  }
  // Вопросы для одного прохождения теста
  function buildQuestions(t) {
    if (t.mixFrom) {
      // сборная проверочная: понемногу из каждого теста предмета по кругу
      var pools = TESTS.filter(function (x) { return x.subject === t.mixFrom && !x.mixFrom && !x.noMix; })
        .map(function (x) { return buildQuestions(x); });
      pools = shuffle(pools);
      var out = [], k = 0;
      while (out.length < t.count && pools.some(function (p) { return p.length; })) {
        var p = pools[k++ % pools.length];
        if (p.length) out.push(p.shift());
      }
      return out;
    }
    if (t.generate) return t.generate();
    return t.shuffle === false ? t.questions.slice() : shuffle(t.questions);
  }
  // ---------- Профили и весёлые фишки ----------
  var FUN = window.FUN || { right: ["Верно!"], wrong: ["Не совсем."], streak: {}, confetti: ["🎉"], result: ["", "", "", ""] };
  var DEFAULT_PROFILE = {
    key: null, name: NAME, mascot: "img/snail.svg", hello: HELLO, sym: ["⭐", "☆"],
    right: FUN.right, wrong: FUN.wrong, streak: FUN.streak || {}, confetti: FUN.confetti, result: FUN.result
  };
  function profileKey(subjectId) {
    var s = subjectById(subjectId);
    return s && s.profile && window.PROFILES && window.PROFILES[s.profile] ? s.profile : null;
  }
  function profileFor(subjectId) {
    var key = profileKey(subjectId);
    if (!key) return DEFAULT_PROFILE;
    var P = Object.assign({}, DEFAULT_PROFILE, window.PROFILES[key]);
    P.key = key;
    return P;
  }
  function pickOne(list) { return list[Math.floor(Math.random() * list.length)]; }
  function withName(s, P) { return String(s).replace(/\{name\}/g, (P || DEFAULT_PROFILE).name); }
  function funText(list, P) { return withName(pickOne(list), P); }
  var currentConfetti = FUN.confetti;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function burst(n) {
    if (reduceMotion) return;
    var box = document.createElement("div");
    box.className = "confetti";
    for (var i = 0; i < n; i++) {
      var e = document.createElement("span");
      e.textContent = pickOne(currentConfetti);
      e.style.left = (5 + Math.random() * 90) + "%";
      e.style.animationDelay = (Math.random() * 0.3) + "s";
      e.style.fontSize = (20 + Math.random() * 22) + "px";
      e.style.setProperty("--dx", (Math.random() * 120 - 60) + "px");
      box.appendChild(e);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 2200);
  }
  function sixSeven() {
    var el = document.createElement("div");
    el.className = "six-seven";
    el.innerHTML = '<div class="ss-num">6️⃣7️⃣</div><div class="ss-text">SIX SEVEN!</div><div class="ss-hands">🤲</div>';
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2000);
  }
  function qCount(t) { return t.count || (t.questions ? t.questions.length : 0); }
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }
  function starsStr(n, P) { var s = (P || DEFAULT_PROFILE).sym; return s[0].repeat(n) + s[1].repeat(3 - n); }
  function subjectById(id) { return SUBJECTS.filter(function (s) { return s.id === id; })[0]; }
  function testById(id) { return TESTS.filter(function (t) { return t.id === id; })[0]; }
  function qType(q) { return q.type || (q.options ? (Array.isArray(q.answer) ? "multi" : "choice") : "input"); }

  // ---------- Экраны ----------
  function renderHome() {
    var results = loadResults();
    var hello = HELLO[Math.floor(Math.random() * HELLO.length)];
    var html = '<div class="hero"><img src="img/snail.svg" alt="Улитка" class="hero-snail">' +
      '<div class="bubble"><h1>Привет, ' + esc(NAME) + '! 👋</h1><p>' + esc(hello) + '</p></div></div><div class="grid">';
    function card(s) {
      var tests = TESTS.filter(function (t) { return t.subject === s.id; });
      var done = tests.filter(function (t) { return results[t.id]; }).length;
      return '<a class="subject-card" style="--c:' + esc(s.color) + '" href="#/s/' + esc(s.id) + '">' +
        '<div class="icon">' + esc(s.icon) + '</div>' +
        '<div class="name">' + esc(s.name) + '</div>' +
        '<div class="meta">' + tests.length + ' ' + plural(tests.length, "тест", "теста", "тестов") +
        (tests.length ? ' · пройдено ' + done : '') + '</div></a>';
    }
    SUBJECTS.forEach(function (s) { if (!profileKey(s.id)) html += card(s); });
    html += '</div>';
    // разделы других детей
    SUBJECTS.forEach(function (s) {
      if (!profileKey(s.id)) return;
      var P = profileFor(s.id);
      var tests = TESTS.filter(function (t) { return t.subject === s.id; });
      html += '<a class="kid-block" style="--c:' + esc(s.color) + '" href="#/s/' + esc(s.id) + '">' +
        '<img src="' + esc(P.mascot) + '" alt="" class="kid-mascot">' +
        '<div><div class="kid-title">' + esc(s.ownerTitle || s.name) + '</div>' +
        '<div class="kid-sub">' + esc(s.icon) + ' ' + esc(s.name) + (s.grade ? ' · ' + esc(s.grade) : '') +
        ' · ' + tests.length + ' ' + plural(tests.length, "тест", "теста", "тестов") + '</div></div></a>';
    });
    app.innerHTML = html;
  }

  function renderSubject(id) {
    var s = subjectById(id);
    if (!s) return renderNotFound();
    var results = loadResults();
    var tests = TESTS.filter(function (t) { return t.subject === id; });
    var P = profileFor(id);
    var html = '<a class="back" href="#/">← Все предметы</a>';
    if (P.key) {
      var coll = loadCards(P.key);
      html += '<div class="hero"><img src="' + esc(P.mascot) + '" alt="" class="hero-snail">' +
        '<div class="bubble"><h1>' + esc(s.icon) + ' ' + esc(s.name) + '</h1><p>' + esc(withName(pickOne(P.hello), P)) + '</p></div></div>';
      if (P.cards) {
        html += '<div class="collection"><b>🃏 Твоя коллекция:</b> ' +
          (Object.keys(coll).length ? esc(cardsText(P, coll)) : 'пока пусто — отвечай правильно и собирай футболистов!') + '</div>';
      }
    } else {
      html += '<h1>' + esc(s.icon) + ' ' + esc(s.name) + '</h1>';
    }
    if (!tests.length) {
      html += '<p class="empty">Тестов пока нет. Скоро появятся!</p>';
    } else {
      var topics = [];
      tests.forEach(function (t) { var tp = t.topic || "Разное"; if (topics.indexOf(tp) < 0) topics.push(tp); });
      topics.forEach(function (tp) {
        html += '<div class="topic-header">' + esc(tp) + '</div><div class="test-list">';
        tests.filter(function (t) { return (t.topic || "Разное") === tp; }).forEach(function (t) {
          var r = results[t.id];
          html += '<a class="test-item" href="#/t/' + esc(t.id) + '">' +
            '<div class="t-body"><div class="t-title">' + esc(t.title) + '</div>' +
            '<div class="t-meta">' + qCount(t) + ' ' + plural(qCount(t), "вопрос", "вопроса", "вопросов") +
            (t.generate ? ' · 🎲 каждый раз новые' : '') + (t.mixFrom ? ' · 🎯 из всех тем' : '') +
            (t.source ? ' · ' + esc(t.source) : '') + '</div></div>' +
            '<div class="t-score" title="Лучший результат">' + (r ? starsStr(r.stars, P) : '▶️') + '</div></a>';
        });
        html += '</div>';
      });
    }
    app.innerHTML = html;
  }

  function renderNotFound() {
    app.innerHTML = '<a class="back" href="#/">← На главную</a><h1>Ой, такой страницы нет 🙈</h1>';
  }

  // ---------- Прохождение теста ----------
  function runTest(id) {
    var test = testById(id);
    if (!test) return renderNotFound();

    var questions = buildQuestions(test);
    var P = profileFor(test.subject);
    currentConfetti = P.confetti;
    var state = { i: 0, correct: 0, mistakes: [], streak: 0, cards: [] };

    function show() {
      var q = questions[state.i];
      var type = qType(q);
      var total = questions.length;
      var html = '<a class="back" href="#/s/' + esc(test.subject) + '">← ' + esc(test.title) + '</a>' +
        '<div class="card"><div class="progress"><div style="width:' + (state.i / total * 100) + '%"></div></div>' +
        '<div class="q-counter">Вопрос ' + (state.i + 1) + ' из ' + total +
        (state.streak >= 2 ? ' <span class="streak">🔥 ' + state.streak + '</span>' : '') + '</div>' +
        '<p class="q-text">' + esc(q.q) + '</p>';

      var order = null;
      if (type === "input") {
        html += '<div class="answer-row"><input class="text-answer" id="answer" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Ответ"' +
          (/^-?\d/.test(String([].concat(q.answer)[0])) ? ' inputmode="decimal"' : '') + '>' +
          (q.unit ? '<span class="unit">' + esc(q.unit) + '</span>' : '') + '</div>';
      } else {
        if (type === "multi") html += '<p class="q-hint">Выбери все правильные ответы.</p>';
        order = q.keepOrder ? q.options.map(function (_, k) { return k; }) : shuffle(q.options.map(function (_, k) { return k; }));
        html += '<div class="options">';
        order.forEach(function (k) {
          html += '<button class="option" data-k="' + k + '">' + esc(q.options[k]) + '</button>';
        });
        html += '</div>';
      }
      html += '<div id="feedback"></div><div class="actions">' +
        '<button class="btn" id="check" ' + (type === "input" ? "" : "disabled") + '>Проверить</button></div></div>';
      app.innerHTML = html;

      var checkBtn = document.getElementById("check");
      var selected = [];
      var answered = false;

      if (type === "input") {
        var input = document.getElementById("answer");
        input.focus();
        input.addEventListener("keydown", function (e) { if (e.key === "Enter") checkBtn.click(); });
      } else {
        Array.prototype.forEach.call(app.querySelectorAll(".option"), function (btn) {
          btn.addEventListener("click", function () {
            if (answered) return;
            var k = +btn.getAttribute("data-k");
            if (type === "choice") {
              selected = [k];
              Array.prototype.forEach.call(app.querySelectorAll(".option"), function (b) { b.classList.remove("selected"); });
              btn.classList.add("selected");
            } else {
              var pos = selected.indexOf(k);
              if (pos >= 0) { selected.splice(pos, 1); btn.classList.remove("selected"); }
              else { selected.push(k); btn.classList.add("selected"); }
            }
            checkBtn.disabled = selected.length === 0;
          });
        });
      }

      checkBtn.addEventListener("click", function () {
        if (answered) return next();
        var ok, userText, rightText;
        if (type === "input") {
          var val = document.getElementById("answer").value;
          if (!val.trim()) return;
          ok = isRightInput(val, q.answer);
          userText = val;
          rightText = [].concat(q.answer)[0] + (q.unit ? " " + q.unit : "");
          var inp = document.getElementById("answer");
          inp.classList.add(ok ? "correct" : "wrong");
          inp.readOnly = true;
        } else {
          var right = [].concat(q.answer);
          ok = selected.length === right.length && selected.every(function (k) { return right.indexOf(k) >= 0; });
          userText = selected.map(function (k) { return q.options[k]; }).join(", ");
          rightText = right.map(function (k) { return q.options[k]; }).join(", ");
          Array.prototype.forEach.call(app.querySelectorAll(".option"), function (b) {
            var k = +b.getAttribute("data-k");
            b.disabled = true;
            if (right.indexOf(k) >= 0) b.classList.add("correct");
            else if (selected.indexOf(k) >= 0) b.classList.add("wrong");
          });
        }
        answered = true;
        if (ok) { state.correct++; state.streak++; } else state.streak = 0;
        if (!ok) state.mistakes.push({ q: q.q, user: userText, right: rightText, explain: q.explain });

        var combo = ok && P.streak[state.streak];
        var got = null;
        if (ok && P.cards) { got = pickOne(P.cards)[0]; state.cards.push(got); }
        var fb = '<div class="feedback ' + (ok ? "ok" : "bad") + '"><img src="' + esc(P.mascot) + '" alt="" class="fb-snail">' +
          (ok ? esc(funText(P.right, P)) + (combo ? ' <span class="combo">' + esc(combo) + '</span>' : '') +
                (got ? ' <span class="card-get">+1 ' + esc(got) + ' 🃏</span>' : '')
              : esc(funText(P.wrong, P)) + ' <b>' + esc(rightText) + '</b>') +
          (q.explain ? '<div class="explain">💡 ' + esc(q.explain) + '</div>' : '') + '</div>';
        document.getElementById("feedback").innerHTML = fb;
        if (ok) {
          // пасхалка «six seven»: в ответе есть 67 — или просто иногда
          if (/6\s*7/.test(rightText) || Math.random() < 0.07) sixSeven();
          else burst(combo ? 26 : 14);
        }
        checkBtn.textContent = state.i + 1 < questions.length ? "Дальше →" : "Результат 🏁";
        checkBtn.disabled = false;
        checkBtn.focus();
      });
    }

    function next() {
      state.i++;
      if (state.i < questions.length) show(); else finish();
    }

    function finish() {
      var total = questions.length;
      var stars = starsFor(state.correct, total);
      saveResult(test.id, state.correct, total);
      if (P.cards && state.cards.length) addCards(P.key, state.cards);
      updateStarsTotal(P);
      var msg = withName(P.result[stars], P);
      var loot = {};
      state.cards.forEach(function (n) { loot[n] = (loot[n] || 0) + 1; });
      if (stars === 3) setTimeout(function () { burst(40); }, 200);
      if (state.correct === 6 || state.correct === 7) setTimeout(sixSeven, 900);
      var html = '<a class="back" href="#/s/' + esc(test.subject) + '">← К списку тестов</a>' +
        '<div class="card result"><img src="' + esc(P.mascot) + '" alt="" class="result-snail' + (stars >= 2 ? ' jump' : '') + '">' +
        '<h2>' + esc(test.title) + '</h2>' +
        '<div class="big-stars">' + starsStr(stars, P) + '</div>' +
        '<div class="score">' + (P.matchScore
          ? 'Счёт матча: ' + state.correct + ' : ' + (total - state.correct)
          : state.correct + ' из ' + total) + '</div>' +
        '<p>' + esc(msg) + '</p>' +
        (P.cards && state.cards.length ? '<div class="loot">🃏 Твоя добыча: <b>' + esc(cardsText(P, loot)) + '</b></div>' : '') +
        '<div class="actions" style="justify-content:center">' +
        '<button class="btn" id="again">Пройти ещё раз 🔄</button>' +
        '<a class="btn secondary" href="#/s/' + esc(test.subject) + '">Другие тесты</a></div>';
      if (state.mistakes.length) {
        html += '<div class="mistakes"><h2>Работа над ошибками</h2>';
        state.mistakes.forEach(function (m) {
          html += '<div class="mistake"><div class="m-q">' + esc(m.q) + '</div>' +
            '<div class="m-a">Твой ответ: ' + esc(m.user) + ' · Правильно: <b>' + esc(m.right) + '</b></div>' +
            (m.explain ? '<div>💡 ' + esc(m.explain) + '</div>' : '') + '</div>';
        });
        html += '</div>';
      }
      html += '</div>';
      app.innerHTML = html;
      document.getElementById("again").addEventListener("click", function () { runTest(id); });
    }

    show();
  }

  // ---------- Маршрутизация ----------
  function route() {
    var h = location.hash.replace(/^#\/?/, "");
    var parts = h.split("/");
    window.scrollTo(0, 0);
    var subj = parts[0] === "s" ? decodeURIComponent(parts[1] || "")
             : parts[0] === "t" ? ((testById(decodeURIComponent(parts[1] || "")) || {}).subject) : null;
    updateStarsTotal(subj ? profileFor(subj) : null);
    if (!h) renderHome();
    else if (parts[0] === "s" && parts[1]) renderSubject(decodeURIComponent(parts[1]));
    else if (parts[0] === "t" && parts[1]) runTest(decodeURIComponent(parts[1]));
    else renderNotFound();
  }

  window.addEventListener("hashchange", route);
  route();
})();
