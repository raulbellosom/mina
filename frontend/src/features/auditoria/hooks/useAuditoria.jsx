import { useState, useCallback } from "react";
import { databases, DATABASE_ID } from "../../../shared/lib/appwrite";
import { Query } from "appwrite";
import { exportToCsv } from "../../../shared/lib/exportToCsv";

const COLLECTION = "audit_logs";
const PAGE_SIZE_OPTIONS = [25, 50];

export function useAuditoria() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [usersMap, setUsersMap] = useState({});

  const [filters, setFilters] = useState({
    action: "",
    collection: "",
    userId: "",
    dateFrom: "",
    dateTo: "",
  });

  /* ─── Load user profiles for display ─── */
  const loadUsersMap = useCallback(
    async (docs) => {
      const userIds = [...new Set(docs.map((d) => d.userId).filter(Boolean))];
      const missing = userIds.filter((id) => !usersMap[id]);
      if (missing.length === 0) return;

      try {
        // Load in batches of 25 (Appwrite Query.equal limit)
        const batchSize = 25;
        const newMap = { ...usersMap };
        for (let i = 0; i < missing.length; i += batchSize) {
          const batch = missing.slice(i, i + batchSize);
          const res = await databases.listDocuments(
            DATABASE_ID,
            "users_profile",
            [Query.equal("userId", batch), Query.limit(batchSize)],
          );
          res.documents.forEach((u) => {
            newMap[u.userId] = u.name || u.firstName || u.email || u.userId;
          });
        }
        // For IDs not found in profiles, keep the ID
        missing.forEach((id) => {
          if (!newMap[id]) newMap[id] = id;
        });
        setUsersMap(newMap);
      } catch (err) {
        console.warn("Error cargando perfiles para auditoría:", err.message);
      }
    },
    [usersMap],
  );

  /* ─── Fetch logs with filters and pagination ─── */
  const fetchLogs = useCallback(
    async (overrideFilters, overridePage, overridePageSize) => {
      const f = overrideFilters || filters;
      const p = overridePage || page;
      const ps = overridePageSize || pageSize;

      try {
        setLoading(true);
        const queries = [
          Query.orderDesc("$createdAt"),
          Query.limit(ps),
          Query.offset((p - 1) * ps),
        ];

        if (f.action) queries.push(Query.equal("action", f.action));
        if (f.collection) queries.push(Query.equal("collection", f.collection));
        if (f.userId) queries.push(Query.equal("userId", f.userId));
        if (f.dateFrom)
          queries.push(
            Query.greaterThanEqual("$createdAt", f.dateFrom + "T00:00:00.000Z"),
          );
        if (f.dateTo)
          queries.push(
            Query.lessThanEqual("$createdAt", f.dateTo + "T23:59:59.999Z"),
          );

        const res = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION,
          queries,
        );
        setLogs(res.documents);
        setTotal(res.total);
        await loadUsersMap(res.documents);
      } catch (err) {
        console.error("Error cargando auditoría:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters, page, pageSize, loadUsersMap],
  );

  /* ─── Apply filters ─── */
  const applyFilters = useCallback(
    async (newFilters) => {
      setFilters(newFilters);
      setPage(1);
      await fetchLogs(newFilters, 1, pageSize);
    },
    [fetchLogs, pageSize],
  );

  /* ─── Clear all filters ─── */
  const clearFilters = useCallback(async () => {
    const empty = {
      action: "",
      collection: "",
      userId: "",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(empty);
    setPage(1);
    await fetchLogs(empty, 1, pageSize);
  }, [fetchLogs, pageSize]);

  /* ─── Go to page ─── */
  const goToPage = useCallback(
    async (newPage) => {
      setPage(newPage);
      await fetchLogs(filters, newPage, pageSize);
    },
    [fetchLogs, filters, pageSize],
  );

  /* ─── Change page size ─── */
  const changePageSize = useCallback(
    async (newSize) => {
      setPageSize(newSize);
      setPage(1);
      await fetchLogs(filters, 1, newSize);
    },
    [fetchLogs, filters],
  );

  /* ─── Export to CSV ─── */
  const exportCSV = useCallback(
    async (userId) => {
      try {
        // Fetch all results matching current filters with pagination (max 10000)
        const MAX_EXPORT = 10000;
        const batchSize = 100;
        let allDocs = [];
        let lastId = null;
        let hasMore = true;

        while (hasMore && allDocs.length < MAX_EXPORT) {
          const queries = [
            Query.orderDesc("$createdAt"),
            Query.limit(batchSize),
          ];
          if (lastId) queries.push(Query.cursorAfter(lastId));
          if (filters.action)
            queries.push(Query.equal("action", filters.action));
          if (filters.collection)
            queries.push(Query.equal("collection", filters.collection));
          if (filters.userId)
            queries.push(Query.equal("userId", filters.userId));
          if (filters.dateFrom)
            queries.push(
              Query.greaterThanEqual(
                "$createdAt",
                filters.dateFrom + "T00:00:00.000Z",
              ),
            );
          if (filters.dateTo)
            queries.push(
              Query.lessThanEqual(
                "$createdAt",
                filters.dateTo + "T23:59:59.999Z",
              ),
            );

          const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION,
            queries,
          );
          allDocs = allDocs.concat(res.documents);

          if (res.documents.length < batchSize || allDocs.length >= res.total) {
            hasMore = false;
          } else {
            lastId = res.documents[res.documents.length - 1].$id;
          }
        }

        const truncated = allDocs.length >= MAX_EXPORT;
        await loadUsersMap(allDocs);

        return await exportToCsv({
          filename: "auditoria",
          headers: [
            "Fecha",
            "Acción",
            "Módulo",
            "ID Documento",
            "Usuario",
            "Detalles",
          ],
          rows: allDocs.map((d) => [
            new Date(d.$createdAt).toLocaleString("es-MX"),
            d.action,
            d.collection,
            d.docId,
            usersMap[d.userId] || d.userId,
            d.details || "",
          ]),
          truncated,
          maxRows: MAX_EXPORT,
          audit: userId
            ? {
                action: "export.audit_csv",
                collection: "audit_logs",
                userId,
                details: { filters },
              }
            : undefined,
        });
      } catch (err) {
        console.error("Error exportando CSV:", err);
        return false;
      }
    },
    [filters, usersMap],
  );

  /* ─── Load known actions and collections for filter dropdowns ─── */
  const [knownActions, setKnownActions] = useState([]);
  const [knownCollections, setKnownCollections] = useState([]);

  const loadFilterOptions = useCallback(async () => {
    try {
      // Get a sample of recent docs to extract unique actions/collections
      const res = await databases.listDocuments(DATABASE_ID, COLLECTION, [
        Query.orderDesc("$createdAt"),
        Query.limit(500),
        Query.select(["action", "collection"]),
      ]);
      const actions = [...new Set(res.documents.map((d) => d.action))].sort();
      const collections = [
        ...new Set(res.documents.map((d) => d.collection)),
      ].sort();
      setKnownActions(actions);
      setKnownCollections(collections);
    } catch (err) {
      console.warn("Error cargando opciones de filtro:", err.message);
    }
  }, []);

  return {
    logs,
    loading,
    total,
    page,
    pageSize,
    filters,
    usersMap,
    knownActions,
    knownCollections,
    PAGE_SIZE_OPTIONS,
    fetchLogs,
    applyFilters,
    clearFilters,
    goToPage,
    changePageSize,
    exportCSV,
    loadFilterOptions,
  };
}
