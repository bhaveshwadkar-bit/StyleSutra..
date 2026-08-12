"use client";
import { useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

// Reads a video file's duration client-side before upload, so we can enforce
// the 20-second max without needing a server round trip.
function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => reject(new Error("Could not read video file"));
    video.src = URL.createObjectURL(file);
  });
}

export default function MediaUploader({ photos, setPhotos, videos, setVideos }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handlePhotoSelect(e) {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      setError("Max 5 photos per product.");
      e.target.value = "";
      return;
    }
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        // 10MB max, works with photos taken directly on Android/iPhone (jpg, heic-converted, png)
        const result = await uploadToCloudinary(file, { maxMB: 10, resourceType: "image" });
        setPhotos((prev) => [...prev, { url: result.url, public_id: result.public_id }]);
      }
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleVideoSelect(e) {
    const files = Array.from(e.target.files || []);
    if (videos.length + files.length > 2) {
      setError("Max 2 videos per product.");
      e.target.value = "";
      return;
    }
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const duration = await getVideoDuration(file).catch(() => null);
        if (duration && duration > 20.5) {
          throw new Error(`"${file.name}" is ${Math.round(duration)}s long — videos must be 20 seconds or under.`);
        }
        // 50MB max, works with videos recorded directly on Android/iPhone (mp4, mov)
        const result = await uploadToCloudinary(file, { maxMB: 50, resourceType: "video" });
        setVideos((prev) => [...prev, { url: result.url, public_id: result.public_id }]);
      }
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div>
      <div className="field">
        <label>Photos (max 5, up to 10MB each)</label>
        <div className="upload-grid">
          {photos.map((p, i) => (
            <div className="upload-thumb" key={i}>
              <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button type="button" className="remove-btn" onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}>×</button>
            </div>
          ))}
          {photos.length < 5 && (
            <label className="upload-tile">
              {uploading ? "…" : "+ Add photo"}
              <input type="file" accept="image/*" multiple hidden onChange={handlePhotoSelect} disabled={uploading} />
            </label>
          )}
        </div>
        <p className="hint">Works directly from your phone gallery — camera roll photos from Android or iPhone.</p>
      </div>

      <div className="field">
        <label>Videos (max 2, up to 50MB each, 20 seconds max)</label>
        <div className="upload-grid">
          {videos.map((v, i) => (
            <div className="upload-thumb" key={i}>
              <video src={v.url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button type="button" className="remove-btn" onClick={() => setVideos((prev) => prev.filter((_, idx) => idx !== i))}>×</button>
            </div>
          ))}
          {videos.length < 2 && (
            <label className="upload-tile">
              {uploading ? "…" : "+ Add video"}
              <input type="file" accept="video/*" multiple hidden onChange={handleVideoSelect} disabled={uploading} />
            </label>
          )}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
