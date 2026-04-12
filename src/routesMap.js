export const ROUTES = {
  home: "/home",
  search: "/search",
  community: "/community",
  shops: "/shops",
  region: "/region",
  missions: "/missions",
  support: "/support",
  my: "/my",
  auth: "/auth",
};

export const NAV_ITEMS = [
  { key: "home",      path: ROUTES.home,      label: "홈" },
  { key: "auth",      path: ROUTES.auth,      label: "로그인/회원가입" },
  { key: "community", path: ROUTES.community, label: "커뮤니티" },
  { key: "shops",     path: ROUTES.shops,     label: "상권" },
  { key: "my",        path: ROUTES.my,        label: "마이오피스" },
];
