'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

const STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta",
"Ebonyi","Edo","Ekiti","Enugu","FCT (Abuja)","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi",
"Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];

const TYPE_COLORS = { Land:"#2F5233", House:"#8a6a3a", Apartment:"#3f5f8a", Commercial:"#6b4a63" };
const STATUS_LABEL = { declared:"Docs declared", pending:"Pending review", confirmed:"Confirmed", none:"No docs declared" };

function statusOf(l){
  if (l.status === 'confirmed') return 'confirmed';
  if (l.status === 'pending') return 'pending';
  if (l.doc_type && l.doc_type !== 'None yet') return 'declared';
  return 'none';
}
function fmtNaira(n){ return '₦' + Number(n).toLocaleString('en-NG'); }

export default function Home(){
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [state, setState] = useState('');
  const [type, setType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess)=>setSession(sess));
    fetchListings();
    return ()=>sub.subscription.unsubscribe();
  },[]);

  async function fetchListings(){
    setLoading(true);
    const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending:false });
    if (!error) setListings(data || []);
    setLoading(false);
  }

  const filtered = useMemo(()=>listings.filter(l=>{
    if (state && l.state !== state) return false;
    if (type && l.type !== type) return false;
    if (maxPrice && Number(l.price) > Number(maxPrice)) return false;
    return true;
  }), [listings, state, type, maxPrice]);

  return (
    <div>
      <div style={{background:'var(--forest-dark)', color:'var(--brass-tint)', fontSize:'0.78rem', padding:'9px 22px', textAlign:'center'}}>
        <strong style={{color:'#fff'}}>Before you pay:</strong> documents shown here are seller-declared or reviewer-confirmed within this app only — always verify at your State Land Registry or with a lawyer.
      </div>

      <header style={{borderBottom:'1px solid var(--line)', position:'sticky', top:0, background:'rgba(250,248,242,0.9)', backdropFilter:'blur(8px)', zIndex:30}}>
        <div style={{maxWidth:1180, margin:'0 auto', padding:'14px 22px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="18" width="32" height="18" fill="#2F5233"/>
              <path d="M2 20L20 6L38 20" stroke="#1F3A24" strokeWidth="3" strokeLinejoin="round" fill="none"/>
              <rect x="17" y="24" width="6" height="12" fill="#FAF8F2"/>
              <circle cx="30" cy="12" r="7" fill="#B08D57"/>
              <path d="M27 12l2 2 4-4" stroke="#1E231A" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div style={{fontFamily:'Fraunces,serif', fontWeight:700, fontSize:'1.2rem', color:'var(--forest-dark)'}}>Ilẹ̀</div>
              <div style={{fontSize:'0.62rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-faint)', marginTop:-2}}>Land &amp; property, state by state</div>
            </div>
          </div>
          <div style={{display:'flex', gap:10, alignItems:'center'}}>
            {session ? (
              <Link href="/post" style={{background:'var(--forest)', color:'#fff', borderRadius:999, padding:'10px 18px', fontSize:'0.87rem', fontWeight:600}}>Post a property</Link>
            ) : (
              <Link href="/login" style={{background:'var(--forest)', color:'#fff', borderRadius:999, padding:'10px 18px', fontSize:'0.87rem', fontWeight:600}}>Sign in to post</Link>
            )}
          </div>
        </div>
      </header>

      <section style={{padding:'64px 22px 46px', position:'relative', overflow:'hidden'}}>
        <div className="blob" style={{top:-120, right:-120, width:420, height:420, background:'radial-gradient(circle, rgba(176,141,87,0.18), transparent 70%)'}} />
        <div className="blob" style={{bottom:-160, left:-140, width:380, height:380, background:'radial-gradient(circle, rgba(47,82,51,0.12), transparent 70%)', animationDelay:'2s'}} />
        <div style={{maxWidth:1180, margin:'0 auto', display:'grid', gridTemplateColumns:'1.25fr 0.85fr', gap:44, alignItems:'center', position:'relative'}}>
          <div className="reveal">
            <div style={{fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--brass)', fontWeight:700, marginBottom:12}}>Live listings, real accounts</div>
            <h1 style={{fontSize:'clamp(2.1rem,4.4vw,3.2rem)', lineHeight:1.05}}>
              Buy and sell land <span style={{color:'var(--brass)'}}>you can actually trust</span>, anywhere in Nigeria.
            </h1>
            <p style={{fontSize:'1.05rem', color:'var(--ink-soft)', marginTop:16, maxWidth:'48ch'}}>
              Browse plots, houses and commercial property by state and LGA. Every listing shows exactly what documents the seller declared.
            </p>
            <div className="reveal reveal-delay-1" style={{marginTop:26, background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'var(--r-lg)', padding:14, display:'grid', gridTemplateColumns:'1.1fr 1fr 1fr auto', gap:10, boxShadow:'var(--shadow-md)'}}>
              <select value={state} onChange={e=>setState(e.target.value)} style={inputStyle}>
                <option value="">All states</option>
                {STATES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <select value={type} onChange={e=>setType(e.target.value)} style={inputStyle}>
                <option value="">All types</option>
                <option>Land</option><option>House</option><option>Apartment</option><option>Commercial</option>
              </select>
              <input type="number" placeholder="Max price (₦)" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} style={inputStyle}/>
              <button style={{background:'var(--forest)', color:'#fff', borderRadius:999, padding:'10px 18px', fontWeight:600}}>Search</button>
            </div>
          </div>
          <svg className="reveal reveal-delay-2" style={{width:'100%', maxWidth:260, justifySelf:'center'}} viewBox="0 0 220 220">
            <defs><path id="stamp-arc" d="M 30,110 A 80,80 0 1 1 190,110" fill="none"/></defs>
            <g style={{transformOrigin:'110px 110px', animation:'ringSpin 40s linear infinite'}}>
              <circle cx="110" cy="110" r="95" fill="none" stroke="#B08D57" strokeWidth="2" strokeDasharray="3 4"/>
            </g>
            <circle cx="110" cy="110" r="78" fill="none" stroke="#B08D57" strokeWidth="2"/>
            <text fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="#B08D57" letterSpacing="3">
              <textPath href="#stamp-arc" startOffset="2%">DOCUMENTS DECLARED · ASK BEFORE YOU PAY ·</textPath>
            </text>
            <path d="M78 112l20 20 44-46" stroke="#2F5233" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round"
              style={{strokeDasharray:60, strokeDashoffset:60, animation:'drawCheck 1s ease forwards .6s'}}/>
          </svg>
        </div>
      </section>

      <section style={{maxWidth:1180, margin:'0 auto', padding:'20px 22px 60px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:20}}>
          <h2 style={{fontSize:'1.6rem'}}>Listings</h2>
          <span style={{fontSize:'0.85rem', color:'var(--ink-soft)'}}>{loading ? 'Loading…' : `${filtered.length} ${filtered.length===1?'listing':'listings'}`}</span>
        </div>

        {!loading && filtered.length === 0 && (
          <div style={{textAlign:'center', padding:'56px 20px', color:'var(--ink-soft)', border:'1.5px dashed var(--line)', borderRadius:'var(--r-md)', background:'var(--surface)'}}>
            {listings.length===0 ? 'No properties posted yet — be the first to list one.' : 'Nothing matches those filters yet.'}
          </div>
        )}

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(255px,1fr))', gap:18}}>
          {filtered.map((l,i)=>{
            const st = statusOf(l);
            const badgeColors = {
              declared:{bg:'var(--brass-tint)', fg:'#8a6a3a'},
              pending:{bg:'var(--blue-tint)', fg:'var(--blue)'},
              confirmed:{bg:'var(--forest-tint)', fg:'var(--forest-dark)'},
              none:{bg:'var(--rust-tint)', fg:'var(--rust)'}
            }[st];
            return (
              <div key={l.id} className="reveal" style={{animationDelay:`${Math.min(i,8)*0.05}s`, background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'var(--r-md)', overflow:'hidden', boxShadow:'var(--shadow-sm)'}}>
                <div style={{
                  height:140, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff',
                  fontFamily:'Fraunces,serif', fontSize:'0.9rem',
                  background: l.images?.[0] ? `url(${l.images[0]}) center/cover` : (TYPE_COLORS[l.type] || '#2F5233')
                }}>
                  <span style={{position:'absolute', top:10, left:10, background:'rgba(30,35,26,0.55)', color:'#fff', fontSize:'0.68rem', fontWeight:600, padding:'4px 10px', borderRadius:999, textTransform:'uppercase'}}>{l.type}</span>
                  {!l.images?.[0] && l.type}
                </div>
                <div style={{padding:'14px 16px 16px', display:'flex', flexDirection:'column', gap:6}}>
                  <div style={{fontSize:'0.82rem', color:'var(--ink-soft)'}}>{l.city}, {l.state}</div>
                  <div style={{fontFamily:'Fraunces,serif', fontSize:'1.04rem', fontWeight:600, color:'var(--forest-dark)'}}>{l.title}</div>
                  <div style={{fontSize:'0.82rem', color:'var(--ink-soft)'}}>{l.size}</div>
                  <div className="mono" style={{fontSize:'1rem', marginTop:2}}>{fmtNaira(l.price)}</div>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8}}>
                    <span style={{background:badgeColors.bg, color:badgeColors.fg, fontSize:'0.68rem', fontWeight:700, padding:'4px 10px', borderRadius:999}}>● {STATUS_LABEL[st]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const inputStyle = { padding:'10px 11px', border:'1px solid var(--line)', borderRadius:'var(--r-sm)', background:'var(--surface)', color:'var(--ink)', fontFamily:'Inter,sans-serif', fontSize:'0.92rem' };
