import { workspaceImagePath, workspaceImageUrl } from "../constants/WORKSPACE";

// Bracket keys, as the backend reads them: settings[color], settings[allowedIPs][0].
const append = (formData, key, value) => {
  if (value === undefined || value === null) return;
  if (Array.isArray(value))
    value.forEach((item, index) => append(formData, `${key}[${index}]`, item));
  else if (typeof value === "object" && !(value instanceof Blob))
    Object.entries(value).forEach(([name, item]) =>
      append(formData, `${key}[${name}]`, item),
    );
  else formData.append(key, value);
};

/**
 * Re-downloads the saved image so it can be sent again. Backend workaround: an update
 * without an image fails (500) and deletes the saved file, so every update carries one.
 */
const currentImage = async (workspace) => {
  const response = await fetch(workspaceImageUrl(workspace));
  if (!response.ok) throw new Error("couldn't keep the workspace image");
  const blob = await response.blob();
  return new File([blob], workspace.image.originalName || "image", {
    type: workspace.image.mimeType || blob.type,
  });
};

/**
 * The multipart body for creating or updating a workspace. `image` is a newly
 * picked file; without one, an existing workspace re-sends its current image.
 */
export const toWorkspaceFormData = async (
  payload,
  { image, workspace } = {},
) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) =>
    append(formData, key, value),
  );

  const file =
    image ??
    (workspaceImagePath(workspace) ? await currentImage(workspace) : null);
  if (file) formData.append("image", file);

  return formData;
};
