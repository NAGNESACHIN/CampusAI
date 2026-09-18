import { useEffect, useMemo, useState } from "react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

const demoAssignments = [
  { id: 1, title: "Probability Theory", description: "Probability & Statistics assignment", subject_id: 1, due: "Tomorrow", status: "Pending" },
  { id: 2, title: "SQL Queries", description: "DBMS practical assignment", subject_id: 2, due: "Friday", status: "Submitted" },
];

async function api(path, options = {}) {
  const token = localStorage.getItem("campusai_token");
  const headers = { ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || data.message || "Something went wrong");
  return data;
}

function Logo() { return <div className="brand">Campus<span>AI</span></div>; }

function AuthScreen({ initialRole, onAuth }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState(initialRole || "student");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const data = await api(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        body: JSON.stringify(mode === "login" ? { email: form.email, password: form.password } : { ...form, role })
      });
      localStorage.setItem("campusai_token", data.access_token);
      localStorage.setItem("campusai_role", data.role);
      onAuth(data.role);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return <div className="auth-page">
    <div className="auth-art">
      <Logo />
      <div className="auth-copy">
        <span className="eyebrow">AI • LEARNING • CAMPUS</span>
        <h1>Everything you need to learn smarter.</h1>
        <p>Assignments, course materials and a subject-aware AI tutor in one secure academic workspace.</p>
        <div className="mini-features"><span>✦ Course-aware AI</span><span>✓ Assignment tracking</span><span>⌁ Faculty workflows</span></div>
      </div>
    </div>
    <div className="auth-card-wrap">
      <div className="auth-card">
        <div className="mobile-logo"><Logo /></div>
        <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        <p className="muted">{mode === "login" ? "Sign in to continue to CampusAI." : "Join your academic workspace."}</p>
        {mode === "register" && <label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name" required /></label>}
        <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@college.edu" required /></label>
        <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••" required /></label>
        {mode === "register" && <div className="role-picker"><button type="button" className={role==="student"?"selected":""} onClick={()=>setRole("student")}>🎓 Student</button><button type="button" className={role==="faculty"?"selected":""} onClick={()=>setRole("faculty")}>👨‍🏫 Faculty</button></div>}
        {error && <div className="error-box">⚠ {error}</div>}
        <button className="primary full" onClick={submit} disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button>
        <p className="switch">{mode === "login" ? "New to CampusAI?" : "Already have an account?"} <button onClick={()=>{setMode(mode==="login"?"register":"login");setError("")}}>{mode==="login"?"Create account":"Sign in"}</button></p>
      </div>
    </div>
  </div>;
}

function Landing({ onChoose }) {
  return <div className="landing">
    <nav className="landing-nav"><Logo /><span className="nav-badge">Built for modern campuses</span></nav>
    <div className="hero">
      <span className="eyebrow">YOUR ACADEMIC COPILOT</span>
      <h1>Your college.<br /><span>Connected with AI.</span></h1>
      <p>Learn from approved course material, stay ahead of assignments, and keep your academic work organized in one secure platform.</p>
      <div className="role-buttons"><button className="primary" onClick={()=>onChoose("student")}>🎓 Continue as Student <b>→</b></button><button className="secondary" onClick={()=>onChoose("faculty")}>👨‍🏫 Faculty Portal <b>→</b></button></div>
      <div className="hero-trust"><span>🔒 Secure access</span><span>📚 Course-aware AI</span><span>⚡ Fast workflows</span></div>
    </div>
    <div className="feature-strip"><div><b>🤖 AI Tutor</b><span>Ask questions grounded in your course</span></div><div><b>📝 Assignments</b><span>Track every deadline and submission</span></div><div><b>📊 Faculty Insights</b><span>Understand course activity at a glance</span></div></div>
  </div>;
}

