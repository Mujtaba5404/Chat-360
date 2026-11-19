// Black or white, whichever reads better on the given hex background.
const readableTextColor = (hex = "") => {
  const value = hex.replace("#", "");

  if (!/^[0-9a-f]{6}$/i.test(value)) return "#FFFFFF";

  const [r, g, b] = [0, 2, 4].map(
    (i) => parseInt(value.slice(i, i + 2), 16) / 255,
  );
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 0.6 ? "#111113" : "#FFFFFF";
};

export default readableTextColor;
