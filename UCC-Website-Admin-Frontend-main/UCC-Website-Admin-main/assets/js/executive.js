(function () {
	const $ = id => document.getElementById(id);
	const day = 86400000;

	const officials = [
		{id:1, name:"Dr. Ricardo Dela Cruz", position:"University President", bio:"Leads the university's academic, administrative, and strategic direction.", order:1, status:"Active", photo:"", createdBy:"Admin", updatedBy:"Admin", createdAt:Date.now() - 9 * day},
		{id:2, name:"Dr. Elena Villanueva", position:"Vice President for Academic Affairs", bio:"Oversees curriculum, instruction, and academic quality across all colleges.", order:2, status:"Active", photo:"", createdBy:"Admin", updatedBy:"Admin", createdAt:Date.now() - 8 * day},
		{id:3, name:"Atty. Jose Ramirez", position:"Vice President for Administration and Finance", bio:"Manages university finances, human resources, and general administration.", order:3, status:"Active", photo:"", createdBy:"Admin", updatedBy:"Admin", createdAt:Date.now() - 7 * day},
		{id:4, name:"Dr. Carmen Reyes", position:"Vice President for Research and Extension", bio:"Directs research, innovation, and community extension programs.", order:4, status:"Active", photo:"", createdBy:"Admin", updatedBy:"Admin", createdAt:Date.now() - 6 * day},
		{id:5, name:"Mr. Antonio Lim", position:"University Registrar", bio:"", order:5, status:"Inactive", photo:"", createdBy:"Admin", updatedBy:"Admin", createdAt:Date.now() - 5 * day}
	];
	let nextId = 6, editingId = null, photoData = "", page = 1;
	const pageSize = 10;

	const tbody = $("officialsTableBody"), search = $("officialSearch"), statusFilter = $("officialStatusFilter"), orderFilter = $("officialOrderFilter");
	const formModal = $("officialModal"), previewModal = $("officialPreviewModal"), viewModal = $("viewModal"), form = $("officialForm"), photoFile = $("officialPhoto");

	const esc = v => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
	const initials = name => (name.trim().split(/\s+/).filter(w => /^[A-Za-z]/.test(w) && !/^(Dr|Atty|Mr|Mrs|Ms|Hon|Engr|Prof)\.?$/i.test(w)).slice(0, 2).map(w => w[0]).join("") || "OF").toUpperCase();
	const fmtDate = ts => ts ? new Date(ts).toLocaleDateString("en-US", {year:"numeric", month:"short", day:"numeric"}) : "—";
	const icons = () => { if (window.lucide) lucide.createIcons(); };

	const effectiveStatus = o => o.status === "Inactive" ? "Hidden" : o.status;
	const statusClass = s => s === "Active" ? "status-published" : "status-hidden-person";

	function toast(message) {
		const t = $("officialToast"); t.textContent = message; t.classList.add("show");
		clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove("show"), 2400);
	}

	function render() {
		const q = search.value.trim().toLowerCase(), st = statusFilter.value, mode = orderFilter.value;
		const list = officials.filter(o => {
			const eff = effectiveStatus(o).toLowerCase();
			const stKey = eff === "hidden" ? "inactive" : eff;
			return (o.name + " " + o.position + " " + o.bio).toLowerCase().includes(q) && (st === "all" || stKey === st);
		});
		list.sort((a, b) => {
			if (mode === "descending") return b.order - a.order;
			if (mode === "name") return a.name.localeCompare(b.name);
			return a.order - b.order;
		});
		const pages = Math.max(1, Math.ceil(list.length / pageSize));
		if (page > pages) page = pages;
		const visible = list.slice((page - 1) * pageSize, page * pageSize);

		tbody.innerHTML = visible.map(o => `
			<tr data-id="${o.id}">
				<td><div class="person-thumb">${o.photo ? `<img src="${o.photo}" alt="">` : esc(initials(o.name))}</div></td>
				<td class="post-title-cell"><span class="cell-ellipsis person-name" title="${esc(o.name)}">${esc(o.name)}</span></td>
				<td><span class="cell-ellipsis" title="${esc(o.position)}">${esc(o.position)}</span></td>
				<td><span class="cell-ellipsis">${o.order}</span></td>
				<td><span class="status-badge ${statusClass(effectiveStatus(o))}">${esc(effectiveStatus(o))}</span></td>
				<td><div class="action-buttons">
					<button class="action-btn" data-action="view" type="button" title="View details" aria-label="View ${esc(o.name)}"><i data-lucide="eye"></i></button>
					<button class="action-btn edit" data-action="edit" type="button" title="Edit official" aria-label="Edit ${esc(o.name)}"><i data-lucide="pencil"></i></button>
					<button class="action-btn archive" data-action="delete" type="button" title="Delete official" aria-label="Delete ${esc(o.name)}"><i data-lucide="trash-2"></i></button>
				</div></td>
			</tr>`).join("");

		$("tableOfficialCount").textContent = list.length + (list.length === 1 ? " official" : " officials");
		$("emptyState").hidden = list.length !== 0;

		const pag = $("officialsPagination");
		pag.innerHTML = pages > 1 ? Array.from({length: pages}, (_, i) => `<button type="button" class="post-btn ${i + 1 === page ? "post-btn-primary" : "post-btn-ghost"}" data-page="${i + 1}">${i + 1}</button>`).join("") : "";
		$("officialsEndMessage").hidden = !(pages > 1 && page === pages);
		icons();
	}
	function resetAndRender() { page = 1; render(); }

	function setPhoto(src) {
		photoData = src || "";
		const prev = $("officialUploadImage"), ph = $("officialUploadInitials"), rm = $("removeOfficialPhoto");
		if (src) {
			prev.src = src; prev.hidden = false; prev.style.display = "block";
			ph.hidden = true; ph.style.display = "none"; rm.hidden = false;
		} else {
			prev.removeAttribute("src"); prev.hidden = true; prev.style.display = "none";
			ph.hidden = false; ph.style.display = "flex"; rm.hidden = true;
		}
	}
	function readPhoto() {
		const f = photoFile.files && photoFile.files[0]; if (!f) return;
		if (!f.type.startsWith("image/")) { toast("Please choose an image file."); photoFile.value = ""; return; }
		const r = new FileReader(); r.onload = e => setPhoto(e.target.result); r.readAsDataURL(f);
	}

	function openForm(o) {
		editingId = o ? o.id : null;
		$("modalTitle").textContent = o ? "Edit Official" : "Add Official";
		$("name").value = o ? o.name : "";
		$("position").value = o ? o.position : "";
		$("bio").value = o ? o.bio : "";
		$("displayOrder").value = o ? o.order : (officials.reduce((m, x) => Math.max(m, x.order), 0) + 1);
		$("status").value = o ? o.status : "Active";
		setPhoto(o ? o.photo : "");
		formModal.classList.add("open"); formModal.setAttribute("aria-hidden", "false");
		icons(); $("name").focus();
	}
	function closeForm() {
		formModal.classList.remove("open"); formModal.setAttribute("aria-hidden", "true");
		editingId = null; form.reset(); photoFile.value = ""; setPhoto("");
	}

	function fillModal(ids, o) {
		$(ids.name).textContent = o.name || "Official Name";
		$(ids.position).textContent = o.position || "";
		const shown = effectiveStatus(o), badge = $(ids.status);
		badge.textContent = shown; badge.className = "status-badge " + statusClass(shown);
		$(ids.bio).textContent = o.bio || "No biography provided.";
		$(ids.order).textContent = "Display order: " + (o.order || "—");

		const img = $(ids.image), ini = $(ids.initials);
		ini.textContent = initials(o.name || "");
		if (o.photo) { img.src = o.photo; img.hidden = false; ini.hidden = true; }
		else { img.removeAttribute("src"); img.hidden = true; ini.hidden = false; }

		$(ids.created).textContent = o.createdBy || "Admin";
		$(ids.date).textContent = fmtDate(o.createdAt);
		$(ids.updated).textContent = o.updatedBy || o.createdBy || "—";
	}
	const previewIds = {name:"officialPreviewName", position:"officialPreviewPosition", status:"officialPreviewStatus", bio:"officialPreviewBio", order:"officialPreviewOrder", image:"officialPreviewImage", initials:"officialPreviewInitials", created:"previewMetadataCreatedBy", date:"previewMetadataDateCreated", updated:"previewMetadataLastUpdatedBy"};
	const viewIds = {name:"viewName", position:"viewPosition", status:"viewStatus", bio:"viewBio", order:"viewOrder", image:"viewImage", initials:"viewInitials", created:"viewMetadataCreatedBy", date:"viewMetadataDateCreated", updated:"viewMetadataLastUpdatedBy"};

	function openModal(modal, ids, o) {
		fillModal(ids, o);
		modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); icons();
	}
	function closeModal(modal) { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); }

	async function deleteOfficial(o) {
		let confirmed;
		if (window.Swal) {
			const res = await Swal.fire({title:"Delete this official?", text:o.name, icon:"warning", showCancelButton:true, confirmButtonText:"Yes, delete", confirmButtonColor:"#b42318"});
			confirmed = res.isConfirmed;
		} else {
			confirmed = confirm("Delete \"" + o.name + "\"?");
		}
		if (!confirmed) return;
		officials.splice(officials.findIndex(x => x.id === o.id), 1);
		render(); toast("Official deleted.");
	}

	$("addOfficialBtn").addEventListener("click", () => openForm(null));
	search.addEventListener("input", resetAndRender);
	[statusFilter, orderFilter].forEach(el => el.addEventListener("change", resetAndRender));
	$("officialsPagination").addEventListener("click", e => {
		const b = e.target.closest("[data-page]"); if (!b) return;
		page = Number(b.dataset.page); render();
	});

	tbody.addEventListener("click", e => {
		const btn = e.target.closest("[data-action]"); if (!btn) return;
		const row = btn.closest("tr[data-id]"); if (!row) return;
		const o = officials.find(x => x.id === Number(row.dataset.id)); if (!o) return;
		if (btn.dataset.action === "view") openModal(viewModal, viewIds, o);
		if (btn.dataset.action === "edit") openForm(o);
		if (btn.dataset.action === "delete") deleteOfficial(o);
	});

	document.querySelectorAll("[data-close-modal]").forEach(b => b.addEventListener("click", closeForm));
	document.querySelectorAll("[data-close-preview]").forEach(b => b.addEventListener("click", () => closeModal(previewModal)));
	document.querySelectorAll("[data-close-view]").forEach(b => b.addEventListener("click", () => closeModal(viewModal)));

	$("chooseOfficialPhotoBtn").addEventListener("click", () => photoFile.click());
	$("removeOfficialPhoto").addEventListener("click", () => { setPhoto(""); photoFile.value = ""; });
	photoFile.addEventListener("change", readPhoto);

	$("previewOfficialFormBtn").addEventListener("click", () => {
		const existing = editingId !== null ? officials.find(x => x.id === editingId) : null;
		openModal(previewModal, previewIds, {
			name: $("name").value.trim(), position: $("position").value.trim(), bio: $("bio").value.trim(),
			order: Number($("displayOrder").value) || 1, status: $("status").value, photo: photoData,
			createdBy: existing ? existing.createdBy : "Admin", createdAt: existing ? existing.createdAt : Date.now(),
			updatedBy: existing ? existing.updatedBy : "Admin"
		});
	});

	form.addEventListener("submit", e => {
		e.preventDefault();
		const data = {
			name: $("name").value.trim(), position: $("position").value.trim(), bio: $("bio").value.trim(),
			order: Number($("displayOrder").value) || 1, status: $("status").value, photo: photoData
		};
		if (!data.name || !data.position) return;
		if (editingId !== null) {
			const o = officials.find(x => x.id === editingId);
			if (o) Object.assign(o, data, {updatedBy: "Admin"});
			toast("Official updated.");
		} else {
			officials.push({id: nextId++, createdBy: "Admin", updatedBy: "Admin", createdAt: Date.now(), ...data});
			toast("Official added.");
		}
		resetAndRender(); closeForm();
	});

	document.addEventListener("keydown", e => {
		if (e.key !== "Escape") return;
		if (previewModal.classList.contains("open")) closeModal(previewModal);
		else if (viewModal.classList.contains("open")) closeModal(viewModal);
		else if (formModal.classList.contains("open")) closeForm();
	});

	render();
})();

loadSharedLayout();
if (window.lucide) { lucide.createIcons(); }