function DashboardShell({ role, tab, setTab, onLogout, children }) {
  const items = role === "student" ? [["dashboard","⌂","Dashboard"],["courses","▦","My Courses"],["assignments","□","Assignments"],["ai","✦","AI Tutor"]] : [["dashboard","⌂","Dashboard"],["assignments","□","Assignments"],["submissions","↓","Submissions"],["materials","▤","Course Materials"]];
  return <div className="app">
    <aside><Logo /><div className="role-label">{role} portal</div><nav>{items.map(([id,icon,label])=><button key={id} className={tab===id?"nav active":"nav"} onClick={()=>setTab(id)}><span>{icon}</span>{label}</button>)}</nav><div className="sidebar-bottom"><button className="nav"><span>⚙</span>Settings</button><button className="nav logout" onClick={onLogout}><span>↪</span>Sign out</button></div></aside>
    <main><div className="mobile-top"><Logo /><button className="avatar">CA</button></div>{children}</main>
  </div>;
}

function Header({ title, subtitle }) { return <header><div><div className="eyebrow">CAMPUSAI</div><h1>{title}</h1><p>{subtitle}</p></div><button className="avatar">CA</button></header>; }
function Stat({icon,label,value,tone}) { return <div className="card stat"><div className={`stat-icon ${tone||""}`}>{icon}</div><small>{label}</small><strong>{value}</strong></div>; }

function StudentDashboard({ setTab }) {
  const [assignments, setAssignments] = useState(demoAssignments);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{api("/api/assignments").then(data=>setAssignments(data.length?data:demoAssignments)).catch(()=>{}).finally(()=>setLoading(false));},[]);
  const pending=assignments.filter(a=>a.status!=="Submitted").length;
  return <><Header title="Good morning 👋" subtitle="Here's what needs your attention today." />
    <div className="grid stats"><Stat icon="○" label="Pending" value={pending} tone="warning"/><Stat icon="✓" label="Submitted" value={assignments.length-pending} tone="success"/><Stat icon="!" label="Due soon" value={Math.min(pending,2)} tone="purple"/><Stat icon="✦" label="AI chats" value="18" tone="blue"/></div>
    <section className="card section"><div className="section-head"><div><h2>Upcoming assignments</h2><p>Stay ahead of your deadlines.</p></div><button className="text-btn" onClick={()=>setTab("assignments")}>View all →</button></div>
      {loading?<Skeleton/>:assignments.slice(0,4).map(a=><AssignmentRow key={a.id} assignment={a} />)}
    </section>
    <section className="ai-banner" onClick={()=>setTab("ai")}><div className="ai-orb">✦</div><div><span className="eyebrow">CAMPUSAI TUTOR</span><h2>Stuck on a topic?</h2><p>Ask a course question and get an explanation grounded in your study material.</p></div><button>Ask AI →</button></section>
  </>;
}

function AssignmentRow({assignment}) { return <div className="assignment-row"><div className="assignment-icon">□</div><div className="assignment-main"><b>{assignment.title}</b><small>{assignment.description || "Course assignment"} · {assignment.status === "Submitted" ? "Submitted" : "Due soon"}</small></div><span className={assignment.status==="Submitted"?"pill ok":"pill"}>{assignment.status || "Pending"}</span><button className="ghost">→</button></div>; }
function Skeleton(){return <div className="skeleton-list"><i/><i/><i/></div>;}

