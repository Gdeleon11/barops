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

  console.log("Seed completo ✅  Login: admin@barops.pro / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
