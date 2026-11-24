import WORKSPACE from "../../constants/WORKSPACE";
import formatBytes from "../../utils/formatBytes";

/** Why a picked image file can't be used, or null. */
const imageFileError = (file) => {
  if (!file) return null;
  if (!WORKSPACE.IMAGE_TYPES.includes(file.type))
    return "Use a PNG, JPG, WebP or GIF image";
  return file.size > WORKSPACE.IMAGE_MAX_BYTES
    ? `Use an image up to ${formatBytes(WORKSPACE.IMAGE_MAX_BYTES)}`
    : null;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Same check the backend runs: one IPv4/IPv6 address, optionally with a CIDR range.
const IPV4 =
  /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}(\/([12]?\d|3[0-2]))?$/;
const IPV6 = /^[0-9a-f:]+(\/(\d{1,2}|1[01]\d|12[0-8]))?$/i;

const isUrl = (value) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

export const isIpOrRange = (value) =>
  IPV4.test(value) || (value.includes(":") && IPV6.test(value));

/** Mantine form rules for the workspace fields the backend checks. */
export const workspaceRules = {
  title: (value) => (value.trim() ? null : "Workspace name is required"),
  email: (value) =>
    !value.trim() || EMAIL.test(value.trim())
      ? null
      : "Enter a valid email address",
  website: (value) =>
    !value.trim() || isUrl(value.trim())
      ? null
      : "Enter a full URL, e.g. https://example.com",
  image: imageFileError,
  allowedIPs: (values) => {
    const invalid = values.find((value) => !isIpOrRange(value));
    return invalid
      ? `"${invalid}" is not a valid IP address or CIDR range`
      : null;
  },
};