function StudentAssignments() {
  const [assignments,setAssignments]=useState(demoAssignments); const [message,setMessage]=useState("");
  useEffect(()=>{api("/api/assignments").then(d=>d.length&&setAssignments(d)).catch(()=>{});},[]);
  const upload=async(a,e)=>{const file=e.target.files?.[0];if(!file)return;const fd=new FormData();fd.append("assignment_id",a.id);fd.append("file",file);try{await api("/api/submissions",{method:"POST",body:fd});setMessage(`✓ ${file.name} submitted successfully`);}catch(err){setMessage(err.message)}};
  return <><Header title="My assignments" subtitle="Track deadlines and submit your work." />{message&&<div className="toast">{message}</div>}<section className="card section"><div className="section-head"><div><h2>All assignments</h2><p>{assignments.length} assignments in your workspace.</p></div></div>{assignments.map(a=><div className="assignment-card" key={a.id}><div className="assignment-main"><span className="subject-tag">COURSE</span><h3>{a.title}</h3><p>{a.description || "Complete and submit this assignment before the deadline."}</p></div><div className="assignment-action"><span className={a.status==="Submitted"?"pill ok":"pill"}>{a.status || "Pending"}</span>{a.status!=="Submitted"&&<label className="upload-btn">Upload<input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={e=>upload(a,e)} hidden /></label>}</div></div>)}</section></>;
}

function AIChat() {
  const [q,setQ]=useState(""); const [messages,setMessages]=useState([{from:"ai",text:"Hi! I'm your CampusAI Tutor. Ask me a question about your course material and I'll help you work through it."}]); const [busy,setBusy]=useState(false);
  const send=async()=>{if(!q.trim()||busy)return;const question=q.trim();setQ("");setMessages(m=>[...m,{from:"user",text:question}]);setBusy(true);try{const data=await api("/api/ai/ask",{method:"POST",body:JSON.stringify({question})});setMessages(m=>[...m,{from:"ai",text:data.answer||"I couldn't find enough course material to answer that yet.",sources:data.sources||[]}]);}catch(err){setMessages(m=>[...m,{from:"ai",text:`I couldn't reach the AI service. ${err.message}`}]);}finally{setBusy(false)}};
  return <><Header title="CampusAI Tutor" subtitle="Your subject-aware academic assistant." /><section className="chat card"><div className="chat-top"><div className="ai-orb small">✦</div><div><b>CampusAI Tutor</b><small>Course-aware assistant</small></div><span className="online">● Online</span></div><div className="messages">{messages.map((m,i)=><div key={i} className={`message ${m.from}`}><div className="bubble">{m.text}</div>{m.sources?.length>0&&<div className="sources"><small>📚 Sources</small>{m.sources.slice(0,3).map((s,j)=><span key={j}>{typeof s==="string"?s:s.name||s.source||"Course material"}</span>)}</div>}</div>)}{busy&&<div className="message ai"><div className="bubble typing">● ● ●</div></div>}</div><div className="suggestions"><button onClick={()=>setQ("Explain this topic simply")}>Explain simply</button><button onClick={()=>setQ("Give me an example")}>Give an example</button><button onClick={()=>setQ("Quiz me on this topic")}>Quiz me</button></div><div className="composer"><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask a question about your course..." /><button className="send-btn" onClick={send}>↑</button></div></section></>;
}

function FacultyDashboard({setTab}) {
  const [assignments,setAssignments]=useState([]); useEffect(()=>{api("/api/assignments").then(setAssignments).catch(()=>{});},[]);
  return <><Header title="Faculty dashboard" subtitle="A clear view of your courses and student activity." /><div className="grid stats"><Stat icon="□" label="Assignments" value={assignments.length||12} tone="purple"/><Stat icon="↓" label="Submissions" value="284" tone="blue"/><Stat icon="○" label="Pending review" value="31" tone="warning"/><Stat icon="♙" label="Students" value="420" tone="success"/></div><div className="dashboard-grid"><section className="card section"><div className="section-head"><div><h2>Recent assignments</h2><p>Manage your latest coursework.</p></div><button className="text-btn" onClick={()=>setTab("assignments")}>Manage →</button></div>{assignments.length?assignments.slice(0,5).map(a=><AssignmentRow key={a.id} assignment={a}/>):<Empty title="No assignments yet" text="Create your first assignment from the Assignments tab."/>}</section><section className="card section"><h2>Needs attention</h2><div className="attention"><div>⚠️ <span><b>31 submissions</b><small>Waiting for review</small></span></div><div>📚 <span><b>Course material</b><small>Add material for AI Tutor</small></span></div><div>✓ <span><b>System healthy</b><small>API connection ready</small></span></div></div></section></div></>;
}

