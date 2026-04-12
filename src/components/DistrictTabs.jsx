/**
 * DistrictTabs — 구/군 선택 가로 탭 컴포넌트
 * props:
 *   regionId     : string   — 현재 지역 ID
 *   value        : string|null — 선택된 district_id (null = 전체)
 *   onChange     : (districtId: string|null) => void
 *   style        : object (선택)
 */
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function DistrictTabs({ regionId, value, onChange, style }) {
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    if (!regionId) return;
    fetch(`${API_BASE}/api/districts?regionId=${encodeURIComponent(regionId)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.districts) setDistricts(d.districts);
      })
      .catch(() => {});
  }, [regionId]);

  if (!districts.length) return null;

  return (
    <div
      className="su-tabRow"
      style={{ marginTop: 6, paddingBottom: 4, ...style }}
      role="tablist"
      aria-label="구/군 선택"
    >
      <button
        type="button"
        className={`su-chip${!value ? " is-active" : ""}`}
        onClick={() => onChange?.(null)}
        role="tab"
        aria-selected={!value}
      >
        전체
      </button>
      {districts.map((d) => {
        const id = d.districtId ?? d.district_id;
        const name = d.name;
        return (
          <button
            key={id}
            type="button"
            className={`su-chip${value === String(id) ? " is-active" : ""}`}
            onClick={() => onChange?.(String(id))}
            role="tab"
            aria-selected={value === String(id)}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}
