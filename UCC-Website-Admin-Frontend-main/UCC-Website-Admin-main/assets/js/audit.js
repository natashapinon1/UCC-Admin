(function () {
    const {$, esc, list, icons, initMenu} = UCC;

    // Sample data only — replace with rows from the backend.
    const H = 3600000;
    const mk = (id, action, description, by, hoursAgo) => ({id, action, description, performedBy: by, createdAt: Date.now() - hoursAgo * H});
    const items = [
        mk(1, "Login", "Signed in to the CMS.", "Maria Santos", 1),
        mk(2, "Create", "Created post \"Enrollment Schedule for Second Semester\".", "Maria Santos", 2),
        mk(3, "Update", "Updated event \"Foundation Day Celebration\".", "Juan Dela Cruz", 26),
        mk(4, "Archive", "Archived post \"Community Outreach Program in Caloocan\".", "Maria Santos", 50),
        mk(5, "Delete", "Deleted event \"Leadership Summit\".", "Juan Dela Cruz", 75),
        mk(6, "Logout", "Signed out of the CMS.", "Juan Dela Cruz", 76),
    ];
    let dateVal = "";

    const actionCls = a => ({Create: "status-published", Update: "status-pending", Delete: "status-expired", Archive: "status-archived"}[a] || "status-draft");
    const fmtDateTime = ts => new Date(ts).toLocaleString("en-PH", {year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"});
    const localDay = ts => { const d = new Date(ts); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

    const table = list({
        items: () => dateVal ? items.filter(i => localDay(i.createdAt) === dateVal) : items,
        tbody: $("auditTableBody"), search: $("auditSearch"), filter: $("auditFilter"), sort: $("auditSort"),
        count: $("auditCount"), pageSize: 10,
        pager: {nav: $("auditPagination"), prev: $("prevPageBtn"), next: $("nextPageBtn"), numbers: $("pageNumbers"), total: $("pageTotal")},
        cols: 4, emptyText: "No audit entries found.",
        countLabel: n => n + (n === 1 ? " entry" : " entries"),
        match: (it, q) => it.description.toLowerCase().includes(q),   // description only
        filterFn: (it, f) => f === "All" || it.action === f,
        sorters: {
            "created-desc": (a, b) => b.createdAt - a.createdAt,
            "created-asc": (a, b) => a.createdAt - b.createdAt,
            "action-asc": (a, b) => a.action.localeCompare(b.action),
            "action-desc": (a, b) => b.action.localeCompare(a.action),
            "by-asc": (a, b) => a.performedBy.localeCompare(b.performedBy),
            "by-desc": (a, b) => b.performedBy.localeCompare(a.performedBy)
        },
        row: it => `
            <tr data-id="${it.id}">
                <td><span class="status-badge ${actionCls(it.action)}">${esc(it.action)}</span></td>
                <td><span class="cell-ellipsis" title="${esc(it.description)}">${esc(it.description)}</span></td>
                <td><span class="cell-ellipsis">${esc(it.performedBy)}</span></td>
                <td><span class="cell-ellipsis">${esc(fmtDateTime(it.createdAt))}</span></td>
            </tr>`,
        onAction: () => {}
    });

    $("auditDate").addEventListener("change", e => { dateVal = e.target.value; table.reset(); });

    table.render();
    initMenu();
    icons();
})();