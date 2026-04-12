import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  calculateStatus,
  getStatusLabel,
  getStatusColor,
} from "../../lib/adminStore";
import { isAdminAuthenticatedLocal } from "../../lib/adminAuth";
import * as storageAdapter from "../../lib/storageAdapter";
import MultiImageUploader, { normalizeImageList } from "../../components/MultiImageUploader";
import ParticipationReviewModal from "../../components/ParticipationReviewModal";
import AdminModalForm from "./components/AdminModalForm";
import ConfirmDialog from "./components/ConfirmDialog";
import Toast from "./components/Toast";

const MISSION_CATEGORIES = [
  { value: "daily", label: "일일" },
  { value: "review", label: "리뷰" },
  { value: "checkin", label: "출석" },
  { value: "purchase", label: "구매" },
  { value: "general", label: "일반" },
];

const EVENT_CATEGORIES = [
  { value: "signup", label: "가입" },
  { value: "promotion", label: "프로모션" },
  { value: "seasonal", label: "시즌" },
  { value: "general", label: "일반" },
];

// 데이터 정규화 함수 (서버 응답 필드명 통일)
const normalizeMission = (m) => {
  if (!m) return null;
  const images = normalizeImageList(m.images);
  const regionIds = Array.isArray(m.regionIds)
    ? m.regionIds
    : (Array.isArray(m.region_ids)
      ? m.region_ids
      : (m.regionId ? [m.regionId] : []));
  return {
    id: m.id ?? m.missionId ?? m.mission_id ?? null,
    title: m.title ?? "(제목 없음)",
    description: m.description ?? "",
    category: m.category ?? "general",
    points: m.points ?? 0,
    rewardType: m.rewardType ?? m.reward_type ?? "points",
    startDate: m.startDate ?? "",
    endDate: m.endDate ?? "",
    status: m.status ?? "ACTIVE",
    isActive: m.isActive ?? true,
    regionScope: m.regionScope ?? "ALL",
    regionIds,
    regionId: m.regionId ?? m.region_id ?? regionIds[0] ?? null,
    regionName: m.regionName ?? m.region_name ?? null,
    images,
    participantsCount: m.participantsCount ?? m.participants_count ?? 0,
    extParticipantsCount: m.extParticipantsCount ?? m.ext_participants_count ?? 0,
    createdAt: m.createdAt ?? null,
    updatedAt: m.updatedAt ?? null,
  };
};

const normalizeEvent = (e) => {
  if (!e) return null;
  const images = normalizeImageList(e.images);
  const regionIds = Array.isArray(e.regionIds)
    ? e.regionIds
    : (Array.isArray(e.region_ids)
      ? e.region_ids
      : ((e.regionId ?? e.region_id) ? [e.regionId ?? e.region_id] : []));
  const regionScope = e.regionScope ?? e.region_scope ?? ((regionIds.length > 0 || e.regionId || e.region_id) ? "REGION" : "ALL");
  return {
    id: e.id ?? e.eventId ?? e.event_id ?? null,
    title: e.title ?? "(제목 없음)",
    description: e.description ?? e.content ?? "",
    category: e.category ?? "general",
    points: e.points ?? 0,
    rewardType: e.rewardType ?? e.reward_type ?? "points",
    startDate: e.startDate ?? e.start_at ?? "",
    endDate: e.endDate ?? e.end_at ?? "",
    isActive: e.isActive ?? true,
    regionScope,
    regionIds,
    regionId: e.regionId ?? e.region_id ?? regionIds[0] ?? null,
    regionName: e.regionName ?? e.region_name ?? null,
    __eventSource: e.__eventSource || "legacy",
    images,
    participantsCount: e.participantsCount ?? e.participants_count ?? 0,
    extParticipantsCount: e.extParticipantsCount ?? e.ext_participants_count ?? 0,
    createdAt: e.createdAt ?? null,
    updatedAt: e.updatedAt ?? null,
  };
};

