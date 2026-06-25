/**
 * displayRef — canonical way to show any Leddar entity's reference.
 *
 * Prefers the entity's stored `ref` field (e.g. "ORD-A3K8T2").
 * Falls back to a formatted ID excerpt for legacy/null records.
 *
 * @param {Object}  entity  Any object with a `ref` and/or `id` field
 * @param {string}  [prefix] Prefix for the ID fallback (no dash)
 * @returns {string}
 */
export function displayRef(entity, prefix) {
  if (!entity) return "—";
  if (entity.ref) return entity.ref;
  const id = entity.id || "";
  if (!id) return "—";
  const short = id.slice(0, 8).toUpperCase();
  return prefix ? `${prefix}-${short}` : `#${short}`;
}
