import { useState, useCallback } from "react";
import { databases, DATABASE_ID } from "../../../shared/lib/appwrite";
import { Query } from "appwrite";
import { exportToCsv } from "../../../shared/lib/exportToCsv";

const TICKETS = "tickets";

/**
 * Fetches ALL tickets matching date range in batches of 100 (Appwrite limit).
 * Returns full array of documents. Max 10,000 to prevent runaway queries.
 */
const MAX_REPORT_ROWS = 10000;

async function fetchAllTickets(dateFrom, dateTo, extraQueries = []) {
  const batchSize = 100;
  let allDocs = [];
  let lastId = null;
  let hasMore = true;

  while (hasMore && allDocs.length < MAX_REPORT_ROWS) {
    const queries = [
      Query.orderDesc("$createdAt"),
      Query.limit(batchSize),
      ...extraQueries,
    ];
    if (lastId) queries.push(Query.cursorAfter(lastId));

    if (dateFrom)
      queries.push(
        Query.greaterThanEqual("$createdAt", dateFrom + "T00:00:00.000Z"),
      );
    if (dateTo)
      queries.push(
        Query.lessThanEqual("$createdAt", dateTo + "T23:59:59.999Z"),
      );

    const res = await databases.listDocuments(DATABASE_ID, TICKETS, queries);
    allDocs = allDocs.concat(res.documents);

    if (res.documents.length < batchSize || allDocs.length >= res.total) {
      hasMore = false;
    } else {
      lastId = res.documents[res.documents.length - 1].$id;
    }
  }

  return { documents: allDocs, truncated: allDocs.length >= MAX_REPORT_ROWS };
}

