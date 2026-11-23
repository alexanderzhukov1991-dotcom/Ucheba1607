(function () {
  "use strict";

  var SUBJECTS = window.SUBJECTS || [];
  var TESTS = window.TESTS || [];
  var app = document.getElementById("app");
  var STORAGE_KEY = "ucheba-results-v1";

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
  function updateStarsTotal() {
    var all = loadResults(), sum = 0;
    Object.keys(all).forEach(function (k) { sum += all[k].stars || 0; });
    document.getElementById("starsTotal").textContent = "⭐ " + sum;
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
      .replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "");
  }
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }
  function starsStr(n) { return "⭐".repeat(n) + "☆".repeat(3 - n); }
  function subjectById(id) { return SUBJECTS.filter(function (s) { return s.id === id; })[0]; }
  function testById(id) { return TESTS.filter(function (t) { return t.id === id; })[0]; }
  function qType(q) { return q.type || (q.options ? (Array.isArray(q.answer) ? "multi" : "choice") : "input"); }

  // ---------- Экраны ----------
  function renderHome() {
    var results = loadResults();
    var html = '<h1>Привет! 👋</h1><p class="subtitle">Выбери предмет и проверь себя.</p><div class="grid">';
    SUBJECTS.forEach(function (s) {
      var tests = TESTS.filter(function (t) { return t.subject === s.id; });
      var done = tests.filter(function (t) { return results[t.id]; }).length;
      html += '<a class="subject-card" style="--c:' + esc(s.color) + '" href="#/s/' + esc(s.id) + '">' +
        '<div class="icon">' + esc(s.icon) + '</div>' +
        '<div class="name">' + esc(s.name) + '</div>' +
        '<div class="meta">' + tests.length + ' ' + plural(tests.length, "тест", "теста", "тестов") +
        (tests.length ? ' · пройдено ' + done : '') + '</div></a>';
    });
    html += '</div>';
    app.innerHTML = html;
  }

  function renderSubject(id) {
    var s = subjectById(id);
    if (!s) return renderNotFound();
    var results = loadResults();
    var tests = TESTS.filter(function (t) { return t.subject === id; });
    var html = '<a class="back" href="#/">← Все предметы</a>' +
      '<h1>' + esc(s.icon) + ' ' + esc(s.name) + '</h1>';
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
            '<div class="t-meta">' + t.questions.length + ' ' + plural(t.questions.length, "вопрос", "вопроса", "вопросов") +
            (t.source ? ' · ' + esc(t.source) : '') + '</div></div>' +
            '<div class="t-score" title="Лучший результат">' + (r ? starsStr(r.stars) : '▶️') + '</div></a>';
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

    var questions = test.shuffle === false ? test.questions.slice() : shuffle(test.questions);
    var state = { i: 0, correct: 0, mistakes: [] };

    function show() {
      var q = questions[state.i];
      var type = qType(q);
      var total = questions.length;
      var html = '<a class="back" href="#/s/' + esc(test.subject) + '">← ' + esc(test.title) + '</a>' +
        '<div class="card"><div class="progress"><div style="width:' + (state.i / total * 100) + '%"></div></div>' +
        '<div class="q-counter">Вопрос ' + (state.i + 1) + ' из ' + total + '</div>' +
        '<p class="q-text">' + esc(q.q) + '</p>';

      var order = null;
      if (type === "input") {
        html += '<input class="text-answer" id="answer" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Напиши ответ">';
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
          var answers = [].concat(q.answer).map(normalize);
          ok = answers.indexOf(normalize(val)) >= 0;
          userText = val;
          rightText = [].concat(q.answer)[0];
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
        if (ok) state.correct++;
        else state.mistakes.push({ q: q.q, user: userText, right: rightText, explain: q.explain });

        var praise = ["Отлично! 🎉", "Верно! 👍", "Молодец! 🌟", "Правильно! ✅", "Супер! 💪"];
        var fb = '<div class="feedback ' + (ok ? "ok" : "bad") + '">' +
          (ok ? praise[Math.floor(Math.random() * praise.length)]
              : 'Не совсем 🙁 Правильный ответ: <b>' + esc(rightText) + '</b>') +
          (q.explain ? '<div class="explain">💡 ' + esc(q.explain) + '</div>' : '') + '</div>';
        document.getElementById("feedback").innerHTML = fb;
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
      updateStarsTotal();
      var msg = ["Попробуй ещё раз — у тебя получится! 💪", "Неплохо! Повтори тему и попробуй снова.", "Хорошо! Ещё чуть-чуть до идеала.", "Великолепно! Ты настоящий знаток! 🏆"][stars];
      var html = '<a class="back" href="#/s/' + esc(test.subject) + '">← К списку тестов</a>' +
        '<div class="card result"><h2>' + esc(test.title) + '</h2>' +
        '<div class="big-stars">' + starsStr(stars) + '</div>' +
        '<div class="score">' + state.correct + ' из ' + total + '</div>' +
        '<p>' + msg + '</p>' +
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
    if (!h) renderHome();
    else if (parts[0] === "s" && parts[1]) renderSubject(decodeURIComponent(parts[1]));
    else if (parts[0] === "t" && parts[1]) runTest(decodeURIComponent(parts[1]));
    else renderNotFound();
  }

  window.addEventListener("hashchange", route);
  updateStarsTotal();
  route();
})();
