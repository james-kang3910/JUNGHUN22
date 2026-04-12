import { useMemo, useRef, useState } from "react";

const RAW_API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "";
const API_BASE = String(RAW_API_BASE || "").replace(/\/+$/, "").replace(/\/api$/, "");
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]);

export function normalizeImageList(value, maxImages = 3) {
  const urls = [];

  const pushValue = (candidate) => {
    if (!candidate) return;

    if (Array.isArray(candidate)) {
      candidate.forEach(pushValue);
      return;
    }

    if (typeof candidate === "object") {
      pushValue(candidate.url || candidate.imageUrl || candidate.src);
      return;
    }

    const text = String(candidate || "").trim();
    if (!text) return;

    if ((text.startsWith("[") || text.startsWith("{")) && !/^https?:\/\//i.test(text) && !text.startsWith("/")) {
      try {
        pushValue(JSON.parse(text));
        return;
      } catch {
        // keep plain text fallback
      }
    }

    if (!urls.includes(text)) urls.push(text);
  };

  pushValue(value);
  return urls.slice(0, maxImages);
}

function toPreviewUrl(url) {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:")) return url;
  return `${API_BASE}${url}`;
}

export default function MultiImageUploader({
  value,
  onChange,
  uploadImage,
  maxImages = 3,
  disabled = false,
  onError,
  helperText,
  countText,
  tone = "default",
}) {
  const inputRef = useRef(null);
  const images = useMemo(() => normalizeImageList(value, maxImages), [value, maxImages]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const isSoftTeal = tone === "soft-teal";

  const reportError = (message) => {
    if (typeof onError === "function") onError(message);
  };

  const updateImages = (nextImages) => {
    if (typeof onChange === "function") onChange(nextImages);
  };

  const handleFiles = async (fileList) => {
    const selectedFiles = Array.from(fileList || []);
    if (selectedFiles.length === 0 || disabled || isUploading) return;

    // 항상 최신 images를 prop에서 직접 계산 (stale closure 방지)
    const currentImages = normalizeImageList(value, maxImages);
    const availableSlots = maxImages - currentImages.length;
    if (availableSlots <= 0) {
      reportError(`이미지는 최대 ${maxImages}장까지 등록할 수 있습니다.`);
      return;
    }

    const validFiles = [];
    for (const file of selectedFiles.slice(0, availableSlots)) {
      if (!ACCEPTED_TYPES.has(file.type)) {
        reportError("이미지 파일만 업로드할 수 있습니다.");
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        reportError("이미지 크기는 10MB 이하여야 합니다.");
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    try {
      const nextImages = currentImages.slice();
      for (const file of validFiles) {
        const uploadedUrl = await uploadImage(file);
        if (uploadedUrl) nextImages.push(uploadedUrl);
      }
      updateImages(nextImages);
    } catch (error) {
      reportError(error?.message || "이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    await handleFiles(event.dataTransfer?.files);
  };

  return (
    <div>
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsDragging(false);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onDrop={handleDrop}
        style={{
          border: `1px dashed ${isDragging ? "#0ea5a0" : isSoftTeal ? "#b8dbe5" : "rgba(255,255,255,0.18)"}`,
          background: isDragging
            ? "rgba(20,184,166,0.08)"
            : isSoftTeal
            ? "linear-gradient(180deg, #eef8fc 0%, #e7f4fa 100%)"
            : "rgba(255,255,255,0.04)",
          borderRadius: isSoftTeal ? 12 : 10,
          padding: isSoftTeal ? 12 : 16,
          transition: "all 0.2s ease",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          disabled={disabled || isUploading || images.length >= maxImages}
          style={{ display: "none" }}
          onChange={(event) => handleFiles(event.target.files)}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              {countText || `이미지 ${images.length}/${maxImages}`}
            </div>
            <div style={{ fontSize: 12, opacity: 0.72 }}>
              {helperText || "JPEG, PNG, GIF, WebP 업로드 가능"}
            </div>
          </div>
          <button
            type="button"
            disabled={disabled || isUploading || images.length >= maxImages}
            onClick={() => inputRef.current?.click()}
            style={{
              minHeight: 36,
              borderRadius: 10,
              border: isSoftTeal ? "1px solid #b8d6e3" : "1px solid rgba(255,255,255,0.14)",
              background: disabled
                ? (isSoftTeal ? "#e2e8f0" : "rgba(255,255,255,0.08)")
                : (isSoftTeal ? "linear-gradient(135deg, #0f7f96 0%, #0e7490 100%)" : "rgba(15,23,42,0.82)"),
              color: "#fff",
              padding: "0 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled || images.length >= maxImages ? 0.55 : 1,
            }}
          >
            {isUploading ? "업로드 중..." : "이미지 추가"}
          </button>
        </div>
      </div>

      {images.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10, marginTop: 12 }}>
          {images.map((imageUrl, index) => (
            <div key={`${imageUrl}-${index}`} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
              <img
                src={toPreviewUrl(imageUrl)}
                alt={`업로드 이미지 ${index + 1}`}
                style={{ width: "100%", height: 96, objectFit: "cover", display: "block" }}
              />
              <div style={{ position: "absolute", left: 8, bottom: 8, padding: "2px 6px", borderRadius: 999, background: "rgba(15,23,42,0.82)", color: "#fff", fontSize: 11, fontWeight: 700 }}>
                {index + 1}
              </div>
              <button
                type="button"
                disabled={disabled}
                onClick={() => updateImages(images.filter((_, imageIndex) => imageIndex !== index))}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  border: "none",
                  background: "rgba(15,23,42,0.82)",
                  color: "#fff",
                  fontSize: 14,
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}