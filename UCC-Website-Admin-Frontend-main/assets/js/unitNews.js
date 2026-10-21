document.addEventListener('DOMContentLoaded',()=>{
  const $=id=>document.getElementById(id);
  const search=$('newsSearch'),unitFilter=$('newsUnitFilter'),statusFilter=$('newsStatusFilter'),sort=$('newsSort'),tbody=$('newsTableBody'),count=$('newsCount'),empty=$('newsEmpty'),showMore=$('newsShowMore'),endMessage=$('newsEndMessage');
  const formModal=$('newsFormModal'),previewModal=$('newsPreviewModal'),form=$('newsForm');
  let nextId=7,editingId=null,showAll=false,toastTimer;
  const today=()=>new Date().toISOString().slice(0,10);
  const newsItems=[
    {id:1,title:'University Unit Holds Student Development Seminar',unit:'College of Arts and Sciences',excerpt:'Students joined a development seminar focused on leadership, collaboration, and academic growth.',image:'',publishDate:'2026-10-10',status:'Published',createdBy:'Admin',dateCreated:'2026-10-03',lastUpdatedBy:'Admin',createdAt:6},
    {id:2,title:'Business Students Showcase Innovative Projects',unit:'College of Business and Accountancy',excerpt:'Student teams presented practical business concepts and solutions during the college showcase.',image:'',publishDate:'2026-10-08',status:'Published',createdBy:'Admin',dateCreated:'2026-10-01',lastUpdatedBy:'—',createdAt:5},
    {id:3,title:'Faculty Workshop on Teaching Strategies',unit:'College of Education',excerpt:'Faculty members participated in a workshop on inclusive teaching strategies and classroom engagement.',image:'',publishDate:'2026-10-15',status:'Draft',createdBy:'Admin',dateCreated:'2026-09-28',lastUpdatedBy:'—',createdAt:4},
    {id:4,title:'Student Affairs Announces Campus Activities',unit:'Office of Student Affairs',excerpt:'A roundup of upcoming campus activities and opportunities for student participation.',image:'',publishDate:'2026-09-26',status:'Published',createdBy:'Admin',dateCreated:'2026-09-22',lastUpdatedBy:'Admin',createdAt:3},
    {id:5,title:'Arts and Sciences Research Forum',unit:'College of Arts and Sciences',excerpt:'The college invites students to share research and discuss current topics across disciplines.',image:'',publishDate:'2026-09-20',status:'Published',createdBy:'Admin',dateCreated:'2026-09-12',lastUpdatedBy:'Admin',createdAt:2},
    {id:6,title:'Welcome Message from the College',unit:'College of Education',excerpt:'A welcome message for students beginning a new semester and joining college activities.',image:'',publishDate:'2026-09-15',status:'Draft',createdBy:'Admin',dateCreated:'2026-09-08',lastUpdatedBy:'—',createdAt:1}
  ];
  const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const shortDate=value=>{if(!value)return'—';
    const d=new Date(`${value}T00:00:00`);return Number.isNaN(d.getTime())?value:d.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})};
  function icons(){if(window.lucide)window.lucide.createIcons()}
  function notify(message){
    const toast=$('newsToast');toast.textContent=message;toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>
        toast.classList.remove('show'),2300)}
  function render(){
    const term=search.value.trim().toLowerCase();
    let list=newsItems.filter(item=>(item.title+' '+item.excerpt+' '+item.unit).toLowerCase().includes(term)&&(unitFilter.value==='All'||item.unit===unitFilter.value)&&(statusFilter.value==='All'||item.status===statusFilter.value));
    if(sort.value==='newest')list.sort((a,b)=>b.createdAt-a.createdAt);if(sort.value==='oldest')list.sort((a,b)=>a.createdAt-b.createdAt);if(sort.value==='title-asc')list.sort((a,b)=>a.title.localeCompare(b.title));if(sort.value==='title-desc')list.sort((a,b)=>b.title.localeCompare(a.title));
    count.textContent=`${list.length} ${list.length===1?'item':'items'}`;
    const visible=showAll?list:list.slice(0,5);
    tbody.innerHTML=visible.map(item=>`<tr><td><div class="news-thumb">${item.image?`<img src="${item.image}" alt="">`:'<i data-lucide="image"></i>'}</div></td><td><div class="news-title-cell">${
        escapeHTML(item.title)}</div>
        </td>
        <td>
        <div class="news-unit-cell">${escapeHTML(item.unit)}
        </div>
        </td>
        <td>
        <div class="news-excerpt-cell">${escapeHTML(item.excerpt)}
        </div>
        </td>
        <td>
        <span class="news-date-cell">${
            escapeHTML(shortDate(item.publishDate))}
            </span></td><td><span class="units-status-badge ${item.status==='Published'?'news-status-published':item.status==='Archived'?'news-status-archived':'news-status-draft'}">${
                escapeHTML(item.status)}</span></td><td><div class="units-actions"><button class="units-action-btn units-action-view" data-action="view" data-id="${item.id}" type="button" aria-label="View news" title="View"><i data-lucide="eye"></i>
                </button>
                <button class="units-action-btn units-action-edit" data-action="edit" data-id="${item.id}" type="button" aria-label="Edit news" title="Edit" ${item.status==='Archived'?'disabled':''}><i data-lucide="pencil"></i>
                </button>
                <button class="units-action-btn units-action-archive" data-action="archive" data-id="${item.id}" type="button" aria-label="Archive news" title="Archive" ${item.status==='Archived'?'disabled':''}>
                <i data-lucide="archive">
                </i>
                </button>
                </div>
                </td>
                </tr>`).join('');
    empty.hidden=list.length!==0;showMore.hidden=list.length<=5;showMore.textContent=showAll?'Show less':'Show more';endMessage.hidden=!(showAll&&list.length>5);icons();
  }
  function setImage(src){
    const image=$('newsImagePreview'),placeholder=$('newsImagePlaceholder'),remove=$('removeNewsImage');if(src){image.src=src;image.hidden=false;placeholder.hidden=true;remove.hidden=false;remove.style.display=''}
    else{image.removeAttribute('src');image.hidden=true;placeholder.hidden=false;remove.hidden=true;remove.style.display='none'}}
  function readImage(file){if(!file)return;if(!file.type.startsWith('image/')){notify('Please choose an image file.');$('newsImageFile').value='';return}
  const reader=new FileReader();reader.onload=()=>setImage(reader.result);reader.readAsDataURL(file)}
  function openForm(item=null){editingId=item?.id??null;form.reset();$('newsFormTitle').textContent=item?'Edit Unit News':'Add Unit News';$('newsUnit').value=item?.unit||'';$('newsTitle').value=item?.title||'';$('newsExcerpt').value=item?.excerpt||'';$('newsPublishDate').value=item?.publishDate||today();$('newsStatus').value=item?.status==='Published'?'Published':'Draft';setImage(item?.image||'');$('newsImageFile').value='';
    formModal.hidden=false;formModal.setAttribute('aria-hidden','false');document.body.classList.add('units-modal-open');icons()}
  function closeForm(){formModal.hidden=true;formModal.setAttribute('aria-hidden','true');document.body.classList.remove('units-modal-open');editingId=null;form.reset();$('newsImageFile').value='';setImage('')}
  function getFormData(){return{unit:$('newsUnit').value,title:$('newsTitle').value.trim(),excerpt:$('newsExcerpt').value.trim(),publishDate:$('newsPublishDate').value,status:$('newsStatus').value,image:$('newsImagePreview').hidden?'':$('newsImagePreview').src}}
  function fillPreview(item){
    const image=$('previewNewsImage');if(item.image){image.src=item.image;image.hidden=false}else{image.removeAttribute('src');image.hidden=true}$('previewNewsTitle').textContent=item.title;$('previewNewsUnit').textContent=item.unit;$('previewNewsExcerpt').textContent=item.excerpt;$('previewNewsDate').textContent=shortDate(item.publishDate);
    const badge=$('previewNewsStatus');
    badge.textContent=item.status;
    badge.className='units-status-badge '+(item.status==='Published'?'news-status-published':item.status==='Archived'?'news-status-archived':'news-status-draft');$('newsCreatedBy').textContent=item.createdBy||'Admin';$('newsDateCreated').textContent=item.dateCreated||'—';$('newsLastUpdatedBy').textContent=item.lastUpdatedBy||'—'}
  function openPreview(item){fillPreview(item);
    previewModal.hidden=false;
    previewModal.setAttribute('aria-hidden','false');icons()}
  function closePreview(){previewModal.hidden=true;
    previewModal.setAttribute('aria-hidden','true')}
  $('addNewsBtn').addEventListener('click',()=>openForm());$('cancelNewsBtn').addEventListener('click',closeForm);
  document.querySelectorAll('[data-close-news-form]').forEach(el=>el.addEventListener('click',closeForm));
  document.querySelectorAll('[data-close-news-preview]').forEach(el=>el.addEventListener('click',closePreview));
  $('newsImageFile').addEventListener('change',e=>readImage(e.target.files&&e.target.files[0]));$('removeNewsImage').addEventListener('click',()=>{setImage('');$('newsImageFile').value=''});
  $('previewNewsBtn').addEventListener('click',()=>{if(!form.reportValidity())return;
    const data=getFormData(),existing=editingId?newsItems.find(item=>item.id===editingId):null;openPreview({...existing,...data,createdBy:existing?.createdBy||'Admin',dateCreated:existing?.dateCreated||today(),lastUpdatedBy:existing?'Admin':'—'})});
  form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;
    const data=getFormData();if(editingId){
        const item=newsItems.find(entry=>entry.id===editingId);Object.assign(item,data,{lastUpdatedBy:'Admin'});
        notify('Unit news updated.')}else{newsItems.unshift({id:nextId++,...data,createdBy:'Admin',dateCreated:
            today(),lastUpdatedBy:'—',createdAt:Date.now()});
            notify('Unit news added.')}showAll=false;
            render();
            closeForm()
        }
    );
  tbody.addEventListener('click',e=>{
    const button=e.target.closest('[data-action]');if(!button||button.disabled)return;
    const item=newsItems.find(entry=>entry.id===Number(button.dataset.id));
    if(!item)return;if(button.dataset.action==='view')openPreview(item);
    if(button.dataset.action==='edit')openForm(item);
    if(button.dataset.action==='archive'&&confirm(`Archive "${item.title}"?`)){item.status='Archived';item.lastUpdatedBy='Admin';
        render();
        notify('Unit news archived.')}});
  search.addEventListener('input',()=>{showAll=false;
    render()});
  unitFilter.addEventListener('change',()=>{showAll=false;
    render()});
    statusFilter.addEventListener('change',()=>{showAll=false;render()});
    sort.addEventListener('change',render);
    showMore.addEventListener('click',()=>{showAll=!showAll;render()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){
    if(!previewModal.hidden)
        closePreview();
    if(!formModal.hidden)
        closeForm()}});
  render();
  icons();
});
