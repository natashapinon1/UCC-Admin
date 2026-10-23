(function () {
    const {$, esc, thumb, fmtDay, fmtDate, todayStr, toast, openModal, closeModal, confirmDelete, imageField, list, icons, initMenu} = UCC;

    const effectiveStatus = it => (it.status === "Published" && it.expiryDate && it.expiryDate < todayStr()) ? "Expired" : it.status;

    const off = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
    const day = 86400000;
    const mk = (id, title, category, status, pub, exp, ago) => ({
        id, title, category, status, publishDate: off(pub), expiryDate: exp === null ? null : off(exp),
        excerpt: "Short summary for: " + title + ".",
        content: "Full content for \"" + title + "\". This is sample text so you can test the preview, edit and archive features.",
        image: "", createdBy: "Admin", updatedBy: id % 2 ? "Admin" : "", createdAt: Date.now() - ago * day
    });
    const items = [
        mk(1, "UCC Opens Applications for the New Academic Year", "Admission", "Published", -10, 60, 12),
        mk(2, "University Community Celebrates Founding Anniversary", "News", "Published", -20, null, 11),
        mk(3, "Enrollment Schedule for Second Semester", "Announcement", "Published", -5, 30, 10),
        mk(4, "Student Leaders Join Leadership Summit", "Student Life", "Published", -8, null, 9),
        mk(5, "Community Outreach Program in Caloocan", "Community Extension Services", "Published", -15, null, 8),
    ];
    let nextId = 13, editingId = null;

    const statusCls = s => ({Published: "status-published", Draft: "status-draft", Pending: "status-pending", Archived: "status-archived", Expired: "status-expired"}[s] || "status-draft");
    const formModal = $("postModal"), previewModal = $("postPreviewModal"), form = $("postForm");
    const img = imageField({fileInput: $("featuredImage"), chooseBtn: $("uploadImageBtn"), removeBtn: $("removeImageBtn"), preview: $("imagePreview"), placeholder: $("uploadPlaceholder")});

    const table = list({
         items: () => items,
        tbody: $("postsTableBody"), search: $("postSearch"), filter: $("postFilter"), sort: $("postSort"),
        count: $("postsCount"),
        pageSize: 10,
        pager: {
            nav: $("postsPagination"), prev: $("prevPageBtn"), next: $("nextPageBtn"),
            numbers: $("pageNumbers"), total: $("pageTotal")
        },
        cols: 7, emptyText: "No posts found.",
        countLabel: n => n + (n === 1 ? " post" : " posts"),
        match: (it, q) => (it.title + " " + it.category + " " + it.excerpt).toLowerCase().includes(q),
        filterFn: (it, f) => f === "All" || effectiveStatus(it) === f,
        sorters: {
            "created-desc": (a, b) => b.createdAt - a.createdAt,
            "created-asc": (a, b) => a.createdAt - b.createdAt,
            "date-desc": (a, b) => b.publishDate.localeCompare(a.publishDate),
            "date-asc": (a, b) => a.publishDate.localeCompare(b.publishDate),
            "expiry-asc": (a, b) => (a.expiryDate || "9999-12-31").localeCompare(b.expiryDate || "9999-12-31"),
            "expiry-desc": (a, b) => (b.expiryDate || "0000-01-01").localeCompare(a.expiryDate || "0000-01-01"),
            "title-asc": (a, b) => a.title.localeCompare(b.title),
            "title-desc": (a, b) => b.title.localeCompare(a.title)
        },
        row: it => {
            const st = effectiveStatus(it);
            return `
            <tr data-id="${it.id}">
                <td>${thumb(it.image, "image")}</td>
                <td class="post-title-cell"><span class="cell-ellipsis" title="${esc(it.title)}">${esc(it.title)}</span></td>
                <td><span class="cell-ellipsis category-text">${esc(it.category)}</span></td>
                <td><span class="cell-ellipsis">${esc(fmtDay(it.publishDate))}</span></td>
                <td><span class="cell-ellipsis">${it.expiryDate ? esc(fmtDay(it.expiryDate)) : "No expiry"}</span></td>
                <td><span class="status-badge ${statusCls(st)}">${esc(st)}</span></td>
                <td><div class="action-buttons">
                    <button class="action-btn" data-action="preview" type="button" title="Preview post" aria-label="Preview post"><i data-lucide="eye"></i></button>
                    <button class="action-btn edit" data-action="edit" type="button" title="Edit post" aria-label="Edit post"><i data-lucide="pencil"></i></button>
                    ${it.status === "Archived" ? "" : '<button class="action-btn archive" data-action="archive" type="button" title="Archive post" aria-label="Archive post"><i data-lucide="archive"></i></button>'}
                </div></td>
            </tr>`;
        },
        onAction: async (action, id) => {
            const it = items.find(x => x.id === id);
            if (!it) return;
            if (action === "preview") showPreview(it);
            if (action === "edit") openForm(it);
            if (action === "archive" && await confirmDelete("Archive this post?", it.title, "Yes, archive")) {
                it.status = "Archived"; it.updatedBy = "Admin";
                table.render(); toast("Post archived.");
            }
        }
    });

    function openForm(it) {
        editingId = it ? it.id : null;
        $("postFormTitle").textContent = it ? "Edit Post" : "Add New Post";
        $("postFormDescription").textContent = it ? "Update this post." : "Create a post for the university website.";
        const sel = $("postStatus");
        if (it && ![...sel.options].some(o => o.value === it.status)) sel.add(new Option(it.status, it.status));
        $("postTitle").value = it ? it.title : "";
        $("postExcerpt").value = it ? it.excerpt : "";
        $("postCategory").value = it ? it.category : "News";
        sel.value = it ? it.status : "Draft";
        $("postDate").value = it ? it.publishDate : todayStr();
        $("postExpiryDate").value = it && it.expiryDate ? it.expiryDate : "";
        $("postContent").value = it ? it.content : "";
        img.set(it ? it.image : "");
        openModal(formModal);
        $("postTitle").focus();
    }
    function closeForm() { closeModal(formModal); editingId = null; form.reset(); img.reset(); }

    function showPreview(it) {
        $("previewTitle").textContent = it.title || "Post title";
        $("previewExcerpt").textContent = it.excerpt || "";
        $("previewContent").textContent = it.content || "";
        const pi = $("previewImage"), pd = document.querySelector("#previewImageWrap .preview-default-image");
        if (it.image) { pi.src = it.image; pi.hidden = false; pd.hidden = true; }
        else { pi.removeAttribute("src"); pi.hidden = true; pd.hidden = false; }
        $("previewMetadataCreatedBy").textContent = it.createdBy || "—";
        $("previewMetadataDateCreated").textContent = fmtDate(it.createdAt);
        $("previewMetadataLastUpdatedBy").textContent = it.updatedBy || "—";
        $("previewMetadataExpiry").textContent = it.expiryDate ? fmtDay(it.expiryDate) : "No expiry";
        openModal(previewModal);
    }

    const readForm = () => ({
        title: $("postTitle").value.trim(), excerpt: $("postExcerpt").value.trim(), category: $("postCategory").value,
        status: $("postStatus").value, publishDate: $("postDate").value || todayStr(), expiryDate: $("postExpiryDate").value || null,
        content: $("postContent").value.trim(), image: img.get()
    });

    $("addPostBtn").addEventListener("click", () => openForm(null));
    $("formPreviewBtn").addEventListener("click", () => {
        const existing = editingId !== null ? items.find(x => x.id === editingId) : null;
        showPreview({createdBy: existing ? existing.createdBy : "Admin", createdAt: existing ? existing.createdAt : Date.now(), updatedBy: existing ? existing.updatedBy : "", ...readForm()});
    });
    form.addEventListener("submit", e => {
        e.preventDefault();
        const data = readForm();
        if (!data.title || !data.excerpt || !data.content) return;
        if (editingId !== null) {
            Object.assign(items.find(x => x.id === editingId), data, {updatedBy: "Admin"});
            toast("Post updated.");
        } else {
            items.push({id: nextId++, createdBy: "Admin", updatedBy: "", createdAt: Date.now(), ...data});
            toast("Post added.");
        }
        table.reset(); closeForm();
    });
    document.querySelectorAll("[data-close-modal]").forEach(b => b.addEventListener("click", closeForm));
    document.querySelectorAll("[data-close-preview]").forEach(b => b.addEventListener("click", () => closeModal(previewModal)));
    document.addEventListener("keydown", e => {
        if (e.key !== "Escape") return;
        if (previewModal.classList.contains("open")) closeModal(previewModal);
        else if (formModal.classList.contains("open")) closeForm();
    });

    table.render();
    initMenu();
    icons();
})();