#!/usr/bin/env bash
set -e

echo "🚀 Initializing HMCTS Express Monorepo Template"
echo ""

# Prompt for team name
read -p "Enter team name (e.g., cath): " TEAM_NAME
if [ -z "$TEAM_NAME" ]; then
  echo "❌ Team name is required"
  exit 1
fi

# Prompt for product name
read -p "Enter product name (e.g., service): " PRODUCT_NAME
if [ -z "$PRODUCT_NAME" ]; then
  echo "❌ Product name is required"
  exit 1
fi

echo ""
echo "📝 Configuration:"
echo "  Team: $TEAM_NAME"
echo "  Product: $PRODUCT_NAME"
echo ""
read -p "Continue with these values? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
  echo "❌ Initialization cancelled"
  exit 1
fi

echo ""
echo "🔄 Replacing template values..."

# Function to replace strings in all files (excluding node_modules, .git, and dist)
replace_in_files() {
  local search="$1"
  local replace="$2"

  # Find all files excluding node_modules, .git, dist directories
  find . -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/.turbo/*" \
    -not -path "*/coverage/*" \
    -exec grep -l "$search" {} \; 2>/dev/null | while read -r file; do
    echo "  - $file"
    sed -i "s/$search/$replace/g" "$file"
  done
}

# Replace in order to avoid partial matches
echo "Replacing expressjs-monorepo-template..."
replace_in_files "expressjs-monorepo-template" "$PRODUCT_NAME"

echo "Replacing ExpressJS Monorepo Template..."
replace_in_files "ExpressJS Monorepo Template" "$PRODUCT_NAME"

echo "Replacing expressjs-monorepo..."
replace_in_files "expressjs-monorepo" "$PRODUCT_NAME"

echo "Replacing RPE (uppercase)..."
replace_in_files "RPE" "$(echo "$TEAM_NAME" | tr '[:lower:]' '[:upper:]')"

echo "Replacing rpe (lowercase)..."
replace_in_files "rpe" "$TEAM_NAME"

echo ""
echo "📦 Rebuilding lockfile..."
yarn install

echo ""
echo "🧪 Running tests..."
yarn test

echo ""
echo "🧹 Cleaning up initialization script..."
rm -f .github/scripts/init.sh

echo ""
echo "✅ Template initialization complete!"
echo ""
echo "Next steps:"
echo "  1. Review the changes: git diff"
echo "  2. Commit the changes: git add . && git commit -m 'Initialize from template'"
echo "  3. Push to your repository: git push"
echo ""
