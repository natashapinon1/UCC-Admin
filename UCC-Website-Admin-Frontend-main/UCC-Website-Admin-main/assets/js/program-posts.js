(function () {
	const $ = id => document.getElementById(id);
	const day = 86400000;
	const dayStr = offset => { const d = new Date(Date.now() + offset * day); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
	const PROGRAMS = {
		BSIT: "Bachelor of Science in Information Technology",
		BSCS: "Bachelor of Science in Computer Science",
		BSA: "Bachelor of Science in Accountancy",
		BSED: "Bachelor of Secondary Education",
		BSHM: "Bachelor of Science in Hospitality Management"
	};

	const items = [
		{id:1, title:"BSIT Students Showcase Capstone Projects", excerpt:"Graduating BSIT students presented their capstone systems to faculty and industry guests.", program:"BSIT", image:"", publishDate:dayStr(-6), status:"Published", createdBy:"Admin", updatedBy:"Admin", createdAt:Date.now() - 7 * day},
		{id:2, title:"BSCS Hosts Programming Contest", excerpt:"The annual inter-year programming contest challenged students with algorithm and problem-solving tasks.", program:"BSCS", image:"", publishDate:dayStr(-4), status:"Published", createdBy:"Admin", updatedBy:"Admin", createdAt:Date.now() - 5 * day},
		{id:3, title:"Accountancy Review Program Opens", excerpt:"A free review program for incoming board examinees will start next month.", program:"BSA", image:"", publishDate:dayStr(5), status:"Draft", createdBy:"Admin", updatedBy:"Admin", createdAt:Date.now() - 3 * day},
		{id:4, title:"BSED Practicum Orientation", excerpt:"Orientation for students about to begin their practicum in partner schools.", program:"BSED", image:"", publishDate:dayStr(-20), status:"Archived", createdBy:"Admin", updatedBy:"Admin", createdAt:Date.now() - 20 * day}
	];
	let nextId = 5, editingId = null, imageData = "", visibleCount = 10;
	const pageSize = 10;

	const tbody = $("pnTableBody"), search = $("pnSearch"), programFilter = $("programFilter"), statusFilter = $("pnStatusFilter"), sortSel = $("pnSort");
	const formModal = $("pnFormModal"), previewModal = $("pnPreviewModal"), form = $("pnForm"), imageFile = $("pnImageFile");

	const esc = v => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
	const fmtDate = ts => ts ? new Date(ts).toLocaleDateString("en-US", {year:"numeric", month:"short", day:"numeric"}) : "—";
	const fmtDay = d => d ? new Date(d + "T00:00:00").toLocaleDateString("en-US", {year:"numeric", month:"short", day:"numeric"}) : "—";
	const icons = () => { if (window.lucide) lucide.createIcons(); };

	const statusClass = s => ({Published:"status-published", Draft:"status-draft-pn", Archived:"status-archived-pn"}[s] || "status-draft-pn");

	function toast(message) {
		const t = $("pnToast"); t.textContent = message; t.classList.add("show");
		clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove("show"), 2400);
	}

	function render() {
		const q = search.value.trim().toLowerCase(), pr = programFilter.value, st = statusFilter.value, mode = sortSel.value;
		const list = items.filter(n =>
			(n.title + " " + n.excerpt + " " + n.program + " " + (PROGRAMS[n.program] || "")).toLowerCase().includes(q) &&
			(pr === "All" || n.program === pr) &&
			(st === "All" || n.status === st)
		);
		list.sort((a, b) => {
			if (mode === "oldest") return a.createdAt - b.createdAt;
			if (mode === "title") return a.title.localeCompare(b.title);
			return b.createdAt - a.createdAt;
		});
		const visible = list.slice(0, visibleCount);

		tbody.innerHTML = visible.map(n => `
			<tr data-id="${n.id}">
				<td><div class="featured-thumb">${n.image ? `<img src="${n.image}" alt="">` : `<i data-lucide="image" aria-hidden="true"></i>`}</div></td>
				<td class="post-title-cell"><span class="pn-title" title="${esc(n.title)}">${esc(n.title)}</span><span class="pn-excerpt" title="${esc(n.excerpt)}">${esc(n.excerpt)}</span></td>
				<td><span class="cell-ellipsis" title="${esc(PROGRAMS[n.program] || n.program)}">${esc(n.program)}</span></td>
				<td><span class="cell-ellipsis">${esc(fmtDay(n.publishDate))}</span></td>
				<td><span class="status-badge ${statusClass(n.status)}">${esc(n.status)}</span></td>
				<td><div class="action-buttons">
					<button class="action-btn" data-action="preview" type="button" title="Preview" aria-label="Preview ${esc(n.title)}"><i data-lucide="eye"></i></button>
					<button class="action-btn edit" data-action="edit" type="button" title="Edit" aria-label="Edit ${esc(n.title)}"><i data-lucide="pencil"></i></button>
					<button class="action-btn archive" data-action="archive" type="button" title="${n.status === "Archived" ? "Restore" : "Archive"}" aria-label="${n.status === "Archived" ? "Restore" : "Archive"} ${esc(n.title)}"><i data-lucide="${n.status === "Archived" ? "archive-restore" : "archive"}"></i></button>
				</div></td>
			</tr>`).join("");

		$("pnCount").textContent = list.length + (list.length === 1 ? " item" : " items");
		$("pnEmpty").hidden = list.length !== 0;
		$("pnShowMore").hidden = list.length <= visibleCount;
		$("pnEndMessage").hidden = !(list.length > pageSize && list.length <= visibleCount);
		icons();
	}
	function resetAndRender() { visibleCount = pageSize; render(); }

	function setImage(src) {
		imageData = src || "";
		const prev = $("pnImagePreview"), ph = $("pnImagePlaceholder"), rm = $("pnRemoveImage");
		if (src) {
			prev.src = src; prev.hidden = false; prev.style.display = "block";
			ph.hidden = true; ph.style.display = "none"; rm.hidden = false;
		} else {
			prev.removeAttribute("src"); prev.hidden = true; prev.style.display = "none";
			ph.hidden = false; ph.style.display = "flex"; rm.hidden = true;
		}
	}
	function readImage() {
		const f = imageFile.files && imageFile.files[0]; if (!f) return;
		if (!f.type.startsWith("image/")) { toast("Please choose an image file."); imageFile.value = ""; return; }
		const r = new FileReader(); r.onload = e => setImage(e.target.result); r.readAsDataURL(f);
	}

	function openForm(n) {
		editingId = n ? n.id : null;
		$("pnFormHeading").textContent = n ? "Edit Program News" : "Add Program News";
		$("pnTitle").value = n ? n.title : "";
		$("pnExcerpt").value = n ? n.excerpt : "";
		$("pnProgram").value = n ? n.program : "";
		$("pnStatus").value = n && n.status !== "Archived" ? n.status : "Draft";
		$("pnDate").value = n ? n.publishDate : dayStr(0);
		setImage(n ? n.image : "");
		formModal.classList.add("open"); formModal.setAttribute("aria-hidden", "false");
		icons(); $("pnTitle").focus();
	}
	function closeForm() {
		formModal.classList.remove("open"); formModal.setAttribute("aria-hidden", "true");
		editingId = null; form.reset(); imageFile.value = ""; setImage("");
	}

	function openPreview(n) {
		$("pnPreviewProgram").textContent = PROGRAMS[n.program] || n.program || "Program";
		$("pnPreviewTitle").textContent = n.title || "Untitled program news";
		const shown = n.status, badge = $("pnPreviewStatus");
		badge.textContent = shown; badge.className = "status-badge " + statusClass(shown);
		$("pnPreviewDate").textContent = n.publishDate ? "Publish date: " + fmtDay(n.publishDate) : "—";
		$("pnPreviewExcerpt").textContent = n.excerpt || "";

		const img = $("pnPreviewImage"), ph = $("pnPreviewNoImage");
		if (n.image) { img.src = n.image; img.hidden = false; ph.hidden = true; }
		else { img.removeAttribute("src"); img.hidden = true; ph.hidden = false; }

		$("pnCreatedBy").textContent = n.createdBy || "Admin";
		$("pnDateCreated").textContent = fmtDate(n.createdAt);
		$("pnUpdatedBy").textContent = n.updatedBy || n.createdBy || "—";
		previewModal.classList.add("open"); previewModal.setAttribute("aria-hidden", "false"); icons();
	}
	function closePreview() { previewModal.classList.remove("open"); previewModal.setAttribute("aria-hidden", "true"); }

	async function toggleArchive(n) {
		const restoring = n.status === "Archived";
		let confirmed;
		if (window.Swal) {
			const res = await Swal.fire({title: restoring ? "Restore this news?" : "Archive this news?", text:n.title, icon:"question", showCancelButton:true, confirmButtonText: restoring ? "Yes, restore" : "Yes, archive", confirmButtonColor:"#0d5c3a"});
			confirmed = res.isConfirmed;
		} else {
			confirmed = confirm((restoring ? "Restore" : "Archive") + " \"" + n.title + "\"?");
		}
		if (!confirmed) return;
		n.status = restoring ? "Draft" : "Archived"; n.updatedBy = "Admin";
		render(); toast(restoring ? "Program news restored as draft." : "Program news archived.");
	}

	$("addProgramNews").addEventListener("click", () => openForm(null));
	search.addEventListener("input", resetAndRender);
	[programFilter, statusFilter, sortSel].forEach(el => el.addEventListener("change", resetAndRender));
	$("pnShowMore").addEventListener("click", () => { visibleCount += pageSize; render(); });

	tbody.addEventListener("click", e => {
		const btn = e.target.closest("[data-action]"); if (!btn) return;
		const row = btn.closest("tr[data-id]"); if (!row) return;
		const n = items.find(x => x.id === Number(row.dataset.id)); if (!n) return;
		if (btn.dataset.action === "preview") openPreview(n);
		if (btn.dataset.action === "edit") openForm(n);
		if (btn.dataset.action === "archive") toggleArchive(n);
	});

	document.querySelectorAll("[data-close-form]").forEach(b => b.addEventListener("click", closeForm));
	document.querySelectorAll("[data-close-preview]").forEach(b => b.addEventListener("click", closePreview));

	$("pnChooseImage").addEventListener("click", () => imageFile.click());
	$("pnRemoveImage").addEventListener("click", () => { setImage(""); imageFile.value = ""; });
	imageFile.addEventListener("change", readImage);

	$("pnPreviewFromForm").addEventListener("click", () => {
		const existing = editingId !== null ? items.find(x => x.id === editingId) : null;
		openPreview({
			title: $("pnTitle").value.trim(), excerpt: $("pnExcerpt").value.trim(), program: $("pnProgram").value,
			status: $("pnStatus").value, publishDate: $("pnDate").value, image: imageData,
			createdBy: existing ? existing.createdBy : "Admin", createdAt: existing ? existing.createdAt : Date.now(),
			updatedBy: existing ? existing.updatedBy : "Admin"
		});
	});

	form.addEventListener("submit", e => {
		e.preventDefault();
		const data = {
			title: $("pnTitle").value.trim(), excerpt: $("pnExcerpt").value.trim(), program: $("pnProgram").value,
			status: $("pnStatus").value, publishDate: $("pnDate").value, image: imageData
		};
		if (!data.title || !data.excerpt || !data.program || !data.publishDate) return;
		if (editingId !== null) {
			const n = items.find(x => x.id === editingId);
			if (n) {
				if (n.status === "Archived") data.status = "Archived";
				Object.assign(n, data, {updatedBy: "Admin"});
			}
			toast("Program news updated.");
		} else {
			items.push({id: nextId++, createdBy: "Admin", updatedBy: "Admin", createdAt: Date.now(), ...data});
			toast("Program news added.");
		}
		resetAndRender(); closeForm();
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