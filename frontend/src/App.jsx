import { useState } from "react";

const demoAssignments = [
  { id: 1, title: "Probability Theory", subject: "Probability & Statistics", due: "Tomorrow", status: "Pending" },
  { id: 2, title: "SQL Queries", subject: "DBMS", due: "Friday", status: "Submitted" },
];

function StudentDashboard() {
  const [tab, setTab] = useState("dashboard");
  return <DashboardShell role="Student" tab={tab} setTab={setTab}>
    {tab === "dashboard" && <>
      <Header title="Student Dashboard" subtitle="Welcome back. Keep your academic work on track." />
      <div className="grid stats"><Stat label="Pending" value="1" /><Stat label="Submitted" value="1" /><Stat label="Upcoming" value="2" /><Stat label="AI Questions" value="18" /></div>
      <section className="card"><h2>Assignments</h2>{demoAssignments.map(a => <div className="row" key={a.id}><div><b>{a.title}</b><small>{a.subject} · Due {a.due}</small></div><span className={a.status === "Submitted" ? "pill ok" : "pill"}>{a.status}</span></div>)}</section>
    </>}
    {tab === "assignments" && <><Header title="My Assignments" subtitle="Upload and track your submissions." /><section className="card">{demoAssignments.map(a => <div className="assignment" key={a.id}><div><h3>{a.title}</h3><p>{a.subject} · Due {a.due}</p></div><button>{a.status === "Submitted" ? "View Submission" : "Upload Assignment"}</button></div>)}</section></>}
    {tab === "ai" && <AIChat />}
  </DashboardShell>
}

function FacultyDashboard() {
  const [tab, setTab] = useState("dashboard");
  return <DashboardShell role="Faculty" tab={tab} setTab={setTab}>
    {tab === "dashboard" && <><Header title="Faculty Dashboard" subtitle="Monitor assignments and student submissions." /><div className="grid stats"><Stat label="Assignments" value="12" /><Stat label="Submissions" value="284" /><Stat label="Pending Review" value="31" /><Stat label="Students" value="420" /></div><section className="card"><h2>Recent Activity</h2><div className="row"><div><b>Probability Theory</b><small>28 new submissions</small></div><span className="pill">Review</span></div><div className="row"><div><b>DBMS SQL Queries</b><small>42 submissions received</small></div><span className="pill ok">Active</span></div></section></>}
    {tab === "assignments" && <><Header title="Assignments" subtitle="Create and manage course assignments." /><section className="card"><button className="primary">+ Create Assignment</button><p>Assignment management will connect to the FastAPI endpoint next.</p></section></>}
    {tab === "submissions" && <><Header title="Submissions" subtitle="Review student work securely." /><section className="card"><div className="row"><div><b>Probability Theory</b><small>28 submissions · 7 pending review</small></div><button>View</button></div></section></>}
  </DashboardShell>
}

function AIChat() { const [q,setQ]=useState(""); const [messages,setMessages]=useState([{from:"ai",text:"Hi! Ask me about your subjects. I’ll use approved course material when RAG is connected."}]); const send=()=>{if(!q.trim())return;setMessages([...messages,{from:"user",text:q},{from:"ai",text:"AI/RAG connection is the next module. Your question has been captured in this prototype."}]);setQ("")}; return <><Header title="CampusAI Assistant" subtitle="Your subject-aware academic assistant."/><section className="chat card">{messages.map((m,i)=><div key={i} className={"bubble "+m.from}>{m.text}</div>)}<div className="composer"><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask a subject question..." /><button onClick={send}>Ask AI</button></div></section></> }

function DashboardShell({role,tab,setTab,children}) { const items=role==="Student"?[["dashboard","Dashboard"],["assignments","Assignments"],["ai","AI Assistant"]]:[["dashboard","Dashboard"],["assignments","Assignments"],["submissions","Submissions"]]; return <div className="app"><aside><div className="brand">Campus<span>AI</span></div><div className="role">{role} Portal</div>{items.map(([id,label])=><button className={tab===id?"nav active":"nav"} onClick={()=>setTab(id)} key={id}>{label}</button>)}<div className="spacer"/><button className="nav">Settings</button></aside><main>{children}</main></div> }
function Header({title,subtitle}){return <header><div><h1>{title}</h1><p>{subtitle}</p></div><div className="avatar">CA</div></header>}
function Stat({label,value}){return <div className="card stat"><small>{label}</small><strong>{value}</strong></div>}

export default function App(){const [role,setRole]=useState(null); if(!role)return <div className="landing"><div className="hero"><div className="brand big">Campus<span>AI</span></div><h1>Your college, connected with AI.</h1><p>Assignments, submissions, faculty workflows and a subject-aware AI assistant in one secure platform.</p><div className="role-buttons"><button className="primary" onClick={()=>setRole("student")}>Enter as Student</button><button onClick={()=>setRole("faculty")}>Enter as Faculty</button></div></div></div>; return role==="student"?<StudentDashboard/>:<FacultyDashboard/>}
