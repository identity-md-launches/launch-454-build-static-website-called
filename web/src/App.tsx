import { useEffect } from 'react';
import { Footer, Header } from './components/Chrome';
import { useIssues } from './data/useIssues';
import { useRoute } from './lib/router';
import { Built } from './pages/Built';
import { Changelog } from './pages/Changelog';
import { Issue } from './pages/Issue';
import { Numbers } from './pages/Numbers';
import { Project } from './pages/Project';
export default function App() {
 const route = useRoute(), state = useIssues();
 const selected = state.issues.find(i=>i.date===route.date) ?? state.issues[0];
 useEffect(()=>{document.title=`${route.page === 'built' ? 'front page' : route.page} · what the swarm did`; if(document.activeElement !== document.body) document.getElementById('main')?.focus({preventScroll:true}); window.scrollTo(0,0);},[route.page,route.date,route.page === 'project' ? route.slug : '']);
 return <><Header route={route} issues={state.issues} selected={selected}/><main id="main" className="wrap" tabIndex={-1}>
 {route.page==='built' && <Built state={state} kind={route.kind} selected={selected}/>}
 {route.page==='issue' && <Issue state={state} date={route.date}/>}
 {route.page==='project' && <Project state={state} slug={route.slug} date={route.date}/>}
 {route.page==='changelog' && <Changelog state={state}/>}
 {route.page==='numbers' && <Numbers state={state}/>}
 </main><Footer/></>;
}
