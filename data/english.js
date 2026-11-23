// Английский язык. Как добавлять тесты — см. подсказку в начале файла data/math.js

TESTS.push({
  id: "eng-words-animals",
  subject: "english",
  topic: "Слова",
  title: "Животные (Animals)",
  questions: [
    { q: "Как по-английски «собака»?", answer: "dog" },
    { q: "Как по-английски «кошка»?", answer: "cat" },
    { q: "Как переводится слово «horse»?", options: ["корова", "лошадь", "свинья", "овца"], answer: 1 },
    { q: "Как переводится слово «rabbit»?", options: ["кролик", "крыса", "белка", "лиса"], answer: 0 },
    { q: "Как по-английски «птица»?", answer: "bird" },
    { q: "Как переводится слово «bear»?", options: ["пчела", "медведь", "волк", "бобр"], answer: 1 }
  ]
});

TESTS.push({
  id: "eng-to-be",
  subject: "english",
  topic: "Грамматика",
  title: "Глагол to be (am / is / are)",
  questions: [
    { q: "I ___ a pupil.", options: ["am", "is", "are"], answer: 0, keepOrder: true },
    { q: "She ___ my sister.", options: ["am", "is", "are"], answer: 1, keepOrder: true },
    { q: "They ___ friends.", options: ["am", "is", "are"], answer: 2, keepOrder: true },
    { q: "It ___ a cat.", options: ["am", "is", "are"], answer: 1, keepOrder: true },
    { q: "We ___ at school.", options: ["am", "is", "are"], answer: 2, keepOrder: true },
    { q: "You ___ ten years old.", options: ["am", "is", "are"], answer: 2, keepOrder: true,
      explain: "С местоимением you всегда используется are." }
  ]
});
