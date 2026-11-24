// Список предметов. id используется в файлах с тестами (поле subject).
window.SUBJECTS = [
  { id: "math",    name: "Математика",            icon: "🔢", color: "#5b6cff" },
  { id: "russian", name: "Русский язык",          icon: "✍️", color: "#e5484d" },
  { id: "world",   name: "Окружающий мир",        icon: "🌍", color: "#22a85a" },
  { id: "reading", name: "Литературное чтение",   icon: "📖", color: "#f59e0b" },
  { id: "english", name: "Английский язык",       icon: "🇬🇧", color: "#0ea5e9" },
  // Раздел Артемия (1 класс): свой профиль — герои, фразы, карточки (см. js/fun.js)
  { id: "artemy",  name: "Математика для Акулы",  icon: "⚽", color: "#16a34a",
    profile: "artemy", owner: "Артемий", ownerTitle: "Раздел Артемия", grade: "1 класс" },
  { id: "artemy_en", name: "Shark's Math (English)", icon: "🇺🇸", color: "#16a34a",
    profile: "artemy_en", owner: "Артемий", ownerTitle: "Раздел Артемия", grade: "Illustrative Mathematics · Grade 1" }
];

// Сюда каждый файл предмета добавляет свои тесты.
window.TESTS = [];
