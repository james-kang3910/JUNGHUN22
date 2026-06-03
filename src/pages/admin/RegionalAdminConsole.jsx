import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import MultiImageUploader, { normalizeImageList } from "../../components/MultiImageUploader";
import ParticipationReviewModal from "../../components/ParticipationReviewModal";
import PageHeader from "../../components/PageHeader";
import Toast from "../../components/Toast";
import { getCurrentUser, isLoggedIn } from "../../lib/authStore";
import { getAuditionDateFloorInput, isAuditionClosed, normalizeAuditionRankLabel, validateAuditionDateRange } from "../../lib/auditionSchedule";
import { canAccessAdmin, canAccessRegionalConsole, getRoleMeta, isRegionManagerRole, isRegionSuperManagerRole, ROLES } from "../../lib/permissions";
import * as storageAdapter from "../../lib/storageAdapter";

function getAuditionStatusMeta(item) {
  if (!isAuditionClosed(item)) return { label: '진행중', color: '#0f766e' };
  return { label: '종료', color: '#ef4444' };
}

function getAuditionSelectionMeta(item) {
  if (!isAuditionClosed(item)) return null;
  return item?.hasRankedSubmissions ? { label: '선정완료', color: '#0f766e' } : { label: '선정대기', color: '#94a3b8' };
}

const SECTION_META = [
  { key: "notices", title: "공지", accent: "#0f766e" },
  { key: "events", title: "이벤트", accent: "#2563eb" },
  { key: "missions", title: "미션", accent: "#7c3aed" },
  { key: "festivals", title: "지역행사", accent: "#0ea5e9" },
  { key: "broadcasts", title: "방송", accent: "#db2777" },
  { key: "auditions", title: "오디션", accent: "#9333ea" },
  { key: "news", title: "뉴스", accent: "#0891b2" },
  { key: "banners", title: "배너광고", accent: "#d97706" },
  { key: "apartments", title: "아파트", accent: "#ea580c" },
  { key: "apartment-notices", title: "아파트 공지", accent: "#ea580c" },
  { key: "shops", title: "상점", accent: "#0284c7" },
  { key: "flyers", title: "전단", accent: "#b45309" },
  { key: "intro", title: "지역 소개", accent: "#475569" },
];

const MISSION_CATEGORY_OPTIONS = ["daily", "review", "checkin", "purchase", "general"];
const EVENT_CATEGORY_OPTIONS = ["signup", "promotion", "seasonal", "general"];
const AUDITION_TYPE_OPTIONS = ["FREE", "NOTICE"];
const AUDITION_TYPE_LABELS = {
  FREE: "자유응모",
  NOTICE: "공지형",
};
const AUDITION_STATUS_OPTIONS = ["OPEN", "CLOSED"];
const SHOP_STATUS_OPTIONS = ["pending", "approved", "rejected"];

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f4fbfb 0%, #eef6ff 100%)",
};

const sectionCardStyle = {
  background: "#ffffff",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  borderRadius: 22,
  padding: 18,
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
  overflow: "hidden", // 카드 전체 오버플로 방지
  wordBreak: "break-word",
  overflowWrap: "anywhere",
};

const buttonBaseStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 38,
  borderRadius: 12,
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1,
  whiteSpace: "nowrap",
  wordBreak: "keep-all",
  cursor: "pointer",
  padding: "0 13px",
  flexShrink: 0,
};

const primaryButtonStyle = {
  ...buttonBaseStyle,
  border: "none",
  background: "linear-gradient(135deg, #0f766e, #0891b2)",
  color: "#ffffff",
};

const inputStyle = {
  width: "100%",
  minHeight: 42,
  borderRadius: 12,
  border: "1px solid rgba(148, 163, 184, 0.28)",
  padding: "0 12px",
  fontSize: 14,
  color: "#0f172a",
  background: "#ffffff",
  boxSizing: "border-box",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  wordBreak: "normal",
};

const textareaStyle = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid rgba(148, 163, 184, 0.28)",
  padding: 12,
  fontSize: 14,
  color: "#0f172a",
  background: "#ffffff",
  resize: "vertical",
  boxSizing: "border-box",
  overflow: "auto",
  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
};

function normalizeList(result, keyCandidates = []) {
  if (Array.isArray(result)) return result;
  if (!result || typeof result !== "object") return [];

  for (const key of keyCandidates) {
    if (Array.isArray(result[key])) return result[key];
  }

  if (result.data && typeof result.data === "object") {
    for (const key of keyCandidates) {
      if (Array.isArray(result.data[key])) return result.data[key];
    }
  }

  return [];
}

function normalizeId(item) {
  return (
    item?.id ??
    item?.noticeId ??
    item?.newsId ??
    item?.eventId ??
    item?.event_id ??
    item?.festivalId ??
    item?.festival_id ??
    item?.missionId ??
    item?.broadcastId ??
    item?.auditionId ??
    item?.shopId ??
    item?.shop_id ??
    item?.apartmentId ??
    item?.apartment_id ??
    item?.flyerId ??
    item?.flyer_id ??
    item?.bannerId ??
    item?.banner_id ??
    null
  );
}

function resolveRegionName(region) {
  return region?.name || [region?.province, region?.district].filter(Boolean).join(" ") || region?.id || "지역";
}

function getItemRegionId(item) {
  const candidates = [
    item?.regionId,
    item?.region_id,
    Array.isArray(item?.regionIds) ? item.regionIds[0] : null,
    Array.isArray(item?.region_ids) ? item.region_ids[0] : null,
    item?.region,
  ];

  for (const candidate of candidates) {
    const normalized = String(candidate || "").trim();
    if (normalized) return normalized;
  }

  return "";
}

function getItemTitle(item, fallback = "제목 없음") {
  return item?.title || item?.name || item?.shopName || item?.shop_name || item?.apartmentName || fallback;
}

function summarizeText(text, limit = 88) {
  const source = String(text || "").replace(/\s+/g, " ").trim();
  if (!source) return "내용 없음";
  return source.length > limit ? `${source.slice(0, limit)}...` : source;
}

function parseImagesText(text) {
  return normalizeImageList(String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean));
}

function toImagesText(images) {
  if (!Array.isArray(images)) return "";
  return images
    .map((image) => (typeof image === "string" ? image : image?.url || ""))
    .filter(Boolean)
    .join("\n");
}

function toIntroImageCaptionsText(images) {
  if (!Array.isArray(images)) return "";
  return images
    .map((image) => {
      if (!image || typeof image !== "object") return "";
      return String(image.title || image.caption || image.name || "").trim();
    })
    .join("\n");
}

function parseTextLines(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim());
}

function composeIntroImagesWithCaptions(images, captionsText) {
  const urls = normalizeImageList(images);
  const captions = parseTextLines(captionsText);
  return urls.map((url, index) => ({
    url,
    title: captions[index] || "",
  }));
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
}

function formatDateInput(value) {
  if (!value) return "";
  const text = String(value);
  if (text.includes("T")) return text.slice(0, 10);
  return text.slice(0, 10);
}

function formatDateTimeInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    const offset = date.getTimezoneOffset();
    const normalized = new Date(date.getTime() - offset * 60 * 1000);
    return normalized.toISOString().slice(0, 16);
  }
  return String(value).slice(0, 16);
}

function normalizeIntroResult(result) {
  if (!result || typeof result !== "object") return null;
  const source = result.intro || result.data?.intro || result;
  if (!source || typeof source !== "object") return null;

  const parseArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  return {
    ...source,
    images: parseArray(source.images),
    sections: parseArray(source.sections ?? source.introSections),
  };
}

function EmptyState({ text }) {
  return (
    <div style={{ borderRadius: 14, background: "rgba(248,250,252,0.92)", color: "#64748b", fontSize: 13, padding: "14px 12px" }}>
      {text}
    </div>
  );
}

function SectionCard({ title, accent, count, subtitle, action, children }) {
  return (
    <section style={sectionCardStyle}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: "1 1 220px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "break-word" }}>{title}</div>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, padding: "4px 9px", borderRadius: 999, background: `${accent}14`, color: accent, fontSize: 11, fontWeight: 800 }}>
              {count}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 5, lineHeight: 1.5, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "break-word" }}>{subtitle}</div>
        </div>
        <div style={{ flex: "0 0 auto" }}>{action}</div>
      </div>
      {children}
    </section>
  );
}

