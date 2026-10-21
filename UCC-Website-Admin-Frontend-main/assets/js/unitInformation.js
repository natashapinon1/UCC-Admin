document.addEventListener('DOMContentLoaded',()=>{
 const $=id=>document.getElementById(id),search=$('unitInfoSearch'),unitFilter=$('unitInfoUnitFilter'),statusFilter=$('unitInfoStatusFilter'),sort=$('unitInfoSort'),tbody=$('unitInfoTableBody'),count=$('unitInfoCount'),empty=$('unitInfoEmpty'),showMore=$('unitInfoShowMore'),endMessage=$('unitInfoEndMessage'),formModal=$('unitInfoFormModal'),previewModal=$('unitInfoPreviewModal'),form=$('unitInfoForm');
 let nextId=7,editingId=null,showAll=false,toastTimer;
 const today=()=>new Date().toISOString().slice(0,10);
 const records=[
 {id:1,unit:'College of Arts and Sciences',mission:'To provide accessible, learner-centered education in the arts, sciences, and humanities.',vision:'A vibrant academic community known for critical inquiry, creativity, and service.',description:'Offers programs that develop communication, research, cultural understanding, and scientific reasoning.',status:'Active',createdBy:'Admin',dateCreated:'2026-09-10',lastUpdatedBy:'—',createdAt:1},
 {id:2,unit:'College of Business and Accountancy',mission:'To develop ethical, competent, and innovative business professionals.',vision:'A leading learning community producing responsible business leaders and entrepreneurs.',description:'Provides business and accountancy education grounded in professional practice and social responsibility.',status:'Active',createdBy:'Admin',dateCreated:'2026-09-12',lastUpdatedBy:'—',createdAt:2},
 {id:3,unit:'College of Education',mission:'To prepare reflective educators committed to inclusive teaching and lifelong learning.',vision:'A recognized center for transformative teacher education and community partnership.',description:'Supports future educators through theory-informed teaching practice, research, and field experience.',status:'Active',createdBy:'Admin',dateCreated:'2026-09-13',lastUpdatedBy:'Admin',createdAt:3},
 {id:4,unit:'College of Computer Studies',mission:'To cultivate responsible computing professionals with practical and analytical skills.',vision:'An innovative computing community contributing to digital progress and public good.',description:'Focuses on computing knowledge, software development, information systems, and responsible technology use.',status:'Hidden',createdBy:'Admin',dateCreated:'2026-09-14',lastUpdatedBy:'—',createdAt:4},
 {id:5,unit:'College of Engineering',mission:'To develop resourceful engineers who apply technical knowledge to real-world needs.',vision:'A collaborative engineering community advancing sustainable and practical solutions.',description:'Promotes engineering fundamentals, design thinking, teamwork, and applied problem-solving.',status:'Active',createdBy:'Admin',dateCreated:'2026-09-15',lastUpdatedBy:'—',createdAt:5},
 {id:6,unit:'Office of Student Affairs',mission:'To support student development, engagement, well-being, and responsible leadership.',vision:'A campus environment where every student can participate, belong, and thrive.',description:'Coordinates student services, activities, leadership opportunities, and support programs.',status:'Active',createdBy:'Admin',dateCreated:'2026-09-16',lastUpdatedBy:'—',createdAt:6}
 ];
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const icons=()=>{if(window.lucide)window.lucide.createIcons()};
 function notify(message){
    const toast=$('unitInfoToast');toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2300)}
 function render(){
    const term=search.value.trim().toLowerCase();
    let list=records.filter(r=>(r.unit+' '+r.mission+' '+r.vision+' '+r.description).toLowerCase().includes(term)&&(unitFilter.value==='All'||r.unit===unitFilter.value)&&(statusFilter.value==='All'||r.status===statusFilter.value));if(sort.value==='name-asc')list.sort((a,b)=>a.unit.localeCompare(b.unit));if(sort.value==='name-desc')list.sort((a,b)=>b.unit.localeCompare(a.unit));if(sort.value==='newest')list.sort((a,b)=>b.createdAt-a.createdAt);if(sort.value==='oldest')list.sort((a,b)=>a.createdAt-b.createdAt);
    count.textContent=`${list.length} ${list.length===1?'record':'records'}`;
    const visible=showAll?list:list.slice(0,5);
    tbody.innerHTML=visible.map(r=>`<tr><td><div class="units-unit-name">${esc(r.unit)}
    </div></td><td><div class="unit-info-excerpt">${esc(r.mission)}</div></td><td><div class="unit-info-excerpt">${esc(r.vision)}
    </div></td><td><div class="unit-info-excerpt">${esc(r.description)}</div></td><td><span class="units-status-badge ${r.status==='Hidden'?'hidden':''}">${esc(r.status)}</span>
    </td><td><div class="units-actions"><button class="units-action-btn units-action-view" data-action="view" data-id="${r.id}" type="button" aria-label="View information" title="View"><i data-lucide="eye"></i></button><button class="units-action-btn units-action-edit" data-action="edit" data-id="${r.id}" type="button" aria-label="Edit information" title="Edit"><i data-lucide="pencil"></i></button><button class="units-action-btn units-action-delete" data-action="delete" data-id="${r.id}" type="button" aria-label="Delete information" title="Delete"><i data-lucide="trash-2"></i></button></div></td></tr>`).join('');empty.hidden=list.length!==0;showMore.hidden=list.length<=5;showMore.textContent=showAll?'Show less':'Show more';
    endMessage.hidden=!(showAll&&list.length>5);
    icons()}
 function data(){return{unit:$('unitInfoUnit').value,mission:$('unitInfoMission').value.trim(),vision:$('unitInfoVision').value.trim(),description:$('unitInfoDescription').value.trim(),status:$('unitInfoStatus').value}}
 function openForm(record=null){editingId=record?.id??null;form.reset();$('unitInfoFormTitle').textContent=record?'Edit Unit Information':'Add Unit Information';$('unitInfoUnit').value=record?.unit||'';$('unitInfoMission').value=record?.mission||'';$('unitInfoVision').value=record?.vision||'';$('unitInfoDescription').value=record?.description||'';$('unitInfoStatus').value=record?.status||'Active';
    formModal.hidden=false;
    formModal.setAttribute('aria-hidden','false');
    document.body.classList.add('units-modal-open');
    icons()}
 function closeForm(){formModal.hidden=true;
    formModal.setAttribute('aria-hidden','true');
    document.body.classList.remove('units-modal-open');
    editingId=null;
    form.reset()}
 function fillPreview(r){$('previewUnitInfoUnit').
    textContent=r.unit;$('previewUnitInfoMission').
    textContent=r.mission||'—';$('previewUnitInfoVision').
    textContent=r.vision||'—';$('previewUnitInfoDescription').
    textContent=r.description||'—';$('previewUnitInfoStatus').
    textContent=r.status;$('previewUnitInfoStatus').
    classList.toggle('hidden',r.status==='Hidden');$('unitInfoCreatedBy').
    textContent=r.createdBy||'Admin';$('unitInfoDateCreated').
    textContent=r.dateCreated||'—';$('unitInfoLastUpdatedBy').
    textContent=r.lastUpdatedBy||'—'}
 function openPreview(r){fillPreview(r);
    previewModal.hidden=false;
    previewModal.setAttribute('aria-hidden','false');
    icons()}
 function closePreview(){
    previewModal.hidden=true;
    previewModal.setAttribute('aria-hidden','true')}
 $('addUnitInfoBtn').addEventListener('click',()=>openForm());$('cancelUnitInfoBtn')
 .addEventListener('click',closeForm);
 document.querySelectorAll('[data-close-unit-info-form]')
 .forEach(el=>el.addEventListener('click',closeForm));
 document.querySelectorAll('[data-close-unit-info-preview]')
 .forEach(el=>el.addEventListener('click',closePreview));
 $('previewUnitInfoBtn').addEventListener('click',()=>{if(!form.reportValidity())
    return;
    const old=editingId?records.find(r=>r.id===editingId):null;openPreview({...old,...data(),createdBy:old?.createdBy||'Admin',dateCreated:old?.dateCreated||today(),lastUpdatedBy:old?'Admin':'—'})});
 form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;
    const values=data();if(editingId){
        const r=records.find(x=>x.id===editingId);Object.assign(r,values,{lastUpdatedBy:'Admin'});notify('Unit information updated.')}else{records.unshift({id:nextId++,...values,createdBy:'Admin',dateCreated:today(),lastUpdatedBy:'—',createdAt:Date.now()});notify('Unit information added.')}showAll=false;render();closeForm()});
 tbody.addEventListener('click',e=>{
    const b=e.target.closest('[data-action]');if(!b)return;
    const r=records.find(x=>x.id===Number(b.dataset.id));if(!r)return;if(b.dataset.action==='view')openPreview(r);if(b.dataset.action==='edit')openForm(r);if(b.dataset.action==='delete'&&confirm(`Delete information for “${r.unit}”?`)){records.splice(records.indexOf(r),1);render();notify('Unit information deleted from this page session.')}});
 [search,unitFilter,statusFilter]
 .forEach(el=>el
    .addEventListener(el===search?'input':'change',()=>
        {showAll=false;render()}));
    sort.addEventListener('change',render);
    showMore.addEventListener('click',()=>{showAll=!showAll;render()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){
        if(!previewModal.hidden)closePreview();
        if(!formModal.hidden)closeForm()}});
        render();
        icons();
});
