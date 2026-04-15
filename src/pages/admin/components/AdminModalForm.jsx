import { useEffect, useState } from "react";

/**
 * 관리자 모달 폼 (생성/수정 공용)
 */
export default function AdminModalForm({
  open,
  title,
  fields, // [{ key, label, type, placeholder, required, options(for select), rows(for textarea) }]
  initialData = {},
  onSubmit,
  onChange, // ★ 폼 데이터 변경 콜백 추가
  onCancel,
  submitText = "저장",
  submitDisabled = false,
}) {
  const [formData, setFormData] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  // 모달 열림/닫힘 추적
  useEffect(() => {
    if (open && !isOpen) {
      // 모달이 새로 열릴 때만 초기화
      setIsOpen(true);
      const init = {};
      fields.forEach((f) => {
        const raw = initialData[f.key];
        if (raw !== undefined) {
          if (f.type === 'date' && raw && typeof raw === 'string') {
            init[f.key] = raw.slice(0, 10);
          } else if (f.type === 'datetime-local' && raw && typeof raw === 'string') {
            init[f.key] = raw.slice(0, 16);
          } else {
            // select 필드: null은 빈 문자열로 정규화 (controlled select 불일치 방지)
            init[f.key] = (raw === null && f.type === 'select') ? '' : raw;
          }
        } else if (f.defaultValue !== undefined) {
          init[f.key] = f.defaultValue;
        } else {
          init[f.key] = f.type === "checkbox" ? false : "";
        }
      });
      setFormData(init);
      // 모달 열릴 때 초기 데이터를 부모에 전달 (regionId 등으로 구/군 목록 즉시 로드)
      onChange?.(init);
    } else if (!open && isOpen) {
      // 모달이 닫힐 때
      setIsOpen(false);
      setFormData({});
    }
  }, [open]);

  // fields 변경 시 기존 입력값 보존하면서 새 필드 추가 (initialData는 dep에서 제외 — 레퍼런스 불안정으로 무한 루프 유발)
  useEffect(() => {
    if (open && isOpen) {
      setFormData((prevData) => {
        const init = {};
        fields.forEach((f) => {
          // 기존 데이터 우선 사용 (입력값 보존)
          if (prevData[f.key] !== undefined) {
            init[f.key] = prevData[f.key];
          } else if (initialData[f.key] !== undefined) {
            const raw = initialData[f.key];
            if (f.type === 'date' && raw && typeof raw === 'string') {
              init[f.key] = raw.slice(0, 10);
            } else if (f.type === 'datetime-local' && raw && typeof raw === 'string') {
              init[f.key] = raw.slice(0, 16);
            } else {
              init[f.key] = (raw === null && f.type === 'select') ? '' : raw;
            }
          } else if (f.defaultValue !== undefined) {
            init[f.key] = f.defaultValue;
          } else {
            init[f.key] = f.type === "checkbox" ? false : "";
          }
        });
        return init;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields])

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && open) onCancel?.();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onCancel]);

  if (!open) return null;

  // handleChange에서 최신 state 기준으로 병합 (연속 업데이트 시 값 유실 방지)
  const handleChange = (key, value) => {
    setFormData((prevData) => {
      const next = { ...prevData, [key]: value };
      onChange?.(next);
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9998,
    padding: 16,
    overflowY: "auto",
  };

  const modalStyle = {
    background: "#1e1e28",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.1)",
    padding: 24,
    maxWidth: 500,
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  };

  const titleStyle = {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  };

  const fieldStyle = {
    marginBottom: 16,
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    opacity: 0.9,
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "inherit",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    cursor: "pointer",
  };

  const checkboxContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const btnContainerStyle = {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 24,
    paddingTop: 16,
    borderTop: "1px solid rgba(255,255,255,0.1)",
  };

  const btnBase = {
    padding: "12px 24px",
    borderRadius: 8,
    border: "none",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  };

  const renderField = (field) => {
    const { key, label, type, placeholder, required, options, rows, disabled, customRender } = field;
    const value = formData[key] ?? "";

    // Custom render 지원 (A1, A2)
    if (type === "custom" && customRender) {
      return customRender(value, (newValue) => handleChange(key, newValue), formData, handleChange);
    }

    switch (type) {
      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            required={required}
            rows={rows || 4}
            style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
            disabled={disabled}
          />
        );

      case "select": {
        // options 첫 번째가 "" 또는 null이면 이미 "전체/미지정" 항목이 있으므로 플레이스홀더 미출력
        // 그 외에는 disabled+hidden 처리 → 드롭다운 열었을 때 목록에 노출 안 됨
        const firstVal = options?.[0]?.value;
        const hasBlankOption = firstVal === "" || firstVal === null;
        return (
          <select
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            required={required}
            style={selectStyle}
            disabled={disabled}
          >
            {!hasBlankOption && (
              <option value="" disabled hidden>선택하세요</option>
            )}
            {options?.map((opt) => (
              <option key={opt.value ?? "__null__"} value={opt.value ?? ""}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      }

      case "checkbox":
        return (
          <div style={checkboxContainerStyle}>
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(key, e.target.checked)}
              style={{ width: 18, height: 18, cursor: "pointer" }}
              disabled={disabled}
            />
            <span style={{ fontSize: 14, opacity: 0.8 }}>{placeholder || "활성화"}</span>
          </div>
        );

      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            required={required}
            style={inputStyle}
            min={field.min}
            max={field.max}
            disabled={disabled}
          />
        );

      case "datetime-local":
        return (
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            required={required}
            style={inputStyle}
            min={field.min}
            max={field.max}
            disabled={disabled}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            required={required}
            style={inputStyle}
            min={field.min}
            max={field.max}
            disabled={disabled}
          />
        );

      case "tags":
        // 쉼표로 구분된 태그 입력
        return (
          <input
            type="text"
            value={Array.isArray(value) ? value.join(", ") : value}
            onChange={(e) => handleChange(key, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            placeholder={placeholder || "쉼표로 구분하여 입력"}
            style={inputStyle}
            disabled={disabled}
          />
        );

      default:
        return (
          <input
            type={type || "text"}
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            required={required}
            style={inputStyle}
            min={field.min}
            max={field.max}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div 
      style={overlayStyle} 
      onMouseDown={(e) => {
        // 오버레이 자체를 클릭했을 때만 닫기 (드래그 방지)
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={titleStyle}>{title}</div>
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.key} style={fieldStyle}>
              <label style={labelStyle}>
                {field.label}
                {field.required && <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}
          <div style={btnContainerStyle}>
            <button
              type="button"
              style={{ ...btnBase, background: "rgba(255,255,255,0.1)", color: "#fff" }}
              onClick={onCancel}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitDisabled}
              style={{
                ...btnBase,
                background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                color: "#fff",
                opacity: submitDisabled ? 0.6 : 1,
                cursor: submitDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
