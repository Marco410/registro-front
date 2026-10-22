
import { DASHBOARD, TAB_CHECKIN, TAB_REGISTRO } from "./const";


export const routes = {
  dashboard: () => DASHBOARD,
  dashboardTab: (tab: string) => `${DASHBOARD}?tab=${tab}`,
  dashboardCheckin: () => `${DASHBOARD}?tab=${TAB_CHECKIN}`,
  dashboardRegistro: () => `${DASHBOARD}?tab=${TAB_REGISTRO}`,
  dashboardAforo: () => `${DASHBOARD}/aforo`,
  dashboardEstadisticas: () => `${DASHBOARD}/estadisticas`,
  dasboardUsers: () => `${DASHBOARD}/usuarios`,
  dasboardEvents: () => `${DASHBOARD}/eventos`,
  /** Bitácora de auditoría; con `userId` abre filtrada por ese usuario. */
  dashboardAuditoria: (userId?: string) =>
    userId
      ? `${DASHBOARD}/auditoria?user=${encodeURIComponent(userId)}`
      : `${DASHBOARD}/auditoria`,
} as const;

