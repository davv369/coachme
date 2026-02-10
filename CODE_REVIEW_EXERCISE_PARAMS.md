# Code review: Exercise parameters (defaults only, steps validation per WorkoutType)

## Zakres zmian

- **parametersTemplate**: tylko `defaults` (bez schema) w request/response/entity/DB.
- **Walidacja steps**: kształt + dozwolone `duration.type` i `intensity.type` / `secondaryIntensity.type` zależne od `workoutType`.
- **Jedno źródło prawdy** dla typów kroków: `WORKOUT_STEP_TYPES` → typ `WorkoutStepType` + Set w walidatorze.

---

## Co jest dobre

### Architektura i spójność
- **Domain bez frameworka** – `workout-parameters.types.ts`, `workout-parameters.handler.ts`, `workout-steps.validator.ts` są czystym domainem (tylko WorkoutType z enum).
- **Jedna lista step types** – `WORKOUT_STEP_TYPES` w types, walidator używa `new Set(WORKOUT_STEP_TYPES)` – brak duplikacji.
- **Spójne typy** – `DurationType`/`TargetType` wyciągnięte z unionów, mapowania `WORKOUT_TYPE_DURATION_TYPES` / `WORKOUT_TYPE_TARGET_TYPES` w jednym miejscu.
- **Kolejność w create** – najpierw `filterDefaultsForWorkoutType`, potem `validateStepsShape(defaults.steps, command.workoutType)` – filtrowane defaults są podstawą walidacji.

### Walidacja
- **Komunikaty błędów** – zawierają ścieżkę (`steps[0]`, `steps[1].steps[0]`) oraz listę dozwolonych wartości.
- **Repeat** – rekurencja z tym samym `workoutType`; `intensity`/`secondaryIntensity` opcjonalne (walidacja tylko gdy obecne).
- **DomainException + InternalErrorCode.VALIDATION_ERROR** – zgodne z konwencją projektu.

### API i porty
- **DTO** – `parametersTemplate: { defaults }`, opis w Swaggerze jasny.
- **Entity / out-port / in-port** – wszędzie `parametersTemplate: { defaults }`, bez schema.
- **Repository** – zapis/odczyt tylko `defaults` w JSONB (`parameters_template`).

---

## Uwagi (opcjonalne)

1. **Repository – walidacja**  
   W `exercise.database.repository.ts` nadal jest `throw new Error(...)` przy braku name/description/workoutType/parametersTemplate. Zgodnie z regułami projektu lepiej `DomainException` + `InternalErrorCode`. To raczej ostatnia linia obrony (application layer już waliduje), więc można zostawić na później lub ujednolicić.

2. **HIKING – primary step**  
   Backend: `WORKOUT_TYPE_PRIMARY_STEP[HIKING]: 'hike'`. W integration-test w `WORKOUT_TYPE_PRIMARY_STEP` jest `HIKING: 'run'`. Warto ustalić jedną konwencję (hike vs run) i zsynchronizować oba repozytoria.

3. **Plik `as-typed-parameters.examples.ts`** (untracked)  
   Ma błędy ESLint (unused vars, unused expressions). Albo go dodać i naprawić, albo nie commitować – żeby `npm run lint` przechodził na głównym zestawie plików.

4. **Jest**  
   Są dwa pliki konfiguracyjne (`jest.config.js` i `jest.config.ts`) – wybrać jeden, żeby `npm test` działał bez `--config`.

---

## Checklist przed merge

- [x] Typy i stałe w domain (WORKOUT_STEP_TYPES, duration/target per WorkoutType).
- [x] Walidator steps z `workoutType`, jedno źródło dla step types.
- [x] Serwis: filterDefaults → validateStepsShape(steps, workoutType).
- [x] Entity, DTO, porty, repository – tylko `defaults`, bez schema.
- [x] Lint: zmienione pliki są czyste (błędy tylko w untracked `as-typed-parameters.examples.ts`).
- [ ] Testy: uruchomić ręcznie (np. `npm test -- --config jest.config.ts`) lub z coachme-integration-test.
- [ ] Zsynchronizować HIKING (hike vs run) z integration-test, jeśli uznane za potrzebne.

---

## Propozycja merge

```bash
# coachme
git add src/common/dto/exercises/create-exercise.dto.ts \
  src/modules/api-gateway/application/ports/out/exercise.out-port.ts \
  src/modules/exercises/application/ports/in/exercise.in-port.ts \
  src/modules/exercises/application/ports/out/exercise-repository.out-port.ts \
  src/modules/exercises/application/services/exercise.service.ts \
  src/modules/exercises/domain/exercise.entity.ts \
  src/modules/exercises/domain/exercise.examples.ts \
  src/modules/exercises/domain/workout-parameters.handler.ts \
  src/modules/exercises/domain/workout-parameters.types.ts \
  src/modules/exercises/domain/workout-steps.validator.ts \
  src/modules/exercises/infrastructure/adapters/out/persistence/database/exercise.database.repository.ts
git status   # upewnij się, że nie ma niechcianych plików
git commit -m "refactor(exercises): parametersTemplate defaults only, step duration/target validation per WorkoutType"
```

Nie dodawaj do commitu: `REFACTOR_CHECKLIST.md`, `STRAVA_*.md`, `WEBHOOK_DEBUG.md` (chyba że celowo), ani `as-typed-parameters.examples.ts` przed poprawką lintu.
