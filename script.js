const get=k=>JSON.parse(localStorage.getItem(k)||'null');
const set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const val=id=>document.getElementById(id).value;

function renderBlogs(id,onlyMine){
  const box=document.getElementById(id);
  if(!box)return;
  const user=get('user');
  let blogs=get('blogs')||[];
  if(onlyMine&&user)blogs=blogs.filter(b=>b.author===user.name);
  box.innerHTML=blogs.length
    ?blogs.map(b=>`<div class="card"><h3>${esc(b.title)}</h3><p>${esc(b.content)}</p><small>By ${esc(b.author)}</small></div>`).join('')
    :'<p>No blogs yet.</p>';
}
function register(e){
  e.preventDefault();
  set('account',{name:val('name'),email:val('email'),password:val('password')});
  alert('Registered! Please login.');
  location.href='login.html';
}
function login(e){
  e.preventDefault();
  const a=get('account');
  if(a&&a.email===val('email')&&a.password===val('password')){
    set('user',a);
    location.href='dashboard.html';
  }else document.getElementById('msg').textContent='Invalid email or password';
}
function logout(){
  localStorage.removeItem('user');
  location.href='login.html';
}
function requireLogin(){
  if(!get('user'))location.href='login.html';
}
function createBlog(e){
  e.preventDefault();
  const u=get('user');
  if(!u){location.href='login.html';return;}
  const blogs=get('blogs')||[];
  blogs.unshift({title:val('title'),content:val('content'),author:u.name});
  set('blogs',blogs);
  location.href='dashboard.html';
}
