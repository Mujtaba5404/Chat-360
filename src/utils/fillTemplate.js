// Replaces {{variable}} placeholders; unknown variables are left as they are.
const fillTemplate = (text = "", values = {}) =>
  text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => values[key] ?? match);

export default fillTemplate;
