(function () {
    const {fillMeta, offsetDate, $, esc, thumb, statusClass, effectiveStatus, fmtDate, toast, openModal, closeModal, confirmDelete, imageField, list, icons, initMenu} = UCC;
    const day = 86400000;

    const items = [];
    const mk = (id, name, description, status, exp, ago) => items.push({id, name, description, image: "", status, expiryDate: exp === null ? null : offsetDate(exp), createdBy: "Admin", updatedBy: id % 2 ? "Admin" : "", createdAt: Date.now() - ago * day});
    mk(1, "About University of Caloocan City", "Learn about UCC, its history, mission, and commitment to quality education.", "Active", null, 12);
    mk(2, "Our History", "Discover the milestones and growth that shaped the university.", "Active", 90, 11);
    mk(3, "Mission and Vision", "Read the university's mission, vision, and guiding values.", "Hidden", null, 10);
    mk(4, "Our Community", "Meet the students, faculty, and community that make UCC unique.", "Active", null, 9);
    mk(5, "Academic Excellence", "An overview of UCC's academic offerings and learning environment.", "Hidden", null, 8);
    let nextId = 200, editingId = null;

    const formModal = $("postFormOverlay"), previewModal = $("postPreviewOverlay"), form = $("postForm");
    const img = imageField({fileInput: $("featuredImage"), chooseBtn: $("chooseImageBtn"), removeBtn: $("removeImageBtn"), preview: $("selectedImagePreview"), placeholder: $("uploadPlaceholder")});

    const table = list({
        items: () => items,
        tbody: $("postsTableBody"), search: $("aboutSearch"), filter: $("statusFilter"),
        more: $("showMoreBtn"), end: $("noMoreItems"), count: $("postCount"),
        cols: 5, emptyText: "No posts found.",
        countLabel: n => n + (n === 1 ? " post" : " posts"),
        match: (it, q) => (it.name + " " + it.description).toLowerCase().includes(q),
        filterFn: (it, f) => f === "all" || effectiveStatus(it) === f,
        defaultSort: (a, b) => a.id - b.id,
        row: it => `
            <tr data-id="${it.id}">
                <td>${thumb(it.image, "image")}</td>
                <td class="post-title-cell"><span class="cell-ellipsis" title="${esc(it.name)}">${esc(it.name)}</span></td>
                <td><span class="cell-ellipsis" title="${esc(it.description)}">${esc(it.description)}</span></td>
                <td><span class="status-badge ${statusClass(effectiveStatus(it))}">${esc(effectiveStatus(it))}</span></td>
                <td><div class="action-buttons">
                    <button type="button" class="action-btn" data-action="preview" title="Preview post" aria-label="Preview post"><i data-lucide="eye"></i></button>
                    <button type="button" class="action-btn edit" data-action="edit" title="Edit post" aria-label="Edit post"><i data-lucide="pencil"></i></button>
                    <button type="button" class="action-btn delete" data-action="delete" title="Delete post" aria-label="Delete post"><i data-lucide="trash-2"></i></button>
                </div></td>
            </tr>`,
        onAction: async (action, id) => {
            const it = items.find(x => x.id === id);
            if (!it) return;
            if (action === "preview") showPreview(it);
            if (action === "edit") openForm(it);
            if (action === "delete" && await confirmDelete("Delete this post?", it.name)) {
                items.splice(items.indexOf(it), 1);
                table.render(); toast("Post deleted.");
            }
        }
    });

    function openForm(it) {
        editingId = it ? it.id : null;
        $("formModalTitle").textContent = it ? "Edit Post" : "Add Post";
        $("savePostLabel").textContent = it ? "Save Changes" : "Save Post";
        $("postName").value = it ? it.name : "";
        $("postDescription").value = it ? it.description : "";
        $("postStatus").value = it ? it.status : "Active";
        $("expiryDate").value = it && it.expiryDate ? it.expiryDate : "";
        img.set(it ? it.image : "");
        openModal(formModal);
        $("postName").focus();
    }
    function closeForm() { closeModal(formModal); editingId = null; form.reset(); img.reset(); }

    function showPreview(it) {
        $("previewName").textContent = it.name || "Post name";
        $("previewDescription").textContent = it.description || "Post description will appear here.";
        const shown = effectiveStatus(it), badge = $("previewStatus");
        badge.textContent = shown; badge.className = "status-badge " + statusClass(shown);
        const pi = $("previewImage");
        if (it.image) { pi.src = it.image; pi.hidden = false; } else { pi.removeAttribute("src"); pi.hidden = true; }
        fillMeta(it);
        openModal(previewModal);
    }

    const readForm = () => ({name: $("postName").value.trim(), description: $("postDescription").value.trim(), status: $("postStatus").value, expiryDate: $("expiryDate").value || null, image: img.get()});

    $("addPostBtn").addEventListener("click", () => openForm(null));
    $("formPreviewBtn").addEventListener("click", () => {
        const existing = editingId !== null ? items.find(x => x.id === editingId) : null;
        showPreview({createdBy: existing ? existing.createdBy : "Admin", createdAt: existing ? existing.createdAt : Date.now(), updatedBy: existing ? existing.updatedBy : "", ...readForm()});
    });
    form.addEventListener("submit", e => {
        e.preventDefault();
        const data = readForm();
        if (!data.name || !data.description) return;
        if (editingId !== null) {
            Object.assign(items.find(x => x.id === editingId), data, {updatedBy: "Admin"});
            toast("Post updated.");
        } else {
            items.push({id: nextId++, createdBy: "Admin", updatedBy: "", createdAt: Date.now(), ...data});
            toast("Post added.");
        }
        table.reset(); closeForm();
    });
    document.querySelectorAll("[data-close-form]").forEach(b => b.addEventListener("click", closeForm));
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