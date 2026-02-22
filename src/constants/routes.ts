
import { DASHBOARD, TAB_CHECKIN, TAB_REGISTRO } from "./const";


export const routes = {
  dashboard: () => DASHBOARD,
  dashboardTab: (tab: string) => `${DASHBOARD}?tab=${tab}`,
  dashboardCheckin: () => `${DASHBOARD}?tab=${TAB_CHECKIN}`,
  dashboardRegistro: () => `${DASHBOARD}?tab=${TAB_REGISTRO}`,
  dashboardAforo: () => `${DASHBOARD}/aforo`,
  dashboardEstadisticas: () => `${DASHBOARD}/estadisticas`,
  dasboardUsers: () => `${DASHBOARD}/usuarios`,
} as const;

