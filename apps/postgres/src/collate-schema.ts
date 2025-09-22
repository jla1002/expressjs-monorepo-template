import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function collateSchemas() {
  const baseSchemaPath = path.join(__dirname, "../prisma/schema.prisma");
  const baseSchema = await fs.readFile(baseSchemaPath, "utf-8");

  const libsDir = path.join(__dirname, "../../../libs");
  const schemaPaths = globSync("*/prisma/*.prisma", {
    cwd: libsDir,
    absolute: true
  });

  let combinedSchema = baseSchema;
  const definedModels = new Set<string>();
  const definedEnums = new Set<string>();

  for (const schemaPath of schemaPaths) {
    const schemaContent = await fs.readFile(schemaPath, "utf-8");

    // Extract models
    const modelDefinitions = schemaContent.match(/^model\s+\w+\s*{[\s\S]*?^}/gm);
    if (modelDefinitions) {
      for (const model of modelDefinitions) {
        const modelNameMatch = model.match(/^model\s+(\w+)/);
        if (modelNameMatch && !definedModels.has(modelNameMatch[1])) {
          combinedSchema += `\n${model}`;
          definedModels.add(modelNameMatch[1]);
        }
      }
    }

    // Extract enums
    const enumDefinitions = schemaContent.match(/^enum\s+\w+\s*{[\s\S]*?^}/gm);
    if (enumDefinitions) {
      for (const enumDef of enumDefinitions) {
        const enumNameMatch = enumDef.match(/^enum\s+(\w+)/);
        if (enumNameMatch && !definedEnums.has(enumNameMatch[1])) {
          combinedSchema += `\n${enumDef}`;
          definedEnums.add(enumNameMatch[1]);
        }
      }
    }
  }

  const distDir = path.join(__dirname, "../dist");
  await fs.mkdir(distDir, { recursive: true });
  await fs.writeFile(path.join(distDir, "schema.prisma"), combinedSchema);

  console.log(`✅ Prisma schema collated successfully!`);
  console.log(`📊 Total: ${definedModels.size} models, ${definedEnums.size} enums`);
}

collateSchemas().catch((error) => {
  console.error("❌ Error collating schemas:", error);
  process.exit(1);
});