function FacultyAssignments() {
  const [title,setTitle]=useState("");const [description,setDescription]=useState("");const [subjectId,setSubjectId]=useState("1");const [items,setItems]=useState([]);const [msg,setMsg]=useState("");
  useEffect(()=>{api("/api/assignments").then(setItems).catch(()=>{});},[]);
  const create=async()=>{if(!title.trim())return;try{const data=await api(`/api/assignments?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&subject_id=${subjectId}`,{method:"POST"});setItems(i=>[data,...i]);setTitle("");setDescription("");setMsg("Assignment created successfully.");}catch(e){setMsg(e.message)}};
  return <><Header title="Assignments" subtitle="Create and manage coursework for your students." />{msg&&<div className="toast">{msg}</div>}<div className="dashboard-grid"><section className="card form-card"><span className="eyebrow">NEW ASSIGNMENT</span><h2>Create assignment</h2><label>Title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Unit 2 — Probability Distributions"/></label><label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Add instructions for students..." rows="4"/></label><label>Subject ID<input value={subjectId} onChange={e=>setSubjectId(e.target.value)} type="number" min="1"/></label><button className="primary" onClick={create}>Create assignment →</button></section><section className="card section"><div className="section-head"><div><h2>Your assignments</h2><p>{items.length} active assignments.</p></div></div>{items.length?items.map(a=><AssignmentRow key={a.id} assignment={a}/>):<Empty title="Nothing here yet" text="Create an assignment to get started."/>}</section></div></>;
}

function FacultySubmissions(){return <><Header title="Submissions" subtitle="Review student work from your assignments."/><section className="card section"><div className="empty"><div className="empty-icon">↓</div><h2>Submission center</h2><p>Select an assignment to view its student submissions. The review workflow is ready to connect to your faculty account.</p></div></section></>;}
function Materials(){return <><Header title="Course materials" subtitle="Add approved material that CampusAI can use for grounded answers."/><section className="card form-card"><span className="eyebrow">RAG KNOWLEDGE BASE</span><h2>Upload course material</h2><p className="muted">The current prototype accepts TXT and Markdown files up to 5 MB.</p><label>Subject<input placeholder="Probability & Statistics"/></label><label className="dropzone">📄 <b>Choose a TXT or MD file</b><small>Course notes, syllabus, reference material</small><input type="file" accept=".txt,.md" hidden /></label><button className="primary">Index material →</button></section></>;}
function Empty({title,text}){return <div className="empty"><div className="empty-icon">✦</div><h2>{title}</h2><p>{text}</p></div>;}

function Dashboard({role,onLogout}) {
  const [tab,setTab]=useState("dashboard");
  let content=role==="student"?(tab==="dashboard"?<StudentDashboard setTab={setTab}/>:tab==="assignments"?<StudentAssignments/>:tab==="ai"?<AIChat/>:<StudentDashboard setTab={setTab}/>):(tab==="dashboard"?<FacultyDashboard setTab={setTab}/>:tab==="assignments"?<FacultyAssignments/>:tab==="submissions"?<FacultySubmissions/>:<Materials/>);
  return <DashboardShell role={role} tab={tab} setTab={setTab} onLogout={onLogout}>{content}</DashboardShell>;
}

export default function App(){
  const [role,setRole]=useState(()=>localStorage.getItem("campusai_role"));
  const [authRole,setAuthRole]=useState(null);
  const logout=()=>{localStorage.removeItem("campusai_token");localStorage.removeItem("campusai_role");setRole(null);setAuthRole(null);};
  if(role)return <Dashboard role={role} onLogout={logout}/>;
  if(authRole)return <AuthScreen initialRole={authRole} onAuth={setRole}/>;
  return <Landing onChoose={setAuthRole}/>;
}
