import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import * as storageAdapter from "../lib/storageAdapter";

export default function RegionPosts() {
  const { regionCode } = useParams();
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [regionName, setRegionName] = useState('');

  // 지역명 로드
  useEffect(() => {
    async function loadRegionName() {
      try {
        const regions = await storageAdapter.getRegions();
        const region = regions.find(r => 
          String(r.id || r.regionId || r.region_id) === String(regionCode)
        );
        setRegionName(region?.name || regionCode);
      } catch (err) {
        console.error('Failed to load region name:', err);
        setRegionName(regionCode);
      }
    }
    loadRegionName();
  }, [regionCode]);

  // 미션/이벤트 로드
  useEffect(() => {
    loadMissionsAndEvents();
  }, [regionCode]);

  async function loadMissionsAndEvents() {
    try {
      setLoading(true);
      const [missionData, eventData] = await Promise.all([
        storageAdapter.getMissions(),
        storageAdapter.getEvents()
      ]);
      
      // 해당 지역의 미션 필터링: 오직 REGION 스코프이며 현재 지역 코드가 포함된 항목만 표시
      const regionMissions = (missionData || []).filter(m => {
        if (m.regionScope === "REGION" && Array.isArray(m.regionIds)) {
          return m.regionIds.some(rid => String(rid) === String(regionCode));
        }
        return false;
      });
      
      // 해당 지역의 이벤트 필터링: 오직 REGION 스코프이며 현재 지역 코드가 포함된 항목만 표시
      const regionEvents = (eventData || []).filter(e => {
        if (e.regionScope === "REGION" && Array.isArray(e.regionIds)) {
          return e.regionIds.some(rid => String(rid) === String(regionCode));
        }
        return false;
      });
      
      setMissions(regionMissions);
      setEvents(regionEvents);
    } catch (err) {
      console.error("Failed to load missions/events:", err);
      setMissions([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  // 미션/이벤트 통합 목록
  const items = [
    ...missions.map(m => ({
      ...m,
      type: 'mission',
      displayType: '🎯 미션',
      displayPoints: `${m.points}P`
    })),
    ...events.map(e => ({
      ...e,
      type: 'event',
      displayType: '🎉 이벤트',
      displayPoints: e.period || '진행중'
    }))
  ];

  function handleItemClick(item) {
    if (item.type === 'event') {
      navigate(`/r/${regionCode}/missions`);
    } else {
      navigate(`/r/${regionCode}/missions`);
    }
  }

  // 스타일 - 다른 페이지와 통일
  const headerStyle = {
    padding: '16px 12px',
    borderBottom: '1px solid #DDE3EA',
    background: '#FFFFFF'
  };

  const cardStyle = {
    padding: 14,
    borderRadius: 12,
    background: '#FFFFFF',
    border: '1px solid #DDE3EA',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  return (
    <div className="su-page">
      <PageHeader title={`📰 ${regionName} 지역 소식`} onBack={() => navigate('/home')} />

      {/* 콘텐츠 영역 */}
      <div style={{ padding: '16px 12px', maxWidth: 600, margin: '0 auto' }}>
        {/* 미션/이벤트 목록 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9BA8AE' }}>
            로딩 중...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9BA8AE' }}>
            등록된 미션/이벤트가 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(item => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleItemClick(item)}
                style={cardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F0F4F8';
                  e.currentTarget.style.borderColor = '#C0CDD5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#DDE3EA';
                }}
              >
                {/* 타입 배지 */}
                <div style={{ 
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 12,
                  background: item.type === 'mission' ? 'rgba(12,84,96,0.10)' : 'rgba(200,168,75,0.12)',
                  border: `1px solid ${item.type === 'mission' ? 'rgba(12,84,96,0.25)' : 'rgba(200,168,75,0.30)'}`,
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 8
                }}>
                  {item.displayType}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 14, color: '#2C3E45', marginBottom: 8 }}>
                  {item.description || '-'}
                </div>
                <div style={{ fontSize: 13, color: '#637074' }}>
                  {item.displayPoints}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
