import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding BarOps Pro…");

  // Clean (idempotent)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.tenant.deleteMany();

  const tenant = await prisma.tenant.create({ data: { name: "Grupo Nocturne", plan: "PRO" } });

  const centro = await prisma.branch.create({
    data: { tenantId: tenant.id, name: "Nocturne Centro", address: "Av. Reforma 123, CDMX" },
  });
  const polanco = await prisma.branch.create({
    data: { tenantId: tenant.id, name: "Nocturne Polanco", address: "Masaryk 456, CDMX" },
  });

  const hash = (p: string) => bcrypt.hashSync(p, 10);
  await prisma.user.createMany({
    data: [
      { tenantId: tenant.id, branchId: centro.id, name: "Guille de León", email: "admin@barops.pro", passwordHash: hash("admin123"), role: "OWNER" },
      { tenantId: tenant.id, branchId: centro.id, name: "María Gerente", email: "gerente@barops.pro", passwordHash: hash("gerente123"), role: "MANAGER" },
      { tenantId: tenant.id, branchId: centro.id, name: "Luis Mesero", email: "mesero@barops.pro", passwordHash: hash("mesero123"), role: "WAITER" },
      { tenantId: tenant.id, branchId: centro.id, name: "Ana Bartender", email: "bar@barops.pro", passwordHash: hash("bar123"), role: "BARTENDER" },
      { tenantId: tenant.id, branchId: centro.id, name: "Chef Diego", email: "cocina@barops.pro", passwordHash: hash("cocina123"), role: "KITCHEN" },
      { tenantId: tenant.id, branchId: polanco.id, name: "Sofía Polanco", email: "polanco@barops.pro", passwordHash: hash("polanco123"), role: "MANAGER" },
    ],
  });

  const cocteles = await prisma.category.create({ data: { branchId: centro.id, name: "Cócteles", color: "#adc6ff" } });
  const cervezas = await prisma.category.create({ data: { branchId: centro.id, name: "Cervezas", color: "#ffb95f" } });
  const vinos = await prisma.category.create({ data: { branchId: centro.id, name: "Vinos", color: "#ff8fa3" } });
  const comida = await prisma.category.create({ data: { branchId: centro.id, name: "Cocina", color: "#4edea3" } });
  const shots = await prisma.category.create({ data: { branchId: centro.id, name: "Destilados", color: "#c58bff" } });

  const products: [string, number, string][] = [
    ["Margarita Clásica", 145, cocteles.id],
    ["Mezcalita de Tamarindo", 165, cocteles.id],
    ["Negroni", 155, cocteles.id],
    ["Old Fashioned", 175, cocteles.id],
    ["Paloma Nocturne", 135, cocteles.id],
    ["Gin Tonic Premium", 160, cocteles.id],
    ["Cerveza Artesanal IPA", 95, cervezas.id],
    ["Cerveza Lager", 75, cervezas.id],
    ["Michelada Especial", 110, cervezas.id],
    ["Copa Vino Tinto", 130, vinos.id],
    ["Copa Vino Blanco", 130, vinos.id],
    ["Botella Malbec", 650, vinos.id],
    ["Tequila Reposado (shot)", 90, shots.id],
    ["Mezcal Espadín (shot)", 110, shots.id],
    ["Whisky Single Malt", 220, shots.id],
    ["Tabla de Quesos", 240, comida.id],
    ["Alitas BBQ", 185, comida.id],
    ["Guacamole & Totopos", 125, comida.id],
    ["Tacos de Pastor (3)", 130, comida.id],
    ["Papas Trufadas", 115, comida.id],
  ];
  await prisma.product.createMany({
    data: products.map(([name, price, categoryId]) => ({
      branchId: centro.id, name, price, cost: +(price * 0.3).toFixed(2), categoryId,
    })),
  });

  await prisma.inventoryItem.createMany({
    data: [
      { branchId: centro.id, name: "Tequila Blanco (L)", unit: "L", stock: 12, parLevel: 8, cost: 380, supplier: "Casa Sauza" },
      { branchId: centro.id, name: "Mezcal Espadín (L)", unit: "L", stock: 4, parLevel: 6, cost: 520, supplier: "Oaxaca Spirits" },
      { branchId: centro.id, name: "Gin London Dry (L)", unit: "L", stock: 9, parLevel: 5, cost: 610, supplier: "Beefeater MX" },
      { branchId: centro.id, name: "Limón (kg)", unit: "kg", stock: 3, parLevel: 10, cost: 28, supplier: "Central de Abastos" },
      { branchId: centro.id, name: "Hielo (bolsa)", unit: "bolsa", stock: 40, parLevel: 20, cost: 35, supplier: "Hielo Polar" },
      { branchId: centro.id, name: "Cerveza IPA (barril)", unit: "barril", stock: 2, parLevel: 3, cost: 1800, supplier: "Cervecería Local" },
      { branchId: centro.id, name: "Naranja (kg)", unit: "kg", stock: 15, parLevel: 8, cost: 22, supplier: "Central de Abastos" },
      { branchId: centro.id, name: "Vino Tinto Malbec (botella)", unit: "botella", stock: 24, parLevel: 12, cost: 320, supplier: "Bodegas Argentinas" },
    ],
  });

  const zones = ["Terraza", "Salón Principal", "Barra"];
  const tableData = [] as { branchId: string; name: string; seats: number; zone: string; status: any }[];
  let n = 1;
  for (const zone of zones) {
    for (let i = 0; i < 6; i++) {
      const statuses = ["FREE", "OCCUPIED", "RESERVED", "FREE", "CLEANING", "FREE"];
      tableData.push({ branchId: centro.id, name: `M${n}`, seats: [2, 4, 6][i % 3], zone, status: statuses[i] });
      n++;
    }
  }
  await prisma.restaurantTable.createMany({ data: tableData });

  await prisma.customer.createMany({
    data: [
      { branchId: centro.id, name: "Roberto Sánchez", phone: "5544332211", email: "roberto@mail.com", visits: 24, loyaltyPts: 480, totalSpent: 12450, vip: true, notes: "Prefiere mezcal, mesa en terraza." },
      { branchId: centro.id, name: "Fernanda López", phone: "5511223344", email: "fer@mail.com", visits: 12, loyaltyPts: 210, totalSpent: 5320, vip: false },
      { branchId: centro.id, name: "Grupo Empresa XYZ", phone: "5599887766", visits: 8, loyaltyPts: 640, totalSpent: 18900, vip: true, notes: "Eventos corporativos, factura." },
      { branchId: centro.id, name: "Diana Torres", phone: "5566778899", visits: 5, loyaltyPts: 90, totalSpent: 2100, vip: false },
      { branchId: centro.id, name: "Carlos Mendoza", phone: "5533445566", visits: 31, loyaltyPts: 720, totalSpent: 21300, vip: true, notes: "Cliente frecuente viernes." },
    ],
  });

  const now = new Date();
  await prisma.reservation.createMany({
    data: [
      { branchId: centro.id, guestName: "Roberto Sánchez", partySize: 4, dateTime: new Date(now.getTime() + 3 * 3600e3), status: "CONFIRMED", notes: "Terraza" },
      { branchId: centro.id, guestName: "Fernanda López", partySize: 2, dateTime: new Date(now.getTime() + 5 * 3600e3), status: "PENDING" },
      { branchId: centro.id, guestName: "Cumpleaños Diana", partySize: 8, dateTime: new Date(now.getTime() + 26 * 3600e3), status: "CONFIRMED", notes: "Pastel a las 22h" },
    ],
  });

  // Some paid orders today for dashboard
  const menu = await prisma.product.findMany({ where: { branchId: centro.id } });
  const waiter = await prisma.user.findFirst({ where: { email: "mesero@barops.pro" } });
  for (let o = 0; o < 6; o++) {
    const picks = [menu[o % menu.length], menu[(o + 3) % menu.length], menu[(o + 7) % menu.length]];
    const subtotal = picks.reduce((s, p) => s + p.price, 0);
    const tax = +(subtotal * 0.16).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    await prisma.order.create({
      data: {
        branchId: centro.id, waiterId: waiter?.id, number: o + 1, status: "PAID",
        subtotal, tax, total,
        items: { create: picks.map((p) => ({ productId: p.id, name: p.name, price: p.price, qty: 1 })) },
      },
    });
  }


  // ---- Extended operational demo data ----
  await prisma.device.createMany({ data: [
    { branchId: centro.id, name: "Router Principal", type: "ROUTER", ip: "192.168.1.1", status: "ONLINE", firmware: "2.4.1", latencyMs: 4, uptime: 99.9 },
    { branchId: centro.id, name: "AP Terraza", type: "AP", ip: "192.168.1.2", status: "ONLINE", firmware: "2.4.1", latencyMs: 9, uptime: 99.2 },
    { branchId: centro.id, name: "AP Salón", type: "AP", ip: "192.168.1.3", status: "WARNING", firmware: "2.3.0", latencyMs: 38, uptime: 96.5 },
    { branchId: centro.id, name: "POS Barra 1", type: "POS", ip: "192.168.1.20", status: "ONLINE", firmware: "2.4.1", latencyMs: 12, uptime: 99.5 },
    { branchId: centro.id, name: "POS Caja", type: "POS", ip: "192.168.1.21", status: "ONLINE", firmware: "2.3.0", latencyMs: 15, uptime: 98.9 },
    { branchId: centro.id, name: "KDS Cocina", type: "KDS", ip: "192.168.1.30", status: "ONLINE", firmware: "2.4.1", latencyMs: 10, uptime: 99.1 },
    { branchId: centro.id, name: "Impresora Barra", type: "PRINTER", ip: "192.168.1.40", status: "OFFLINE", firmware: "1.9.0", latencyMs: 0, uptime: 80.0 },
    { branchId: centro.id, name: "Tablet Mesero 1", type: "TABLET", ip: "192.168.1.50", status: "ONLINE", firmware: "2.3.0", latencyMs: 22, uptime: 97.8 },
  ]});

  await prisma.supplier.createMany({ data: [
    { branchId: centro.id, name: "Casa Sauza", contact: "Ventas MX", phone: "555-1000", category: "Licores" },
    { branchId: centro.id, name: "Oaxaca Spirits", contact: "Mezcal Dept", phone: "555-2000", category: "Licores" },
    { branchId: centro.id, name: "Central de Abastos", contact: "Frutas y verduras", phone: "555-3000", category: "Alimentos" },
    { branchId: centro.id, name: "Cervecería Local", contact: "Distribución", phone: "555-4000", category: "Cervezas" },
  ]});

  const po1 = await prisma.purchaseOrder.create({ data: { branchId: centro.id, supplierName: "Casa Sauza", number: 1001, status: "SENT", total: 7600, items: { create: [ { name: "Tequila Blanco", qty: 20, unit: "L", cost: 380 } ] } } });
  await prisma.purchaseOrder.create({ data: { branchId: centro.id, supplierName: "Central de Abastos", number: 1002, status: "RECEIVED", total: 840, items: { create: [ { name: "Limón", qty: 30, unit: "kg", cost: 28 } ] } } });
  await prisma.purchaseOrder.create({ data: { branchId: centro.id, supplierName: "Cervecería Local", number: 1003, status: "DRAFT", total: 5400, items: { create: [ { name: "Barril IPA", qty: 3, unit: "barril", cost: 1800 } ] } } });

  await prisma.recipe.create({ data: { branchId: centro.id, name: "Margarita Clásica", yield: "1 copa", salePrice: 145, items: { create: [ { ingredient: "Tequila", qty: 45, unit: "ml", cost: 17 }, { ingredient: "Triple sec", qty: 20, unit: "ml", cost: 8 }, { ingredient: "Limón", qty: 25, unit: "ml", cost: 3 }, { ingredient: "Sal / hielo", qty: 1, unit: "porción", cost: 2 } ] } } });
  await prisma.recipe.create({ data: { branchId: centro.id, name: "Mezcalita de Tamarindo", yield: "1 copa", salePrice: 165, items: { create: [ { ingredient: "Mezcal", qty: 45, unit: "ml", cost: 23 }, { ingredient: "Pulpa tamarindo", qty: 30, unit: "ml", cost: 9 }, { ingredient: "Chile / sal", qty: 1, unit: "porción", cost: 3 } ] } } });
  await prisma.recipe.create({ data: { branchId: centro.id, name: "Tabla de Quesos", yield: "2-3 personas", salePrice: 240, items: { create: [ { ingredient: "Quesos surtidos", qty: 200, unit: "g", cost: 70 }, { ingredient: "Embutidos", qty: 100, unit: "g", cost: 45 }, { ingredient: "Pan / uvas", qty: 1, unit: "porción", cost: 20 } ] } } });

  const inThreeDays = new Date(now.getTime() + 3 * 86400e3);
  const pastDue = new Date(now.getTime() - 2 * 86400e3);
  await prisma.maintenanceTask.createMany({ data: [
    { branchId: centro.id, deviceName: "Cafetera Industrial", task: "Descalcificación", dueDate: inThreeDays, status: "PENDING", assignee: "Chef Diego" },
    { branchId: centro.id, deviceName: "Refrigerador Barra", task: "Limpieza de condensador", dueDate: pastDue, status: "PENDING", assignee: "Ana Bartender" },
    { branchId: centro.id, deviceName: "Campana extractora", task: "Cambio de filtros", dueDate: inThreeDays, status: "DONE", assignee: "Mantenimiento" },
  ]});

  await prisma.alert.createMany({ data: [
    { branchId: centro.id, title: "Meta de ventas alcanzada", message: "Se superó la meta diaria de $10,000", level: "INFO", acknowledged: false },
    { branchId: centro.id, title: "Impresora sin papel", message: "Impresora Barra reporta falta de papel", level: "WARNING", acknowledged: false },
  ]});

  await prisma.campaign.createMany({ data: [
    { branchId: centro.id, name: "Happy Hour Jueves", channel: "WhatsApp", audience: "Frecuentes", sent: 320, delivered: 310, opened: 148, status: "SENT" },
    { branchId: centro.id, name: "Promo VIP Fin de Semana", channel: "WhatsApp", audience: "VIP", sent: 85, delivered: 84, opened: 61, status: "SENT" },
    { branchId: centro.id, name: "Reactivación clientes", channel: "WhatsApp", audience: "Todos", sent: 0, delivered: 0, opened: 0, status: "DRAFT" },
  ]});

  await prisma.priceRule.createMany({ data: [
    { branchId: centro.id, name: "Happy Hour Cócteles", categoryName: "Cócteles", discountPct: 25, startHour: 17, endHour: 20, days: "L-V", active: true },
    { branchId: centro.id, name: "2x1 Cervezas", categoryName: "Cervezas", discountPct: 50, startHour: 18, endHour: 21, days: "Mié", active: true },
    { branchId: centro.id, name: "Vinos Domingo", categoryName: "Vinos", discountPct: 15, startHour: 14, endHour: 23, days: "Dom", active: false },
  ]});

  await prisma.invoice.createMany({ data: [
    { tenantId: tenant.id, number: "F-2026-05", amount: 1499, status: "PAID", period: "Mayo 2026" },
    { tenantId: tenant.id, number: "F-2026-06", amount: 1499, status: "PAID", period: "Junio 2026" },
    { tenantId: tenant.id, number: "F-2026-07", amount: 1499, status: "DUE", period: "Julio 2026" },
  ]});

  await prisma.auditLog.createMany({ data: [
    { branchId: centro.id, actor: "admin@barops.pro", action: "LOGIN", target: "Sesión", severity: "INFO" },
    { branchId: centro.id, actor: "gerente@barops.pro", action: "CIERRE_CAJA", target: "Turno #12", severity: "INFO" },
    { branchId: centro.id, actor: "mesero@barops.pro", action: "DESCUENTO_MANUAL", target: "Ticket #45", severity: "WARNING", detail: "Descuento del 20% aplicado sin autorización de gerente." },
    { branchId: centro.id, actor: "desconocido", action: "INTENTO_LOGIN_FALLIDO", target: "admin@barops.pro", severity: "CRITICAL", detail: "3 intentos fallidos consecutivos desde IP 190.20.10.5." },
    { branchId: centro.id, actor: "admin@barops.pro", action: "BRIEFING", target: "Turno", severity: "INFO", detail: "Reserva VIP a las 21h (mesa terraza). 86 de mezcal espadín." },
  ]});

  await prisma.waitlistEntry.createMany({ data: [
    { branchId: centro.id, name: "Familia Ramírez", partySize: 5, phone: "5512340000", quotedWait: 20, status: "WAITING" },
    { branchId: centro.id, name: "Pareja Gómez", partySize: 2, phone: "5512341111", quotedWait: 10, status: "WAITING" },
  ]});

  const gerente = await prisma.user.findFirst({ where: { email: "gerente@barops.pro" } });
  if (gerente) {
    await prisma.shift.create({ data: { branchId: centro.id, userId: gerente.id, openedAt: new Date(now.getTime() - 30 * 86400e3), closedAt: new Date(now.getTime() - 30 * 86400e3 + 8 * 3600e3), openingCash: 2000, closingCash: 12450, salesTotal: 10450 } });
  }


  console.log("Seed completo ✅  Login: admin@barops.pro / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
