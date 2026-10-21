document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const programs = {BSIT:"BSIT", BSCS:"BSCS", BSA:"BSA", BSED:"BSED", BSHM:"BSHM"};
  const now = new Date();
  const dateString = date => date ? new Date(date + "T00:00:00").toLocaleDateString("en-US", {year:"numeric", month:"short", day:"numeric"}) : "—";
  const today = now.toISOString().slice(0,10);
  let nextId = 5, editingId = null, imageData = "";
  const pageSize = 3;
  let showAllRows = false;
  const records = [
    {id:1,title:"BSIT Students Join Technology Innovation Forum",excerpt:"Students explored emerging digital tools, software development practices, and career pathways during a program learning forum.",program:"BSIT",date:"2026-10-05",status:"Published",image:"",createdBy:"Admin",createdAt:"2026-09-22",updatedBy:"Admin"},
    {id:2,title:"Computer Science Research Colloquium",excerpt:"The program invites students to present research ideas and discuss current topics in computing and applied technology.",program:"BSCS",date:"2026-10-18",status:"Draft",image:"",createdBy:"Admin",createdAt:"2026-10-01",updatedBy:"Admin"},
    {id:3,title:"Accountancy Program Announces Student Briefing",excerpt:"An academic briefing will cover program reminders, student support resources, and upcoming activities.",program:"BSA",date:"2026-09-28",status:"Published",image:"",createdBy:"Admin",createdAt:"2026-09-15",updatedBy:"Admin"},
    {id:4,title:"Education Students Prepare for Teaching Demonstrations",excerpt:"Students are preparing lesson plans and classroom demonstrations as part of their professional learning activities.",program:"BSED",date:"2026-10-22",status:"Draft",image:"",createdBy:"Admin",createdAt:"2026-10-03",updatedBy:"Admin"}
  ];
  const formModal = $("pnFormModal"), previewModal = $("pnPreviewModal"), form = $("pnForm"), fileInput = $("pnImageFile");
  const tableBody = $("pnTableBody");

  function statusClass(status){return "pn-status pn-status-" + status.toLowerCase();}
  function safeText(value){return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
  function renderTable(){
    const query = $("pnSearch").value.trim().toLowerCase();
    const program = $("programFilter").value;
    const status = $("pnStatusFilter").value;
    const sort = $("pnSort").value;
    let list = records.filter(item => (program === "All" || item.program === program) && (status === "All" || item.status === status) && (item.title + " " + item.excerpt + " " + item.program).toLowerCase().includes(query));
    list.sort((a,b) => sort === "oldest" ? a.createdAt.localeCompare(b.createdAt) : sort === "title" ? a.title.localeCompare(b.title) : b.createdAt.localeCompare(a.createdAt));
    $("pnCount").textContent = `${list.length} ${list.length === 1 ? "item" : "items"}`;
    const showMoreButton = $("pnShowMore");
    const endMessage = $("pnEndMessage");
    const hasMoreRows = list.length > pageSize && !showAllRows;
    const visibleList = showAllRows ? list : list.slice(0, pageSize);
    showMoreButton.textContent = showAllRows ? "Show less" : "Show more";
    showMoreButton.setAttribute("aria-expanded", String(showAllRows));
    endMessage.hidden = list.length === 0 || hasMoreRows;
    if(!list.length){tableBody.innerHTML = '<tr><td colspan="6" class="pn-empty">No program news found.</td></tr>';return;}
    tableBody.innerHTML = visibleList.map(item => `<tr data-id="${item.id}">
      <td><div class="pn-thumb">${item.image ? `<img src="${item.image}" alt="">` : '<i data-lucide="image"></i>'}</div></td>
      <td><div class="pn-title">${safeText(item.title)}</div><div class="pn-excerpt">${safeText(item.excerpt)}</div></td>
      <td><span class="pn-program-pill">${safeText(programs[item.program] || item.program)}</span></td>
      <td>${safeText(dateString(item.date))}</td><td><span class="${statusClass(item.status)}">${safeText(item.status)}</span></td>
      <td><div class="pn-actions"><button class="pn-action" data-action="view" title="View" aria-label="View ${safeText(item.title)}"><i data-lucide="eye"></i></button><button class="pn-action edit" data-action="edit" title="Edit" aria-label="Edit ${safeText(item.title)}"><i data-lucide="pencil"></i></button><button class="pn-action archive" data-action="archive" title="Archive" aria-label="Archive ${safeText(item.title)}"><i data-lucide="archive"></i></button></div></td>
    </tr>`).join("");
    if(window.lucide) lucide.createIcons();
  }
  function setImage(src) {
    imageData = src || "";
    const img = $("pnImagePreview");
    const placeholder = $("pnImagePlaceholder");
    const removeButton = $("pnRemoveImage");

    if (imageData) {
      img.src = imageData;
      img.hidden = false;
      placeholder.hidden = true;
      removeButton.hidden = false;
    } else {
      img.removeAttribute("src");
      img.hidden = true;
      placeholder.hidden = false;
      removeButton.hidden = true;
    }
  }
  function syncModalScrollLock(){document.body.classList.toggle("pn-modal-open",formModal.classList.contains("open")||previewModal.classList.contains("open"));}
  function openForm(item=null){editingId=item?item.id:null;form.reset();$("pnTitle").value=item?.title||"";$("pnExcerpt").value=item?.excerpt||"";$("pnProgram").value=item?.program||"";$("pnDate").value=item?.date||today;$("pnStatus").value=item?.status==="Published"?"Published":"Draft";setImage(item?.image||"");$("pnFormHeading").textContent=item?"Edit Program News":"Add Program News";formModal.classList.add("open");formModal.setAttribute("aria-hidden","false");syncModalScrollLock();if(window.lucide)lucide.createIcons();}
  function closeForm(){formModal.classList.remove("open");formModal.setAttribute("aria-hidden","true");syncModalScrollLock();form.reset();fileInput.value="";setImage("");editingId=null;}
  function getDraft(){return {title:$("pnTitle").value.trim()||"Untitled program news",excerpt:$("pnExcerpt").value.trim(),program:$("pnProgram").value,date:$("pnDate").value,status:$("pnStatus").value,image:imageData,createdBy:editingId?records.find(x=>x.id===editingId)?.createdBy||"Admin":"Admin",createdAt:editingId?records.find(x=>x.id===editingId)?.createdAt:today,updatedBy:"Admin"};}
  function openPreview(item){$("pnPreviewTitle").textContent=item.title||"Untitled program news";$("pnPreviewExcerpt").textContent=item.excerpt||"No excerpt provided.";$("pnPreviewProgram").textContent=item.program?programs[item.program]||item.program:"Program not selected";$("pnPreviewDate").textContent=item.date?"Publish date: "+dateString(item.date):"Publish date not set";$("pnPreviewStatus").textContent=item.status||"Draft";$("pnPreviewStatus").className=statusClass(item.status||"Draft");$("pnCreatedBy").textContent=item.createdBy||"Admin";$("pnDateCreated").textContent=dateString(item.createdAt);$("pnUpdatedBy").textContent=item.updatedBy||item.createdBy||"Admin";const image=$("pnPreviewImage"),noImage=$("pnPreviewNoImage");if(item.image){image.src=item.image;image.hidden=false;noImage.hidden=true;}else{image.removeAttribute("src");image.hidden=true;noImage.hidden=false;}previewModal.classList.add("open");previewModal.setAttribute("aria-hidden","false");syncModalScrollLock();if(window.lucide)lucide.createIcons();}
  function closePreview(){previewModal.classList.remove("open");previewModal.setAttribute("aria-hidden","true");syncModalScrollLock();}
  function toast(message){const el=$("pnToast");el.textContent=message;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2300);}

  $("addProgramNews").addEventListener("click",()=>openForm());
  $("pnShowMore").addEventListener("click", () => { showAllRows = !showAllRows; renderTable(); });
  ["pnSearch","pnStatusFilter","pnSort","programFilter"].forEach(id=>$(id).addEventListener(id==="pnSearch"?"input":"change",()=>{showAllRows=false;renderTable();}));
  // Open the system file picker when Choose Photo is clicked.
  $("pnChooseImage").addEventListener("click", () => fileInput.click());

  // Remove the selected photo and return to the initial placeholder state.
  $("pnRemoveImage").addEventListener("click", () => {
    setImage("");
    fileInput.value = "";
  });

  // Show the selected photo and reveal Remove Photo only after a valid image is chosen.
  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast("Please choose an image file.");
      fileInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = event => setImage(event.target.result);
    reader.onerror = () => {
      toast("Unable to load this photo. Please choose another image.");
      fileInput.value = "";
    };
    reader.readAsDataURL(file);
  });
  $("pnPreviewFromForm").addEventListener("click",()=>openPreview(getDraft()));
  form.addEventListener("submit",event=>{event.preventDefault();const data=getDraft();if(!data.program){$("pnProgram").focus();toast("Please select a program.");return;}if(editingId){const old=records.find(item=>item.id===editingId);if(old)Object.assign(old,data,{updatedBy:"Admin"});}else{records.unshift({id:nextId++,...data});}closeForm();showAllRows=false;renderTable();toast("Program news saved.");});
  tableBody.addEventListener("click",event=>{const button=event.target.closest("[data-action]");if(!button)return;const row=button.closest("tr[data-id]");const item=records.find(record=>record.id===Number(row?.dataset.id));if(!item)return;if(button.dataset.action==="view")openPreview(item);if(button.dataset.action==="edit")openForm(item);if(button.dataset.action==="archive"){item.status="Archived";renderTable();toast("Program news archived.");}});
  document.querySelectorAll("[data-close-form]").forEach(button=>button.addEventListener("click",closeForm));
  document.querySelectorAll("[data-close-preview]").forEach(button=>button.addEventListener("click",closePreview));
  document.addEventListener("keydown",event=>{if(event.key==="Escape"){if(previewModal.classList.contains("open"))closePreview();else if(formModal.classList.contains("open"))closeForm();}});
  renderTable();
});
