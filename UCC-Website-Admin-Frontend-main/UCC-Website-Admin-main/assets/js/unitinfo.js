(function () {
	const $ = id => document.getElementById(id);
	const day = 86400000;

	const records = [
		{id:1, unit:"College of Arts and Sciences", mission:"To provide liberal arts and sciences education that develops critical thinkers and responsible citizens.", vision:"A leading college known for academic excellence and social engagement.", description:"The College of Arts and Sciences offers programs in the humanities, social sciences, and natural sciences.", status:"Active", createdBy:"Admin", updatedBy:"Admin", createdAt:Date.now() - 6 * day},
		{id:2, unit:"College of Business and Accountancy", mission:"To develop ethical business leaders and accountants ready for professional practice.", vision:"A center of excellence in business and accountancy education in the region.", description:"The college offers programs in accountancy, business administration, and entrepreneurship.", status:"Active", createdBy:"Admin", updatedBy:"Admin", createdAt:Date.now() - 5 * day},
		{id:3, unit:"College of Education", mission:"To prepare dedicated teachers who nurture learners with competence and compassion.", vision:"A premier teacher education institution committed to quality and service.", description:"The college trains future educators in elementary, secondary, and special education.", status:"Active", createdBy:"Admin", updatedBy:"Admin", createdAt:Date.now() - 4 * day},
		{id:4, unit:"Office of Student Affairs", mission:"To support student development through programs, services, and organizations.", vision:"A student-centered office that fosters leadership and well-being.", description:"The office coordinates student activities, organizations, scholarships, and welfare services.", status:"Hidden", createdBy:"Admin", updatedBy:"Admin", createdAt:Date.now() - 3 * day}
	];
	let nextId = 5, editingId = null, showingAll = false;
	const pageSize = 10;

	const tbody = $("unitInfoTableBody"), search = $("unitInfoSearch"), unitFilter = $("unitInfoUnitFilter"), statusFilter = $("unitInfoStatusFilter"), sortSel = $("unitInfoSort");
	const formModal = $("unitInfoFormModal"), previewModal = $("unitInfoPreviewModal"), form = $("unitInfoForm");

	const esc = v => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
	const fmtDate = ts => ts ? new Date(ts).toLocaleDateString("en-US", {year:"numeric", month:"short", day:"numeric"}) : "—";
	const icons = () => { if (window.lucide) lucide.createIcons(); };

	const statusClass = s => s === "Active" ? "status-published" : "status-hidden-unitinfo";

	function toast(message) {
		const t = $("unitInfoToast"); t.textContent = message; t.classList.add("show");
		clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove("show"), 2400);
	}

	function render() {
		const q = search.value.trim().toLowerCase(), un = unitFilter.value, st = statusFilter.value, mode = sortSel.value;
		const list = records.filter(r =>
			(r.unit + " " + r.mission + " " + r.vision + " " + r.description).toLowerCase().includes(q) &&
			(un === "All" || r.unit === un) &&
			(st === "All" || r.status === st)
		);
		list.sort((a, b) => {
			if (mode === "name-desc") return b.unit.localeCompare(a.unit);
			if (mode === "newest") return b.createdAt - a.createdAt;
			if (mode === "oldest") return a.createdAt - b.createdAt;
			return a.unit.localeCompare(b.unit);
		});
		const visible = showingAll ? list : list.slice(0, pageSize);

		tbody.innerHTML = visible.map(r => `
			<tr data-id="${r.id}">
				<td class="post-title-cell"><span class="cell-ellipsis unitinfo-unit-name" title="${esc(r.unit)}">${esc(r.unit)}</span></td>
				<td><span class="unitinfo-excerpt" title="${esc(r.mission)}">${esc(r.mission)}</span></td>
				<td><span class="unitinfo-excerpt" title="${esc(r.vision)}">${esc(r.vision)}</span></td>
				<td><span class="unitinfo-excerpt" title="${esc(r.description)}">${esc(r.description)}</span></td>
				<td><span class="status-badge ${statusClass(r.status)}">${esc(r.status)}</span></td>
				<td><div class="action-buttons">
					<button class="action-btn" data-action="preview" type="button" title="Preview" aria-label="Preview ${esc(r.unit)}"><i data-lucide="eye"></i></button>
					<button class="action-btn edit" data-action="edit" type="button" title="Edit" aria-label="Edit ${esc(r.unit)}"><i data-lucide="pencil"></i></button>
					<button class="action-btn archive" data-action="delete" type="button" title="Delete" aria-label="Delete ${esc(r.unit)}"><i data-lucide="trash-2"></i></button>
				</div></td>
			</tr>`).join("");

		$("unitInfoCount").textContent = list.length + (list.length === 1 ? " record" : " records");
		$("unitInfoEmpty").hidden = list.length !== 0;
		$("unitInfoShowMore").hidden = list.length <= pageSize;
		$("unitInfoShowMore").textContent = showingAll ? "Show less" : "Show more";
		$("unitInfoEndMessage").hidden = !(list.length > pageSize && showingAll);
		icons();
	}

	function openForm(r) {
		editingId = r ? r.id : null;
		$("unitInfoFormTitle").textContent = r ? "Edit Unit Information" : "Add Unit Information";
		$("unitInfoUnit").value = r ? r.unit : "";
		$("unitInfoMission").value = r ? r.mission : "";
		$("unitInfoVision").value = r ? r.vision : "";
		$("unitInfoDescription").value = r ? r.description : "";
		$("unitInfoStatus").value = r ? r.status : "Active";
		formModal.classList.add("open"); formModal.setAttribute("aria-hidden", "false");
		icons(); $("unitInfoUnit").focus();
	}
	function closeForm() {
		formModal.classList.remove("open"); formModal.setAttribute("aria-hidden", "true");
		editingId = null; form.reset();
	}

	function openPreview(r) {
		$("previewUnitInfoUnit").textContent = r.unit || "Unit name";
		const shown = r.status, badge = $("previewUnitInfoStatus");
		badge.textContent = shown; badge.className = "status-badge " + statusClass(shown);
		$("previewUnitInfoMission").textContent = r.mission || "";
		$("previewUnitInfoVision").textContent = r.vision || "";
		$("previewUnitInfoDescription").textContent = r.description || "";
		$("unitInfoCreatedBy").textContent = r.createdBy || "Admin";
		$("unitInfoDateCreated").textContent = fmtDate(r.createdAt);
		$("unitInfoLastUpdatedBy").textContent = r.updatedBy || r.createdBy || "—";
		previewModal.classList.add("open"); previewModal.setAttribute("aria-hidden", "false"); icons();
	}
	function closePreview() { previewModal.classList.remove("open"); previewModal.setAttribute("aria-hidden", "true"); }

	async function deleteRecord(r) {
		let confirmed;
		if (window.Swal) {
			const res = await Swal.fire({title:"Delete this record?", text:r.unit, icon:"warning", showCancelButton:true, confirmButtonText:"Yes, delete", confirmButtonColor:"#b42318"});
			confirmed = res.isConfirmed;
		} else {
			confirmed = confirm("Delete \"" + r.unit + "\"?");
		}
		if (!confirmed) return;
		records.splice(records.findIndex(x => x.id === r.id), 1);
		render(); toast("Record deleted.");
	}

	$("addUnitInfoBtn").addEventListener("click", () => openForm(null));
	search.addEventListener("input", () => { showingAll = false; render(); });
	[unitFilter, statusFilter, sortSel].forEach(el => el.addEventListener("change", () => { showingAll = false; render(); }));
	$("unitInfoShowMore").addEventListener("click", () => { showingAll = !showingAll; render(); });

	tbody.addEventListener("click", e => {
		const btn = e.target.closest("[data-action]"); if (!btn) return;
		const row = btn.closest("tr[data-id]"); if (!row) return;
		const r = records.find(x => x.id === Number(row.dataset.id)); if (!r) return;
		if (btn.dataset.action === "preview") openPreview(r);
		if (btn.dataset.action === "edit") openForm(r);
		if (btn.dataset.action === "delete") deleteRecord(r);
	});

	document.querySelectorAll("[data-close-unit-info-form]").forEach(b => b.addEventListener("click", closeForm));
	document.querySelectorAll("[data-close-unit-info-preview]").forEach(b => b.addEventListener("click", closePreview));
	$("cancelUnitInfoBtn").addEventListener("click", closeForm);

	$("previewUnitInfoBtn").addEventListener("click", () => {
		const existing = editingId !== null ? records.find(x => x.id === editingId) : null;
		openPreview({
			unit: $("unitInfoUnit").value, mission: $("unitInfoMission").value.trim(),
			vision: $("unitInfoVision").value.trim(), description: $("unitInfoDescription").value.trim(),
			status: $("unitInfoStatus").value,
			createdBy: existing ? existing.createdBy : "Admin", createdAt: existing ? existing.createdAt : Date.now(),
			updatedBy: existing ? existing.updatedBy : "Admin"
		});
	});

	form.addEventListener("submit", e => {
		e.preventDefault();
		const data = {
			unit: $("unitInfoUnit").value, mission: $("unitInfoMission").value.trim(),
			vision: $("unitInfoVision").value.trim(), description: $("unitInfoDescription").value.trim(),
			status: $("unitInfoStatus").value
		};
		if (!data.unit || !data.mission || !data.vision || !data.description) return;
		if (editingId !== null) {
			const r = records.find(x => x.id === editingId);
			if (r) Object.assign(r, data, {updatedBy: "Admin"});
			toast("Information updated.");
		} else {
			records.push({id: nextId++, createdBy: "Admin", updatedBy: "Admin", createdAt: Date.now(), ...data});
			toast("Information added.");
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