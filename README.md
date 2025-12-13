# coachMe

Minimalny projekt NestJS z Hexagonal Architecture.

## 🚀 Uruchomienie

```bash
npm install
npm run start:dev
```

Aplikacja będzie dostępna na http://localhost:3000

## 📁 Struktura

```
src/
├── common/          # Wspólne moduły (logger, error-handling)
├── modules/         # Moduły biznesowe (puste na start)
├── app.module.ts    # Główny moduł
└── main.ts          # Punkt wejścia
```

## 🏗️ Następne kroki

1. Utwórz pierwszy moduł: `./generate_module.sh my-module`
2. Dodaj moduł do `app.module.ts`
3. Rozwijaj stopniowo!

