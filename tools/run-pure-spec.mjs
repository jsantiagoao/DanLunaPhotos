/**
 * Runner mínimo para specs de LÓGICA PURA (sin Angular, DOM ni snapshots).
 *
 * Existe porque en esta máquina Jest 30 no arranca: la ruta del workspace contiene un '@'
 * (santiago.aguillon@2bcore.com) y el resolver de Jest lo rechaza (falla al resolver el
 * preset y cualquier módulo, incluso con rutas absolutas o junctions — usa realpath). Como
 * los repos no se pueden mover, este runner permite seguir TDD sobre funciones puras.
 *
 * Qué hace: transpila el spec y todos los módulos .ts que importa (en cascada) a .mjs
 * temporales, y los corre en Node (que no sufre el bug del '@') con un shim de
 * describe/it/expect. NO sirve para specs que importan componentes Angular, TestBed o DOM.
 *
 * Uso:
 *   node tools/run-pure-spec.mjs src/app/pages/navidad/christmas-booking.logic.spec.ts
 *   node tools/run-pure-spec.mjs   (sin args: corre todas las specs de lógica pura conocidas)
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { dirname, resolve as resolvePath } from 'node:path';
import ts from 'typescript';

// ── mini framework ────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const stack = [];
const failures = [];

globalThis.describe = (name, fn) => { stack.push(name); fn(); stack.pop(); };
globalThis.it = (name, fn) => {
  try { fn(); passed++; }
  catch (e) { failed++; failures.push(`${stack.join(' > ')} > ${name}\n    ${e.message}`); }
};
globalThis.beforeEach = (fn) => fn();  // suficiente para specs puras simples
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
globalThis.expect = (actual) => ({
  toBe: (e) => { if (actual !== e) throw new Error(`esperaba ${JSON.stringify(e)}, obtuvo ${JSON.stringify(actual)}`); },
  toEqual: (e) => { if (!eq(actual, e)) throw new Error(`esperaba ${JSON.stringify(e)}, obtuvo ${JSON.stringify(actual)}`); },
  toBeNull: () => { if (actual !== null) throw new Error(`esperaba null, obtuvo ${JSON.stringify(actual)}`); },
  toBeUndefined: () => { if (actual !== undefined) throw new Error(`esperaba undefined, obtuvo ${JSON.stringify(actual)}`); },
  toBeTruthy: () => { if (!actual) throw new Error(`esperaba truthy, obtuvo ${JSON.stringify(actual)}`); },
  toBeFalsy: () => { if (actual) throw new Error(`esperaba falsy, obtuvo ${JSON.stringify(actual)}`); },
  toContain: (e) => { if (!String(actual).includes(e)) throw new Error(`"${actual}" no contiene "${e}"`); },
  toHaveLength: (n) => { if (actual?.length !== n) throw new Error(`esperaba longitud ${n}, obtuvo ${actual?.length}`); },
  toBeGreaterThan: (n) => { if (!(actual > n)) throw new Error(`esperaba > ${n}, obtuvo ${actual}`); },
  toBeLessThan: (n) => { if (!(actual < n)) throw new Error(`esperaba < ${n}, obtuvo ${actual}`); },
  not: {
    toBeNull: () => { if (actual === null) throw new Error('esperaba no-null'); },
    toBe: (e) => { if (actual === e) throw new Error(`no esperaba ${JSON.stringify(e)}`); },
    toContain: (e) => { if (String(actual).includes(e)) throw new Error(`"${actual}" no debia contener "${e}"`); },
  },
});

// ── transpila un .ts a .mjs, reescribiendo imports relativos a .mjs ─────────────
const OPTS = { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } };
const tempFiles = new Set();

function tsToMjs(tsPath) { return tsPath.replace(/\.ts$/, '.__pure.mjs'); }

/** Transpila tsPath y, en cascada, cada módulo .ts relativo que importe. */
function transpileWithDeps(tsPath, seen = new Set()) {
  const abs = resolvePath(tsPath);
  if (seen.has(abs)) return;
  seen.add(abs);

  let src = readFileSync(abs, 'utf8');
  const dir = dirname(abs);

  // Reescribe imports relativos ('./x' / '../x') para que apunten a los .mjs temporales,
  // y transpila esas dependencias tambien.
  src = src.replace(/(from\s+|import\s*\()\s*['"](\.[^'"]+)['"]/g, (m, kw, rel) => {
    let depTs = resolvePath(dir, rel);
    if (!depTs.endsWith('.ts')) depTs += '.ts';
    if (existsSync(depTs)) {
      transpileWithDeps(depTs, seen);
      const relMjs = rel.endsWith('.ts') ? rel.replace(/\.ts$/, '.__pure.mjs') : rel + '.__pure.mjs';
      return `${kw}'${relMjs}'`;
    }
    return m;
  });

  const js = ts.transpileModule(src, { ...OPTS, fileName: abs }).outputText;
  const outPath = tsToMjs(abs);
  writeFileSync(outPath, js);
  tempFiles.add(outPath);
}

// ── specs de lógica pura conocidas (sin Angular) ────────────────────────────────
const PURE_SPECS = [
  'src/app/pages/navidad/christmas-booking.logic.spec.ts',
  'src/app/pages/navidad/christmas-calendar.model.spec.ts',
  'src/app/pages/navidad/christmas-slots.spec.ts',
  'src/app/pages/agendar/booking.logic.spec.ts',
];

const args = process.argv.slice(2);
const specs = args.length ? args : PURE_SPECS;

for (const spec of specs) {
  if (!existsSync(spec)) { console.log(`(omitido, no existe) ${spec}`); continue; }
  const before = { passed, failed };
  transpileWithDeps(spec);
  try {
    await import(pathToFileURL(tsToMjs(resolvePath(spec))).href);
  } catch (e) {
    failed++;
    failures.push(`${spec} (error al cargar)\n    ${e.message}`);
  }
  const dp = passed - before.passed, df = failed - before.failed;
  console.log(`  ${spec}: ${dp} passed${df ? `, ${df} failed` : ''}`);
}

// limpia los .mjs temporales
for (const f of tempFiles) { try { unlinkSync(f); } catch {} }

console.log(`\nTOTAL: ${passed} passed, ${failed} failed`);
if (failures.length) { console.log('\nFALLOS:\n' + failures.join('\n')); process.exit(1); }
