async function loadSharedLayout(){
  const sidebarContainer=document.getElementById('sidebar-container');
  const headerContainer=document.getElementById('header-container');
  try{
    const [sidebarResponse,headerResponse]=await Promise.all([fetch('sidebar.html'),fetch('header.html')]);
    if(!sidebarResponse.ok||!headerResponse.ok)throw new Error('Unable to load shared header or sidebar.');
    sidebarContainer.innerHTML=await sidebarResponse.text();headerContainer.innerHTML=await headerResponse.text();
    const currentPage=window.location.pathname.split('/').pop().toLowerCase();
    const titleElement=document.getElementById('pageTitle');if(titleElement)titleElement.textContent=document.body.dataset.pageTitle||document.title;
    document.querySelectorAll('.sidebar [data-page]').forEach(link=>{if(link.dataset.page.toLowerCase()===currentPage){link.classList.add('active');
	const group=link.closest('.menu-group');if(group){group.classList.add('open');
	const button=group.querySelector('.menu-title');if(button){button.classList.add('active');button.setAttribute('aria-expanded','true');}}}});
    document.querySelectorAll('.sidebar .menu-title').forEach(button=>button.addEventListener('click',()=>{
		const group=button.closest('.menu-group');if(!group)return;
	const open=group.classList.toggle('open');
	button.setAttribute('aria-expanded',String(open));}));
    if(window.lucide)window.lucide.createIcons();
  }
  catch(error){
	console.error('Shared layout loading error:',error);
	sidebarContainer.textContent='Unable to load sidebar. Check that sidebar.html exists.';
	headerContainer.textContent='Unable to load header. Check that header.html exists.';}
}
loadSharedLayout();
if (window.lucide) { lucide.createIcons(); }