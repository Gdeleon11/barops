import type { ComponentType } from "react";

// Registro de pantallas reales. Slug -> componente (server component async).
// Los slugs no listados usan el embed del mockup original como fallback.
import KDS from "./kds";
import BDS from "./bds";
import Plano from "./plano";
import Waitlist from "./waitlist";
import AperturaCaja from "./apertura-caja";
import MonitoreoCaja from "./monitoreo-caja";
import CierreTurno from "./cierre-turno";
import ReporteZ from "./reporte-z";
import Briefing from "./briefing";
import Recetas from "./recetas";
import Botellas from "./botellas";
import Compras from "./compras";
import VentasProducto from "./ventas-producto";
import PreciosHappyHour from "./precios";
import PerfilCliente from "./perfil-cliente";
import Reconocimiento from "./reconocimiento";
import AnaliticaClientes from "./analitica-clientes";
import MarketingWhatsapp from "./marketing-whatsapp";
import CrmWhatsapp from "./crm-whatsapp";
import TurnosAsistencia from "./turnos-asistencia";
import Comisiones from "./comisiones";
import AuditoriaEmpleado from "./auditoria-empleado";
import Terminales from "./terminales";
import Topologia from "./topologia";
import RendimientoRed from "./rendimiento-red";
import Firmware from "./firmware";
import Mantenimiento from "./mantenimiento";
import Alertas from "./alertas";
import Usuarios from "./usuarios";
import PermisosRol from "./permisos-rol";
import LogAuditoria from "./log-auditoria";
import DetalleEvento from "./detalle-evento";
import Invitacion from "./invitacion";
import Suscripcion from "./suscripcion";
import PlanesSaas from "./planes-saas";

export const SCREENS: Record<string, ComponentType<any>> = {
  kitchen_display_system_kds: KDS,
  bar_display_system_bds: BDS,
  plano_de_sal_n_din_mico_y_servicio_activo: Plano,
  lista_de_espera_y_asignaci_n_de_mesas: Waitlist,
  apertura_de_caja_y_turno: AperturaCaja,
  monitoreo_de_caja_en_vivo: MonitoreoCaja,
  reconciliaci_n_y_cierre_de_turno: CierreTurno,
  resumen_financiero_y_cierre_diario_reporte_z: ReporteZ,
  briefing_de_apertura_y_bit_cora_de_turno: Briefing,
  recetas_y_escandallos: Recetas,
  control_de_botellas_y_rendimiento: Botellas,
  compras_y_proveedores: Compras,
  dashboard_de_ventas_por_producto: VentasProducto,
  configuraci_n_de_precios_y_happy_hours_din_micos: PreciosHappyHour,
  perfil_y_fidelizaci_n_de_cliente_crm: PerfilCliente,
  panel_de_reconocimiento_de_clientes: Reconocimiento,
  anal_tica_de_clientes_y_lealtad: AnaliticaClientes,
  anal_tica_de_marketing_whatsapp: MarketingWhatsapp,
  crm_con_marketing_por_whatsapp: CrmWhatsapp,
  turnos_y_asistencia: TurnosAsistencia,
  comisiones_y_propinas: Comisiones,
  detalle_y_auditor_a_de_empleado: AuditoriaEmpleado,
  gesti_n_de_terminales_y_dispositivos: Terminales,
  topolog_a_de_red_avanzada: Topologia,
  anal_tica_de_rendimiento_de_red: RendimientoRed,
  gesti_n_y_despliegue_de_firmware: Firmware,
  mantenimiento_preventivo_de_hardware: Mantenimiento,
  alertas_cr_ticas_y_notificaciones_push: Alertas,
  gesti_n_de_usuarios_y_permisos: Usuarios,
  configuraci_n_de_permisos_avanzados_por_rol: PermisosRol,
  log_de_auditor_a_de_seguridad: LogAuditoria,
  detalle_de_evento_y_comparativa_diff: DetalleEvento,
  flujo_de_invitaci_n_de_usuario: Invitacion,
  configuraci_n_de_suscripci_n_y_facturaci_n: Suscripcion,
  planes_y_precios_saas: PlanesSaas,
};
