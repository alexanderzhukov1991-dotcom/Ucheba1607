/*
  ARTEMY'S MATH IN ENGLISH — follows Illustrative Mathematics (IM K–5), Grade 1.
  Units: 1 Adding, Subtracting & Data · 2 Story Problems · 3 Within 20 · 4 Numbers to 99 ·
         5 Adding Within 100 · 6 Length · 7 Geometry & Time · 8 Putting It All Together.
  Heroes: Shark (Artemy), Maestro (uncle), Mom Tanya (marketer, loves kazy & beshbarmak),
  Dad Maxim (IT, curly hair, longboard, boxing with Shark) and football stars.
  Test format — see the hint at the top of data/math.js.
*/

(function () {
  var S = "artemy_en";
  function R(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function many(n, make) { var out = []; for (var i = 0; i < n; i++) out.push(make(i)); return out; }
  function mix(arr) { return arr.sort(function () { return Math.random() - 0.5; }); }
  function pl(n, one, lots) { return n + " " + (n === 1 ? one : lots); }
  function goals(n) { return pl(n, "goal", "goals"); }
  function to(n) { return pl(Math.floor(n / 10), "ten", "tens") + " and " + pl(n % 10, "one", "ones"); }   // 31 -> 3 tens and 1 one
  function row(e, n) { var s = ""; for (var i = 0; i < n; i++) s += e + ((i + 1) % 5 === 0 && i + 1 < n ? " " : ""); return s; }
  // pick a, b so that a + b <= max
  function sumUpTo(max, min) { var a = R(min || 1, max - 1), b = R(1, max - a); return [a, b]; }

  var PLAYERS = ["Haaland", "Ronaldo", "Messi", "Mbappe", "Yamal", "Vinicius", "Kane", "Salah"];
  function players(n) { return mix(PLAYERS.slice()).slice(0, n); }

  var U1 = "Unit 1 · Adding, Subtracting & Data";
  var U2 = "Unit 2 · Story Problems";
  var U3 = "Unit 3 · Add & Subtract Within 20";
  var U4 = "Unit 4 · Numbers to 99";
  var U5 = "Unit 5 · Adding Within 100";
  var U6 = "Unit 6 · Length & Numbers to 120";
  var U7 = "Unit 7 · Geometry & Time";
  var U8 = "Unit 8 · Putting It All Together";

  // ===================== UNIT 1: DATA =====================
  TESTS.push({
    id: "en-u1-graph", subject: S, topic: U1,
    title: "Picture graphs: who scored more? 📊", count: 8,
    generate: function () {
      return many(8, function (i) {
        var p = players(3), g = [R(1, 9), R(1, 9), R(1, 9)];
        while (g[0] === g[1] || g[1] === g[2] || g[0] === g[2]) g = [R(1, 9), R(1, 9), R(1, 9)];
        var graph = "Goals this season ⚽ = 1 goal\n" +
          p.map(function (name, k) { return name + ": " + row("⚽", g[k]); }).join("\n") + "\n\n";
        var max = Math.max.apply(null, g), min = Math.min.apply(null, g);
        switch (i % 5) {
          case 0: return { q: graph + "How many goals did " + p[1] + " score?", answer: String(g[1]) };
          case 1: return { q: graph + "Who scored the MOST goals?", options: p.slice(), answer: g.indexOf(max), keepOrder: true };
          case 2: return { q: graph + "Who scored the FEWEST goals?", options: p.slice(), answer: g.indexOf(min), keepOrder: true };
          case 3: return { q: graph + "How many goals did they score in all?", answer: String(g[0] + g[1] + g[2]),
                           explain: g[0] + " + " + g[1] + " + " + g[2] + " = " + (g[0] + g[1] + g[2]) + "." };
          default:
            var a = g[0] > g[2] ? 0 : 2, b = a === 0 ? 2 : 0;
            return { q: graph + "How many MORE goals did " + p[a] + " score than " + p[b] + "?", answer: String(g[a] - g[b]),
                     explain: g[a] + " − " + g[b] + " = " + (g[a] - g[b]) + "." };
        }
      });
    }
  });

  // ===================== UNIT 2: STORY PROBLEMS =====================
  TESTS.push({
    id: "en-u2-stories", subject: S, topic: U2,
    title: "Story problems with Shark & Maestro 🦈🎩", count: 9,
    generate: function () {
      var makers = [
        function () { var x = sumUpTo(20, 5); return { q: "Shark had " + x[0] + " football cards. Maestro gave him " + x[1] + " more. How many cards does Shark have now?", answer: String(x[0] + x[1]) }; },
        function () { var x = sumUpTo(20, 5), c = x[0] + x[1];
          return { q: "Shark had " + x[0] + " football cards. Maestro gave him some more. Now Shark has " + c + ". How many cards did Maestro give him?",
                   answer: String(x[1]), explain: x[0] + " + ? = " + c + ". Count on from " + x[0] + " to " + c + ": that's " + x[1] + "." }; },
        function () { var x = sumUpTo(20, 3), c = x[0] + x[1];
          return { q: "Shark had some football cards. Maestro gave him " + x[1] + " more. Now he has " + c + ". How many cards did Shark have at first?",
                   answer: String(x[0]), explain: "? + " + x[1] + " = " + c + ". " + c + " − " + x[1] + " = " + x[0] + "." }; },
        function () { var c = R(8, 20), b = R(2, c - 2);
          return { q: "Mom Tanya made " + c + " baursaks. Dad Maxim ate " + b + ". How many baursaks are left?", answer: String(c - b) }; },
        function () { var c = R(8, 20), a = R(1, c - 2);
          return { q: "There were " + c + " baursaks on the table. Dad Maxim ate some. Now there are " + a + " left. How many did Dad Maxim eat?",
                   answer: String(c - a), explain: c + " − ? = " + a + ". " + c + " − " + a + " = " + (c - a) + ". Dad Maxim loves baursaks! 😋" }; },
        function () { var x = sumUpTo(20, 3);
          return { q: "On Fighting Day, Shark won " + x[0] + " fights and Maestro won " + x[1] + ". How many fights were there in all?", answer: String(x[0] + x[1]) }; },
        function () { var p = players(2), a = R(6, 19), b = R(1, a - 1);
          return { q: p[0] + " scored " + goals(a) + ". " + p[1] + " scored " + goals(b) + ". How many more goals did " + p[0] + " score?",
                   answer: String(a - b), explain: a + " − " + b + " = " + (a - b) + "." }; },
        function () { var x = sumUpTo(20, 3);
          return { q: "Maestro did " + x[0] + " push-ups. Shark did " + x[1] + " MORE than Maestro. How many push-ups did Shark do?",
                   answer: String(x[0] + x[1]), explain: x[0] + " + " + x[1] + " = " + (x[0] + x[1]) + ". Shark is stronger! 💪" }; },
        function () { var c = R(10, 20), b = R(2, 9);
          return { q: "Dad Maxim rode his longboard for " + c + " minutes. Shark rode for " + b + " FEWER minutes. How many minutes did Shark ride?",
                   answer: String(c - b), unit: "min", explain: "Fewer means take away: " + c + " − " + b + " = " + (c - b) + "." }; },
        function () { var c = R(10, 20), a = R(3, c - 3);
          return { q: "Mom Tanya's agency has " + c + " clients. " + a + " of them are food shops. The rest sell football boots. How many clients sell football boots?",
                   answer: String(c - a) }; }
      ];
      return mix(makers.slice()).slice(0, 9).map(function (m) { return m(); });
    }
  });

  // ===================== UNIT 3: WITHIN 20 =====================
  TESTS.push({
    id: "en-u3-make10", subject: S, topic: U3,
    title: "Make a ten: 8 + 5, 14 − 6", count: 10,
    generate: function () {
      return mix(many(10, function (i) {
        var a = R(3, 9), b = R(Math.max(2, 11 - a), 9), c = a + b;
        if (i < 4) return { q: a + " + " + b + " = ?", answer: String(c),
          explain: "Make a ten: " + a + " + " + (10 - a) + " = 10, then 10 + " + (c - 10) + " = " + c + "." };
        if (i < 6) { var d = R(3, 9);
          return { q: "Double it! " + d + " + " + d + " = ?", answer: String(d + d), explain: "Doubles: " + d + " + " + d + " = " + (d + d) + "." }; }
        return { q: c + " − " + b + " = ?", answer: String(a),
          explain: "Think addition: " + b + " + ? = " + c + ". The answer is " + a + "." };
      }));
    }
  });

  TESTS.push({
    id: "en-u3-equations", subject: S, topic: U3,
    title: "True or false? Missing numbers", count: 8,
    generate: function () {
      var qs = many(4, function () {
        var a = R(3, 9), b = R(3, 9), real = a + b, shown = Math.random() < 0.5 ? real : real + pick([-2, -1, 1, 2]);
        return { q: "True or false?\n" + a + " + " + b + " = " + shown, options: ["True ✅", "False ❌"], keepOrder: true,
                 answer: shown === real ? 0 : 1, explain: a + " + " + b + " = " + real + "." };
      });
      qs = qs.concat(many(3, function () {
        var a = R(3, 9), b = R(3, 9);
        return { q: a + " + □ = " + (a + b), answer: String(b), explain: (a + b) + " − " + a + " = " + b + "." };
      }));
      var t = R(11, 18), right = [t - 9, 9];
      var opts = [right[0] + " + " + right[1], (t - 8 + 1) + " + 8", (t - 6 - 1) + " + 6"];
      qs.push({ q: "Which one is equal to 10 + " + (t - 10) + "?", options: opts, answer: 0,
                explain: "10 + " + (t - 10) + " = " + t + " and " + right[0] + " + " + right[1] + " = " + t + "." });
      return mix(qs);
    }
  });

  // ===================== UNIT 4: NUMBERS TO 99 =====================
  TESTS.push({
    id: "en-u4-tens", subject: S, topic: U4,
    title: "Tens and ones", count: 9,
    generate: function () {
      var makers = [
        function () { var t = R(2, 9), o = R(0, 9); return { q: t + " tens and " + o + " ones = ?", answer: String(t * 10 + o) }; },
        function () { var n = R(21, 99); return { q: "How many TENS are in " + n + "?", answer: String(Math.floor(n / 10)),
          explain: n + " = " + to(n) + "." }; },
        function () { var n = R(21, 99); return { q: "How many ONES are in " + n + "?", answer: String(n % 10),
          explain: n + " = " + to(n) + "." }; },
        function () { var t = R(2, 9), o = R(1, 9);
          return { q: "Shark has " + t + " bags with 10 footballs in each, and " + o + " more balls. How many balls does he have?",
                   answer: String(t * 10 + o), explain: to(t * 10 + o) + " = " + (t * 10 + o) + "." }; },
        function () { var s = R(1, 5) * 10; return { q: "Count by 10s: " + s + ", " + (s + 10) + ", " + (s + 20) + ", ?", answer: String(s + 30) }; },
        function () { var n = R(11, 89); return { q: "What is 10 MORE than " + n + "?", answer: String(n + 10), explain: "Add one ten: " + n + " + 10 = " + (n + 10) + "." }; },
        function () { var n = R(20, 99); return { q: "What is 10 LESS than " + n + "?", answer: String(n - 10), explain: "Take away one ten: " + n + " − 10 = " + (n - 10) + "." }; },
        function () { var n = pick([29, 39, 49, 59, 69, 79, 89]); return { q: "What number comes right after " + n + "?", answer: String(n + 1) }; },
        function () { var n = R(21, 99);
          return { q: "Dad Maxim counted his curls: " + n + "! How many tens and ones is that? 🧑‍🦱",
                   options: [to(n), to((n % 10) * 10 + Math.floor(n / 10)), n + " tens"],
                   answer: 0 }; }
      ];
      var qs = mix(makers.slice()).map(function (m) { return m(); });
      // варианты в последнем вопросе могут совпасть (например, 55) — заменим такой вопрос
      return qs.map(function (q) {
        if (q.options && q.options[0] === q.options[1]) return { q: "What is 10 more than 45?", answer: "55" };
        return q;
      });
    }
  });

  TESTS.push({
    id: "en-u4-compare", subject: S, topic: U4,
    title: "Compare: >, <, =", count: 8,
    generate: function () {
      var qs = many(6, function () {
        var a = R(10, 99), b = Math.random() < 0.15 ? a : (Math.random() < 0.5 ? (a % 10) * 10 + Math.floor(a / 10) : R(10, 99));
        if (b < 10) b = R(10, 99);
        return { q: "Compare: " + a + " … " + b, options: [">", "<", "="], keepOrder: true, answer: a > b ? 0 : a < b ? 1 : 2,
                 explain: a === b ? "They are the same." : "Compare the tens first. If the tens are the same, compare the ones. The Shark's mouth eats the bigger number 🦈" };
      });
      var nums = []; while (nums.length < 4) { var n = R(10, 99); if (nums.indexOf(n) < 0) nums.push(n); }
      qs.push({ q: "Which number is the GREATEST?", options: nums.map(String), answer: nums.indexOf(Math.max.apply(null, nums)) });
      var p = players(2), a2 = R(20, 60), b2 = a2 + R(1, 9);
      qs.push({ q: "In a football video game, " + p[0] + " has " + a2 + " points and " + p[1] + " has " + b2 + " points. Who has more?",
                options: [p[0], p[1]], keepOrder: true, answer: 1 });
      return qs;
    }
  });

  // ===================== UNIT 5: ADDING WITHIN 100 =====================
  TESTS.push({
    id: "en-u5-add", subject: S, topic: U5,
    title: "Adding two-digit numbers", count: 10,
    generate: function () {
      var makers = [
        function () { var t = R(2, 8), o = R(1, 5), b = R(1, 9 - o); var a = t * 10 + o;      // 34 + 5
          return { q: a + " + " + b + " = ?", answer: String(a + b), explain: "Add the ones: " + o + " + " + b + " = " + (o + b) + ". " + (t * 10) + " + " + (o + b) + " = " + (a + b) + "." }; },
        function () { var t = R(2, 8), o = R(5, 9), b = R(Math.max(2, 11 - o), 9); var a = t * 10 + o;     // 38 + 7
          return { q: a + " + " + b + " = ?", answer: String(a + b),
                   explain: "Make the next ten: " + a + " + " + (10 - o) + " = " + (t * 10 + 10) + ", then + " + (b - (10 - o)) + " = " + (a + b) + "." }; },
        function () { var a = R(11, 59), b = R(1, Math.floor((99 - a) / 10)) * 10;            // 45 + 30
          return { q: a + " + " + b + " = ?", answer: String(a + b), explain: "Add the tens: " + Math.floor(a / 10) + " + " + (b / 10) + " = " + (Math.floor(a / 10) + b / 10) + " tens. The ones stay " + (a % 10) + ". So it's " + (a + b) + "." }; },
        function () { var a1 = R(1, 5), a0 = R(1, 4), b1 = R(1, 8 - a1), b0 = R(1, 9 - a0 - 1);  // 24 + 35
          var a = a1 * 10 + a0, b = b1 * 10 + b0;
          return { q: a + " + " + b + " = ?", answer: String(a + b),
                   explain: "Tens: " + (a1 * 10) + " + " + (b1 * 10) + " = " + ((a1 + b1) * 10) + ". Ones: " + a0 + " + " + b0 + " = " + (a0 + b0) + ". Together: " + (a + b) + "." }; },
        function () { var a1 = R(1, 5), a0 = R(5, 9), b1 = R(1, 8 - a1), b0 = R(10 - a0, 9);    // 27 + 18
          var a = a1 * 10 + a0, b = b1 * 10 + b0;
          return { q: a + " + " + b + " = ?", answer: String(a + b),
                   explain: "Tens: " + (a1 * 10) + " + " + (b1 * 10) + " = " + ((a1 + b1) * 10) + ". Ones: " + a0 + " + " + b0 + " = " + (a0 + b0) + " — that's a new ten! " + ((a1 + b1) * 10) + " + " + (a0 + b0) + " = " + (a + b) + "." }; },
        function () { var a = R(3, 9), b = R(1, a - 1);                                        // 70 − 30
          return { q: (a * 10) + " − " + (b * 10) + " = ?", answer: String((a - b) * 10), explain: a + " tens − " + b + " tens = " + (a - b) + " tens." }; }
      ];
      return many(10, function (i) { return makers[i % makers.length](); }).sort(function () { return Math.random() - 0.5; });
    }
  });

  TESTS.push({
    id: "en-u5-stories", subject: S, topic: U5,
    title: "Big number stories ⚽📱🛹", count: 8,
    generate: function () {
      function two(maxSum) { var a = R(12, maxSum - 12), b = R(10, maxSum - a); return [a, b]; }
      var makers = [
        function () { var x = two(99); return { q: "Shark has " + x[0] + " football cards. Maestro gives him " + x[1] + " more. How many cards does Shark have now?", answer: String(x[0] + x[1]) }; },
        function () { var x = two(99); return { q: "Dad Maxim rode his longboard for " + x[0] + " minutes on Saturday and " + x[1] + " minutes on Sunday. How many minutes in all?", answer: String(x[0] + x[1]), unit: "min" }; },
        function () { var x = two(99); return { q: "Mom Tanya's ad got " + x[0] + " likes in the morning and " + x[1] + " likes in the evening. How many likes in all? 📱", answer: String(x[0] + x[1]),
                                                explain: "Great marketing, Mom Tanya! 📈" }; },
        function () { var a = R(3, 9) * 10, b = R(1, a / 10 - 1) * 10; return { q: "There were " + a + " fans on the stadium bus. " + b + " fans got off. How many fans are still on the bus?", answer: String(a - b) }; },
        function () { var x = two(99); return { q: "Shark punched the bag " + x[0] + " times. Dad Maxim punched it " + x[1] + " times. How many punches in all? 🥊", answer: String(x[0] + x[1]) }; },
        function () { var x = two(99); return { q: "Dad Maxim fixed " + x[0] + " bugs in his code on Monday and " + x[1] + " on Tuesday. How many bugs did he fix? 🐛", answer: String(x[0] + x[1]),
                                                explain: "A bug is a mistake in a computer program. Dad Maxim catches them like a goalkeeper! 🧤" }; },
        function () { var x = two(99); return { q: "Mom Tanya bought " + x[0] + " baursaks for the party and Maestro brought " + x[1] + " more. How many baursaks are there?", answer: String(x[0] + x[1]) }; },
        function () { var a = R(2, 6) * 10 + R(1, 9), b = R(1, 3) * 10; return { q: "Shark counted " + a + " curls on Dad Maxim's head. After a shower he found " + b + " more! How many curls now? 🧑‍🦱", answer: String(a + b) }; },
        function () { var a = R(20, 60), b = R(10, 30); return { q: "Haaland ran " + a + " meters, then " + b + " more meters to score a goal. How many meters did he run?", answer: String(a + b), unit: "m" }; }
      ];
      return mix(makers.slice()).slice(0, 8).map(function (m) { return m(); });
    }
  });

  // ===================== UNIT 6: LENGTH & NUMBERS TO 120 =====================
  TESTS.push({
    id: "en-u6-length", subject: S, topic: U6,
    title: "Measuring length 📏",
    questions: [
      { q: "The pencil is 9 cubes long. The crayon is 5 cubes long. How much longer is the pencil?", answer: "4", unit: "cubes" },
      { q: "Dad Maxim's longboard is 95 cm long. Shark's skateboard is 60 cm long. How much longer is the longboard?", answer: "35", unit: "cm",
        explain: "95 − 60: take away 6 tens. 9 tens − 6 tens = 3 tens, and 5 ones stay. 35 cm." },
      { q: "Which is the LONGEST?", options: ["a football pitch ⚽", "a football boot 👟", "a goal 🥅"], answer: 0 },
      { q: "Which is the SHORTEST?", options: ["a baursak", "Dad Maxim's longboard", "Mom Tanya's car"], answer: 0 },
      { q: "When we measure with cubes, the cubes should…", options: ["touch, with no gaps and no overlaps", "have big gaps between them", "be on top of each other"], answer: 0 },
      { q: "A book is 8 paper clips long. Shark measures it with BIGGER clips. Will he need more or fewer clips?",
        options: ["fewer clips", "more clips", "the same number"], answer: 0, keepOrder: true,
        explain: "Bigger units → you need fewer of them." },
      { q: "Maestro is 18 cubes tall in a drawing. Shark is 11 cubes tall. How much taller is Maestro?", answer: "7", unit: "cubes" },
      { q: "What number comes right after 109?", answer: "110" },
      { q: "What number comes right after 119?", answer: "120" },
      { q: "Count on: 97, 98, 99, ?", answer: "100" },
      { q: "Count by 10s: 80, 90, 100, ?", answer: "110" }
    ]
  });

  // ===================== UNIT 7: GEOMETRY & TIME =====================
  TESTS.push({
    id: "en-u7-shapes", subject: S, topic: U7,
    title: "Shapes, halves and fourths 🔺🍕",
    questions: [
      { q: "How many sides does a triangle have? 🔺", answer: "3" },
      { q: "How many corners does a rectangle have?", answer: "4" },
      { q: "How many sides does a hexagon have? ⬡", answer: "6" },
      { q: "Which shape has NO corners?", options: ["circle ⚪", "square 🟥", "triangle 🔺"], answer: 0 },
      { q: "What shape is a football pitch?", options: ["rectangle", "circle", "triangle"], answer: 0 },
      { q: "Mom Tanya cut a round cake into 2 EQUAL parts. Each part is a…", options: ["half", "fourth", "whole"], answer: 0, keepOrder: true },
      { q: "Mom Tanya cut a pizza into 4 EQUAL parts. Each part is a…", options: ["fourth (a quarter)", "half", "whole"], answer: 0, keepOrder: true },
      { q: "How many halves make one whole?", answer: "2" },
      { q: "How many fourths make one whole?", answer: "4" },
      { q: "Which piece of the same pizza is BIGGER?", options: ["a half", "a fourth", "they are the same"], answer: 0, keepOrder: true,
        explain: "When you cut into more equal parts, each part gets smaller." }
    ]
  });

  TESTS.push({
    id: "en-u7-time", subject: S, topic: U7,
    title: "Tell time: o'clock and half past 🕒", count: 8,
    generate: function () {
      function clock(h, half) { return String.fromCodePoint((half ? 0x1F55C : 0x1F550) + h - 1); }
      function txt(h, half) { return h + (half ? ":30" : ":00"); }
      var qs = many(6, function () {
        var h = R(1, 12), half = Math.random() < 0.5;
        var wrong1 = txt(h, !half), wrong2 = txt(h === 12 ? 1 : h + 1, half);
        return { q: "What time is it?", pic: clock(h, half), options: [txt(h, half), wrong1, wrong2], answer: 0,
                 explain: half ? "The long hand points to 6 — that's half past " + h + "." : "The long hand points to 12 — that's " + h + " o'clock." };
      });
      var s = R(1, 8);
      qs.push({ q: "Fighting Day starts at " + s + ":00. Shark and Maestro fight for 1 hour. When does it end?",
                options: [(s + 1) + ":00", s + ":30", (s + 2) + ":00"], answer: 0 });
      var t = R(1, 10);
      qs.push({ q: "Dad Maxim starts his longboard ride at " + t + ":00 and rides for half an hour. When does he finish?",
                options: [t + ":30", (t + 1) + ":00", (t + 1) + ":30"], answer: 0 });
      return qs;
    }
  });

  // ===================== HEROES =====================
  TESTS.push({
    id: "en-fight", subject: S, topic: U8,
    title: "Fighting Day: Shark vs Maestro 🤼",
    questions: [
      { q: "On Fighting Day, Shark pinned Maestro 14 times. Maestro pinned Shark 6 times. How many more times did Shark win?", answer: "8",
        explain: "14 − 6 = 8. Maestro wants a rematch! 🤼" },
      { q: "Round 1 lasted 25 seconds. Round 2 lasted 30 seconds. How long did they fight in all?", answer: "55", unit: "sec" },
      { q: "Maestro shouted «I give up!» 17 times. Shark shouted it 0 times. How many times did they shout it in all?", answer: "17",
        explain: "17 + 0 = 17. Sharks never give up! 🦈" },
      { q: "There were 40 pillows for the pillow fight. Shark threw 20 of them. How many pillows are left?", answer: "20" },
      { q: "Shark won 9 fights in the morning and 8 in the evening. How many fights did he win?", answer: "17",
        explain: "Make a ten: 9 + 1 = 10, 10 + 7 = 17." },
      { q: "Shark won 23 fights this month. Maestro won 10 fewer. How many fights did Maestro win?", answer: "13" },
      { q: "Who usually wins on Fighting Day?", options: ["Shark 🦈", "Maestro 🎩"], answer: 0, keepOrder: true,
        explain: "Of course it's Shark! 😄" },
      { q: "Maestro did 35 squats. Shark did 10 more. How many squats did Shark do?", answer: "45" }
    ]
  });

  TESTS.push({
    id: "en-family", subject: S, topic: U8,
    title: "Mom Tanya & Dad Maxim 👩‍💼🧑‍💻",
    questions: [
      { q: "Mom Tanya cooked beshbarmak. There were 16 pieces of meat. Shark ate 7. How many pieces are left?", answer: "9" },
      { q: "Mom Tanya bought 24 pieces of kazy, then 15 more. How many pieces of kazy does she have now?", answer: "39",
        explain: "Kazy is a tasty Kazakh sausage. Mom Tanya LOVES it! 😋" },
      { q: "Mom Tanya helped a shop with an ad. Before the ad, 12 people came in. After the ad, 30 more people came. How many people came in all?", answer: "42",
        explain: "That's what good marketing does! 📈" },
      { q: "Mom Tanya wrote 18 posts. She has shared 9. How many posts are not shared yet?", answer: "9" },
      { q: "Dad Maxim has 47 curls. Shark found 20 more under his cap! How many curls now?", answer: "67",
        explain: "47 + 20: add 2 tens. 4 tens + 2 tens = 6 tens, 7 ones stay. 67 — SIX SEVEN! 🤲" },
      { q: "Dad Maxim rode his longboard 8 laps. Shark rode his scooter 5 laps. How many laps in all?", answer: "13" },
      { q: "In boxing class, Shark punched the bag 38 times. Dad Maxim punched it 40 times. How many punches in all?", answer: "78" },
      { q: "Dad Maxim fixed 50 bugs. Then he fixed 30 more. How many bugs did he fix?", answer: "80" }
    ]
  });

  TESTS.push({
    id: "en-final", subject: S, topic: U8,
    title: "The Big Match: mixed review 🏆", count: 12,
    mixFrom: S
  });
})();
