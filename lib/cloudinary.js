// Client-side direct upload to Cloudinary using an UNSIGNED upload preset.
// This lets photos/videos go straight from the admin's browser to Cloudinary
// without ever passing your API secret through this app.
//
// Setup once in Cloudinary dashboard:
//   Settings -> Upload -> Add upload preset -> Signing mode: "Unsigned"
//   Name it exactly: stylesutra_unsigned  (or update .env.local to match)

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadToCloudinary(file, { maxMB, resourceType = "auto" } = {}) {
  if (maxMB && file.size > maxMB * 1024 * 1024) {
    throw new Error(`File too large. Max ${maxMB}MB allowed (this file is ${(file.size / 1024 / 1024).toFixed(1)}MB).`);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const res = await fetch(endpoint, { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Upload failed");
  }
  const data = await res.json();
  return { url: data.secure_url, public_id: data.public_id, resource_type: data.resource_type };
}
