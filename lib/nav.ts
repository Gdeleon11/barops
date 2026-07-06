export type NavItem = {
  slug: string;        // mockup file slug (for embed) or route id
  title: string;
  icon: string;        // material symbol name
  href: string;        // route path
  native?: boolean;    // true = real React page; false = embedded mockup
};

export type NavGroup = { label: string; items: NavItem[] };

// Native (full-stack, DB-backed) screens
export const NAV: NavGroup[] = [
  {
    label: "Operación",
    items: [
      { slug: "panel_de_control_general", title: "Dashboard Ejecutivo", icon: "dashboard", href: "/dashboard", native: true },
      { slug: "punto_de_venta_pos_operativo", title: "Punto de Venta (POS)", icon: "point_of_sale", href: "/pos", native: true },
      { slug: "gesti_n_de_mesas_y_salones", title: "Mesas y Salones", icon: "table_restaurant", href: "/tables", native: true },
      { slug: "plano_de_sal_n_din_mico_y_servicio_activo", title: "Plano de Salón", icon: "grid_view", href: "/m/plano_de_sal_n_din_mico_y_servicio_activo" },
      { slug: "lista_de_espera_y_asignaci_n_de_mesas", title: "Lista de Espera", icon: "hourglass_top", href: "/m/lista_de_espera_y_asignaci_n_de_mesas" },
      { slug: "kitchen_display_system_kds", title: "Cocina (KDS)", icon: "skillet", href: "/m/kitchen_display_system_kds" },
      { slug: "bar_display_system_bds", title: "Barra (BDS)", icon: "local_bar", href: "/m/bar_display_system_bds" },
    ],
  },
  {
    label: "Caja y Turnos",
    items: [
      { slug: "apertura_de_caja_y_turno", title: "Apertura de Caja", icon: "lock_open", href: "/m/apertura_de_caja_y_turno" },
      { slug: "monitoreo_de_caja_en_vivo", title: "Monitoreo de Caja", icon: "monitoring", href: "/m/monitoreo_de_caja_en_vivo" },
      { slug: "reconciliaci_n_y_cierre_de_turno", title: "Cierre de Turno", icon: "receipt_long", href: "/m/reconciliaci_n_y_cierre_de_turno" },
      { slug: "resumen_financiero_y_cierre_diario_reporte_z", title: "Reporte Z", icon: "summarize", href: "/m/resumen_financiero_y_cierre_diario_reporte_z" },
      { slug: "briefing_de_apertura_y_bit_cora_de_turno", title: "Briefing de Turno", icon: "campaign", href: "/m/briefing_de_apertura_y_bit_cora_de_turno" },
    ],
  },
  {
    label: "Inventario y Cocina",
    items: [
      { slug: "gesti_n_de_inventario_general", title: "Inventario General", icon: "inventory_2", href: "/inventory", native: true },
      { slug: "recetas_y_escandallos", title: "Recetas y Escandallos", icon: "menu_book", href: "/m/recetas_y_escandallos" },
      { slug: "control_de_botellas_y_rendimiento", title: "Control de Botellas", icon: "liquor", href: "/m/control_de_botellas_y_rendimiento" },
      { slug: "compras_y_proveedores", title: "Compras y Proveedores", icon: "local_shipping", href: "/m/compras_y_proveedores" },
    ],
  },
  {
    label: "Clientes y Marketing",
    items: [
      { slug: "crm_con_marketing_por_whatsapp", title: "CRM Clientes", icon: "groups", href: "/customers", native: true },
      { slug: "perfil_y_fidelizaci_n_de_cliente_crm", title: "Perfil y Fidelización", icon: "loyalty", href: "/m/perfil_y_fidelizaci_n_de_cliente_crm" },
      { slug: "panel_de_reconocimiento_de_clientes", title: "Reconocimiento", icon: "face", href: "/m/panel_de_reconocimiento_de_clientes" },
      { slug: "anal_tica_de_clientes_y_lealtad", title: "Analítica de Clientes", icon: "insights", href: "/m/anal_tica_de_clientes_y_lealtad" },
      { slug: "anal_tica_de_marketing_whatsapp", title: "Marketing WhatsApp", icon: "chat", href: "/m/anal_tica_de_marketing_whatsapp" },
    ],
  },
  {
    label: "Reservas",
    items: [
      { slug: "gesti_n_de_reservas_y_libros_de_turnos", title: "Reservas", icon: "event_available", href: "/reservations", native: true },
    ],
  },
  {
    label: "Personal",
    items: [
      { slug: "gesti_n_de_personal_y_desempe_o", title: "Personal y Desempeño", icon: "badge", href: "/staff", native: true },
      { slug: "turnos_y_asistencia", title: "Turnos y Asistencia", icon: "schedule", href: "/m/turnos_y_asistencia" },
      { slug: "comisiones_y_propinas", title: "Comisiones y Propinas", icon: "payments", href: "/m/comisiones_y_propinas" },
      { slug: "detalle_y_auditor_a_de_empleado", title: "Auditoría de Empleado", icon: "person_search", href: "/m/detalle_y_auditor_a_de_empleado" },
    ],
  },
  {
    label: "Analítica y Precios",
    items: [
      { slug: "dashboard_de_ventas_por_producto", title: "Ventas por Producto", icon: "bar_chart", href: "/m/dashboard_de_ventas_por_producto" },
      { slug: "configuraci_n_de_precios_y_happy_hours_din_micos", title: "Precios y Happy Hour", icon: "sell", href: "/m/configuraci_n_de_precios_y_happy_hours_din_micos" },
    ],
  },
  {
    label: "Dispositivos y Red",
    items: [
      { slug: "gesti_n_de_terminales_y_dispositivos", title: "Terminales y Dispositivos", icon: "devices", href: "/m/gesti_n_de_terminales_y_dispositivos" },
      { slug: "topolog_a_de_red_avanzada", title: "Topología de Red", icon: "lan", href: "/m/topolog_a_de_red_avanzada" },
      { slug: "anal_tica_de_rendimiento_de_red", title: "Rendimiento de Red", icon: "network_check", href: "/m/anal_tica_de_rendimiento_de_red" },
      { slug: "gesti_n_y_despliegue_de_firmware", title: "Firmware", icon: "memory", href: "/m/gesti_n_y_despliegue_de_firmware" },
      { slug: "mantenimiento_preventivo_de_hardware", title: "Mantenimiento", icon: "build", href: "/m/mantenimiento_preventivo_de_hardware" },
      { slug: "alertas_cr_ticas_y_notificaciones_push", title: "Alertas Críticas", icon: "notifications_active", href: "/m/alertas_cr_ticas_y_notificaciones_push" },
    ],
  },
  {
    label: "Seguridad y Admin",
    items: [
      { slug: "gesti_n_de_usuarios_y_permisos", title: "Usuarios y Permisos", icon: "manage_accounts", href: "/m/gesti_n_de_usuarios_y_permisos" },
      { slug: "configuraci_n_de_permisos_avanzados_por_rol", title: "Permisos por Rol", icon: "admin_panel_settings", href: "/m/configuraci_n_de_permisos_avanzados_por_rol" },
      { slug: "log_de_auditor_a_de_seguridad", title: "Log de Auditoría", icon: "gpp_maybe", href: "/m/log_de_auditor_a_de_seguridad" },
      { slug: "detalle_de_evento_y_comparativa_diff", title: "Detalle de Evento", icon: "difference", href: "/m/detalle_de_evento_y_comparativa_diff" },
      { slug: "flujo_de_invitaci_n_de_usuario", title: "Invitación de Usuario", icon: "person_add", href: "/m/flujo_de_invitaci_n_de_usuario" },
      { slug: "configuraci_n_de_suscripci_n_y_facturaci_n", title: "Suscripción y Facturación", icon: "credit_card", href: "/m/configuraci_n_de_suscripci_n_y_facturaci_n" },
      { slug: "planes_y_precios_saas", title: "Planes SaaS", icon: "workspace_premium", href: "/m/planes_y_precios_saas" },
    ],
  },
];

export const ALL_ITEMS: NavItem[] = NAV.flatMap((g) => g.items);
export const MOCKUP_SLUGS = ALL_ITEMS.filter((i) => !i.native).map((i) => i.slug);