function FieldRenderer({ field, value, onChange, districts }) {
  if (field.type === "custom" && typeof field.customRender === "function") {
    return field.customRender(value, (nextValue) => onChange(field.key, nextValue));
  }

  const commonProps = {
    value,
    min: field.min,
    max: field.max,
    onChange: (event) => onChange(field.key, event.target.type === "checkbox" ? event.target.checked : event.target.value),
  };

  if (field.type === "textarea") {
    return <textarea {...commonProps} rows={field.rows || 4} style={textareaStyle} placeholder={field.placeholder} />;
  }

  if (field.type === "select") {
    return (
      <select {...commonProps} style={inputStyle}>
        {field.options.map((option) => (
          <option key={String(option.value)} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "district") {
    const options = [{ value: "", label: "구/군 전체" }, ...districts.map((district) => ({ value: String(district.id), label: district.name }))];
    return (
      <select {...commonProps} style={inputStyle}>
        {options.map((option) => (
          <option key={String(option.value)} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "#334155", fontWeight: 700 }}>
        <input type="checkbox" checked={!!value} onChange={(event) => onChange(field.key, event.target.checked)} />
        {field.label}
      </label>
    );
  }

  return <input {...commonProps} type={field.type || "text"} style={inputStyle} placeholder={field.placeholder} />;
}

export default function RegionalAdminConsole() {
  const navigate = useNavigate();
  const me = getCurrentUser();
  const role = String(me?.role || "").toUpperCase();
  const memberId = me?.memberId || me?.id || null;
  const allowed = isLoggedIn() && canAccessRegionalConsole(role);
  const roleMeta = getRoleMeta(role || ROLES.USER);
  const isAdminLevel = canAccessAdmin(role);
  const isFixedRegionManager = isRegionManagerRole(role);
  const isMultiRegionManager = isRegionSuperManagerRole(role);
  const canSwitchRegions = isAdminLevel || isMultiRegionManager;

  const [regions, setRegions] = useState([]);
  const [allowedRegionIds, setAllowedRegionIds] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [content, setContent] = useState({
    notices: [],
    events: [],
    festivals: [],
    missions: [],
    broadcasts: [],
    auditions: [],
    news: [],
    apartments: [],
    "apartment-notices": [],
    shops: [],
    flyers: [],
    banners: [],
    intro: null,
    stats: null,
  });
  const [editor, setEditor] = useState({ section: null, mode: "create", itemId: null, form: {} });
  const auditionDateFloor = useMemo(() => getAuditionDateFloorInput(), []);
  const [saving, setSaving] = useState(false);
  const [actingId, setActingId] = useState(null);
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [participantSection, setParticipantSection] = useState(null);
  const [participantItem, setParticipantItem] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [auditionRankDrafts, setAuditionRankDrafts] = useState({});

  const selectedRegion = useMemo(
    () => regions.find((region) => String(region.id) === String(selectedRegionId)) || null,
    [regions, selectedRegionId]
  );

  const selectedRegionName = useMemo(() => resolveRegionName(selectedRegion), [selectedRegion]);

  const allowedRegions = useMemo(
    () => regions.filter((region) => allowedRegionIds.includes(String(region.id))),
    [allowedRegionIds, regions]
  );

  useEffect(() => {
    if (!allowed) return;

    let cancelled = false;

    const loadRegions = async () => {
      setLoading(true);
      try {
        const regionList = await storageAdapter.getRegions();
        if (cancelled) return;

        const normalizedRegions = Array.isArray(regionList) ? regionList : [];
        setRegions(normalizedRegions);

        let nextAllowedRegionIds = [];
        if (isAdminLevel || isMultiRegionManager) {
          nextAllowedRegionIds = normalizedRegions.map((region) => String(region.id));
        } else {
          const fallbackById = String(me?.regionId || me?.region_id || "").trim();
          const fallbackByName = String(me?.region || "").trim();
          if (fallbackById) {
            nextAllowedRegionIds = [fallbackById];
          } else if (fallbackByName) {
            const matched = normalizedRegions.find((region) => resolveRegionName(region) === fallbackByName || String(region.name || "").trim() === fallbackByName);
            if (matched?.id) nextAllowedRegionIds = [String(matched.id)];
          }
        }

        const dedupedIds = Array.from(new Set(nextAllowedRegionIds)).filter((regionId) => normalizedRegions.some((region) => String(region.id) === String(regionId)));
        setAllowedRegionIds(dedupedIds);
        setSelectedRegionId((prev) => (prev && dedupedIds.includes(prev) ? prev : dedupedIds[0] || ""));
      } catch (error) {
        if (!cancelled) {
          setToast({ open: true, message: error.message || "지역 정보를 불러오지 못했습니다.", type: "error" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRegions();
    return () => {
      cancelled = true;
    };
  }, [allowed, isAdminLevel, memberId, me?.region, me?.regionId]);

  useEffect(() => {
    if (!selectedRegionId) {
      setDistricts([]);
      return;
    }

    let cancelled = false;

    const loadDistricts = async () => {
      try {
        const list = await storageAdapter.getDistricts(selectedRegionId);
        if (!cancelled) setDistricts(Array.isArray(list) ? list : []);
      } catch (error) {
        if (!cancelled) setDistricts([]);
      }
    };

    loadDistricts();
    return () => {
      cancelled = true;
    };
  }, [selectedRegionId]);

  useEffect(() => {
    const handleSsotChanged = (event) => {
      const changedType = String(event?.detail?.type || '').toLowerCase();
      // 타입 단수/복수 모두 허용
      if (["missions", "mission", "events", "event", "notices", "notice", "banners", "banner"].includes(changedType)) {
        refreshData();
      }
    };

    window.addEventListener('su:ssot:changed', handleSsotChanged);
    return () => {
      window.removeEventListener('su:ssot:changed', handleSsotChanged);
    };
  }, []);

  useEffect(() => {
    setEditor({ section: null, mode: "create", itemId: null, form: {} });
  }, [selectedRegionId]);

  useEffect(() => {
    if (!allowed || !selectedRegionId) return;

    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const [statsResult, noticesResult, eventsResult, legacyEventsResult, festivalsResult, missionsResult, broadcastsResult, apartmentsResult, apartmentPostsResult] = await Promise.all([
          storageAdapter.getRegionStats(selectedRegionId).catch(() => null),
          storageAdapter.getNotices({ scope: "REGION", region_id: selectedRegionId }).catch(() => []),
          storageAdapter.getRegionEvents(selectedRegionId).catch(() => []),
          storageAdapter.getEvents({ regionId: selectedRegionId }).catch(() => []),
          storageAdapter.getRegionFestivals(selectedRegionId).catch(() => []),
          storageAdapter.getMissions({ regionId: selectedRegionId }).catch(() => []),
          storageAdapter.getBroadcasts({ publicOnly: false, regionId: selectedRegionId }).catch(() => []),
          storageAdapter.getApartments({ regionId: selectedRegionId }).catch(() => []),
          storageAdapter.getApartmentPosts({ regionId: selectedRegionId, section: 'notices' }).catch(() => []),
        ]);

        if (cancelled) return;

        const nextNotices = normalizeList(noticesResult, ["notices"]).filter((item) => String(item?.scope || "").toUpperCase() === "REGION" && getItemRegionId(item) === selectedRegionId);
        const nextEvents = normalizeList(eventsResult, ["events"]).filter((item) => {
          const itemRegionId = getItemRegionId(item);
          if (itemRegionId) return itemRegionId === selectedRegionId;
          return Array.isArray(item?.regionIds) ? item.regionIds.map(String).includes(String(selectedRegionId)) : false;
        });
        const nextLegacyEvents = normalizeList(legacyEventsResult, ["events"]).filter((item) => {
          const itemRegionId = getItemRegionId(item);
          if (itemRegionId) return itemRegionId === selectedRegionId;
          return Array.isArray(item?.regionIds) ? item.regionIds.map(String).includes(String(selectedRegionId)) : false;
        }).map((item) => ({ ...item, __eventSource: "legacy" }));
        const mergedEvents = [
          ...nextEvents,
          ...nextLegacyEvents.filter((legacyItem) => {
            const legacyId = String(normalizeId(legacyItem) || "");
            if (!legacyId) return true;
            return !nextEvents.some((regionItem) => String(normalizeId(regionItem) || "") === legacyId);
          }),
        ];
        const nextFestivals = normalizeList(festivalsResult, ["events", "festivals"]).filter((item) => {
          const itemRegionId = getItemRegionId(item);
          if (itemRegionId) return itemRegionId === selectedRegionId;
          return Array.isArray(item?.regionIds) ? item.regionIds.map(String).includes(String(selectedRegionId)) : false;
        });
        const nextMissions = normalizeList(missionsResult, ["missions"]).filter((item) => {
          const itemRegionId = getItemRegionId(item);
          if (itemRegionId) return itemRegionId === selectedRegionId;
          return Array.isArray(item?.regionIds) ? item.regionIds.map(String).includes(String(selectedRegionId)) : false;
        });
        const nextBroadcasts = normalizeList(broadcastsResult, ["broadcasts"]).filter((item) => getItemRegionId(item) === selectedRegionId);
        const nextApartments = normalizeList(apartmentsResult, ["apartments"]).filter((item) => getItemRegionId(item) === selectedRegionId);
        const apartmentNameById = new Map(
          nextApartments.map((apt) => [
            String(normalizeId(apt) || apt?.apartmentId || apt?.apartment_id || ""),
            String(apt?.name || ""),
          ])
        );
        const nextApartmentNotices = normalizeList(apartmentPostsResult, ["posts"]).filter((item) => {
          const itemRegionId = getItemRegionId(item);
          return itemRegionId === selectedRegionId && (String(item?.postType || item?.post_type || "").toLowerCase() === "notice" || String(item?.category || "").toLowerCase() === "notice");
        }).map((item) => {
          const aptId = String(item?.apartmentId || item?.apartment_id || "");
          return {
            ...item,
            apartmentName: item?.apartmentName || apartmentNameById.get(aptId) || "",
          };
        });

        setContent({
          notices: nextNotices,
          events: mergedEvents,
          festivals: nextFestivals,
          missions: nextMissions,
          broadcasts: nextBroadcasts,
          auditions: [],
          news: [],
          apartments: nextApartments,
          "apartment-notices": nextApartmentNotices,
          shops: [],
          flyers: [],
          banners: [],
          intro: null,
          stats: statsResult,
        });

        setLoading(false);

        // 모바일 체감 속도를 위해 비핵심 섹션은 2차 비동기 로딩으로 채운다.
        Promise.all([
          storageAdapter.getAuditions({ regionId: selectedRegionId }).catch(() => []),
          storageAdapter.getAdminRegionNews({ regionId: selectedRegionId }).catch(() => []),
          storageAdapter.getShops({ regionId: selectedRegionId }).catch(() => []),
          storageAdapter.getRegionFlyers(selectedRegionId).catch(() => []),
          storageAdapter.getRegionIntro(selectedRegionId).catch(() => null),
          storageAdapter.getRegionPortalBanners(selectedRegionId).catch(() => []),
        ]).then(([auditionsResult, newsResult, shopsResult, flyersResult, introResult, bannersResult]) => {
          if (cancelled) return;
          const nextAuditions = normalizeList(auditionsResult, ["auditions"]).filter((item) => getItemRegionId(item) === selectedRegionId);
          const nextNews = Array.isArray(newsResult) ? newsResult : [];
          const nextShops = normalizeList(shopsResult, ["shops"]).filter((item) => getItemRegionId(item) === selectedRegionId || String(item?.region || "").trim() === selectedRegionName);
          const nextFlyers = normalizeList(flyersResult, ["flyers"]).filter((item) => getItemRegionId(item) === selectedRegionId || !getItemRegionId(item));
          const nextIntro = normalizeIntroResult(introResult);
          const nextBanners = normalizeList(bannersResult, ["banners"]);

          setContent((prev) => ({
            ...prev,
            auditions: nextAuditions,
            news: nextNews,
            shops: nextShops,
            flyers: nextFlyers,
            intro: nextIntro,
            banners: nextBanners,
          }));
        });
      } catch (error) {
        if (!cancelled) {
          setToast({ open: true, message: error.message || "운영 데이터를 불러오지 못했습니다.", type: "error" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [allowed, refreshTick, selectedRegionId, selectedRegionName]);

  const sectionCounts = useMemo(() => ({
    notices: content.notices.length,
    events: content.events.length,
    festivals: content.festivals.length,
    missions: content.missions.length,
    broadcasts: content.broadcasts.length,
    auditions: content.auditions.length,
    news: content.news.length,
    apartments: content.apartments.length,
    "apartment-notices": content["apartment-notices"]?.length || 0,
    shops: content.shops.length,
    flyers: content.flyers.length,
    banners: content.banners.length,
    intro: (content.intro?.content || (Array.isArray(content.intro?.images) && content.intro.images.length > 0) || (Array.isArray(content.intro?.sections) && content.intro.sections.length > 0)) ? 1 : 0,
  }), [content]);

  const summaryCards = useMemo(() => {
    const statsSource = content.stats && typeof content.stats === "object" ? content.stats : {};
    return [
      { label: "공지", value: content.notices.length || statsSource.noticeCount || 0 },
      { label: "이벤트", value: content.events.length || statsSource.eventCount || 0 },
      { label: "미션", value: content.missions.length || statsSource.missionCount || 0 },
      { label: "지역행사", value: content.festivals.length || 0 },
      { label: "방송", value: content.broadcasts.length || statsSource.broadcastCount || 0 },
      { label: "오디션", value: content.auditions.length || 0 },
      { label: "뉴스", value: content.news.length || 0 },
      { label: "아파트", value: content.apartments.length || statsSource.apartmentCount || 0 },
      { label: "상점", value: content.shops.length || statsSource.shopCount || 0 },
      { label: "전단", value: content.flyers.length || 0 },
    ];
  }, [content]);

  const getEditorFields = (section) => {
    switch (section) {
      case "notices":
        return [
          { key: "title", label: "제목", type: "text", placeholder: "공지 제목" },
          { key: "content", label: "내용", type: "textarea", rows: 5, placeholder: "공지 내용을 입력하세요" },
          {
            key: "imageUrl",
            label: "공지 이미지",
            type: "custom",
            customRender: (value, onChange) => (
              <MultiImageUploader
                value={value ? [value] : []}
                maxImages={1}
                onChange={(nextImages) => onChange(Array.isArray(nextImages) && nextImages[0] ? nextImages[0] : "")}
                uploadImage={async (file) => {
                  const result = await storageAdapter.uploadContentImage(file, { context: 'regional-notices' });
                  return result.imageUrl || result.url || "";
                }}
                onError={(message) => setToast({ open: true, message, type: "error" })}
                helperText="공지 이미지는 1장까지 등록할 수 있습니다."
              />
            ),
          },
          { key: "isPinned", label: "상단 고정", type: "checkbox" },
          { key: "isPublic", label: "공개", type: "checkbox" },
        ];
      case "events":
        return [
          { key: "title", label: "제목", type: "text", placeholder: "이벤트 제목" },
          { key: "description", label: "설명", type: "textarea", rows: 4, placeholder: "이벤트 설명" },
          {
            key: "images",
            label: "이미지",
            type: "custom",
            customRender: (value, onChange) => (
              <MultiImageUploader
                value={value}
                onChange={onChange}
                uploadImage={async (file) => {
                  const result = await storageAdapter.uploadContentImage(file, { context: 'regional-events' });
                  return result.imageUrl || result.url || "";
                }}
                onError={(message) => setToast({ open: true, message, type: "error" })}
                helperText="이벤트 이미지는 최대 3장까지 등록할 수 있습니다."
              />
            ),
          },
          { key: "category", label: "카테고리", type: "select", options: EVENT_CATEGORY_OPTIONS.map((value) => ({ value, label: value })) },
          { key: "rewardType", label: "보상 유형", type: "select", options: [
            { value: "points", label: "포인트" },
            { value: "vip", label: "VIP 상품권" },
          ]},
          { key: "points", label: editor.form?.rewardType === "vip" ? "상품권 액면가 (원)" : "포인트", type: "number", placeholder: "0" },
          { key: "startDate", label: "시작일", type: "date" },
          { key: "endDate", label: "종료일", type: "date" },
          { key: "isActive", label: "활성", type: "checkbox" },
        ];
      case "festivals":
        return [
          { key: "title", label: "제목", type: "text", placeholder: "지역행사 제목" },
          { key: "description", label: "설명", type: "textarea", rows: 4, placeholder: "지역행사 설명" },
          { key: "location", label: "장소", type: "text", placeholder: "예) 경산 시민광장" },
          { key: "startDate", label: "시작일", type: "date" },
          { key: "endDate", label: "종료일", type: "date" },
          {
            key: "images",
            label: "이미지",
            type: "custom",
            customRender: (value, onChange) => (
              <MultiImageUploader
                value={value}
                onChange={onChange}
                uploadImage={async (file) => {
                  const result = await storageAdapter.uploadContentImage(file, { context: 'regional-festivals' });
                  return result.imageUrl || result.url || "";
                }}
                onError={(message) => setToast({ open: true, message, type: "error" })}
                helperText="최대 3장까지 업로드할 수 있습니다."
              />
            ),
          },
        ];
      case "missions":
        return [
          { key: "title", label: "제목", type: "text", placeholder: "미션 제목" },
          { key: "description", label: "설명", type: "textarea", rows: 4, placeholder: "미션 설명" },
          { key: "category", label: "카테고리", type: "select", options: MISSION_CATEGORY_OPTIONS.map((value) => ({ value, label: value })) },
          { key: "rewardType", label: "보상 유형", type: "select", options: [
            { value: "points", label: "포인트" },
            { value: "vip", label: "VIP 상품권" },
          ]},
          { key: "points", label: editor.form?.rewardType === "vip" ? "상품권 액면가 (원)" : "포인트", type: "number", placeholder: "0" },
          { key: "startDate", label: "시작일", type: "date" },
          { key: "endDate", label: "종료일", type: "date" },
          {
            key: "images",
            label: "이미지",
            type: "custom",
            customRender: (value, onChange) => (
              <MultiImageUploader
                value={value}
                onChange={onChange}
                uploadImage={async (file) => {
                  const result = await storageAdapter.uploadContentImage(file, { context: 'regional-missions' });
                  return result.imageUrl || result.url || "";
                }}
                onError={(message) => setToast({ open: true, message, type: "error" })}
                helperText="최대 3장까지 업로드할 수 있습니다."
              />
            ),
          },
          { key: "isActive", label: "활성", type: "checkbox" },
        ];
      case "broadcasts":
        return [
          { key: "title", label: "제목", type: "text", placeholder: "방송 제목" },
          { key: "videoUrl", label: "영상 URL", type: "text", placeholder: "https://..." },
          { key: "thumbnail", label: "썸네일 URL", type: "text", placeholder: "https://..." },
          { key: "description", label: "설명", type: "textarea", rows: 3, placeholder: "방송 설명" },
          { key: "isPublic", label: "공개", type: "checkbox" },
        ];
      case "auditions":
        return [
          { key: "title", label: "제목", type: "text", placeholder: "오디션 제목" },
          { key: "description", label: "설명", type: "textarea", rows: 4, placeholder: "오디션 설명" },
          { key: "type", label: "타입", type: "select", options: AUDITION_TYPE_OPTIONS.map((value) => ({ value, label: AUDITION_TYPE_LABELS[value] || value })) },
          { key: "districtId", label: "구/군", type: "district" },
          { key: "status", label: "상태", type: "select", options: AUDITION_STATUS_OPTIONS.map((value) => ({ value, label: value })) },
          { key: "published", label: "게시", type: "checkbox" },
          { key: "startAt", label: "신청 시작", type: "date", min: auditionDateFloor.slice(0, 10) },
          { key: "endAt", label: "신청 종료", type: "date", min: editor.form?.startAt || auditionDateFloor.slice(0, 10) },
          {
            key: "images",
            label: "이미지",
            type: "custom",
            customRender: (value, onChange) => (
              <MultiImageUploader
                value={value}
                maxImages={1}
                onChange={onChange}
                uploadImage={async (file) => {
                  const result = await storageAdapter.uploadContentImage(file, { context: 'regional-auditions' });
                  return result.imageUrl || result.url || "";
                }}
                onError={(message) => setToast({ open: true, message, type: "error" })}
                helperText="메인 화면 노출용 이미지 1장만 등록할 수 있습니다."
              />
            ),
          },
          { key: "isActive", label: "활성", type: "checkbox" },
        ];
      case "news":
        return [
          { key: "title", label: "제목", type: "text", placeholder: "뉴스 제목" },
          { key: "content", label: "내용", type: "textarea", rows: 5, placeholder: "뉴스 내용" },
          {
            key: "images",
            label: "이미지",
            type: "custom",
            customRender: (value, onChange) => (
              <MultiImageUploader
                value={value}
                onChange={onChange}
                uploadImage={async (file) => {
                  const result = await storageAdapter.uploadContentImage(file, { context: 'regional-news' });
                  return result.imageUrl || result.url || "";
                }}
                onError={(message) => setToast({ open: true, message, type: "error" })}
                helperText="뉴스 이미지는 최대 3장까지 등록할 수 있습니다."
              />
            ),
          },
          { key: "districtId", label: "구/군", type: "district" },
          { key: "isPinned", label: "상단 고정", type: "checkbox" },
          { key: "isPublic", label: "공개", type: "checkbox" },
        ];
      case "apartments":
        return [
          { key: "name", label: "아파트명", type: "text", placeholder: "단지명" },
          { key: "districtId", label: "구/군", type: "district" },
          { key: "address", label: "주소", type: "text", placeholder: "상세 주소" },
          { key: "households", label: "세대수", type: "number", placeholder: "0" },
          { key: "floors", label: "층수", type: "number", placeholder: "0" },
          { key: "builtYear", label: "준공연도", type: "number", placeholder: "2020" },
          { key: "managerPhone", label: "관리 연락처", type: "text", placeholder: "02-0000-0000" },
          {
            key: "thumbnail",
            label: "대표 이미지",
            type: "custom",
            customRender: (value, onChange) => (
              <MultiImageUploader
                value={value ? [value] : []}
                onChange={(nextImages) => onChange(Array.isArray(nextImages) && nextImages[0] ? nextImages[0] : "")}
                maxImages={1}
                uploadImage={async (file) => {
                  const result = await storageAdapter.uploadContentImage(file, { context: 'regional-apartments' });
                  return result.imageUrl || result.url || "";
                }}
                onError={(message) => setToast({ open: true, message, type: "error" })}
                helperText="대표 이미지를 1장 업로드합니다."
              />
            ),
          },
          { key: "sortOrder", label: "정렬 순서", type: "number", placeholder: "0" },
          { key: "isActive", label: "활성", type: "checkbox" },
        ];
      case "apartment-notices":
        return [
          { key: "title", label: "제목", type: "text", placeholder: "공지 제목", required: true },
          { key: "content", label: "내용", type: "textarea", rows: 6, placeholder: "공지 내용", required: true },
          { key: "apartmentId", label: "아파트", type: "select", options: content.apartments.map(apt => ({ value: String(apt.id || apt.apartmentId || apt.apartment_id), label: apt.name })) },
          { key: "isPinned", label: "상단 고정", type: "checkbox" },
          {
            key: "images",
            label: "이미지",
            type: "custom",
            customRender: (value, onChange) => (
              <MultiImageUploader
                value={value}
                onChange={onChange}
                uploadImage={async (file) => {
                  const result = await storageAdapter.uploadContentImage(file, { context: 'apartment-notices' });
                  return result.imageUrl || result.url || "";
                }}
                onError={(message) => setToast({ open: true, message, type: "error" })}
                helperText="공지 이미지는 최대 5장까지 등록할 수 있습니다."
              />
            ),
          },
        ];
      case "shops":
        return [
          { key: "name", label: "상점명", type: "text", placeholder: "상점명" },
          { key: "category", label: "업종", type: "text", placeholder: "예) 카페" },
          { key: "description", label: "소개", type: "textarea", rows: 4, placeholder: "상점 소개" },
          { key: "owner", label: "대표자", type: "text", placeholder: "대표자명" },
          { key: "phone", label: "연락처", type: "text", placeholder: "010-0000-0000" },
          { key: "address", label: "주소", type: "text", placeholder: "상세 주소" },
          { key: "thumbnail", label: "대표 이미지 URL", type: "text", placeholder: "https://..." },
          { key: "districtId", label: "구/군", type: "district" },
          { key: "status", label: "승인 상태", type: "select", options: SHOP_STATUS_OPTIONS.map((value) => ({ value, label: value })) },
          { key: "isVisible", label: "노출", type: "checkbox" },
          { key: "reviewAllowed", label: "리뷰 허용", type: "checkbox" },
          { key: "vipVoucherCount", label: "VIP 상품권 수", type: "number", placeholder: "0" },
        ];
      case "flyers":
        return [
          { key: "title", label: "제목", type: "text", placeholder: "전단 제목" },
          { key: "shopName", label: "상점명", type: "text", placeholder: "연결 상점명" },
          { key: "category", label: "카테고리", type: "text", placeholder: "예) 할인" },
          {
            key: "images",
            label: "전단 이미지",
            type: "custom",
            customRender: (value, onChange) => (
              <MultiImageUploader
                value={value}
                maxImages={5}
                countText="이미지 등록"
                onChange={onChange}
                uploadImage={async (file) => {
                  const result = await storageAdapter.uploadContentImage(file, { context: 'regional-flyers' });
                  return result.imageUrl || result.url || "";
                }}
                onError={(message) => setToast({ open: true, message, type: "error" })}
                helperText="전단 이미지를 등록할 수 있습니다."
              />
            ),
          },
          { key: "pointReward", label: "포인트 보상", type: "number", placeholder: "0" },
          { key: "pointEnabled", label: "포인트 지급", type: "checkbox" },
          { key: "startAt", label: "시작일", type: "date" },
          { key: "endAt", label: "종료일", type: "date" },
          { key: "isActive", label: "활성", type: "checkbox" },
        ];
      case "banners":
        return [
          { key: "title", label: "배너 제목", type: "text", placeholder: "광고 제목" },
          {
            key: "imageUrl",
            label: "배너 이미지",
            type: "custom",
            customRender: (value, onChange) => (
              <MultiImageUploader
                value={value ? [value] : []}
                maxImages={1}
                onChange={(nextImages) => onChange(Array.isArray(nextImages) && nextImages[0] ? nextImages[0] : "")}
                uploadImage={async (file) => {
                  const result = await storageAdapter.uploadBannerImage(file);
                  return result.imageUrl || result.url || "";
                }}
                onError={(message) => setToast({ open: true, message, type: "error" })}
                helperText="지역포털 하단에 노출됩니다. 3:1 비율 권장 (1200x400 이상)."
              />
            ),
          },
          { key: "linkUrl", label: "연결 링크", type: "text", placeholder: "https://example.com (선택)" },
          { key: "startDate", label: "노출 시작일", type: "date" },
          { key: "endDate", label: "노출 종료일", type: "date" },
          { key: "priority", label: "우선순위", type: "number", placeholder: "0" },
          { key: "isActive", label: "활성", type: "checkbox" },
        ];
      case "intro":
        return [
          { key: "content", label: "소개 문구", type: "textarea", rows: 6, placeholder: "지역 소개 내용을 입력하세요" },
          {
            key: "images",
            label: "소개 이미지",
            type: "custom",
            customRender: (value, onChange) => (
              <MultiImageUploader
                value={value}
                maxImages={10}
                countText="이미지 등록"
                onChange={onChange}
                uploadImage={async (file) => {
                  const result = await storageAdapter.uploadContentImage(file, { context: "regional-intro" });
                  return result.imageUrl || result.url || "";
                }}
                onError={(message) => setToast({ open: true, message, type: "error" })}
                helperText="지역 소개 대표 이미지를 최대 10장까지 등록할 수 있습니다."
              />
            ),
          },
          {
            key: "introSections",
            label: "섹션 (제목 + 내용 + 이미지 최대 10장)",
            type: "custom",
            customRender: (value, onChange) => {
              const sections = Array.isArray(value) ? value : [];
              return (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>섹션 {sections.length}개</span>
                    <button
                      type="button"
                      onClick={() => onChange([...sections, { title: '', content: '', images: [], createdAt: Date.now() }])}
                      style={{ minHeight: 34, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0f766e,#0891b2)', color: '#fff', padding: '0 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >+ 섹션 추가</button>
                  </div>
                  {sections.length === 0 && (
                    <div style={{ borderRadius: 10, background: 'rgba(248,250,252,0.92)', color: '#94a3b8', fontSize: 12, padding: '12px 10px', textAlign: 'center' }}>섹션마다 제목/내용/이미지를 함께 관리합니다.</div>
                  )}
                  <div style={{ display: 'grid', gap: 8 }}>
                    {sections.map((sec, i) => (
                      <div key={`intro-sec-${i}`} style={{ border: '1px solid rgba(148,163,184,0.22)', borderRadius: 12, padding: 10, background: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: '#0f766e', fontWeight: 700 }}>내용 블록 {i + 1}</span>
                          <button
                            type="button"
                            onClick={() => onChange(sections.filter((_, idx) => idx !== i))}
                            style={{ ...buttonBaseStyle, color: '#dc2626', minHeight: 28, padding: '0 8px', fontSize: 11 }}
                          >삭제</button>
                        </div>
                        <input
                          type="text"
                          value={sec.title || ''}
                          placeholder="제목 (선택사항)"
                          onChange={(e) => { const next = sections.map((s, idx) => idx === i ? { ...s, title: e.target.value } : s); onChange(next); }}
                          style={{ ...inputStyle, minHeight: 36, marginBottom: 6 }}
                        />
                        <textarea
                          value={sec.content || ''}
                          placeholder="내용을 입력하세요"
                          rows={4}
                          onChange={(e) => { const next = sections.map((s, idx) => idx === i ? { ...s, content: e.target.value } : s); onChange(next); }}
                          style={{ ...textareaStyle }}
                        />

                        <div style={{ marginTop: 8, borderTop: '1px solid rgba(148,163,184,0.16)', paddingTop: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>이미지 {(Array.isArray(sec.images) ? sec.images.length : 0)}/10</span>
                            <button
                              type="button"
                              onClick={async () => {
                                const picker = document.createElement('input');
                                picker.type = 'file';
                                picker.accept = 'image/jpeg,image/png,image/gif,image/webp';
                                picker.multiple = true;
                                picker.onchange = async () => {
                                  const files = picker.files;
                                  if (!files || !files.length) return;
                                  const current = Array.isArray(sec.images) ? sec.images : [];
                                  const remaining = 10 - current.length;
                                  if (remaining <= 0) return;
                                  const added = [];
                                  for (const [offset, file] of Array.from(files).slice(0, remaining).entries()) {
                                    try {
                                      const result = await storageAdapter.uploadContentImage(file, { context: 'regional-intro' });
                                      const url = result.imageUrl || result.url || '';
                                      if (url) added.push({ url, createdAt: Date.now() + offset });
                                    } catch (err) {
                                      setToast({ open: true, message: err.message || '업로드 실패', type: 'error' });
                                    }
                                  }
                                  if (!added.length) return;
                                  const next = sections.map((s, idx) => idx === i ? { ...s, images: [...current, ...added] } : s);
                                  onChange(next);
                                };
                                picker.click();
                              }}
                              style={{ ...buttonBaseStyle, minHeight: 28, padding: '0 8px', fontSize: 11 }}
                            >이미지 추가</button>
                          </div>
                          <div style={{ display: 'grid', gap: 6 }}>
                            {(Array.isArray(sec.images) ? sec.images : []).map((img, idx) => {
                              const src = typeof img === 'string' ? img : (img?.url || img?.imageUrl || '');
                              if (!src) return null;
                              return (
                                <div key={`intro-sec-${i}-img-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8, padding: 6 }}>
                                  <img src={src} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                                  <div style={{ flex: 1, fontSize: 12, color: '#64748b' }}>이미지 {idx + 1}</div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = Array.isArray(sec.images) ? sec.images : [];
                                      const next = sections.map((s, sIdx) => sIdx === i ? { ...s, images: current.filter((_, k) => k !== idx) } : s);
                                      onChange(next);
                                    }}
                                    style={{ ...buttonBaseStyle, color: '#dc2626', minHeight: 28, padding: '0 8px', fontSize: 11 }}
                                  >삭제</button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            },
          },
        ];
      default:
        return [];
    }
  };

  const buildForm = (section, item) => {
    switch (section) {
      case "notices":
        return {
          title: item?.title || "",
          content: item?.content || "",
          imageUrl: item?.imageUrl || item?.image_url || "",
          isPinned: !!item?.isPinned,
          isPublic: item?.isPublic !== false,
        };
      case "events":
        return {
          title: item?.title || "",
          description: item?.description || item?.content || "",
          images: normalizeImageList(item?.images),
          category: item?.category || "general",
          rewardType: item?.rewardType ?? item?.reward_type ?? "points",
          points: item?.points ?? item?.reward_points ?? 0,
          startDate: formatDateInput(item?.startDate || item?.start_at),
          endDate: formatDateInput(item?.endDate || item?.end_at),
          isActive: item?.isActive !== false,
        };
      case "festivals":
        return {
          title: item?.title || "",
          description: item?.description || item?.content || "",
          location: item?.location || "",
          startDate: formatDateInput(item?.startDate || item?.start_at),
          endDate: formatDateInput(item?.endDate || item?.end_at),
          images: normalizeImageList(item?.images),
        };
      case "missions":
        return {
          title: item?.title || "",
          description: item?.description || "",
          category: item?.category || "general",
          rewardType: item?.rewardType ?? item?.reward_type ?? "points",
          points: item?.points ?? item?.reward_points ?? 0,
          startDate: formatDateInput(item?.startDate),
          endDate: formatDateInput(item?.endDate),
          images: normalizeImageList(item?.images),
          isActive: item?.isActive !== false,
        };
      case "broadcasts":
        return {
          title: item?.title || "",
          videoUrl: item?.videoUrl || item?.video_url || "",
          thumbnail: item?.thumbnail || "",
          description: item?.description || "",
          isPublic: item?.isPublic !== false,
        };
      case "auditions":
        return {
          title: item?.title || "",
          description: item?.description || "",
          type: item?.type || "NOTICE",
          districtId: item?.districtId || item?.district_id || "",
          status: item?.status || "OPEN",
          published: item?.published !== false,
          startAt: formatDateInput(item?.startAt || item?.start_at),
          endAt: formatDateInput(item?.endAt || item?.end_at),
          images: normalizeImageList(item?.images && item.images.length ? item.images : [item?.posterUrl, item?.poster_url, item?.imageUrl, item?.image_url]),
          isActive: item?.isActive !== false,
        };
      case "news":
        return {
          title: item?.title || "",
          content: item?.content || "",
          images: normalizeImageList(item?.images && item.images.length ? item.images : [item?.thumbnail]),
          districtId: item?.districtId || item?.district_id || "",
          isPinned: !!item?.isPinned,
          isPublic: item?.isPublic !== false,
        };
      case "apartments":
        return {
          name: item?.name || "",
          districtId: item?.districtId || item?.district_id || "",
          address: item?.address || "",
          households: item?.households ?? 0,
          floors: item?.floors ?? 0,
          builtYear: item?.builtYear || item?.built_year || "",
          managerPhone: item?.managerPhone || item?.manager_phone || "",
          thumbnail: item?.thumbnail || "",
          sortOrder: item?.sortOrder ?? item?.sort_order ?? 0,
          isActive: item?.isActive !== false,
        };
      case "apartment-notices": {
        const defaultApartmentId = String(normalizeId(content.apartments?.[0]) || "");
        return {
          title: item?.title || "",
          content: item?.content || "",
          apartmentId: String(item?.apartmentId || item?.apartment_id || defaultApartmentId),
          isPinned: !!item?.isPinned,
          images: normalizeImageList(item?.images),
        };
      }
      case "shops":
        return {
          name: item?.name || "",
          category: item?.category || "",
          description: item?.description || "",
          owner: item?.owner || "",
          phone: item?.phone || "",
          address: item?.address || "",
          thumbnail: item?.thumbnail || "",
          districtId: item?.districtId || item?.district_id || "",
          status: item?.status || "pending",
          isVisible: item?.isVisible !== false,
          reviewAllowed: item?.reviewAllowed !== false,
          vipVoucherCount: item?.vipVoucherCount ?? item?.vip_voucher_count ?? 0,
        };
      case "flyers":
        return {
          title: item?.title || "",
          shopName: item?.shopName || item?.shop_name || "",
          category: item?.category || "",
          images: normalizeImageList(item?.images || [], 5),
          pointReward: item?.pointReward ?? item?.point_reward ?? 0,
          pointEnabled: !!(item?.pointEnabled ?? item?.point_enabled),
          startAt: formatDateInput(item?.startAt || item?.start_at),
          endAt: formatDateInput(item?.endAt || item?.end_at),
          isActive: item?.isActive !== false,
        };
      case "banners":
        return {
          title: item?.title || "",
          imageUrl: item?.imageUrl || item?.image_url || "",
          linkUrl: item?.linkUrl || item?.link_url || "",
          startDate: formatDateInput(item?.startDate || item?.start_date),
          endDate: formatDateInput(item?.endDate || item?.end_date),
          priority: item?.priority ?? 0,
          isActive: item?.isActive !== false,
        };
      case "intro": {
        const introItem = item || content.intro || {};
        const rawImages = Array.isArray(introItem?.images) ? introItem.images : [];
        const rawSections = (() => {
          const s = introItem?.sections;
          if (Array.isArray(s)) return s;
          if (typeof s === 'string') { try { const p = JSON.parse(s); return Array.isArray(p) ? p : []; } catch { return []; } }
          return [];
        })();

        const normalizeImages = (images) => (Array.isArray(images) ? images : [])
          .map((img) => ({
            url: typeof img === 'string' ? img : (img?.url || img?.imageUrl || ''),
            createdAt: typeof img === 'object' && img ? (img.createdAt || img.created_at || '') : '',
          }))
          .filter((it) => it.url)
          .slice(0, 10);

        const normalizedSections = rawSections.map((s) => ({
          title: s?.title || '',
          content: s?.content || '',
          images: normalizeImages(s?.images),
          createdAt: s?.createdAt || s?.created_at || '',
        }));

        return {
          content: introItem?.content || "",
          images: normalizeImageList(rawImages, 10),
          introSections: normalizedSections,
        };
      }
      default:
        return {};
    }
  };

  const openCreateEditor = (section) => {
    setEditor({ section, mode: "create", itemId: null, form: buildForm(section, null) });
  };

  const openEditEditor = (section, item) => {
    setEditor({ section, mode: "edit", itemId: normalizeId(item) || selectedRegionId, form: buildForm(section, item) });
  };

  const closeEditor = () => {
    setEditor({ section: null, mode: "create", itemId: null, form: {} });
  };

  const updateField = (key, value) => {
    setEditor((prev) => ({ ...prev, form: { ...prev.form, [key]: value } }));
  };

  const refreshData = () => setRefreshTick((prev) => prev + 1);

  const withGuard = (condition, message) => {
    if (!condition) {
      setToast({ open: true, message, type: "error" });
      return false;
    }
    return true;
  };

  const saveEditor = async () => {
    if (!editor.section || !selectedRegionId) return;
    const form = editor.form;

    try {
      setSaving(true);
      // [MISSION-FRONT-PAYLOAD] 로그 (missions, events만)
      let payload = { ...form };
      if (editor.section === "missions" || editor.section === "events") {
        let regionIds = form.regionIds;
        if (!Array.isArray(regionIds)) {
          if (typeof regionIds === "string" && regionIds) regionIds = [regionIds];
          else regionIds = [selectedRegionId];
        }
        if (!regionIds.length) regionIds = [selectedRegionId];
        payload = {
          ...form,
          regionScope: "REGION",
          regionIds,
          regionId: selectedRegionId,
          regionName: selectedRegionName,
          isActive: !!form.isActive,
        };
        console.log(
          "[MISSION-FRONT-REGION]",
          `section=${editor.section}`,
          "title=", payload.title,
          "regionId=", payload.regionId,
          "regionIds=", payload.regionIds,
          "regionName=", payload.regionName
        );
      }
      switch (editor.section) {
        case "notices": {
          if (!withGuard(form.title?.trim() && form.content?.trim(), "공지 제목과 내용을 입력해주세요.")) return;
          const payload = {
            title: form.title.trim(),
            content: form.content.trim(),
            imageUrl: String(form.imageUrl || '').trim() || null,
            scope: "REGION",
            regionId: selectedRegionId,
            isPinned: !!form.isPinned,
            isPublic: !!form.isPublic,
          };
          if (editor.mode === "edit") await storageAdapter.updateNotice(editor.itemId, payload);
          else await storageAdapter.createNotice(payload);
          break;
        }
        case "events": {
          if (!withGuard(form.title?.trim(), "이벤트 제목을 입력해주세요.")) return;
          const currentEvent = content.events.find((entry) => String(normalizeId(entry) || "") === String(editor.itemId || ""));
          const isLegacyEvent = currentEvent?.__eventSource === "legacy";
          const images = normalizeImageList(form.images);
          const payload = {
            title: form.title.trim(),
            content: String(form.description || "").trim(),
            images,
            thumbnail: images[0] || "",
            imageUrl: images[0] || "",
            category: form.category || "general",
            rewardType: form.rewardType || "points",
            points: Number(form.points || 0),
            startAt: form.startDate || null,
            endAt: form.endDate || null,
            regionId: selectedRegionId,
            regionName: selectedRegionName,
            regionScope: "REGION",
            regionIds: [selectedRegionId],
            isActive: !!form.isActive,
          };
          if (isLegacyEvent) {
            await storageAdapter.upsertEvent(editor.mode === "edit" ? { ...payload, id: editor.itemId } : payload);
          } else {
            await storageAdapter.upsertRegionEvent(selectedRegionId, editor.mode === "edit" ? { ...payload, id: editor.itemId } : payload);
          }
          break;
        }
        case "festivals": {
          if (!withGuard(form.title?.trim(), "지역행사 제목을 입력해주세요.")) return;
          const images = normalizeImageList(form.images);
          const payload = {
            title: form.title.trim(),
            content: String(form.description || "").trim(),
            location: String(form.location || "").trim() || null,
            images,
            startAt: form.startDate || null,
            endAt: form.endDate || null,
          };
          await storageAdapter.upsertRegionFestival(selectedRegionId, editor.mode === "edit" ? { ...payload, id: editor.itemId } : payload);
          break;
        }
        case "missions": {
          if (!withGuard(form.title?.trim(), "미션 제목을 입력해주세요.")) return;
          const images = normalizeImageList(form.images);
          let regionIds = form.regionIds;
          if (form.regionScope === "REGION" || !form.regionScope) {
            if (Array.isArray(regionIds)) {
              regionIds = regionIds.length > 0 ? regionIds : [selectedRegionId];
            } else if (typeof regionIds === "string") {
              regionIds = [regionIds];
            } else {
              regionIds = [selectedRegionId];
            }
          }
          const payload = {
            title: form.title.trim(),
            description: String(form.description || "").trim(),
            category: form.category || "general",
            rewardType: form.rewardType || "points",
            points: Number(form.points || 0),
            startDate: form.startDate || null,
            endDate: form.endDate || null,
            images,
            regionId: selectedRegionId,
            regionName: selectedRegionName,
            regionScope: "REGION",
            regionIds,
            isActive: !!form.isActive,
          };
          await storageAdapter.upsertMission(editor.mode === "edit" ? { ...payload, id: editor.itemId } : payload);
          break;
        }
        case "broadcasts": {
          if (!withGuard(form.title?.trim(), "방송 제목을 입력해주세요.")) return;
          const payload = {
            title: form.title.trim(),
            videoUrl: String(form.videoUrl || "").trim(),
            thumbnail: String(form.thumbnail || "").trim(),
            description: String(form.description || "").trim(),
            regionId: selectedRegionId,
            isPublic: !!form.isPublic,
          };
          if (editor.mode === "edit") await storageAdapter.updateBroadcast(editor.itemId, payload);
          else await storageAdapter.createBroadcast(payload);
          break;
        }
        case "auditions": {
          if (!withGuard(form.title?.trim(), "오디션 제목을 입력해주세요.")) return;
          const dateError = validateAuditionDateRange(form.startAt, form.endAt);
          if (!withGuard(!dateError, dateError || "오디션 일정이 올바르지 않습니다.")) return;
          const images = normalizeImageList(form.images, 1);
          const payload = {
            title: form.title.trim(),
            description: String(form.description || "").trim(),
            type: form.type || "NOTICE",
            regionId: selectedRegionId,
            districtId: form.districtId || null,
            status: form.status || "OPEN",
            published: !!form.published,
            startAt: form.startAt || null,
            endAt: form.endAt || null,
            images,
            posterUrl: images[0] || "",
            imageUrl: images[0] || "",
            isActive: !!form.isActive,
          };
          await storageAdapter.upsertAudition(editor.mode === "edit" ? { ...payload, id: editor.itemId } : payload);
          break;
        }
        case "news": {
          if (!withGuard(form.title?.trim() && form.content?.trim(), "뉴스 제목과 내용을 입력해주세요.")) return;
          const images = normalizeImageList(form.images);
          const payload = {
            title: form.title.trim(),
            content: form.content.trim(),
            images,
            thumbnail: images[0] || "",
            regionId: selectedRegionId,
            districtId: form.districtId || null,
            isPinned: !!form.isPinned,
            isPublic: !!form.isPublic,
          };
          if (editor.mode === "edit") await storageAdapter.updateAdminRegionNews(editor.itemId, payload);
          else await storageAdapter.createAdminRegionNews(payload);
          break;
        }
        case "apartments": {
          if (!withGuard(form.name?.trim(), "아파트명을 입력해주세요.")) return;
          const payload = {
            ...(editor.mode === "edit" ? { id: editor.itemId } : {}),
            regionId: selectedRegionId,
            districtId: form.districtId || null,
            name: form.name.trim(),
            address: String(form.address || "").trim(),
            households: parseInt(form.households, 10) || 0,
            floors: parseInt(form.floors, 10) || 0,
            builtYear: parseInt(form.builtYear, 10) || null,
            managerPhone: String(form.managerPhone || "").trim(),
            thumbnail: String(form.thumbnail || "").trim(),
            isActive: !!form.isActive,
            sortOrder: parseInt(form.sortOrder, 10) || 0,
          };
          await storageAdapter.upsertApartment(payload);
          break;
        }
        case "apartment-notices": {
          if (!withGuard(form.title?.trim(), "공지 제목을 입력해주세요.")) return;
          if (!withGuard(String(form.apartmentId || "").trim(), "아파트를 선택해주세요.")) return;
          const images = normalizeImageList(form.images);
          const payload = {
            apartmentId: String(form.apartmentId || "").trim(),
            regionId: selectedRegionId,
            title: form.title.trim(),
            content: String(form.content || "").trim(),
            postType: "notice",
            images,
            isPinned: !!form.isPinned,
          };
          if (editor.mode === "edit") {
            await storageAdapter.updateApartmentPost(editor.itemId, payload);
          } else {
            await storageAdapter.createApartmentPost(payload);
          }
          break;
        }
        case "shops": {
          if (!withGuard(form.name?.trim(), "상점명을 입력해주세요.")) return;
          const payload = {
            ...(editor.mode === "edit" ? { id: editor.itemId } : {}),
            name: form.name.trim(),
            category: String(form.category || "").trim(),
            description: String(form.description || "").trim(),
            owner: String(form.owner || "").trim(),
            phone: String(form.phone || "").trim(),
            address: String(form.address || "").trim(),
            thumbnail: String(form.thumbnail || "").trim(),
            regionId: selectedRegionId,
            districtId: form.districtId || null,
            status: form.status || "pending",
            isVisible: !!form.isVisible,
            reviewAllowed: !!form.reviewAllowed,
            vipVoucherCount: parseInt(form.vipVoucherCount, 10) || 0,
          };
          await storageAdapter.upsertShop(payload, memberId);
          break;
        }
        case "flyers": {
          if (!withGuard(isAdminLevel, "현재 전단 관리 API는 관리자 권한에서만 수정할 수 있습니다.")) return;
          if (!withGuard(form.title?.trim(), "전단 제목을 입력해주세요.")) return;
          const payload = {
            title: form.title.trim(),
            shopName: String(form.shopName || "").trim(),
            category: String(form.category || "").trim(),
            images: (Array.isArray(form.images) ? form.images : []).map(img => ({ url: typeof img === 'string' ? img : (img?.url || ''), createdAt: (typeof img === 'object' && img?.createdAt) ? img.createdAt : Date.now() })).filter(img => img.url),
            pointReward: parseInt(form.pointReward, 10) || 0,
            pointEnabled: !!form.pointEnabled,
            startAt: form.startAt || null,
            endAt: form.endAt || null,
            isActive: !!form.isActive,
          };
          if (editor.mode === "edit") await storageAdapter.updateRegionFlyer(selectedRegionId, editor.itemId, payload);
          else await storageAdapter.createRegionFlyer(selectedRegionId, payload);
          break;
        }
        case "intro": {
          const normalizedImages = (Array.isArray(form.images) ? form.images : [])
            .map((img, imgIdx) => ({
              url: typeof img === "string" ? img : (img?.url || img?.imageUrl || ""),
              createdAt: (typeof img === "object" && img) ? (img.createdAt || img.created_at || Date.now() + imgIdx) : Date.now() + imgIdx,
            }))
            .filter((img) => img.url)
            .slice(0, 10);

          const normalizedSections = (Array.isArray(form.introSections) ? form.introSections : [])
            .filter((s) => s?.title?.trim() || s?.content?.trim() || (Array.isArray(s?.images) && s.images.length > 0))
            .map((s, index) => ({
              title: String(s.title || '').trim(),
              content: String(s.content || '').trim(),
              images: (Array.isArray(s.images) ? s.images : [])
                .map((img, imgIdx) => ({
                  url: typeof img === 'string' ? img : (img?.url || img?.imageUrl || ''),
                  createdAt: (typeof img === 'object' && img) ? (img.createdAt || img.created_at || Date.now() + imgIdx) : Date.now() + imgIdx,
                }))
                .filter((img) => img.url)
                .slice(0, 10),
              createdAt: s?.createdAt || s?.created_at || Date.now() + index,
            }));

          const payload = {
            content: String(form.content || "").trim(),
            images: normalizedImages,
            sections: normalizedSections,
            introSections: normalizedSections,
          };
          await storageAdapter.updateRegionIntro(selectedRegionId, payload);
          break;
        }
        case "banners": {
          if (!withGuard(form.title?.trim(), "배너 제목을 입력해주세요.")) return;
          const imageUrl = String(form.imageUrl || "").trim();
          if (!withGuard(imageUrl || editor.mode === "edit", "배너 이미지를 등록해주세요.")) return;
          const payload = {
            title: form.title.trim(),
            imageUrl,
            linkUrl: String(form.linkUrl || "").trim(),
            alt: form.title.trim(),
            type: "region_portal",
            regionId: selectedRegionId,
            regions: [selectedRegionId],
            startDate: form.startDate || null,
            endDate: form.endDate || null,
            priority: parseInt(form.priority, 10) || 0,
            isActive: form.isActive !== false,
          };
          if (editor.mode === "edit") {
            await storageAdapter.upsertBanner({ ...payload, id: editor.itemId });
          } else {
            await storageAdapter.createBanner(payload);
          }
          break;
        }
        default:
          return;
      }

      setToast({ open: true, message: "저장되었습니다.", type: "success" });
      closeEditor();
      refreshData();
    } catch (error) {
      setToast({ open: true, message: error.message || "저장에 실패했습니다.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (section, itemId, item) => {
    if (!window.confirm("삭제하시겠습니까?")) return;

    try {
      setActingId(itemId);

      switch (section) {
        case "notices":
          await storageAdapter.deleteNotice(itemId);
          break;
        case "events":
          if (item?.__eventSource === "legacy") {
            await storageAdapter.deleteEvent(itemId);
          } else {
            await storageAdapter.deleteRegionEvent(selectedRegionId, itemId);
          }
          break;
        case "festivals":
          await storageAdapter.deleteRegionFestival(selectedRegionId, itemId);
          break;
        case "missions":
          await storageAdapter.deleteMission(itemId);
          break;
        case "broadcasts":
          await storageAdapter.deleteBroadcast(itemId);
          break;
        case "auditions":
          await storageAdapter.deleteAudition(itemId);
          break;
        case "news":
          await storageAdapter.deleteAdminRegionNews(itemId);
          break;
        case "apartments":
          await storageAdapter.deleteApartment(itemId);
          break;
        case "apartment-notices":
          await storageAdapter.deleteApartmentPost(itemId);
          break;
        case "shops":
          await storageAdapter.deleteShop(itemId);
          break;
        case "flyers":
          if (!withGuard(isAdminLevel, "현재 전단 삭제 API는 관리자 권한에서만 사용할 수 있습니다.")) return;
          await storageAdapter.deleteRegionFlyer(selectedRegionId, itemId);
          break;
        case "banners":
          await storageAdapter.deleteBanner(itemId);
          break;
        default:
          return;
      }

      setToast({ open: true, message: "삭제되었습니다.", type: "success" });
      refreshData();
    } catch (error) {
      setToast({ open: true, message: error.message || "삭제에 실패했습니다.", type: "error" });
    } finally {
      setActingId(null);
    }
  };

  const toggleBroadcastLive = async (item) => {
    const itemId = normalizeId(item);
    if (!itemId) return;

    try {
      setActingId(itemId);
      if (item?.isLive || item?.is_live) {
        await storageAdapter.stopLiveBroadcast(itemId);
      } else {
        await storageAdapter.startLiveBroadcast(itemId, item.title || "라이브 방송", memberId);
      }
      setToast({ open: true, message: "방송 상태가 변경되었습니다.", type: "success" });
      refreshData();
    } catch (error) {
      setToast({ open: true, message: error.message || "방송 상태 변경에 실패했습니다.", type: "error" });
    } finally {
      setActingId(null);
    }
  };

  const openParticipantsModal = async (section, item) => {
    const itemId = normalizeId(item);
    if (!itemId) return;
    try {
      const list = section === "auditions"
        ? await storageAdapter.getAuditionSubmissions(itemId)
        : await storageAdapter.getProgramParticipants(section === "events" ? "event" : "mission", itemId);
      const normalizedList = Array.isArray(list) ? list : [];
      const itemRegionIds = Array.isArray(item?.regionIds)
        ? item.regionIds.map((value) => String(value || "").trim()).filter(Boolean)
        : (Array.isArray(item?.region_ids)
          ? item.region_ids.map((value) => String(value || "").trim()).filter(Boolean)
          : (selectedRegionId ? [String(selectedRegionId)] : []));
      const extCount = (section === "events" || section === "missions")
        ? normalizedList.filter((participant) => {
            const crossRegion = participant?.crossRegion === true || participant?.crossRegion === 1 || participant?.crossRegion === "1" || String(participant?.crossRegion || "").toLowerCase() === "true";
            if (crossRegion) return true;
            const memberRegionId = String(participant?.memberRegionId || participant?.regionId || "").trim();
            return !!memberRegionId && itemRegionIds.length > 0 && !itemRegionIds.includes(memberRegionId);
          }).length
        : 0;

      setParticipantSection(section);
      setParticipantItem({
        ...item,
        rewardType: item?.rewardType ?? item?.reward_type ?? "points",
        points: Number(item?.points ?? item?.reward_points ?? 0) || 0,
        participantsCount: normalizedList.length,
        extParticipantsCount: extCount,
      });
      setParticipants(normalizedList);
      if (section === "events" || section === "missions") {
        setContent((prev) => ({
          ...prev,
          [section]: (Array.isArray(prev?.[section]) ? prev[section] : []).map((entry) => {
            if (String(normalizeId(entry)) !== String(itemId)) return entry;
            return {
              ...entry,
              participantsCount: normalizedList.length,
              extParticipantsCount: extCount,
            };
          }),
        }));
      }
      setAuditionRankDrafts(section === "auditions"
        ? normalizedList.reduce((acc, submission) => {
            acc[normalizeId(submission)] = normalizeAuditionRankLabel(submission.rankLabel);
            return acc;
          }, {})
        : {});
      setParticipantsModalOpen(true);
    } catch (error) {
      setToast({ open: true, message: error.message || "참여자 정보를 불러오지 못했습니다.", type: "error" });
    }
  };

  const closeParticipantsModal = () => {
    setParticipantsModalOpen(false);
    setParticipantSection(null);
    setParticipantItem(null);
    setParticipants([]);
    setAuditionRankDrafts({});
  };

  const reloadParticipants = async () => {
    if (!participantSection || !participantItem) return;
    if (participantSection === "auditions") {
      const list = await storageAdapter.getAuditionSubmissions(normalizeId(participantItem));
      setParticipants(Array.isArray(list) ? list : []);
      return;
    }
    const itemType = participantSection === "events" ? "event" : "mission";
    const list = await storageAdapter.getProgramParticipants(itemType, normalizeId(participantItem));
    const normalizedList = Array.isArray(list) ? list : [];
    const itemRegionIds = Array.isArray(participantItem?.regionIds)
      ? participantItem.regionIds.map((value) => String(value || "").trim()).filter(Boolean)
      : (Array.isArray(participantItem?.region_ids)
        ? participantItem.region_ids.map((value) => String(value || "").trim()).filter(Boolean)
        : (selectedRegionId ? [String(selectedRegionId)] : []));
    const extCount = normalizedList.filter((participant) => {
      const crossRegion = participant?.crossRegion === true || participant?.crossRegion === 1 || participant?.crossRegion === "1" || String(participant?.crossRegion || "").toLowerCase() === "true";
      if (crossRegion) return true;
      const memberRegionId = String(participant?.memberRegionId || participant?.regionId || "").trim();
      return !!memberRegionId && itemRegionIds.length > 0 && !itemRegionIds.includes(memberRegionId);
    }).length;

    setParticipants(normalizedList);
    setParticipantItem((prev) => prev ? {
      ...prev,
      participantsCount: normalizedList.length,
      extParticipantsCount: extCount,
    } : prev);
    setContent((prev) => ({
      ...prev,
      [participantSection]: (Array.isArray(prev?.[participantSection]) ? prev[participantSection] : []).map((entry) => {
        if (String(normalizeId(entry)) !== String(normalizeId(participantItem))) return entry;
        return {
          ...entry,
          participantsCount: normalizedList.length,
          extParticipantsCount: extCount,
        };
      }),
    }));
  };

  const handleSaveAuditionRank = async (submission, nextValue) => {
    if (participantSection !== "auditions" || !participantItem) return;
    const submissionId = normalizeId(submission);
    try {
      const rankLabel = normalizeAuditionRankLabel(nextValue ?? auditionRankDrafts[submissionId]);
      console.log('[RegionalAdminConsole] save audition rankLabel', {
        auditionId: normalizeId(participantItem),
        submissionId,
        rankLabel,
      });
      await storageAdapter.updateAuditionSubmission(normalizeId(participantItem), submissionId, {
        title: submission.title || '참가자',
        rankLabel,
      });
      setParticipants((prev) => prev.map((item) => normalizeId(item) === submissionId ? { ...item, rankLabel } : item));
      setAuditionRankDrafts((prev) => ({ ...prev, [submissionId]: rankLabel }));
      setToast({ open: true, message: rankLabel ? "등수 뱃지가 저장되었습니다." : "등수 뱃지가 제거되었습니다.", type: "success" });
    } catch (error) {
      setToast({ open: true, message: error.message || "등수 저장에 실패했습니다.", type: "error" });
    }
  };

  const handleSelectParticipant = async (participant) => {
    if (!participantSection || !participantItem) return;
    const itemType = participantSection === "events" ? "event" : "mission";
    await storageAdapter.markParticipationSelection(`${itemType}:${normalizeId(participantItem)}`, participant.memberId, true);
    await reloadParticipants();
    setToast({ open: true, message: "선정 완료. 보상 지급 대기 상태로 전환되었습니다.", type: "success" });
  };

  const handleParticipantStatusChange = async (participant, nextStatus) => {
    if (!participantSection || !participantItem) return;
    const itemType = participantSection === "events" ? "event" : "mission";
    await storageAdapter.updateProgramParticipant(itemType, normalizeId(participantItem), {
      memberId: participant.memberId,
      status: nextStatus,
      adminId: memberId || 'regional-admin',
    });
    await reloadParticipants();
    setToast({ open: true, message: "참여 상태가 변경되었습니다.", type: "success" });
  };

  const handleRewardParticipant = async (participant, rewardForm) => {
    if (!participantSection || !participantItem) return;
    const itemType = participantSection === "events" ? "event" : "mission";
    await storageAdapter.rewardParticipation({
      itemKey: `${itemType}:${normalizeId(participantItem)}`,
      memberId: participant.memberId,
      rewardType: rewardForm.rewardType,
      rewardAmount: rewardForm.rewardAmount,
      rewardDescription: rewardForm.rewardDescription,
      adminId: memberId || 'regional-admin',
    });
    await reloadParticipants();
    setToast({ open: true, message: "보상 지급이 완료되었습니다.", type: "success" });
  };

  const getSectionItems = (section) => {
    if (section === "intro") return content.intro ? [content.intro] : [];
    return Array.isArray(content[section]) ? content[section] : [];
  };

  const getSectionSubtitle = (section) => {
    switch (section) {
      case "notices": return "등록, 수정, 삭제를 한 카드에서 처리합니다.";
      case "events": return "기존 이벤트 API 데이터를 관리합니다.";
      case "festivals": return "지역행사 탭과 동일한 데이터를 관리합니다. 이미지 업로드를 지원합니다.";
      case "missions": return "기존 미션 API를 그대로 묶었습니다.";
      case "broadcasts": return "방송 생성과 라이브 상태 전환을 함께 지원합니다.";
      case "auditions": return "지역 오디션 공고를 동일한 데이터로 운영합니다.";
      case "news": return "메인관리자와 완전히 동일한 뉴스 데이터를 사용합니다.";
      case "banners": return "지역포털 홈 하단에 노출되는 광고 배너입니다.";
      case "apartments": return "단지 등록과 수정, 삭제를 바로 처리합니다.";
      case "apartment-notices": return "아파트 공지 등록/수정은 선택한 단지 기준으로 처리됩니다.";
      case "shops": return "상점과 상권 데이터를 같은 시스템에 바로 반영합니다.";
      case "flyers": return isAdminLevel ? "기존 전단 관리 API를 재사용합니다." : "현재 API 권한상 관리자 이상만 수정 가능합니다.";
      case "intro": return "지역 소개 콘텐츠를 현재 지역 기준으로 수정합니다.";
      default: return "";
    }
  };

  const getItemSummary = (section, item) => {
    switch (section) {
      case "notices":
      case "news":
        return summarizeText(item?.content);
      case "banners":
        return summarizeText(item?.linkUrl || item?.link_url || "링크 없음");
      case "events":
        return summarizeText(item?.description || item?.content);
      case "festivals":
      case "missions":
      case "auditions":
      case "broadcasts":
        return summarizeText(item?.description || item?.content);
      case "apartments":
      case "shops":
        return summarizeText(item?.address || item?.description);
      case "apartment-notices":
        return summarizeText(item?.apartmentName || item?.apartment || item?.content || "");
      case "flyers":
        return summarizeText(item?.shopName || item?.shop_name || item?.category);
      case "intro":
        return summarizeText(item?.content, 120);
      default:
        return "";
    }
  };

  const getItemChips = (section, item) => {
    const itemRewardType = String(item?.rewardType ?? item?.reward_type ?? "points").toLowerCase();
    const itemRewardAmount = Number(item?.points ?? item?.reward_points ?? 0) || 0;
    switch (section) {
      case "notices":
        return [item?.isPinned ? "고정" : "일반", item?.isPublic === false ? "비공개" : "공개", `등록 ${formatDate(item?.createdAt)}`];
      case "events":
        return [item?.category || "general", itemRewardType === "vip" ? `VIP ${itemRewardAmount.toLocaleString("ko-KR")}원` : `${itemRewardAmount.toLocaleString("ko-KR")}P`, (item?.isActive === false || String(item?.status || "").toLowerCase() === "inactive") ? "비활성" : "활성"];
      case "festivals":
        return [item?.location || "장소 미지정", `기간 ${formatDate(item?.startAt || item?.startDate)} ~ ${formatDate(item?.endAt || item?.endDate)}`, item?.isActive === false ? "비활성" : "활성"];
      case "missions":
        return [item?.category || "general", itemRewardType === "vip" ? `VIP ${itemRewardAmount.toLocaleString("ko-KR")}원` : `${itemRewardAmount.toLocaleString("ko-KR")}P`, item?.isActive === false ? "비활성" : "활성"];
      case "broadcasts":
        return [item?.isLive || item?.is_live ? "LIVE" : "대기", item?.isPublic === false ? "비공개" : "공개", `등록 ${formatDate(item?.createdAt)}`];
      case "auditions":
        return [item?.type || "FREE", item?.status || "OPEN", item?.published === false ? "비공개" : "게시"];
      case "news":
        return [item?.isPinned ? "고정" : "일반", item?.isPublic === false ? "비공개" : "공개", `등록 ${formatDate(item?.createdAt)}`];
      case "banners":
        return [
          item?.isActive === false ? "비활성" : "활성",
          `우선순위 ${item?.priority ?? 0}`,
          `${formatDate(item?.startDate)} ~ ${formatDate(item?.endDate)}`,
        ];
      case "apartments":
        return [item?.districtName || item?.district || "구/군 전체", item?.isActive === false ? "비활성" : "활성"];
      case "apartment-notices":
        return [item?.apartmentName || "아파트 미지정", item?.isPinned ? "고정" : "일반", `등록 ${formatDate(item?.createdAt)}`];
      case "shops":
        return [item?.category || "업종 없음", item?.status || "pending", item?.isVisible === false ? "비노출" : "노출"];
      case "flyers":
        return [item?.category || "카테고리 없음", item?.point_enabled || item?.pointEnabled ? `+${item?.point_reward ?? item?.pointReward ?? 0}P` : "포인트 없음", item?.is_active === false || item?.isActive === false ? "비활성" : "활성"];
      case "intro":
        return [
          Array.isArray(item?.sections) ? `섹션 ${item.sections.length}` : "섹션 0",
          `이미지 ${(() => {
            const top = Array.isArray(item?.images) ? item.images.length : 0;
            const section = Array.isArray(item?.sections)
              ? item.sections.reduce((acc, sec) => acc + (Array.isArray(sec?.images) ? sec.images.length : 0), 0)
              : 0;
            return top + section;
          })()}`,
          "지역 소개",
        ];
      default:
        return [];
    }
  };

  const renderEditor = (section) => {
    if (editor.section !== section) return null;

    const fields = getEditorFields(section);
    const requiresAdmin = ["flyers"].includes(section) && !isAdminLevel;

    return (
      <div style={{ border: "1px solid rgba(15, 118, 110, 0.16)", background: "rgba(248,250,252,0.96)", borderRadius: 18, padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{editor.mode === "edit" ? "수정" : "등록"}</div>
          <button type="button" onClick={closeEditor} style={{ ...buttonBaseStyle, minHeight: 34 }}>닫기</button>
        </div>

        {requiresAdmin ? (
          <div style={{ borderRadius: 12, background: "rgba(255,247,237,0.96)", color: "#9a3412", fontSize: 13, padding: "12px 13px", lineHeight: 1.6 }}>
            현재 서버 권한 정책상 이 항목은 관리자 이상 계정에서만 저장할 수 있습니다.
          </div>
        ) : null}

        <div style={{ display: "grid", gap: 10 }}>
          {fields.map((field) => {
            if (field.type === "checkbox") {
              return <FieldRenderer key={field.key} field={field} value={editor.form[field.key]} onChange={updateField} districts={districts} />;
            }

            return (
      <label key={field.key} style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{field.label}</span>
                <FieldRenderer field={field} value={editor.form[field.key] ?? (field.key === "images" ? [] : "")} onChange={updateField} districts={districts} />
              </label>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          <button type="button" onClick={saveEditor} disabled={saving || requiresAdmin} style={{ ...primaryButtonStyle, minHeight: 42, opacity: saving || requiresAdmin ? 0.5 : 1 }}>
            {saving ? "저장 중..." : editor.mode === "edit" ? "수정 저장" : "등록 저장"}
          </button>
          <button type="button" onClick={closeEditor} style={{ ...buttonBaseStyle, minHeight: 42 }}>취소</button>
        </div>
      </div>
    );
  };

  const renderItemRow = (section, item, accent) => {
    const itemId = normalizeId(item) || selectedRegionId;
    const participantsCount = Number(item?.participantsCount ?? item?.participants_count ?? 0) || 0;
    const extParticipantsCount = Number(item?.extParticipantsCount ?? item?.ext_participants_count ?? 0) || 0;
    const localParticipantsCount = Math.max(0, participantsCount - extParticipantsCount);

    return (
      <article key={`${section}-${itemId}`} style={{ border: "1px solid rgba(148, 163, 184, 0.16)", borderRadius: 16, padding: 14, background: "#fbfdff" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ minWidth: 220, flex: "1 1 220px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 14, fontWeight: 800, color: "#0f172a", lineHeight: 1.4 }}>
                <span style={{ wordBreak: "keep-all", overflowWrap: "anywhere" }}>{section === "intro" ? `${selectedRegionName} 소개` : getItemTitle(item)}</span>
              {section === "auditions" ? <span style={{ display: "inline-flex", alignItems: "center", minHeight: 24, padding: "2px 9px", borderRadius: 999, background: `${getAuditionStatusMeta(item).color}14`, color: getAuditionStatusMeta(item).color, fontSize: 11, fontWeight: 800 }}>{getAuditionStatusMeta(item).label}</span> : null}
              {section === "auditions" && getAuditionSelectionMeta(item) ? <span style={{ display: "inline-flex", alignItems: "center", minHeight: 24, padding: "2px 9px", borderRadius: 999, background: `${getAuditionSelectionMeta(item).color}14`, color: getAuditionSelectionMeta(item).color, fontSize: 11, fontWeight: 800 }}>{getAuditionSelectionMeta(item).label}</span> : null}
            </div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, marginTop: 6, wordBreak: "keep-all", overflowWrap: "anywhere" }}>{getItemSummary(section, item)}</div>
          </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", flex: "0 0 auto" }}>
            {section === "broadcasts" ? (
              <button type="button" onClick={() => toggleBroadcastLive(item)} disabled={actingId === itemId} style={{ ...buttonBaseStyle, minHeight: 32, background: `${accent}12`, borderColor: `${accent}22`, color: accent }}>
                {item?.isLive || item?.is_live ? "LIVE 종료" : "LIVE 시작"}
              </button>
            ) : null}
            {(section === "missions" || section === "events" || section === "auditions") ? (
              <button type="button" onClick={() => openParticipantsModal(section, item)} style={{ ...buttonBaseStyle, minHeight: 32, background: `${accent}12`, borderColor: `${accent}22`, color: accent }}>
                {section === "auditions" ? "참가작 관리" : `참여자 (${localParticipantsCount})${section !== "auditions" ? ` · 타지역 (${extParticipantsCount})` : ""}`}
              </button>
            ) : null}
            <button type="button" onClick={() => openEditEditor(section, item)} style={{ ...buttonBaseStyle, minHeight: 32 }}>수정</button>
            {section !== "intro" ? (
              <button type="button" onClick={() => deleteItem(section, itemId, item)} disabled={actingId === itemId} style={{ ...buttonBaseStyle, minHeight: 32, color: "#dc2626" }}>
                삭제
              </button>
            ) : null}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          {getItemChips(section, item).map((chip) => (
            <span key={`${itemId}-${chip}`} style={{ display: "inline-flex", alignItems: "center", padding: "4px 9px", borderRadius: 999, background: `${accent}12`, color: accent, fontSize: 11, fontWeight: 700 }}>
              {chip}
            </span>
          ))}
        </div>
      </article>
    );
  };

  if (!isLoggedIn()) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowed) {
    return (
      <div className="su-app" style={pageStyle}>
        <PageHeader title="지역관리자 콘솔" onBack={() => navigate("/my")} style={{ margin: "10px 16px", borderRadius: "16px" }} />
        <div style={{ padding: "18px 16px 110px", display: "grid", gap: 14, maxWidth: "600px", margin: "0 auto", width: "100%" }}>
          <section style={{ ...sectionCardStyle, background: "linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)", borderRadius: 24, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#9a3412", marginBottom: 8 }}>접근 권한이 없습니다</div>
            <div style={{ fontSize: 13, color: "#7c2d12", lineHeight: 1.7 }}>이 콘솔은 지역관리자 이상 계정만 사용할 수 있습니다. 현재 역할은 {roleMeta.label}입니다.</div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="su-app" style={pageStyle}>
      <PageHeader title="지역관리자 콘솔" onBack={() => navigate("/my")} style={{ margin: "10px 16px", borderRadius: "16px" }} />

      <div style={{ padding: "16px 16px 110px", display: "grid", gap: 14, maxWidth: "600px", margin: "0 auto", width: "100%" }}>
        <section style={{ ...sectionCardStyle, background: "linear-gradient(135deg, #0f766e 0%, #155e75 100%)", color: "#ffffff", borderRadius: 24, padding: 16, textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em" }}>{selectedRegionId ? `${selectedRegionName} 운영 센터` : "운영 지역 준비 중"}</div>
              <div style={{ fontSize: 12, color: "rgba(236,255,253,0.78)", marginTop: 6, lineHeight: 1.6, textAlign: "center" }}>
                현재 지역관리자 권한으로 운영 중입니다.
              </div>
            </div>

            <div style={{ display: "grid", gap: 0, width: "100%", maxWidth: "220px" }}>
              {canSwitchRegions ? (
                <select value={selectedRegionId} onChange={(event) => setSelectedRegionId(event.target.value)} style={{ minHeight: 40, borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.12)", color: "#ffffff", padding: "0 12px", fontSize: 13, fontWeight: 700, textAlign: "center" }}>
                  {allowedRegions.length === 0 ? <option value="">접근 가능 지역 없음</option> : null}
                  {allowedRegions.map((region) => (
                    <option key={region.id} value={region.id} style={{ color: "#0f172a" }}>{resolveRegionName(region)}</option>
                  ))}
                </select>
              ) : (
                <div style={{ minHeight: 40, borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.12)", color: "#ffffff", padding: "0 12px", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {selectedRegionName || "가입 지역 없음"}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(108px, 1fr))", gap: 10, marginTop: 14 }}>
            {summaryCards.map((card) => (
              <div key={card.label} style={{ borderRadius: 16, padding: "12px 10px", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.12)", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(236,255,253,0.75)" }}>{card.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>{card.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={sectionCardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>운영 바로가기</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>포털과 기존 관리화면을 오가면서 같은 데이터를 확인할 수 있습니다.</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            <Link to={selectedRegionId ? `/r/${selectedRegionId}` : "/region"} style={{ ...primaryButtonStyle, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>지역 포털 보기</Link>
            <Link to={selectedRegionId ? `/r/${selectedRegionId}/board` : "/community"} style={{ ...buttonBaseStyle, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>커뮤니티 보기</Link>
            <Link to={selectedRegionId ? `/r/${selectedRegionId}/shops` : "/shops"} style={{ ...buttonBaseStyle, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>상권 / 상점 보기</Link>
            <Link to={selectedRegionId ? `/r/${selectedRegionId}/apt` : "/region"} style={{ ...buttonBaseStyle, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>아파트 보기</Link>
            {isAdminLevel ? <Link to="/admin/contents" style={{ ...buttonBaseStyle, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>기존 콘텐츠 관리</Link> : <button type="button" onClick={refreshData} style={buttonBaseStyle}>콘솔 새로고침</button>}
            {isAdminLevel ? <Link to="/admin/missions" style={{ ...buttonBaseStyle, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>기존 미션/이벤트 관리</Link> : <button type="button" onClick={() => navigate("/my")} style={buttonBaseStyle}>마이오피스로 이동</button>}
          </div>
        </section>

        {loading ? (
          <section style={sectionCardStyle}>
            <div style={{ fontSize: 14, color: "#64748b" }}>지역 데이터를 불러오는 중입니다...</div>
          </section>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
            {SECTION_META.map((meta) => {
              const items = getSectionItems(meta.key);
              return (
                <SectionCard
                  key={meta.key}
                  title={meta.title}
                  accent={meta.accent}
                  count={sectionCounts[meta.key] || 0}
                  subtitle={getSectionSubtitle(meta.key)}
                  action={<button type="button" onClick={() => openCreateEditor(meta.key)} style={primaryButtonStyle}>등록</button>}
                >
                  {renderEditor(meta.key)}
                  {(editor.section === meta.key && (meta.key === "apartments" || meta.key === "apartment-notices" || meta.key === "flyers")) ? null : (
                    items.length === 0
                      ? <EmptyState text={`${meta.title} 데이터가 없습니다.`} />
                      : <div style={{ display: "grid", gap: 10 }}>{items.map((item) => renderItemRow(meta.key, item, meta.accent))}</div>
                  )}
                </SectionCard>
              );
            })}
          </div>
        )}
      </div>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, open: false }))} />
      {participantSection === "auditions" && participantsModalOpen ? (
        <div style={{ position: "fixed", inset: 0, zIndex: 1200, display: "flex" }}>
          <div style={{ flex: 1, background: "rgba(15, 23, 42, 0.46)" }} onClick={closeParticipantsModal} />
          <div style={{ width: "100%", maxWidth: 560, background: "#ffffff", borderLeft: "1px solid rgba(148, 163, 184, 0.22)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(148, 163, 184, 0.18)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#ffffff", zIndex: 1 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>🎬 오디션 참가작 관리</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{participantItem?.title || "오디션"} · {participants.length}건</div>
              </div>
              <button type="button" onClick={closeParticipantsModal} style={{ ...buttonBaseStyle, minHeight: 34 }}>닫기</button>
            </div>

            {!isAuditionClosed(participantItem) ? <div style={{ margin: 16, borderRadius: 14, padding: "12px 14px", background: "rgba(59, 130, 246, 0.08)", color: "#1d4ed8", fontSize: 13, fontWeight: 700 }}>진행중 오디션은 투표 순위가 유지됩니다. 종료 후 심사 결과 뱃지를 입력할 수 있습니다.</div> : null}

            <div style={{ padding: "0 16px 16px", display: "grid", gap: 10 }}>
              {participants.length === 0 ? <div style={{ padding: 24, textAlign: "center", color: "#64748b", fontSize: 13 }}>등록된 참가작이 없습니다.</div> : participants.map((submission, index) => {
                const submissionId = normalizeId(submission);
                const rankDraft = auditionRankDrafts[submissionId] ?? normalizeAuditionRankLabel(submission.rankLabel);
                return (
                  <div key={submissionId} style={{ border: "1px solid rgba(148, 163, 184, 0.18)", borderRadius: 14, padding: 12, background: "#fbfdff" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 88, flexShrink: 0 }}>
                        <div style={{ position: "relative", width: 88, height: 58, borderRadius: 8, overflow: "hidden", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: 20 }}>
                          {submission.thumbnailUrl ? <img src={submission.thumbnailUrl} alt="thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🎬"}
                          {normalizeAuditionRankLabel(submission.rankLabel) ? <div style={{ position: "absolute", top: 6, left: 6, maxWidth: 72, padding: "2px 7px", borderRadius: 999, background: "linear-gradient(135deg,#fff5cc,#f5c451)", color: "#3d2b00", fontSize: 10, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(15,23,42,0.18)" }}>{submission.rankLabel}</div> : null}
                        </div>
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{index + 1}. {submission.title || "(제목 없음)"}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>👤 {submission.memberName || submission.memberId} · ❤️ {submission.votesCount || 0}표</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                          <input value={rankDraft} disabled={!isAuditionClosed(participantItem)} onChange={(event) => setAuditionRankDrafts((prev) => ({ ...prev, [submissionId]: event.target.value }))} placeholder={isAuditionClosed(participantItem) ? "예: 1위, 금상, 대상" : "종료 후 입력 가능"} style={{ flex: 1, minWidth: 150, minHeight: 38, borderRadius: 10, border: "1px solid rgba(148, 163, 184, 0.28)", padding: "0 12px", fontSize: 13, background: isAuditionClosed(participantItem) ? "#ffffff" : "#f8fafc", color: "#0f172a" }} />
                          <button type="button" disabled={!isAuditionClosed(participantItem)} onClick={() => handleSaveAuditionRank(submission)} style={{ ...primaryButtonStyle, minHeight: 38, opacity: isAuditionClosed(participantItem) ? 1 : 0.5 }}>저장</button>
                          <button type="button" disabled={!isAuditionClosed(participantItem)} onClick={() => handleSaveAuditionRank(submission, '')} style={{ ...buttonBaseStyle, minHeight: 38, opacity: isAuditionClosed(participantItem) ? 1 : 0.5 }}>제거</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <ParticipationReviewModal
          open={participantsModalOpen}
          item={participantItem}
          itemType={participantSection === "events" ? "event" : "mission"}
          participants={participants}
          onClose={closeParticipantsModal}
          onSelectParticipant={handleSelectParticipant}
          onChangeStatus={handleParticipantStatusChange}
          onRewardParticipant={handleRewardParticipant}
        />
      )}
    </div>
  );
}