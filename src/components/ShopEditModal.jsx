import { useEffect, useState } from "react";
import ShopMenuEditor from "./ShopMenuEditor";
import * as storageAdapter from "../lib/storageAdapter";
import { getAuthInfo } from "../lib/authStore";

/**
 * 상점 정보 수정 모달
 * Props:
 * - shop: 수정할 상점 객체
 * - onClose: 모달 닫기 핸들러
 * - onSaved: 저장 완료 후 콜백
 */
export default function ShopEditModal({ shop, onClose, onSaved }) {
  const [activeTab, setActiveTab] = useState("info"); // info | menu | hours
  const [formData, setFormData] = useState({
    name: "",
    category: "food",
    sub: "",
    businessHours: "",
    closedDay: "",
    breakTime: "",
    phone: "",
    address: "",
    // 메뉴는 별도 상태로 관리
  });
  const [menus, setMenus] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name || "",
        category: shop.category || shop.cat || "food",
        sub: shop.sub || "",
        businessHours: shop.businessHours || "",
        closedDay: shop.closedDay || "",
        breakTime: shop.breakTime || "",
        phone: shop.phone || "",
        address: shop.address || "",
      });
      
      // 메뉴 데이터 로드 (string[] 또는 object[] 호환)
      if (Array.isArray(shop.menus)) {
        if (shop.menus.length > 0 && typeof shop.menus[0] === 'string') {
          // 구형: string[] → object[]로 변환
          setMenus(shop.menus.map((menuStr, idx) => ({
            id: `menu-${idx}`,
            name: menuStr.split(/\s+/)[0] || menuStr,
            price: menuStr.split(/\s+/).slice(1).join(' ') || '',
            order: idx,
            recommended: false,
          })));
        } else {
          // 신형: object[]
          setMenus(shop.menus);
        }
      }
    }
  }, [shop]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!shop) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const auth = getAuthInfo();
      if (!auth || !auth.memberId) {
        window.alert('로그인이 필요합니다.');
        return;
      }
      
      // 필수 필드 검증
      if (!formData.name || !formData.name.trim()) {
        window.alert('상점명을 입력하세요.');
        return;
      }
      
      // 서버 API 호출
      const shopId = shop.id || shop.shopId;
      await storageAdapter.patchShop(shopId, { ...formData, menus }, auth.memberId);
      
      console.log('[ShopEditModal] Save success:', { ...formData, menus });
      
      // 완료 알림
      window.alert('상점 정보가 수정되었습니다.');
      onSaved?.({ ...formData, menus });
      onClose?.();
    } catch (error) {
      console.error('[ShopEditModal] Save error:', error);
      window.alert('저장 실패: ' + error.message);
    } finally {
      setSaving(false);
    }
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
    zIndex: 9999,
    padding: 16,
    overflowY: "auto",
  };

  const modalStyle = {
    background: "#1e1e28",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.1)",
    padding: 0,
    maxWidth: 600,
    width: "100%",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  };

  const headerStyle = {
    padding: "20px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const titleStyle = {
    fontSize: 18,
    fontWeight: 700,
  };

  const closeButtonStyle = {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.6)",
    fontSize: 24,
    cursor: "pointer",
    padding: 0,
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  };

  const tabsContainerStyle = {
    display: "flex",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    padding: "0 24px",
  };

  const tabStyle = (isActive) => ({
    padding: "12px 20px",
    background: "none",
    border: "none",
    color: isActive ? "#8b5cf6" : "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: isActive ? 600 : 400,
    cursor: "pointer",
    borderBottom: isActive ? "2px solid #8b5cf6" : "2px solid transparent",
    transition: "all 0.2s",
  });

  const contentStyle = {
    padding: 24,
    overflowY: "auto",
    flex: 1,
  };

  const footerStyle = {
    padding: "16px 24px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
  };

  const btnBase = {
    padding: "12px 24px",
    borderRadius: 8,
    border: "none",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
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

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div style={headerStyle}>
          <div style={titleStyle}>상점 정보 수정</div>
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        </div>

        {/* 탭 */}
        <div style={tabsContainerStyle}>
          <button style={tabStyle(activeTab === "info")} onClick={() => setActiveTab("info")}>
            기본 정보
          </button>
          <button style={tabStyle(activeTab === "menu")} onClick={() => setActiveTab("menu")}>
            메뉴
          </button>
          <button style={tabStyle(activeTab === "hours")} onClick={() => setActiveTab("hours")}>
            영업시간
          </button>
        </div>

        {/* 내용 */}
        <div style={contentStyle}>
          {activeTab === "info" && (
            <div>
              <div style={fieldStyle}>
                <label style={labelStyle}>상점명 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="상점명을 입력하세요"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>업종 *</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  style={selectStyle}
                  required
                >
                  <option value="food">음식</option>
                  <option value="cafe">카페</option>
                  <option value="life">생활</option>
                  <option value="beauty">뷰티</option>
                  <option value="etc">기타</option>
                </select>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>한줄 소개</label>
                <input
                  type="text"
                  value={formData.sub}
                  onChange={(e) => handleChange("sub", e.target.value)}
                  placeholder="예: 든든한 한그릇 · 포장 가능"
                  style={inputStyle}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>전화번호</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="예: 02-1234-5678"
                  style={inputStyle}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>주소</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="상점 주소를 입력하세요"
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {activeTab === "menu" && (
            <div>
              <ShopMenuEditor
                menus={menus}
                onChange={setMenus}
                maxItems={20}
              />
            </div>
          )}

          {activeTab === "hours" && (
            <div>
              <div style={fieldStyle}>
                <label style={labelStyle}>영업시간</label>
                <input
                  type="text"
                  value={formData.businessHours}
                  onChange={(e) => handleChange("businessHours", e.target.value)}
                  placeholder="예: 10:00 ~ 21:00"
                  style={inputStyle}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>휴무일</label>
                <input
                  type="text"
                  value={formData.closedDay}
                  onChange={(e) => handleChange("closedDay", e.target.value)}
                  placeholder="예: 매주 월요일"
                  style={inputStyle}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>브레이크 타임</label>
                <input
                  type="text"
                  value={formData.breakTime}
                  onChange={(e) => handleChange("breakTime", e.target.value)}
                  placeholder="예: 15:00 ~ 16:30"
                  style={inputStyle}
                />
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div style={footerStyle}>
          <button
            type="button"
            style={{ ...btnBase, background: "rgba(255,255,255,0.1)", color: "#fff" }}
            onClick={onClose}
            disabled={saving}
          >
            취소
          </button>
          <button
            type="button"
            style={{ 
              ...btnBase, 
              background: saving ? "rgba(139, 92, 246, 0.5)" : "linear-gradient(135deg, #8b5cf6, #7c3aed)", 
              color: "#fff",
              opacity: saving ? 0.6 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
