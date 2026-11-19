/** Chat Model brand mark. Color follows `currentColor` (brand by default). */
const Logo = ({ size = 26, className }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      style={{ flexShrink: 0, color: "var(--mantine-color-brand-6)" }}
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        d="M9 11.5A3.5 3.5 0 0 1 12.5 8h7a3.5 3.5 0 0 1 3.5 3.5v5a3.5 3.5 0 0 1-3.5 3.5H15l-4.2 3.2c-.5.4-1.3 0-1.3-.6V20A3.5 3.5 0 0 1 9 16.5v-5Z"
        fill="#fff"
      />
    </svg>
  );
};

export default Logo;
