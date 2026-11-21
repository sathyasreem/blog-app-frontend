const API="https://blog-app-backend-3au5.onrender.com";
const get=k=>JSON.parse(localStorage.getItem(k)||'null');
const set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const val=id=>document.getElementById(id).value;
const post=(path,body,token)=>fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});

async function renderBlogs(id,onlyMine){
  const box=document.getElementById(id);
  if(!box)return;
  box.innerHTML='<p>Loading... (first time may take 1 minute)</p>';
  const user=get('user');
  try{
    const res=await fetch(API+'/api/blogs');
    let blogs=await res.json();
    if(onlyMine&&user)blogs=blogs.filter(b=>b.author===user.name);
    box.innerHTML=blogs.length
      ?blogs.map(b=>`<div class="card"><h3>${esc(b.title)}</h3><p>${esc(b.content.length>120?b.content.slice(0,120)+'...':b.content)}</p><small>By ${esc(b.author)}</small><br><a href="blog.html?id=${encodeURIComponent(b._id)}">Read more</a></div>`).join('')
      :'<p>No blogs yet.</p>';
  }catch(err){
    box.innerHTML='<p>Could not load blogs. Please refresh.</p>';
  }
}

async function loadBlog(){
  const box=document.getElementById('blogDetail');
  if(!box)return;
  const id=new URLSearchParams(location.search).get('id');
  if(!id){box.innerHTML='<p>Blog not found.</p>';return;}
  box.innerHTML='<p>Loading... (first time may take 1 minute)</p>';
  try{
    const res=await fetch(API+'/api/blogs/'+encodeURIComponent(id));
    if(!res.ok){box.innerHTML='<p>Blog not found.</p>';return;}
    const b=await res.json();
    const date=new Date(b.createdAt).toLocaleDateString();
    box.innerHTML=`<div class="card"><h2>${esc(b.title)}</h2><small>By ${esc(b.author)} | ${esc(date)}</small><p style="margin-top:12px;white-space:pre-wrap">${esc(b.content)}</p></div>`;
  }catch(err){
    box.innerHTML='<p>Could not load blog. Please refresh.</p>';
  }
}

async function register(e){
  e.preventDefault();
  try{
    const res=await post('/api/register',{name:val('name'),email:val('email'),password:val('password')});
    const data=await res.json();
    alert(data.message);
    if(res.ok)location.href='login.html';
  }catch(err){alert('Server is waking up. Try again in a minute.');}
}

async function login(e){
  e.preventDefault();
  const msg=document.getElementById('msg');
  try{
    const res=await post('/api/login',{email:val('email'),password:val('password')});
    const data=await res.json();
    if(res.ok){
      set('user',{name:data.name,token:data.token});
      location.href='dashboard.html';
    }else if(msg)msg.textContent=data.message;
  }catch(err){if(msg)msg.textContent='Server is waking up. Try again in a minute.';}
}

function logout(){
  localStorage.removeItem('user');
  location.href='login.html';
}

function requireLogin(){
  if(!get('user'))location.href='login.html';
}

async function createBlog(e){
  e.preventDefault();
  const u=get('user');
  if(!u||!u.token){location.href='login.html';return;}
  try{
    const res=await post('/api/blogs',{title:val('title'),content:val('content')},u.token);
    if(res.status===401){logout();return;}
    const data=await res.json();
    if(res.ok)location.href='dashboard.html';
    else alert(data.message);
  }catch(err){alert('Server is waking up. Try again in a minute.');}
}
