// Seconds as a short timer: "45s", "4m 12s", "1h 05m".
const formatElapsed = (totalSeconds = 0) => {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;

  if (hours) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  if (minutes) return `${minutes}m ${String(rest).padStart(2, "0")}s`;

  return `${rest}s`;
};

export default formatElapsed;
