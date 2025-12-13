#!/bin/bash

# Usage: ./generate_module.sh <module_name>
if [ -z "$1" ]; then
  echo "Usage: $0 <module_name>"
  exit 1
fi

INPUT="$1"
# lower-case with hyphens, e.g. game-engine
moduleLower=$(echo "$INPUT" | tr '[:upper:]' '[:lower:]')
# PascalCase without hyphens, e.g. GameEngine
moduleCap=$(echo "$moduleLower" | sed -E 's/(^|-)([a-z])/\U\2/g' | sed 's/-//g')
# UPPER_WITH_UNDERSCORES for constants, e.g. GAME_ENGINE
moduleUpper=$(echo "$moduleLower" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
# camelCase for variables and methods, e.g. gameEngine
moduleCamel="$(echo "${moduleCap:0:1}" | tr '[:upper:]' '[:lower:]')${moduleCap:1}"

MODULE_DIR="./src/modules/${moduleLower}"

mkdir -p "${MODULE_DIR}/application/ports/in"
mkdir -p "${MODULE_DIR}/application/ports/out"
mkdir -p "${MODULE_DIR}/application/services"
mkdir -p "${MODULE_DIR}/infrastructure/adapters/in/http"
mkdir -p "${MODULE_DIR}/infrastructure/adapters/in/internal"
mkdir -p "${MODULE_DIR}/infrastructure/adapters/out/persistence/in-memory"
mkdir -p "${MODULE_DIR}/domain"

echo "Module '${moduleLower}' structure created in '${MODULE_DIR}'"
echo ""
echo "Next steps:"
echo "1. Create your domain entities in ${MODULE_DIR}/domain/"
echo "2. Create ports in ${MODULE_DIR}/application/ports/"
echo "3. Create services in ${MODULE_DIR}/application/services/"
echo "4. Create adapters in ${MODULE_DIR}/infrastructure/adapters/"
echo "5. Create ${moduleLower}.module.ts in ${MODULE_DIR}/"
echo "6. Add module to app.module.ts"
echo "7. Update tsconfig.json with path mapping: '@${moduleLower}/*': ['./src/modules/${moduleLower}/*']"
echo "8. Update jest.config.ts with path mapping: '^@${moduleLower}/(.*)$': '<rootDir>/src/modules/${moduleLower}/\$1'"

