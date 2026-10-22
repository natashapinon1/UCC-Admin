(function () {
    const {fillMeta, $, esc, fmtDay, toast, openModal, closeModal, confirmDelete, list, icons, initMenu} = UCC;
    const day = 86400000;
    const items = [];
    const mk = (id, title, category, publish, archived, excerpt, content, ago) => items.push({id, title, category, publish, archived, image: "", excerpt, content, createdBy: "Admin", updatedBy: "Admin", createdAt: Date.now() - ago * day});
    mk(101, "UCC Opens Applications for the New Academic Year", "Admission", "2026-06-12", "2026-10-10", "Application details, requirements, and important dates for incoming students.", "The University of Caloocan City announces the opening of applications for the upcoming academic year. Applicants are encouraged to review the admission requirements and submit complete documents within the published application period.", 12);
    mk(102, "University Community Celebrates Founding Anniversary", "News", "2026-05-28", "2026-10-09", "Highlights from the university’s founding anniversary celebration.", "The university community came together to celebrate its founding anniversary, recognizing the people and milestones that have shaped UCC. The celebration highlighted the university’s continuing commitment to accessible education and public service.", 11);
    const cats = ["Announcement", "Event", "Student Life", "Community Extension Services", "Alumni", "Careers", "College News", "Program News", "News", "Event"];
    cats.forEach((c, i) => mk(103 + i, "Archived " + c + " Sample " + (i + 1), c, "2026-0" + (1 + (i % 6)) + "-1" + (i % 9), "2026-10-0" + (1 + (i % 8)), "Sample excerpt for archived " + c + " post " + (i + 1) + ".", "Sample content for archived " + c + " post " + (i + 1) + ". Use this row to test preview, restore, and permanent delete.", 10 - i));

    const previewModal = $("archivePreviewModal");

    const table = list({
        items: () => items,
        tbody: $("archiveTableBody"), search: $("archiveSearch"), filter: $("categoryFilter"), sort: $("orderFilter"),
        count: $("archiveCount"),
        pageSize: 10,
        pager: {
            nav: $("archivePagination"), prev: $("archivePrevPage"), next: $("archiveNextPage"),
            numbers: $("archivePageNumbers"), total: $("archivePageTotal")
        },
        cols: 6, emptyText: "No archived content found.",
        countLabel: n => n + (n === 1 ? " archived item" : " archived items"),
        match: (it, q) => (it.title + " " + it.excerpt + " " + it.category).toLowerCase().includes(q),
        filterFn: (it, f) => f === "all" || it.category === f,
        sorters: {
            newest: (a, b) => b.publish.localeCompare(a.publish),
            oldest: (a, b) => a.publish.localeCompare(b.publish),
            az: (a, b) => a.title.localeCompare(b.title),
            za: (a, b) => b.title.localeCompare(a.title)
        },
        row: it => `
            <tr data-id="${it.id}">
                <td><div class="archive-thumb">${it.image ? `<img src="${esc(it.image)}" alt="">` : `<i data-lucide="image" aria-hidden="true"></i>`}</div></td>
                <td class="archive-title-cell"><span class="archive-cell-ellipsis" title="${esc(it.title)}">${esc(it.title)}</span><span class="archive-cell-ellipsis archive-excerpt-line">${esc(it.excerpt)}</span></td>
                <td><span class="archive-category">${esc(it.category)}</span></td>
                <td>${esc(fmtDay(it.publish))}</td>
                <td>${esc(fmtDay(it.archived))}</td>
                <td><div class="archive-actions">
                    <button type="button" class="archive-action-btn" data-action="preview" title="Preview post" aria-label="Preview post"><i data-lucide="eye"></i></button>
                    <button type="button" class="archive-action-btn archive-action-restore" data-action="restore" title="Unarchive post" aria-label="Unarchive post"><i data-lucide="archive-restore"></i></button>
                    <button type="button" class="archive-action-btn archive-action-delete" data-action="delete" title="Delete permanently" aria-label="Delete permanently"><i data-lucide="trash-2"></i></button>
                </div></td>
            </tr>`,
        onAction: async (action, id) => {
            const it = items.find(x => x.id === id);
            if (!it) return;
            if (action === "preview") showPreview(it);
            if (action === "restore" && await confirmDelete("Restore this post?", it.title, "Yes, restore")) {
                items.splice(items.indexOf(it), 1);
                table.render(); toast("Post restored to the active list.");
            }
            if (action === "delete" && await confirmDelete("Delete permanently?", it.title)) {
                items.splice(items.indexOf(it), 1);
                table.render(); toast("Post permanently deleted.");
            }
        }
    });

    function showPreview(it) {
        $("previewTitle").textContent = it.title;
        $("previewExcerpt").textContent = it.excerpt;
        $("previewBody").textContent = it.content;
        const pi = $("previewImage"), pd = $("previewImagePlaceholder");
        if (it.image) { pi.src = it.image; pi.hidden = false; pd.hidden = true; }
        else { pi.removeAttribute("src"); pi.hidden = true; pd.hidden = false; }
        fillMeta(it);
        openModal(previewModal);
    }

    document.querySelectorAll("[data-close-preview]").forEach(b => b.addEventListener("click", () => closeModal(previewModal)));
    document.addEventListener("keydown", e => { if (e.key === "Escape" && previewModal.classList.contains("open")) closeModal(previewModal); });

    table.render();
    initMenu();
    icons();
})();