export function useReportes() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [reportType, setReportType] = useState("operations");

  // Catalogs for name resolution
  const [catalogs, setCatalogs] = useState({
    clients: [],
    drivers: [],
    trucks: [],
    materials: [],
    plants: [],
  });
  const [catalogsLoaded, setCatalogsLoaded] = useState(false);

  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    clientId: "",
    materialId: "",
    status: "",
    plantId: "",
    type: "", // voucher | counter_sale
  });

  /* ─── Load catalogs once ─── */
  const loadCatalogs = useCallback(async () => {
    if (catalogsLoaded) return;
    try {
      const [cl, dr, tr, ma, pl] = await Promise.all([
        databases.listDocuments(DATABASE_ID, "clients", [
          Query.limit(500),
          Query.orderAsc("name"),
        ]),
        databases.listDocuments(DATABASE_ID, "drivers", [
          Query.limit(500),
          Query.orderAsc("fullName"),
        ]),
        databases.listDocuments(DATABASE_ID, "trucks", [Query.limit(500)]),
        databases.listDocuments(DATABASE_ID, "materials", [
          Query.limit(500),
          Query.orderAsc("name"),
        ]),
        databases.listDocuments(DATABASE_ID, "plants", [
          Query.limit(500),
          Query.orderAsc("name"),
        ]),
      ]);
      setCatalogs({
        clients: cl.documents,
        drivers: dr.documents,
        trucks: tr.documents,
        materials: ma.documents,
        plants: pl.documents,
      });
      setCatalogsLoaded(true);
    } catch (err) {
      console.error("Error cargando catálogos para reportes:", err);
    }
  }, [catalogsLoaded]);

  /* ─── Catalog helpers ─── */
  const getName = useCallback(
    (collection, id, field = "name") => {
      if (!id) return "—";
      const doc = catalogs[collection]?.find((d) => d.$id === id);
      return doc ? doc[field] || doc.name || id : id;
    },
    [catalogs],
  );

  const getClientName = useCallback((id) => getName("clients", id), [getName]);
  const getDriverName = useCallback(
    (id) => getName("drivers", id, "fullName"),
    [getName],
  );
  const getTruckPlate = useCallback(
    (id) => {
      if (!id) return "—";
      const t = catalogs.trucks?.find((d) => d.$id === id);
      return t ? t.plateNumber || t.economicNumber || id : id;
    },
    [catalogs],
  );
  const getMaterialName = useCallback(
    (id) => getName("materials", id),
    [getName],
  );
  const getPlantName = useCallback((id) => getName("plants", id), [getName]);

  /* ─── Generate report ─── */
  const generateReport = useCallback(
    async (type, overrideFilters) => {
      const f = overrideFilters || filters;
      setLoading(true);
      setReportType(type);

      try {
        const extraQueries = [];
        if (f.clientId) extraQueries.push(Query.equal("clientId", f.clientId));
        if (f.materialId)
          extraQueries.push(Query.equal("materialId", f.materialId));
        if (f.status) extraQueries.push(Query.equal("status", f.status));
        if (f.plantId) extraQueries.push(Query.equal("plantId", f.plantId));
        if (f.type) extraQueries.push(Query.equal("type", f.type));

        const { documents: tickets, truncated } = await fetchAllTickets(
          f.dateFrom,
          f.dateTo,
          extraQueries,
        );

        let result;
        switch (type) {
          case "operations":
            result = buildOperationsReport(tickets);
            break;
          case "byClient":
            result = buildByClientReport(tickets);
            break;
          case "byMaterial":
            result = buildByMaterialReport(tickets);
            break;
          case "byDriver":
            result = buildByDriverReport(tickets);
            break;
          case "byTruck":
            result = buildByTruckReport(tickets);
            break;
          case "byPlant":
            result = buildByPlantReport(tickets);
            break;
          case "byType":
            result = buildByTypeReport(tickets);
            break;
          default:
            result = buildOperationsReport(tickets);
        }

        result.truncated = truncated;
        result.maxRows = MAX_REPORT_ROWS;
        setData(result);
      } catch (err) {
        console.error("Error generando reporte:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  /* ─── Report builders ─── */
  function buildOperationsReport(tickets) {
    const completed = tickets.filter((t) => t.status === "completed").length;
    const cancelled = tickets.filter((t) => t.status === "cancelled").length;
    const rejected = tickets.filter((t) => t.status === "rejected").length;
    const totalQty = tickets.reduce((s, t) => s + (t.commercialQty || 0), 0);
    const totalNet = tickets.reduce((s, t) => s + (t.netWeight || 0), 0);

    return {
      type: "operations",
      rows: tickets,
      totals: {
        total: tickets.length,
        completed,
        cancelled,
        rejected,
        totalQty,
        totalNet,
      },
    };
  }

  function buildByClientReport(tickets) {
    const map = {};
    tickets.forEach((t) => {
      const key = t.clientId || "sin_cliente";
      if (!map[key])
        map[key] = {
          clientId: key,
          ops: 0,
          qty: 0,
          net: 0,
          materials: new Set(),
        };
      map[key].ops++;
      map[key].qty += t.commercialQty || 0;
      map[key].net += t.netWeight || 0;
      if (t.materialId) map[key].materials.add(t.materialId);
    });
    const rows = Object.values(map).map((r) => ({
      ...r,
      materials: [...r.materials],
    }));
    rows.sort((a, b) => b.ops - a.ops);
    const totalOps = rows.reduce((s, r) => s + r.ops, 0);
    const totalQty = rows.reduce((s, r) => s + r.qty, 0);
    const totalNet = rows.reduce((s, r) => s + r.net, 0);
    return { type: "byClient", rows, totals: { totalOps, totalQty, totalNet } };
  }

  function buildByMaterialReport(tickets) {
    const map = {};
    tickets.forEach((t) => {
      const key = t.materialId || "sin_material";
      if (!map[key])
        map[key] = {
          materialId: key,
          ops: 0,
          qty: 0,
          net: 0,
          clients: new Set(),
        };
      map[key].ops++;
      map[key].qty += t.commercialQty || 0;
      map[key].net += t.netWeight || 0;
      if (t.clientId) map[key].clients.add(t.clientId);
    });
    const rows = Object.values(map).map((r) => ({
      ...r,
      clients: [...r.clients],
    }));
    rows.sort((a, b) => b.ops - a.ops);
    const totalOps = rows.reduce((s, r) => s + r.ops, 0);
    const totalQty = rows.reduce((s, r) => s + r.qty, 0);
    const totalNet = rows.reduce((s, r) => s + r.net, 0);
    return {
      type: "byMaterial",
      rows,
      totals: { totalOps, totalQty, totalNet },
    };
  }

  function buildByDriverReport(tickets) {
    const map = {};
    tickets.forEach((t) => {
      const key = t.driverId || "sin_chofer";
      if (!map[key])
        map[key] = { driverId: key, ops: 0, qty: 0, trucks: new Set() };
      map[key].ops++;
      map[key].qty += t.commercialQty || 0;
      if (t.truckId) map[key].trucks.add(t.truckId);
    });
    const rows = Object.values(map).map((r) => ({
      ...r,
      trucks: [...r.trucks],
    }));
    rows.sort((a, b) => b.ops - a.ops);
    const totalOps = rows.reduce((s, r) => s + r.ops, 0);
    const totalQty = rows.reduce((s, r) => s + r.qty, 0);
    return { type: "byDriver", rows, totals: { totalOps, totalQty } };
  }

  function buildByTruckReport(tickets) {
    const map = {};
    tickets.forEach((t) => {
      const key = t.truckId || "sin_camion";
      if (!map[key])
        map[key] = {
          truckId: key,
          ops: 0,
          qty: 0,
          drivers: new Set(),
          materials: new Set(),
        };
      map[key].ops++;
      map[key].qty += t.commercialQty || 0;
      if (t.driverId) map[key].drivers.add(t.driverId);
      if (t.materialId) map[key].materials.add(t.materialId);
    });
    const rows = Object.values(map).map((r) => ({
      ...r,
      drivers: [...r.drivers],
      materials: [...r.materials],
    }));
    rows.sort((a, b) => b.ops - a.ops);
    const totalOps = rows.reduce((s, r) => s + r.ops, 0);
    const totalQty = rows.reduce((s, r) => s + r.qty, 0);
    return { type: "byTruck", rows, totals: { totalOps, totalQty } };
  }

  function buildByPlantReport(tickets) {
    const map = {};
    tickets.forEach((t) => {
      const key = t.plantId || "sin_planta";
      if (!map[key])
        map[key] = { plantId: key, ops: 0, qty: 0, materials: new Set() };
      map[key].ops++;
      map[key].qty += t.commercialQty || 0;
      if (t.materialId) map[key].materials.add(t.materialId);
    });
    const rows = Object.values(map).map((r) => ({
      ...r,
      materials: [...r.materials],
    }));
    rows.sort((a, b) => b.ops - a.ops);
    const totalOps = rows.reduce((s, r) => s + r.ops, 0);
    const totalQty = rows.reduce((s, r) => s + r.qty, 0);
    return { type: "byPlant", rows, totals: { totalOps, totalQty } };
  }

  function buildByTypeReport(tickets) {
    const voucher = tickets.filter((t) => t.type === "voucher");
    const counter = tickets.filter((t) => t.type === "counter_sale");
    const other = tickets.filter(
      (t) => t.type !== "voucher" && t.type !== "counter_sale",
    );
    const total = tickets.length || 1; // avoid /0
    return {
      type: "byType",
      rows: [
        {
          label: "Voucher / Prepago",
          count: voucher.length,
          pct: ((voucher.length / total) * 100).toFixed(1),
          qty: voucher.reduce((s, t) => s + (t.commercialQty || 0), 0),
          net: voucher.reduce((s, t) => s + (t.netWeight || 0), 0),
        },
        {
          label: "Venta en Mostrador",
          count: counter.length,
          pct: ((counter.length / total) * 100).toFixed(1),
          qty: counter.reduce((s, t) => s + (t.commercialQty || 0), 0),
          net: counter.reduce((s, t) => s + (t.netWeight || 0), 0),
        },
        ...(other.length > 0
          ? [
              {
                label: "Otro",
                count: other.length,
                pct: ((other.length / total) * 100).toFixed(1),
                qty: other.reduce((s, t) => s + (t.commercialQty || 0), 0),
                net: other.reduce((s, t) => s + (t.netWeight || 0), 0),
              },
            ]
          : []),
      ],
      totals: {
        total: tickets.length,
        totalQty: tickets.reduce((s, t) => s + (t.commercialQty || 0), 0),
        totalNet: tickets.reduce((s, t) => s + (t.netWeight || 0), 0),
      },
    };
  }

  /* ─── Export CSV ─── */
  const exportCSV = useCallback(async (reportData, resolvers) => {
    if (!reportData || !reportData.rows?.length) return false;

    const {
      getClientName: gc,
      getDriverName: gd,
      getTruckPlate: gt,
      getMaterialName: gm,
      getPlantName: gp,
    } = resolvers;

    const escape = (val) => {
      const s = String(val ?? "");
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? '"' + s.replace(/"/g, '""') + '"'
        : s;
    };

    let header = "";
    let rows = [];

    switch (reportData.type) {
      case "operations":
        header =
          "Folio,Fecha,Cliente,Chofer,Camión,Material,Planta,Cant. Comercial,Unidad,Peso Neto,Estado,Tipo";
        rows = reportData.rows.map((t) =>
          [
            escape(t.ticketNumber),
            new Date(t.$createdAt).toLocaleString("es-MX"),
            escape(gc(t.clientId)),
            escape(gd(t.driverId)),
            escape(gt(t.truckId)),
            escape(gm(t.materialId)),
            escape(gp(t.plantId)),
            t.commercialQty || 0,
            escape(t.commercialUnit || ""),
            t.netWeight || 0,
            escape(t.status),
            escape(t.type),
          ].join(","),
        );
        break;
      case "byClient":
        header = "Cliente,Operaciones,Cant. Comercial,Peso Neto";
        rows = reportData.rows.map((r) =>
          [
            escape(gc(r.clientId)),
            r.ops,
            r.qty.toFixed(2),
            r.net.toFixed(2),
          ].join(","),
        );
        break;
      case "byMaterial":
        header = "Material,Operaciones,Cant. Comercial,Peso Neto";
        rows = reportData.rows.map((r) =>
          [
            escape(gm(r.materialId)),
            r.ops,
            r.qty.toFixed(2),
            r.net.toFixed(2),
          ].join(","),
        );
        break;
      case "byDriver":
        header = "Chofer,Operaciones,Cant. Total,Camiones";
        rows = reportData.rows.map((r) =>
          [
            escape(gd(r.driverId)),
            r.ops,
            r.qty.toFixed(2),
            r.trucks.length,
          ].join(","),
        );
        break;
      case "byTruck":
        header = "Camión,Operaciones,Cant. Total,Choferes,Materiales";
        rows = reportData.rows.map((r) =>
          [
            escape(gt(r.truckId)),
            r.ops,
            r.qty.toFixed(2),
            r.drivers.length,
            r.materials.length,
          ].join(","),
        );
        break;
      case "byPlant":
        header = "Planta,Operaciones,Cant. Total,Materiales";
        rows = reportData.rows.map((r) =>
          [
            escape(gp(r.plantId)),
            r.ops,
            r.qty.toFixed(2),
            r.materials.length,
          ].join(","),
        );
        break;
      case "byType":
        header = "Tipo de Venta,Operaciones,%,Cant. Comercial,Peso Neto";
        rows = reportData.rows.map((r) =>
          [
            escape(r.label),
            r.count,
            r.pct + "%",
            r.qty.toFixed(2),
            r.net.toFixed(2),
          ].join(","),
        );
        break;
    }

    const headersArr = header.split(",");
    const rowsArr = rows.map((r) =>
      r.split(",").map((v) => v.replace(/^"|"$/g, "").replace(/""/g, '"')),
    );

    return await exportToCsv({
      filename: `reporte_${reportData.type}`,
      headers: headersArr,
      rows: rowsArr,
      truncated: reportData.truncated || false,
      maxRows: reportData.maxRows || 10000,
      audit: resolvers.userId
        ? {
            action: "export.reports_csv",
            collection: "tickets",
            userId: resolvers.userId,
            details: { reportType: reportData.type, rowCount: rows.length },
          }
        : undefined,
    });
  }, []);

  return {
    loading,
    data,
    reportType,
    filters,
    catalogs,
    setFilters,
    setReportType,
    loadCatalogs,
    generateReport,
    exportCSV,
    getClientName,
    getDriverName,
    getTruckPlate,
    getMaterialName,
    getPlantName,
  };
}
