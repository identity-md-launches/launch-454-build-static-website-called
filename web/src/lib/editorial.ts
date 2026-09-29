import type { GalleryItem, IssueRecord, Links, StatusState } from '../types';
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const projectSlug = (g: GalleryItem) => g.projectSlug ?? (/heirloom/i.test(g.name ?? '') ? 'heirloom' : /docket/i.test(g.name ?? '') ? 'docket' : /swarmworld/i.test(g.name ?? '') ? 'swarmworld' : slugify(g.name ?? g.id ?? 'project'));
export const openLink = (links: Links = {}, kind?: string) => (kind === 'oracle' ? links.oracle : kind === 'heartbeat' ? links.schedule : null) || links.site || links.launch?.replace('https://api.imd.fun/launches/','https://explorer.imd.fun/launches/') || links.job || links.repo;
export const clean = (s: string) => s.replace(/https?:\/\/\S+/g,'the public record').replace(/\bstructurally\b/gi,'').replace(/\bstructural\b/gi,'file').replace(/\bverifier\b/gi,'checker').replace(/\bquorum\b/gi,'required agreement').replace(/\bmanifest\b/gi,'file list').replace(/\binvariant\b/gi,'rule').replace(/\battestation\b/gi,'answer').replace(/\bCID\b/g,'file address').trim();
const legacy: Record<string, [string,string,string,string,string?]> = {
 'Docket v0.1':['Docket’s token-free launch is still waiting','Docket lets people record agreements without using a token.','An unchanged version was submitted for launch.','parked','The launch tool required a token this project does not have.'],
 'Heirloom website':['Heirloom gets a home on the web','Heirloom lets people leave crypto to others if they stop checking in.','A website was published for the test network version.','published'],
 'Heirloom':['Heirloom’s inheritance vault goes live','Heirloom lets people leave crypto to others if they stop checking in.','The vault was launched on the Sepolia test network.','live'],
 'SIMCARD':['SIMCARD brings agent identities into view','SIMCARD lets people browse IdentityMD agent identities.','A new website was published.','published'],
 'IMDerivatives':['A directory gathers projects around IdentityMD','IMDerivatives helps readers find projects built around IdentityMD.','The independent directory was published.','published'],
 'Ghosts':['Ghosts tells a story of Swarm Pepe','Ghosts is a short film about the Swarm Pepe collection.','The 25-second film was accepted and published.','published'],
 'Pacts':['Pacts brings guilds to a shared map','Pacts is a game where guilds compete for land.','A new build was submitted for review.','accepted','The build passed the recorded work checks.'],
 'SwarmWorld final verification':['SwarmWorld returns for final checks','SwarmWorld is a world for agents to use together.','The existing build was submitted for final checks and a test launch.','accepted','The submitted work passed the recorded checks.'],
 'SwarmWorld Core hardening':['SwarmWorld gets another security review','SwarmWorld is a world for agents to use together.','The existing design was reviewed and hardened.','accepted','The submitted work passed the recorded checks.'],
 'Bitcoin Cooler':['Bitcoin Cooler launches a copied project','Bitcoin Cooler is a token project on a test network.','The published project was copied and launched.','live'],
 'StakeLaunch':['StakeLaunch puts its savings vault on a test network','StakeLaunch lets token holders put tokens into a savings vault.','Its token and vault were launched on Sepolia.','live'],
 'The Room, part 1 of 6':['The Room draws its first working agent','The Room is a picture of agents at desks, drawn by code.','The first room was launched on a test network.','live'],
 'The Room, part 2 of 6':['A second agent joins The Room','The Room is a picture of agents at desks, drawn by code.','A second agent and a seedling were added.','live'],
 'IMD Ember World wallet sign-in review':['A review checks Ember World’s wallet sign-in','This review asks whether players can safely sign in with a wallet.','A report on the sign-in flow was accepted.','accepted','The report passed file checks; its conclusions are not a safety guarantee.'],
 '4626 governance and voter rewards review':['A review checks how 4626 rewards voters','This review examines voting rights and weekly rewards.','The voting and reward rules were reviewed.','accepted','The report passed file checks; its conclusions are not independently confirmed.'],
};
export function editorial(g: GalleryItem): GalleryItem {
  if (g.idea && g.today && g.status) return g;
  const name = g.name ?? 'Untitled project', l = legacy[name];
  let idea = l?.[1] ?? clean(g.asked ?? 'The public description is not exposed.');
  if (g.kind === 'oracle') {
    const q = String(g.extra?.question ?? g.asked ?? name);
    idea = /WETH9/.test(q) ? 'Does wrapped Ether use 18 decimal places?' : /Coinbase/.test(q) ? 'What is the price of one Ether in US dollars on Coinbase?' : /Charizard/.test(q) ? 'What is the listed price of a top-graded Charizard card?' : q.split(' Answer')[0]!.split('\n')[0]!;
  }
  if (g.kind === 'heartbeat') idea = /hour|WETH9/.test(name) ? 'A check asks every hour whether wrapped Ether uses 18 decimal places.' : 'A daily check asks which pool traded the most wrapped Ether.';
  return { ...g, projectSlug:projectSlug(g), headline:g.headline ?? l?.[0] ?? (g.kind === 'oracle' ? 'The network answers another public question' : g.kind === 'heartbeat' ? 'A regular check keeps running' : clean(name).split(/\s+/).slice(0,10).join(' ')), idea:g.idea ?? idea, today:g.today ?? l?.[2] ?? (g.kind === 'oracle' ? 'The question received a public answer.' : g.kind === 'heartbeat' ? 'The scheduled check remained active.' : clean(g.built?.split(/(?<=\.)\s/)[0] ?? 'The recorded work was accepted.')), status:g.status ?? {state:(l?.[3] as StatusState) ?? (g.kind === 'oracle' ? 'published' : 'accepted'),reason:l?.[4] ?? (g.kind === 'heartbeat' ? 'The scheduled check is active.' : 'The submitted work passed the recorded checks.')} };
}
export const issueItems = (r: IssueRecord) => (r.data.items ?? r.data.gallery ?? []).map(g => { const c = r.projects?.flatMap(p=>p.cards ?? []).find(c=>c.id===g.id); return editorial(c ? {...g,...c,extra:{...g.extra,...c.extra}} : g); });
export const category = (g: GalleryItem) => g.kind === 'website' ? 'websites' : g.kind === 'oracle' || g.kind === 'heartbeat' ? 'oracle' : ['image','audio','video'].includes(g.kind ?? '') ? 'media' : /review/i.test(g.kind ?? '') || /review/i.test(g.name ?? '') ? 'reviews' : g.kind === 'report' ? 'reports' : g.kind === 'token' || g.kind === 'launch' ? 'launches' : 'contracts';
export const categories = ['all','websites','contracts','launches','oracle','reviews','reports','media'];
