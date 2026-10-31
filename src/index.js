const isNumeric = (s) => /^-?\d+(\.\d+)?$/.test(s);

/**
 * @param {string[]} argv
 * @param {{boolean?: string[], string?: string[], alias?: Record<string,string>, defaults?: object}} [options]
 *   `alias` maps a short or alternate name to the canonical name.
 */
export function parseArgs(argv, { boolean = [], string = [], alias = {}, defaults = {} } = {}) {
  const bools = new Set(boolean);
  const strs = new Set(string);
  const canon = (k) => alias[k] ?? k;
  const out = { _: [] };
  const seen = new Set();

  const coerce = (key, raw) => (strs.has(key) || !isNumeric(raw) ? raw : Number(raw));
  const set = (key, value) => {
    if (seen.has(key)) out[key] = [].concat(out[key], value); // repeated option becomes an array
    else out[key] = value;
    seen.add(key);
  };
  const takesValue = (key) => !bools.has(key);
  const nextIsValue = (i) => i + 1 < argv.length && (!argv[i + 1].startsWith("-") || isNumeric(argv[i + 1]));

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") { out._.push(...argv.slice(i + 1)); break; }

    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      if (eq !== -1) {
        const key = canon(arg.slice(2, eq));
        set(key, coerce(key, arg.slice(eq + 1)));
      } else if (arg.startsWith("--no-")) {
        set(canon(arg.slice(5)), false);
      } else {
        const key = canon(arg.slice(2));
        if (takesValue(key) && nextIsValue(i)) set(key, coerce(key, argv[++i]));
        else set(key, true);
      }
    } else if (arg.length > 1 && arg.startsWith("-") && !isNumeric(arg)) {
      const letters = [...arg.slice(1)];
      letters.forEach((letter, idx) => {
        const key = canon(letter);
        const isLast = idx === letters.length - 1;
        if (isLast && takesValue(key) && nextIsValue(i)) set(key, coerce(key, argv[++i]));
        else set(key, true);
      });
    } else {
      out._.push(strs.has("_") || !isNumeric(arg) ? arg : Number(arg));
    }
  }

  for (const [k, v] of Object.entries(defaults)) if (!(k in out)) out[k] = v;
  for (const k of bools) if (!(k in out)) out[k] = false;
  return out;
}
