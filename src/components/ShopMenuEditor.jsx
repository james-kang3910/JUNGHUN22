import { useState } from "react";

/**
 * 메뉴 편집 컴포넌트
 * Props:
 * - menus: 메뉴 배열 [{ id, name, price, order, recommended }]
 * - onChange: 메뉴 변경 콜백 (newMenus) => void
 * - maxItems: 최대 메뉴 개수 (기본 20)
 */
export default function ShopMenuEditor({ menus = [], onChange, maxItems = 20 }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", recommended: false });

  const handleAdd = () => {
    if (menus.length >= maxItems) {
      window.alert(`최대 ${maxItems}개까지만 추가할 수 있습니다.`);
      return;
    }

    const newMenu = {
      id: `menu-${Date.now()}`,
      name: "새 메뉴",
      price: "",
      order: menus.length,
      recommended: false,
    };

    onChange?.([...menus, newMenu]);
    setEditingId(newMenu.id);
    setEditForm({ name: newMenu.name, price: newMenu.price, recommended: newMenu.recommended });
  };

  const handleEdit = (menu) => {
    setEditingId(menu.id);
    setEditForm({ name: menu.name, price: menu.price, recommended: menu.recommended });
  };

  const handleSaveEdit = () => {
    if (!editForm.name.trim()) {
      window.alert("메뉴명을 입력하세요.");
      return;
    }

    const updated = menus.map((m) =>
      m.id === editingId
        ? { ...m, name: editForm.name.trim(), price: editForm.price.trim(), recommended: editForm.recommended }
        : m
    );

    onChange?.(updated);
    setEditingId(null);
    setEditForm({ name: "", price: "", recommended: false });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", price: "", recommended: false });
  };

  const handleDelete = (id) => {
    if (!window.confirm("이 메뉴를 삭제하시겠습니까?")) return;

    const filtered = menus.filter((m) => m.id !== id);
    // order 재정렬
    const reordered = filtered.map((m, idx) => ({ ...m, order: idx }));
    onChange?.(reordered);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;

    const newMenus = [...menus];
    [newMenus[index - 1], newMenus[index]] = [newMenus[index], newMenus[index - 1]];
    // order 재정렬
    const reordered = newMenus.map((m, idx) => ({ ...m, order: idx }));
    onChange?.(reordered);
  };

  const handleMoveDown = (index) => {
    if (index === menus.length - 1) return;

    const newMenus = [...menus];
    [newMenus[index], newMenus[index + 1]] = [newMenus[index + 1], newMenus[index]];
    // order 재정렬
    const reordered = newMenus.map((m, idx) => ({ ...m, order: idx }));
    onChange?.(reordered);
  };

  const containerStyle = {
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 16,
    background: "rgba(255,255,255,0.02)",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  };

  const titleStyle = {
    fontSize: 14,
    fontWeight: 600,
  };

  const addButtonStyle = {
    padding: "8px 16px",
    borderRadius: 6,
    border: "1px solid rgba(139, 92, 246, 0.5)",
    background: "rgba(139, 92, 246, 0.1)",
    color: "#8b5cf6",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const menuListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  };

  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 12,
    background: "rgba(255,255,255,0.04)",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.08)",
  };

  const menuInfoStyle = {
    flex: 1,
    fontSize: 14,
  };

  const menuNameStyle = {
    fontWeight: 600,
    marginBottom: 2,
  };

  const menuPriceStyle = {
    fontSize: 13,
    opacity: 0.7,
  };

  const recommendedBadgeStyle = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    background: "rgba(251, 191, 36, 0.2)",
    border: "1px solid rgba(251, 191, 36, 0.5)",
    color: "#fbbf24",
    fontSize: 11,
    fontWeight: 600,
    marginLeft: 6,
  };

  const btnStyle = {
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontSize: 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  const moveButtonStyle = {
    padding: "4px 8px",
    borderRadius: 4,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const editFormStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 12,
    background: "rgba(139, 92, 246, 0.08)",
    borderRadius: 8,
    border: "1px solid rgba(139, 92, 246, 0.3)",
  };

  const inputStyle = {
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    color: "inherit",
    fontSize: 14,
    outline: "none",
  };

  const checkboxLabelStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    cursor: "pointer",
  };

  const editButtonsStyle = {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>
          메뉴 목록 ({menus.length}/{maxItems})
        </div>
        <button style={addButtonStyle} onClick={handleAdd}>
          + 메뉴 추가
        </button>
      </div>

      {menus.length === 0 && (
        <div style={{ textAlign: "center", padding: 24, opacity: 0.5, fontSize: 13 }}>
          등록된 메뉴가 없습니다. 메뉴를 추가해보세요.
        </div>
      )}

      <div style={menuListStyle}>
        {menus.map((menu, index) => (
          <div key={menu.id}>
            {editingId === menu.id ? (
              // 편집 모드
              <div style={editFormStyle}>
                <div>
                  <label style={{ display: "block", fontSize: 12, marginBottom: 4, opacity: 0.8 }}>
                    메뉴명 *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="예: 아메리카노"
                    style={inputStyle}
                    autoFocus
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, marginBottom: 4, opacity: 0.8 }}>
                    가격
                  </label>
                  <input
                    type="text"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    placeholder="예: 4,500원"
                    style={inputStyle}
                  />
                </div>
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={editForm.recommended}
                    onChange={(e) => setEditForm({ ...editForm, recommended: e.target.checked })}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  <span>추천 메뉴로 표시</span>
                </label>
                <div style={editButtonsStyle}>
                  <button style={btnStyle} onClick={handleCancelEdit}>
                    취소
                  </button>
                  <button
                    style={{ ...btnStyle, background: "#8b5cf6", border: "1px solid #7c3aed" }}
                    onClick={handleSaveEdit}
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              // 보기 모드
              <div style={menuItemStyle}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button
                    style={{ ...moveButtonStyle, opacity: index === 0 ? 0.3 : 1 }}
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    title="위로"
                  >
                    ↑
                  </button>
                  <button
                    style={{ ...moveButtonStyle, opacity: index === menus.length - 1 ? 0.3 : 1 }}
                    onClick={() => handleMoveDown(index)}
                    disabled={index === menus.length - 1}
                    title="아래로"
                  >
                    ↓
                  </button>
                </div>

                <div style={menuInfoStyle}>
                  <div style={menuNameStyle}>
                    {menu.name}
                    {menu.recommended && <span style={recommendedBadgeStyle}>추천</span>}
                  </div>
                  {menu.price && <div style={menuPriceStyle}>{menu.price}</div>}
                </div>

                <button style={btnStyle} onClick={() => handleEdit(menu)}>
                  편집
                </button>
                <button
                  style={{ ...btnStyle, borderColor: "rgba(239, 68, 68, 0.5)", color: "#ef4444" }}
                  onClick={() => handleDelete(menu.id)}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
