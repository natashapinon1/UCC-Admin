(function () {
    const {fillMeta, offsetDate, $, esc, statusClass, effectiveStatus, mapsUrl, isUrl, fmtDate, toast, openModal, closeModal, confirmDelete, list, icons, initMenu} = UCC;
    const day = 86400000;

    const items = [];
    const mk = (id, name, email, number, category, status, exp, location, ago) => items.push({id, name, email, number, category, status, expiryDate: exp === null ? null : offsetDate(exp), location, createdBy: "Admin", updatedBy: id % 2 ? "Admin" : "", createdAt: Date.now() - ago * day});
    mk(1, "University Registrar", "registrar@ucc.edu.ph", "(02) 5310 1234", "Offices", "Active", null, "", 12);
    mk(2, "Admissions Office", "admissions@ucc.edu.ph", "(02) 5310 1235", "Offices", "Active", 60, "", 11);
    mk(3, "Public Information Office", "pio@ucc.edu.ph", "(02) 5310 1236", "Offices", "Active", null, "", 10);
    mk(4, "Student Affairs", "studentaffairs@ucc.edu.ph", "(02) 5310 1237", "Offices", "Hidden", null, "", 9);
    mk(5, "IT Services", "itservices@ucc.edu.ph", "(02) 5310 1238", "Offices", "Active", null, "", 8);

    // FIX: these were missing in the original file
    let nextId = 200, editingId = null;

    const formModal = $("contactFormModal"), previewModal = $("contactPreviewModal"), form = $("contactForm");

    function toggleLocation() { $("campusLocationField").style.display = $("contactCategory").value === "Campus" ? "" : "none"; }

    const table = list({
        items: () => items,
        tbody: $("contactTableBody"), search: $("contactSearch"), filter: $("statusFilter"),
        more: $("showMoreContacts"), end: $("contactEndMessage"), count: $("contactCountLabel"),
        cols: 6, emptyText: "No contacts found.",
        countLabel: n => n + (n === 1 ? " Contact" : " Contacts"),
        match: (it, q) => {
            const cat = $("categoryFilter").value;
            return (!cat || it.category === cat) && (it.name + " " + it.email + " " + it.number + " " + it.category).toLowerCase().includes(q);
        },
        filterFn: (it, f) => !f || effectiveStatus(it) === f,
        defaultSort: (a, b) => a.id - b.id,
        row: it => `
            <tr data-id="${it.id}">
                <td class="post-title-cell"><span class="cell-ellipsis" title="${esc(it.name)}">${esc(it.name)}</span></td>
                <td>${esc(it.email)}</td>
                <td>${esc(it.number)}</td>
                <td><span class="category-text">${esc(it.category)}</span></td>
                <td><span class="status-badge ${statusClass(effectiveStatus(it))}">${esc(effectiveStatus(it))}</span></td>
                <td><div class="action-buttons">
                    <button type="button" class="action-btn" data-action="preview" title="View contact" aria-label="View ${esc(it.name)}"><i data-lucide="eye"></i></button>
                    <button type="button" class="action-btn edit" data-action="edit" title="Edit contact" aria-label="Edit ${esc(it.name)}"><i data-lucide="pencil"></i></button>
                    <button type="button" class="action-btn delete" data-action="delete" title="Delete contact" aria-label="Delete ${esc(it.name)}"><i data-lucide="trash-2"></i></button>
                </div></td>
            </tr>`,
        onAction: async (action, id) => {
            const it = items.find(x => x.id === id);
            if (!it) return;
            if (action === "preview") showPreview(it);
            if (action === "edit") openForm(it);
            if (action === "delete" && await confirmDelete("Delete this contact?", it.name)) {
                items.splice(items.indexOf(it), 1);
                table.render(); toast("Contact deleted.");
            }
        }
    });
    $("categoryFilter").addEventListener("change", () => table.reset());

    function openForm(it) {
        editingId = it ? it.id : null;
        $("contactFormTitle").textContent = it ? "Edit Contact" : "Add Contact";
        $("saveContactLabel").textContent = it ? "Save Changes" : "Save Contact";
        $("contactCategory").value = it ? it.category : "Campus";
        $("contactStatus").value = it ? it.status : "Active";
        $("contactName").value = it ? it.name : "";
        $("contactEmail").value = it ? it.email : "";
        $("contactNumber").value = it ? it.number : "";
        $("expiryDate").value = it && it.expiryDate ? it.expiryDate : "";
        $("contactLocation").value = it ? it.location : "";
        toggleLocation();
        openModal(formModal);
        $("contactName").focus();
    }
    function closeForm() { closeModal(formModal); editingId = null; form.reset(); toggleLocation(); }

    function showPreview(it) {
        $("previewContactName").textContent = it.name || "Contact name";
        const shown = effectiveStatus(it);
        const badge = $("previewContactStatus");
        badge.textContent = shown; badge.className = "status-badge " + statusClass(shown);
        $("previewContactCategory").textContent = it.category;
        $("previewContactEmail").textContent = it.email || "—";
        $("previewContactNumber").textContent = it.number || "—";

        const section = $("previewLocationSection");
        if (it.category === "Campus" && it.location) {
            section.hidden = false;
            $("previewContactLocation").textContent = it.location;
            const link = isUrl(it.location) ? it.location : mapsUrl(it.location);
            $("previewContactMapLink").href = link;
            $("previewMapFrame").innerHTML = isUrl(it.location) ? "" :
                '<iframe title="Campus map" width="100%" height="220" style="border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=' + encodeURIComponent(it.location) + '&output=embed"></iframe>';
        } else {
            section.hidden = true;
            $("previewMapFrame").innerHTML = "";
        }
        fillMeta(it);
        openModal(previewModal);
    }

    const readForm = () => ({
        category: $("contactCategory").value, status: $("contactStatus").value, name: $("contactName").value.trim(),
        email: $("contactEmail").value.trim(), number: $("contactNumber").value.trim(),
        expiryDate: $("expiryDate").value || null, location: $("contactLocation").value.trim()
    });

    $("openContactForm").addEventListener("click", () => openForm(null));
    $("contactCategory").addEventListener("change", toggleLocation);
    $("previewContactBtn").addEventListener("click", () => {
        const existing = editingId !== null ? items.find(x => x.id === editingId) : null;
        showPreview({createdBy: existing ? existing.createdBy : "Admin", createdAt: existing ? existing.createdAt : Date.now(), updatedBy: existing ? existing.updatedBy : "", ...readForm()});
    });
    form.addEventListener("submit", e => {
        e.preventDefault();
        const data = readForm();
        if (!data.name || !data.email || !data.number) return;
        if (data.category !== "Campus") data.location = "";
        if (editingId !== null) {
            Object.assign(items.find(x => x.id === editingId), data, {updatedBy: "Admin"});
            toast("Contact updated.");
        } else {
            items.push({id: nextId++, createdBy: "Admin", updatedBy: "", createdAt: Date.now(), ...data});
            toast("Contact added.");
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

    toggleLocation();
    table.render();
    initMenu();
    icons();
})();