export default function AdminMissions() {
  console.log('[FORENSIC] 🔍 THIS FILE IS USED: src/pages/admin/AdminMissions.jsx');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("missions"); // missions | events
  // ★ 데이터 초기값 null로 변경 (null=로딩, []=확정 빈 데이터)
  const [missions, setMissions] = useState(null);
  const [events, setEvents] = useState(null);
  const [regions, setRegions] = useState(null);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal/Dialog 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Toast 상태
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  
  // 로딩 상태
  const [loading, setLoading] = useState(false);
  // 모달 폼 데이터 추적 (districtId 조건부 렌더링)
  const [currentFormData, setCurrentFormData] = useState({});
  // 현재 선택된 regionScope 기반 구/군 목록
  const [districts, setDistricts] = useState([]);
  // ★ adminReady 게이트 (관리자 인증 완료 여부)
  const [adminReady, setAdminReady] = useState(false);

  // ★ PV3 완전 복원: 참여자 관리 모달 상태
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [selectedParticipantItemType, setSelectedParticipantItemType] = useState("mission");
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    // ★ adminReady 게이트: 관리자 인증 확인 (로그인 페이지로 리다이렉트)
    if (!isAdminAuthenticatedLocal()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    
    // ★ adminReady 플래그 설정 (관리자 토큰 확인 완료)
    setAdminReady(true);
    
    // ★ 데이터 로드 (adminReady일 때만 호출)
    loadData();
  }, [navigate]);

  useEffect(() => {
    const handleSsotChanged = (event) => {
      const changedType = String(event?.detail?.type || '').toLowerCase();
      if (changedType === 'missions' || changedType === 'events') {
        loadData();
      }
    };

    window.addEventListener('su:ssot:changed', handleSsotChanged);
    return () => {
      window.removeEventListener('su:ssot:changed', handleSsotChanged);
    };
  }, []);

  // 지역범위 변경 시 구/군 목록 로드
  useEffect(() => {
    const scope = currentFormData.regionScope;
    // 지역 ID("ALL"이 아니고 비버 문자열)
    if (!scope || scope === "ALL") { setDistricts([]); return; }
    const API_BASE = import.meta.env.VITE_API_URL || '';
    fetch(`${API_BASE}/api/districts?regionId=${scope}`)
      .then(r => r.ok ? r.json() : { districts: [] })
      .then(d => setDistricts(d.districts || []))
      .catch(() => setDistricts([]));
  }, [currentFormData.regionScope]);

  const loadData = async () => {
    console.log('[AdminMissions][loadData] 시작');
    try {
      setLoading(true);
      const [missionsData, eventsData, regionsData] = await Promise.all([
        storageAdapter.getMissions(),
        storageAdapter.getEvents(),
        storageAdapter.getRegions(), // ★ 서버 기반으로 전환
      ]);
      const regionEventGroups = await Promise.all(
        (regionsData || []).map(async (region) => {
          const regionId = String(region?.id || region?.regionId || region?.region_id || "").trim();
          if (!regionId) return [];
          const result = await storageAdapter.getRegionEvents(regionId).catch(() => []);
          const list = Array.isArray(result?.events) ? result.events : (Array.isArray(result) ? result : []);
          return list.map((event) => ({
            ...event,
            __eventSource: "region",
            regionId: event?.regionId || event?.region_id || regionId,
            regionIds: [String(event?.regionId || event?.region_id || regionId)],
          }));
        })
      );
      const regionEvents = regionEventGroups.flat();
      const baseEvents = Array.isArray(eventsData) ? eventsData : [];
      const mergedEvents = [...baseEvents];
      const seenEventIds = new Set(baseEvents.map((event) => String(event?.id ?? event?.eventId ?? event?.event_id ?? "")).filter(Boolean));
      regionEvents.forEach((event) => {
        const eventId = String(event?.id ?? event?.eventId ?? event?.event_id ?? "");
        if (!eventId || seenEventIds.has(eventId)) return;
        seenEventIds.add(eventId);
        mergedEvents.push(event);
      });
      // 데이터 정규화 및 null 필터링
      setMissions((missionsData || []).map(normalizeMission).filter(Boolean));
      setEvents(mergedEvents.map(normalizeEvent).filter(Boolean));
      setRegions(regionsData || []);
      console.log('[AdminMissions][loadData] 성공', { 
        missionsCount: (missionsData || []).length, 
        eventsCount: (eventsData || []).length, 
        regionsCount: (regionsData || []).length 
      });
    } catch (error) {
      console.error('[AdminMissions][loadData] 실패:', error);
      // ★ 실패 시에도 [] 확정 (빈 화면 고착 방지)
      setMissions([]);
      setEvents([]);
      setRegions([]);
      setToast({ open: true, message: "데이터 로드 실패", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ★ 안전 변수 선언 (null=로딩을 안전하게 처리, 크래시 방지)
  const safeRegions = Array.isArray(regions) ? regions : [];
  const safeMissions = Array.isArray(missions) ? missions : [];
  const safeEvents = Array.isArray(events) ? events : [];

  // 현재 탭의 데이터 (★ null 처리: 로딩 중엔 빈 배열 방지)
  const currentData = activeTab === "missions" 
    ? safeMissions 
    : safeEvents;

  // 필터링된 목록
  const filteredList = useMemo(() => {
    let list = [...currentData];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((item) => item.title.toLowerCase().includes(q));
    }
    if (regionFilter !== "all") {
      if (regionFilter === "global") {
        list = list.filter((item) => {
          const regionScope = String(item?.regionScope || '').trim().toUpperCase();
          const regionIds = Array.isArray(item?.regionIds) ? item.regionIds.filter(Boolean) : [];
          return regionScope === 'ALL' || (!item?.regionId && regionIds.length === 0);
        });
      } else {
        list = list.filter((item) => {
          const regionIds = Array.isArray(item?.regionIds) ? item.regionIds.map(String) : [];
          return String(item?.regionId || '') === String(regionFilter) || regionIds.includes(String(regionFilter));
        });
      }
    }
    if (statusFilter !== "all") {
      list = list.filter((item) => calculateStatus(item.startDate, item.endDate) === statusFilter);
    }
    return list;
  }, [currentData, search, regionFilter, statusFilter]);

  // 관리자 지역명 계산 함수 (global/all → 전체 지역, regions 매핑, 실패 시 알 수 없음)
  function getRegionName(item, regions = safeRegions) {
    if (!item) return '전체 지역';

    const regionScope = String(item?.regionScope || '').trim().toLowerCase();
    const explicitRegionName = String(item?.regionName || '').trim();
    if (explicitRegionName && regionScope !== 'all' && regionScope !== 'global') {
      return explicitRegionName;
    }

    // regionId 우선순위: regionId → regionIds[0] → ''
    let regionId = String(item?.regionId || (Array.isArray(item?.regionIds) && item.regionIds[0]) || '').trim().toLowerCase();

    // 1. global 처리 최우선
    if (
      regionId === 'all' ||
      regionScope === 'all' ||
      regionScope === 'global'
    ) {
      return '전체 지역';
    }

    // 2. regions 매핑
    const matched = regions.find(
      r => String(r?.id || '').trim().toLowerCase() === regionId
    );
    if (matched?.name) return matched.name;

    // 3. fallback
    return '알 수 없음';
  }

  // 모달 열기
  const openCreateModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    // 기존 데이터를 폼 필드에 맞게 변환
    const formItem = {
      ...item,
      // regionScope 값 설정: REGION이면 regionIds 배열 유지, ALL이면 "ALL"
      regionScope: item.regionScope === "REGION" && item.regionIds?.length > 0 
        ? item.regionIds[0] 
        : "ALL",
      // 날짜 필드 보존 - 문자열 그대로 사용 (타임존 변환 없이)
      startDate: item.startDate ? String(item.startDate).split('T')[0] : '',
      endDate: item.endDate ? String(item.endDate).split('T')[0] : '',
      period: item.period || '',
    };
    setEditingItem(formItem);
    setModalOpen(true);
  };

  // 저장
  const handleSave = async (data) => {
    try {
      // [MISSION-FRONT-PAYLOAD] 로그
      const itemName = activeTab === "missions" ? "미션" : "이벤트";
      const images = normalizeImageList(data.images);
      // regionScope 처리: "ALL"이면 전체 지역, 아니면 특정 지역
      const isAll = data.regionScope === "ALL" || !data.regionScope;
      let regionName = "전체 지역";
      if (!isAll && Array.isArray(regions) && regions.length > 0) {
        const found = regions.find(r => String(r.id) === String(data.regionScope));
        if (found) regionName = found.name;
      }
      const processedData = {
        ...data,
        images,
        regionScope: isAll ? "ALL" : "REGION",
        regionIds: isAll ? [] : [data.regionScope],
        regionId: isAll ? null : data.regionScope,
        regionName,
        isActive: !!data.isActive,
      };
      console.log(
        "[MISSION-FRONT-REGION]",
        "title=", processedData.title,
        "regionId=", processedData.regionId,
        "regionName=", processedData.regionName
      );

      if (editingItem) {
        // 수정
        const upsertFn = activeTab === "missions" ? storageAdapter.upsertMission : storageAdapter.upsertEvent;
        const result = await upsertFn({ ...processedData, id: editingItem.id });
        console.log('[AdminMissions] 수정 결과:', result);
        setToast({ open: true, message: `${itemName}이 수정되었습니다.`, type: "success" });
      } else {
        // 생성
        const upsertFn = activeTab === "missions" ? storageAdapter.upsertMission : storageAdapter.upsertEvent;
        const result = await upsertFn(processedData);
        console.log('[AdminMissions] 생성 결과:', result);
        setToast({ open: true, message: `${itemName}이 추가되었습니다.`, type: "success" });
      }
      setModalOpen(false);
      await loadData(); // 서버에서 재조회
    } catch (error) {
      console.error('[AdminMissions] Save failed:', error);
      setToast({ open: true, message: error.message || "저장 실패", type: "error" });
    }
  };

  // 삭제
  const openDeleteConfirm = (id) => {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (deleteTargetId) {
      try {
        const deleteFn = activeTab === "missions" ? storageAdapter.deleteMission : storageAdapter.deleteEvent;
        const itemName = activeTab === "missions" ? "미션" : "이벤트";
        await deleteFn(deleteTargetId);
        setToast({ open: true, message: `${itemName}이 삭제되었습니다.`, type: "success" });
        await loadData(); // 서버에서 재조회
      } catch (error) {
        console.error('[AdminMissions] Delete failed:', error);
        setToast({ open: true, message: "삭제 실패", type: "error" });
      }
    }
    setConfirmOpen(false);
    setDeleteTargetId(null);
  };

  // 활성화 토글
  const handleToggleActive = async (id) => {
    try {
      const item = currentData.find(i => i.id === id);
      if (!item) return;
      
      const upsertFn = activeTab === "missions" ? storageAdapter.upsertMission : storageAdapter.upsertEvent;
      await upsertFn({ ...item, isActive: !item.isActive });
      setToast({ open: true, message: "상태가 변경되었습니다.", type: "success" });
      await loadData(); // 서버에서 재조회
    } catch (error) {
      console.error('[AdminMissions] Toggle active failed:', error);
      setToast({ open: true, message: "상태 변경 실패", type: "error" });
    }
  };

  // 복제
  const handleDuplicate = async (item) => {
    try {
      const upsertFn = activeTab === "missions" ? storageAdapter.upsertMission : storageAdapter.upsertEvent;
      const itemName = activeTab === "missions" ? "미션" : "이벤트";
      const { id, createdAt, updatedAt, ...rest } = item;
      await upsertFn({ ...rest, title: `${rest.title} (복사본)` });
      setToast({ open: true, message: `${itemName}이 복제되었습니다.`, type: "success" });
      await loadData(); // 서버에서 재조회
    } catch (error) {
      console.error('[AdminMissions] Duplicate failed:', error);
      setToast({ open: true, message: "복제 실패", type: "error" });
    }
  };

  // ★ PV3 완전 복원: 참여자 관리 모달 열기
  const openParticipantsModal = async (mission, filter = 'all') => {
    try {
      const itemType = activeTab === "events" ? "event" : "mission";
      const normalizeRegionId = (value) => String(value || '').trim();
      const missionRegionIds = Array.isArray(mission?.regionIds)
        ? mission.regionIds.map(normalizeRegionId).filter(Boolean)
        : (mission?.regionId ? [normalizeRegionId(mission.regionId)] : []);
      setSelectedParticipantItemType(itemType);
      const list = await storageAdapter.getProgramParticipants(itemType, mission.id);
      const normalizedList = Array.isArray(list) ? list : [];
      const extCount = normalizedList.filter((participant) => {
        const crossRegion = participant?.crossRegion === true || participant?.crossRegion === 1 || participant?.crossRegion === '1' || String(participant?.crossRegion || '').toLowerCase() === 'true';
        if (crossRegion) return true;
        const memberRegionId = normalizeRegionId(participant?.memberRegionId || participant?.regionId || null);
        return !!memberRegionId && missionRegionIds.length > 0 && !missionRegionIds.includes(memberRegionId);
      }).length;
      const missionWithCounts = {
        ...mission,
        participantsCount: normalizedList.length,
        extParticipantsCount: extCount,
      };
      setSelectedMission(missionWithCounts);
      if (itemType === 'event') {
        setEvents((prev) => (Array.isArray(prev) ? prev.map((entry) => String(entry.id) === String(mission.id) ? missionWithCounts : entry) : prev));
      } else {
        setMissions((prev) => (Array.isArray(prev) ? prev.map((entry) => String(entry.id) === String(mission.id) ? missionWithCounts : entry) : prev));
      }
      setParticipants(normalizedList);
      setParticipantsModalOpen(true);
    } catch (error) {
      console.error('[AdminMissions] Failed to load participants:', error);
      setToast({ open: true, message: "참여자 정보를 불러오는데 실패했습니다.", type: "error" });
    }
  };

  // 참여자 선정 → 보상 지급 대기 상태 전환
  const handleSelectParticipant = async (participant) => {
    try {
      const memberId = participant.memberId;
      const itemKey = `${selectedParticipantItemType}:${selectedMission.id}`;
      
      if (!memberId) {
        setToast({ open: true, message: '회원 정보를 찾을 수 없습니다.', type: 'error' });
        return;
      }
      await storageAdapter.markParticipationSelection(itemKey, memberId, true);
      const list = await storageAdapter.getProgramParticipants(selectedParticipantItemType, selectedMission.id);
      const normalizedList = Array.isArray(list) ? list : [];
      setParticipants(normalizedList);
      setSelectedMission((prev) => prev ? { ...prev, participantsCount: normalizedList.length } : prev);
      
      setToast({ 
        open: true, 
        message: '선정 완료. 보상 지급 대기 상태로 전환되었습니다.', 
        type: 'success' 
      });
    } catch (e) {
      console.error('[AdminMissions] handleSelectParticipant error:', e);
      setToast({ open: true, message: e.message || '선정 처리에 실패했습니다.', type: 'error' });
    }
  };

  // ★ PV3 완전 복원: 참여자 상태 변경 (대기중/완료/거절)
  const handleParticipantStatusChange = async (participant, newStatus) => {
    if (!selectedMission) return;
    
    try {
      const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
      const memberId = participant?.memberId;
      if (!memberId) {
        setToast({ open: true, message: "회원 정보를 찾을 수 없습니다.", type: "error" });
        return;
      }
      
      await storageAdapter.updateProgramParticipant(selectedParticipantItemType, selectedMission.id, {
        memberId,
        status: newStatus,
        adminId: adminUser.id || 'admin'
      });
      
      setToast({ 
        open: true, 
        message: `참여자 상태가 '${newStatus}'로 변경되었습니다.`, 
        type: "success" 
      });
      
      // 참여자 목록 새로고침
      const list = await storageAdapter.getProgramParticipants(selectedParticipantItemType, selectedMission.id);
      const normalizedList = Array.isArray(list) ? list : [];
      setParticipants(normalizedList);
      setSelectedMission((prev) => prev ? { ...prev, participantsCount: normalizedList.length } : prev);
      
    } catch (error) {
      console.error('[AdminMissions] Failed to update participant status:', error);
      setToast({ open: true, message: "상태 변경에 실패했습니다.", type: "error" });
    }
  };

  // ★ PV3 완전 복원: 참여자 모달 닫기
  const closeParticipantsModal = () => {
    setParticipantsModalOpen(false);
    setSelectedMission(null);
    setSelectedParticipantItemType("mission");
    setParticipants([]);
  };

  const handleRewardParticipant = async (participant, rewardForm) => {
    const itemKey = `${selectedParticipantItemType}:${selectedMission.id}`;
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    await storageAdapter.rewardParticipation({
      itemKey,
      memberId: participant.memberId,
      rewardType: rewardForm.rewardType,
      rewardAmount: rewardForm.rewardAmount,
      rewardDescription: rewardForm.rewardDescription,
      adminId: adminUser.id || 'admin',
    });
    const list = await storageAdapter.getProgramParticipants(selectedParticipantItemType, selectedMission.id);
    const normalizedList = Array.isArray(list) ? list : [];
    setParticipants(normalizedList);
    setSelectedMission((prev) => prev ? { ...prev, participantsCount: normalizedList.length } : prev);
    setToast({ open: true, message: '보상 지급이 완료되었습니다.', type: 'success' });
  };

  // 폼 필드 정의
  const getFormFields = () => {
    const categories = activeTab === "missions" ? MISSION_CATEGORIES : EVENT_CATEGORIES;
    const regionOptions = [
      { value: "ALL", label: "전체 지역" },
      ...safeRegions.map((r) => ({ value: r.id, label: r.name })),
    ];

    const fields = [
      { key: "title", label: "제목", type: "text", placeholder: "제목 입력", required: true },
      { key: "description", label: "설명", type: "textarea", placeholder: "설명 입력", rows: 3 },
      { key: "category", label: "카테고리", type: "select", options: categories, required: true },
      { key: "regionScope", label: "지역 범위", type: "select", options: regionOptions, required: true },
    ];
    // 지역 선택 시 구/군 드롭다운 추가
    if (currentFormData.regionScope && currentFormData.regionScope !== "ALL" && districts.length > 0) {
      fields.push({ key: "districtId", label: "구/군", type: "select", options: [
        { value: "", label: "구/군 전체" },
        ...districts.map(d => ({ value: d.id, label: d.name }))
      ]});
    }
    fields.push(
      { key: "rewardType", label: "보상 유형", type: "select", options: [
          { value: "points", label: "포인트" },
          { value: "vip", label: "VIP 상품권" },
        ], required: true },
      { key: "points", label: currentFormData.rewardType === "vip" ? "상품권 액면가 (원)" : "지급 포인트", type: "number", min: 0, placeholder: currentFormData.rewardType === "vip" ? "상품권 금액 (원)" : "지급 포인트 수", required: true },
      { key: "startDate", label: "시작일", type: "date", required: true },
      { key: "endDate", label: "종료일", type: "date", required: true },
      {
        key: "images",
        label: "이미지",
        type: "custom",
        customRender: (value, onChange) => (
          <MultiImageUploader
            value={value}
            onChange={onChange}
            uploadImage={async (file) => {
              const result = await storageAdapter.uploadContentImage(file, { context: `admin-${activeTab}` });
              return result.imageUrl || result.url || "";
            }}
            onError={(message) => setToast({ open: true, message, type: "error" })}
            helperText="최대 3장까지 업로드할 수 있습니다."
          />
        ),
      },
      { key: "isActive", label: "활성화", type: "checkbox", placeholder: "활성화" }
    );
    return fields;
  };

  // 스타일
  const pageStyle = { minHeight: "100vh", background: "#0f0f14", padding: "20px 16px 100px" };
  const headerStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 };
  const titleStyle = { fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 };
  const backBtnStyle = { background: "none", border: "none", color: "#a855f7", fontSize: 14, cursor: "pointer" };
  const addBtnStyle = { padding: "10px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" };

  const tabContainerStyle = { display: "flex", gap: 8, marginBottom: 16 };
  const tabStyle = (isActive) => ({
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    background: isActive ? "#a855f7" : "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  });

  const filterRowStyle = { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" };
  const inputStyle = { flex: 1, minWidth: 150, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "inherit", fontSize: 14, outline: "none" };
  const selectStyle = { ...inputStyle, flex: "none", minWidth: 100 };

  const cardStyle = { background: "#18181b", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", padding: 16, marginBottom: 12 };
  const cardHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 };
  const itemTitleStyle = {
    fontSize: 16,
    fontWeight: 700,
    whiteSpace: "pre-line",
    wordBreak: "break-word",
    lineHeight: 1.4,
    maxWidth: "90vw"
  };
  const badgeStyle = (color) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}20`, color, marginLeft: 8 });
  const infoRowStyle = { display: "flex", gap: 16, fontSize: 13, opacity: 0.7, marginBottom: 10, flexWrap: "wrap" };
  const actionRowStyle = { display: "flex", gap: 8, flexWrap: "wrap" };
  const actionBtnStyle = (color) => ({ padding: "6px 12px", borderRadius: 6, border: "none", background: color, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" });

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>
          <button style={backBtnStyle} onClick={() => navigate("/admin")}>← 뒤로</button>
          🎯 미션/이벤트 관리
        </div>
        <button style={addBtnStyle} onClick={openCreateModal}>
          + {activeTab === "missions" ? "미션" : "이벤트"} 추가
        </button>
      </div>

      {/* Tabs */}
      <div style={tabContainerStyle}>
        <button style={tabStyle(activeTab === "missions")} onClick={() => setActiveTab("missions")}>
          미션 ({safeMissions.length})
        </button>
        <button style={tabStyle(activeTab === "events")} onClick={() => setActiveTab("events")}>
          이벤트 ({safeEvents.length})
        </button>
      </div>

      {/* Filters */}
      <div style={filterRowStyle}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="제목 검색..."
          style={inputStyle}
        />
        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} style={selectStyle}>
          <option value="all">전체 지역</option>
          <option value="global">전체 지역용</option>
          {safeRegions.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">전체 상태</option>
          <option value="scheduled">예정</option>
          <option value="ongoing">진행중</option>
          <option value="ended">종료</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, opacity: 0.7 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div>데이터를 불러오는 중...</div>
        </div>
      ) : filteredList.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
          등록된 {activeTab === "missions" ? "미션" : "이벤트"}이 없습니다.
        </div>
      ) : (
        filteredList.map((item) => {
          if (!item || !item.id) return null; // null guard
          const status = calculateStatus(item.startDate, item.endDate);
          // 상태 라벨: calculateStatus/getStatusLabel의 원래 분기 사용 (예정/진행중/종료)
          const statusLabel = getStatusLabel(status);
          const statusColor = getStatusColor(status);
          return (
            <div key={item.id} style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <span style={itemTitleStyle}>{item.title ?? "(제목 없음)"}</span>
                  <span style={badgeStyle(statusColor)}>{statusLabel}</span>
                  {!item.isActive && <span style={badgeStyle("#6b7280")}>비활성</span>}
                </div>
                <span style={{ fontSize: 12, opacity: 0.5 }}>
                  {item.rewardType === "vip"
                    ? `VIP 상품권 ${(item.points ?? 0).toLocaleString("ko-KR")}원`
                    : `${(item.points ?? 0).toLocaleString("ko-KR")}P`}
                </span>
              </div>
              <div style={infoRowStyle}>
                <span>📍 {getRegionName(item)}</span>
                <span>📅 {item.startDate ?? ""} ~ {item.endDate ?? ""}</span>
                <span>🏷️ {item.category ?? ""}</span>
              </div>
              {item.description && (
                <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 10 }}>{item.description}</div>
              )}
              <div style={actionRowStyle}>
                <button style={actionBtnStyle("rgba(168,85,247,0.8)")} onClick={() => openEditModal(item)}>
                  ✏️ 수정
                </button>
                {/* ★ Issue 4-B: 미션 참여자 관리 버튼 (participantsCount 필드 사용) */}
                {(() => {
                  const missionRegionIds = item.regionIds || [];
                  const totalCount = Number(item.participantsCount ?? 0) || 0;
                  const extCount = item.extParticipantsCount ?? 0;
                  const localCount = Math.max(0, totalCount - extCount);
                  return (
                    <>
                      <button style={actionBtnStyle("rgba(34,197,94,0.8)")} onClick={() => openParticipantsModal(item, 'all')}>
                        👥 참여자 ({localCount})
                      </button>
                      {missionRegionIds.length > 0 && (
                        <button style={actionBtnStyle("rgba(251,191,36,0.8)")} onClick={() => openParticipantsModal(item, 'external')}>
                          🌐 타지역 ({extCount})
                        </button>
                      )}
                    </>
                  );
                })()}
                <button
                  style={actionBtnStyle(item.isActive ? "rgba(107,114,128,0.8)" : "rgba(34,197,94,0.8)")}
                  onClick={() => handleToggleActive(item.id)}
                >
                  {item.isActive ? "⏸️ 비활성" : "▶️ 활성"}
                </button>
                <button style={actionBtnStyle("rgba(59,130,246,0.8)")} onClick={() => handleDuplicate(item)}>
                  📋 복제
                </button>
                <button style={actionBtnStyle("rgba(239,68,68,0.8)")} onClick={() => openDeleteConfirm(item.id)}>
                  🗑️ 삭제
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* Modal */}
      <AdminModalForm
        open={modalOpen}
        title={editingItem ? `${activeTab === "missions" ? "미션" : "이벤트"} 수정` : `${activeTab === "missions" ? "미션" : "이벤트"} 추가`}
        fields={getFormFields()}
        initialData={editingItem || { isActive: true }}
        onSubmit={handleSave}
        onChange={(data) => setCurrentFormData(data)}
        onCancel={() => { setModalOpen(false); setDistricts([]); setCurrentFormData({}); }}
        submitText={editingItem ? "수정" : "추가"}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmOpen}
        title={`${activeTab === "missions" ? "미션" : "이벤트"} 삭제`}
        message={`이 ${activeTab === "missions" ? "미션" : "이벤트"}을 삭제하시겠습니까?`}
        confirmText="삭제"
        confirmColor="#ef4444"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Toast */}
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />

      <ParticipationReviewModal
        open={participantsModalOpen}
        item={selectedMission}
        itemType={selectedParticipantItemType}
        participants={participants}
        onClose={closeParticipantsModal}
        onSelectParticipant={handleSelectParticipant}
        onChangeStatus={(participant, nextStatus) => handleParticipantStatusChange(participant.memberId, nextStatus)}
        onRewardParticipant={handleRewardParticipant}
      />
    </div>
  );
}

// ★ PV3 완전 복원: 참여자 관리 모달 스타일
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
};

const modalContentStyle = {
  background: '#1a1a20',
  borderRadius: 12,
  maxWidth: 800,
  width: '90%',
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid rgba(255,255,255,0.1)'
};

const modalHeaderStyle = {
  padding: 24,
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: '#fff'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: 32,
  cursor: 'pointer',
  color: '#999',
  padding: 0,
  width: 32,
  height: 32,
  lineHeight: 1
};

const modalBodyStyle = {
  padding: 24,
  overflowY: 'auto',
  flex: 1,
  color: '#fff'
};

const participantsListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16
};

const participantCardStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: 16,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16
};

const participantInfoStyle = {
  flex: 1
};

const participantActionsStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 8
};

const participantStatusBadgeStyle = (status) => ({
  padding: '4px 12px',
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 600,
  background: status === 'completed' ? 'rgba(34,197,94,0.2)' :
              status === 'rejected' ? 'rgba(239,68,68,0.2)' :
              'rgba(234,179,8,0.2)',
  color: status === 'completed' ? '#22c55e' :
         status === 'rejected' ? '#ef4444' :
         '#eab308',
  border: `1px solid ${status === 'completed' ? '#22c55e' :
                       status === 'rejected' ? '#ef4444' :
                       '#eab308'}`,
  whiteSpace: 'nowrap'
});

const participantActionBtnStyle = (color) => ({
  padding: '6px 14px',
  borderRadius: 6,
  border: 'none',
  background: color,
  color: '#fff',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap'
});

const modalFooterStyle = {
  padding: 16,
  borderTop: '1px solid rgba(255,255,255,0.1)',
  display: 'flex',
  justifyContent: 'flex-end'
};

const closeFooterButtonStyle = {
  padding: '10px 24px',
  background: 'rgba(107,114,128,0.8)',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
  color: '#fff'
};
