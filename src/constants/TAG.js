import COLORS from "./COLORS";

/** Options and defaults for a tag record (`/:slug/tags`). */
const TAG = {
  DEFAULTS: {
    title: "",
    color: COLORS.BLUE,
    description: "",
    isActive: true,
  },
  STATUSES: [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ],
  TITLE_MAX: 40,
  DESCRIPTION_MAX: 200,
};

/** A tag record → form values. */
export const toTagValues = (tag) => ({
  title: tag?.title ?? TAG.DEFAULTS.title,
  color: tag?.color ?? TAG.DEFAULTS.color,
  description: tag?.description ?? TAG.DEFAULTS.description,
  isActive: tag?.isActive ?? TAG.DEFAULTS.isActive,
});

/** Form values → the body the tags API expects. `metadata` is kept as saved. */
export const toTagPayload = (values, tag) => ({
  title: values.title.trim(),
  color: values.color,
  description: values.description.trim(),
  isActive: values.isActive,
  metadata: tag?.metadata ?? {},
});

export default TAG;
