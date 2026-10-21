(function () {
    const $ = id => document.getElementById(id);
    const day = 86400000;

    const units = [
        {id:1, name:"College of Arts and Sciences", dean:"Dr. Maria Santos", logo:"", deanImage:"", status:"Active", createdBy:"Admin", updatedBy:"Admin", createdAt:Date.now() - 3 * day},
        {id:2, name:"College of Business and Accountancy", dean:"Dr. Roberto Cruz", logo:"", deanImage:"", status:"Active", createdBy:"Admin", updatedBy:"Admin", createdAt:Date.now() - 2 * day},
        {id:3, name:"College of Education", dean:"Dr. Elena Reyes", logo:"", deanImage:"", status:"Hidden", createdBy:"Admin", updatedBy:"Admin", createdAt:Date.now() - 1 * day}
    ];
    let nextId = 4, editingId = null, logoData = "", deanData = "", showingAll = false;
    const pageSize = 10;

    const tbody = $("unitsTableBody"), search = $("unitSearch"), statusFilter = $("unitStatusFilter"), sortSel = $("unitSort");
    const formModal = $("unitFormModal"), previewModal = $("unitPreviewModal"), form = $("unitForm");
    const logoFile = $("unitLogoFile"), deanFile = $("deanImageFile");

    const esc = v => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    const logoInitials = name => (name.trim().slice(0, 2) || "UN").toUpperCase();
    const deanInitials = name => (name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("") || "DN").toUpperCase();
    const fmtDate = ts => ts ? new Date(ts).toLocaleDateString("en-US", {year:"numeric", month:"short", day:"numeric"}) : "—";
    const icons = () => { if (window.lucide) lucide.createIcons(); };

    const statusClass = s => s === "Active" ? "status-published" : "status-hidden-unit";

    function toast(message) {
        const t = $("unitsToast"); t.textContent = message; t.classList.add("show");
        clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove("show"), 2400);
    }

    function render() {
        const q = search.value.trim().toLowerCase(), st = statusFilter.value, mode = sortSel.value;
        const list = units.filter(u => (u.name + " " + u.dean).toLowerCase().includes(q) && (st === "All" || u.status === st));
        list.sort((a, b) => {
            if (mode === "name-desc") return b.name.localeCompare(a.name);
            if (mode === "newest") return b.createdAt - a.createdAt;
            if (mode === "oldest") return a.createdAt - b.createdAt;
            return a.name.localeCompare(b.name);
        });
        const visible = showingAll ? list : list.slice(0, pageSize);

        tbody.innerHTML = visible.map(u => `
            <tr data-id="${u.id}">
                <td><div class="unit-logo">${u.logo ? `<img src="${u.logo}" alt="">` : esc(logoInitials(u.name))}</div></td>
                <td class="post-title-cell"><span class="cell-ellipsis unit-name" title="${esc(u.name)}">${esc(u.name)}</span></td>
                <td><div class="unit-dean"><span class="unit-dean-avatar">${u.deanImage ? `<img src="${u.deanImage}" alt="">` : esc(deanInitials(u.dean))}</span><span class="cell-ellipsis">${esc(u.dean)}</span></div></td>
                <td><span class="status-badge ${statusClass(u.status)}">${esc(u.status)}</span></td>
                <td><div class="action-buttons">
                    <button class="action-btn" data-action="preview" type="button" title="Preview unit" aria-label="Preview ${esc(u.name)}"><i data-lucide="eye"></i></button>
                    <button class="action-btn edit" data-action="edit" type="button" title="Edit unit" aria-label="Edit ${esc(u.name)}"><i data-lucide="pencil"></i></button>
                    <button class="action-btn archive" data-action="delete" type="button" title="Delete unit" aria-label="Delete ${esc(u.name)}"><i data-lucide="trash-2"></i></button>
                </div></td>
            </tr>`).join("");

        $("unitCount").textContent = list.length + (list.length === 1 ? " unit" : " units");
        $("unitsEmpty").hidden = list.length !== 0;
        $("unitsShowMore").hidden = list.length <= pageSize;
        $("unitsShowMore").textContent = showingAll ? "Show less" : "Show more";
        $("unitsEndMessage").hidden = !(list.length > pageSize && showingAll);
        icons();
    }

    function showImage(previewEl, placeholderEl, removeBtn, src) {
        if (src) {
            previewEl.src = src; previewEl.hidden = false; previewEl.style.display = "block";
            placeholderEl.hidden = true; placeholderEl.style.display = "none";
            removeBtn.hidden = false;
        } else {
            previewEl.removeAttribute("src"); previewEl.hidden = true; previewEl.style.display = "none";
            placeholderEl.hidden = false; placeholderEl.style.display = "flex";
            removeBtn.hidden = true;
        }
    }
    const setLogo = src => { logoData = src || ""; showImage($("unitLogoPreview"), $("unitLogoInitials"), $("removeUnitLogo"), logoData); };
    const setDean = src => { deanData = src || ""; showImage($("deanImagePreview"), $("deanImageInitials"), $("removeDeanImage"), deanData); };

    function readImage(input, setter) {
        const f = input.files && input.files[0]; if (!f) return;
        if (!f.type.startsWith("image/")) { toast("Please choose an image file."); input.value = ""; return; }
        const r = new FileReader(); r.onload = e => setter(e.target.result); r.readAsDataURL(f);
    }

    function openForm(unit) {
        editingId = unit ? unit.id : null;
        $("unitFormTitle").textContent = unit ? "Edit Unit" : "Add Unit";
        $("unitName").value = unit ? unit.name : "";
        $("unitDeanName").value = unit ? unit.dean : "";
        $("unitStatus").value = unit ? unit.status : "Active";
        setLogo(unit ? unit.logo : ""); setDean(unit ? unit.deanImage : "");
        formModal.classList.add("open"); formModal.setAttribute("aria-hidden", "false");
        icons(); $("unitName").focus();
    }
    function closeForm() {
        formModal.classList.remove("open"); formModal.setAttribute("aria-hidden", "true");
        editingId = null; form.reset(); logoFile.value = ""; deanFile.value = ""; setLogo(""); setDean("");
    }

    function openPreview(u) {
        $("previewUnitName").textContent = u.name || "Unit Name";
        const badge = $("previewUnitStatus");
        badge.textContent = u.status; badge.className = "status-badge " + statusClass(u.status);
        $("previewDeanName").textContent = u.dean || "Dean's Name";

        const logoImg = $("previewUnitLogo"), logoDefault = $("previewUnitLogoInitials");
        logoDefault.textContent = logoInitials(u.name || "");
        if (u.logo) { logoImg.src = u.logo; logoImg.hidden = false; logoDefault.hidden = true; }
        else { logoImg.removeAttribute("src"); logoImg.hidden = true; logoDefault.hidden = false; }

        const deanImg = $("previewDeanImage"), deanText = $("previewDeanInitials");
        deanText.textContent = deanInitials(u.dean || "");
        if (u.deanImage) { deanImg.src = u.deanImage; deanImg.style.display = "block"; deanText.style.display = "none"; }
        else { deanImg.removeAttribute("src"); deanImg.style.display = "none"; deanText.style.display = "flex"; }

        $("unitCreatedBy").textContent = u.createdBy || "Admin";
        $("unitDateCreated").textContent = fmtDate(u.createdAt);
        $("unitLastUpdatedBy").textContent = u.updatedBy || u.createdBy || "—";

        previewModal.classList.add("open"); previewModal.setAttribute("aria-hidden", "false"); icons();
    }
    function closePreview() { previewModal.classList.remove("open"); previewModal.setAttribute("aria-hidden", "true"); }

    async function deleteUnit(unit) {
        let confirmed;
        if (window.Swal) {
            const res = await Swal.fire({title:"Delete this unit?", text:unit.name, icon:"warning", showCancelButton:true, confirmButtonText:"Yes, delete", confirmButtonColor:"#b42318"});
            confirmed = res.isConfirmed;
        } else {
            confirmed = confirm("Delete \"" + unit.name + "\"?");
        }
        if (!confirmed) return;
        units.splice(units.findIndex(u => u.id === unit.id), 1);
        render(); toast("Unit deleted.");
    }

    $("addUnitBtn").addEventListener("click", () => openForm(null));
    search.addEventListener("input", () => { showingAll = false; render(); });
    statusFilter.addEventListener("change", () => { showingAll = false; render(); });
    sortSel.addEventListener("change", () => { showingAll = false; render(); });
    $("unitsShowMore").addEventListener("click", () => { showingAll = !showingAll; render(); });

    tbody.addEventListener("click", e => {
        const btn = e.target.closest("[data-action]"); if (!btn) return;
        const row = btn.closest("tr[data-id]"); if (!row) return;
        const unit = units.find(u => u.id === Number(row.dataset.id)); if (!unit) return;
        if (btn.dataset.action === "preview") openPreview(unit);
        if (btn.dataset.action === "edit") openForm(unit);
        if (btn.dataset.action === "delete") deleteUnit(unit);
    });
    document.querySelectorAll("[data-close-unit-form]").forEach(b => b.addEventListener("click", closeForm));
    document.querySelectorAll("[data-close-unit-preview]").forEach(b => b.addEventListener("click", closePreview));
    $("cancelUnitBtn").addEventListener("click", closeForm);

    $("chooseUnitLogoBtn").addEventListener("click", () => logoFile.click());
    $("chooseDeanImageBtn").addEventListener("click", () => deanFile.click());
    $("removeUnitLogo").addEventListener("click", () => { setLogo(""); logoFile.value = ""; });
    $("removeDeanImage").addEventListener("click", () => { setDean(""); deanFile.value = ""; });
    logoFile.addEventListener("change", () => readImage(logoFile, setLogo));
    deanFile.addEventListener("change", () => readImage(deanFile, setDean));

    $("previewUnitBtn").addEventListener("click", () => {
        const existing = editingId !== null ? units.find(u => u.id === editingId) : null;
        openPreview({
            name: $("unitName").value.trim(), dean: $("unitDeanName").value.trim(), status: $("unitStatus").value,
            logo: logoData, deanImage: deanData,
            createdBy: existing ? existing.createdBy : "Admin", createdAt: existing ? existing.createdAt : Date.now(),
            updatedBy: existing ? existing.updatedBy : "Admin"
        });
    });
    form.addEventListener("submit", e => {
        e.preventDefault();
        const data = {name: $("unitName").value.trim(), dean: $("unitDeanName").value.trim(), status: $("unitStatus").value, logo: logoData, deanImage: deanData};
        if (!data.name || !data.dean) return;
        if (editingId !== null) {
            const unit = units.find(u => u.id === editingId);
            if (unit) Object.assign(unit, data, {updatedBy: "Admin"});
            toast("Unit updated.");
        } else {
            units.push({id: nextId++, createdBy: "Admin", updatedBy: "Admin", createdAt: Date.now(), ...data});
            toast("Unit added.");
        }
        showingAll = false; render(); closeForm();
    });
    document.addEventListener("keydown", e => {
        if (e.key !== "Escape") return;
        if (previewModal.classList.contains("open")) closePreview();
        else if (formModal.classList.contains("open")) closeForm();
    });

    render();
})();
loadSharedLayout();
if (window.lucide) { lucide.createIcons(); }