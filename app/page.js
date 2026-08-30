'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

const STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta",
"Ebonyi","Edo","Ekiti","Enugu","FCT (Abuja)","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi",
"Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];

const STATUS_LABEL = { declared:"Docs declared", pending:"Pending review", confirmed:"Confirmed", none:"No docs declared" };

const TYPE_PHOTOS = {
  Land: "https://images.unsplash.com/photo-1747854805840-9be7d5e360e6?fm=jpg&q=80&w=900&auto=format&fit=crop",
  House: "https://images.unsplash.com/photo-1787672358142-95e697dacd81?fm=jpg&q=80&w=900&auto=format&fit=crop",
  Apartment: "https://images.unsplash.com/photo-1768638687896-35bde623d532?fm=jpg&q=80&w=900&auto=format&fit=crop",
  Commercial: "https://images.unsplash.com/photo-1778961419928-2968ddd57c05?fm=jpg&q=80&w=900&auto=format&fit=crop",
};
const CATEGORIES = ["Land","House","Apartment","Commercial"];

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

      <header style={{borderBottom:'1px solid var(--line)', position:'sticky', top:0, background:'rgba(255,255,255,0.92)', backdropFilter:'blur(8px)', zIndex:30}}>
        <div style={{maxWidth:1180, margin:'0 auto', padding:'14px 22px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="18" width="32" height="18" fill="#16A34A"/>
              <path d="M2 20L20 6L38 20" stroke="#0E7A38" strokeWidth="3" strokeLinejoin="round" fill="none"/>
              <rect x="17" y="24" width="6" height="12" fill="#fff"/>
              <circle cx="30" cy="12" r="7" fill="#F5A623"/>
              <path d="M27 12l2 2 4-4" stroke="#14180F" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div style={{fontFamily:'Fraunces,serif', fontWeight:700, fontSize:'1.2rem', color:'var(--forest-dark)'}}>TrustLand</div>
              <div style={{fontSize:'0.62rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink-faint)', marginTop:-2}}>Nigeria · Land &amp; property, state by state</div>
            </div>
          </div>
          {session ? (
            <Link href="/post" style={{background:'var(--forest)', color:'#fff', borderRadius:999, padding:'10px 18px', fontSize:'0.87rem', fontWeight:700, boxShadow:'var(--shadow-sm)'}}>Post a property</Link>
          ) : (
            <Link href="/login" style={{background:'var(--forest)', color:'#fff', borderRadius:999, padding:'10px 18px', fontSize:'0.87rem', fontWeight:700, boxShadow:'var(--shadow-sm)'}}>Sign in to post</Link>
          )}
        </div>
      </header>

      <section style={{
        position:'relative', minHeight:440, display:'flex', alignItems:'flex-end',
        background:`linear-gradient(180deg, rgba(14,20,10,0.25), rgba(10,16,8,0.88)), url(https://images.unsplash.com/photo-1761935554215-e6dc9940550d?fm=jpg&q=90&w=2400&auto=format&fit=crop) center/cover`,
      }}>
        <div style={{maxWidth:1180, margin:'0 auto', padding:'60px 22px 42px', width:'100%'}}>
          <div className="reveal" style={{fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.14em', color:'var(--brass)', fontWeight:700, marginBottom:12}}>Live listings, real accounts</div>
          <h1 className="reveal reveal-delay-1" style={{fontSize:'clamp(2.1rem,4.6vw,3.4rem)', lineHeight:1.05, color:'#fff'}}>
            Buy and sell land <span style={{color:'var(--brass)'}}>you can actually trust</span>, anywhere in Nigeria.
          </h1>
          <p className="reveal reveal-delay-2" style={{fontSize:'1.05rem', color:'rgba(255,255,255,0.85)', marginTop:14, maxWidth:'52ch'}}>
            Browse plots, houses and commercial property by state and LGA — every listing shows exactly what documents the seller declared.
          </p>
          <div className="reveal reveal-delay-3" style={{marginTop:24, background:'rgba(255,255,255,0.96)', borderRadius:'var(--r-lg)', padding:14, display:'grid', gridTemplateColumns:'1.1fr 1fr 1fr auto', gap:10, boxShadow:'var(--shadow-lg)'}}>
            <select value={state} onChange={e=>setState(e.target.value)} style={inputStyle}>
              <option value="">All states</option>
              {STATES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <select value={type} onChange={e=>setType(e.target.value)} style={inputStyle}>
              <option value="">All types</option>
              <option>Land</option><option>House</option><option>Apartment</option><option>Commercial</option>
            </select>
            <input type="number" placeholder="Max price (₦)" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} style={inputStyle}/>
            <button style={{background:'var(--forest)', color:'#fff', borderRadius:999, padding:'10px 20px', fontWeight:700}}>Search</button>
          </div>
        </div>
      </section>

      <section style={{maxWidth:1180, margin:'0 auto', padding:'30px 22px 6px'}}>
        <div style={{display:'flex', gap:16, overflowX:'auto', paddingBottom:6}}>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setType(type===c ? '' : c)}
              style={{
                flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:8, width:96,
                opacity: (!type || type===c) ? 1 : 0.45, transition:'opacity .15s ease'
              }}>
              <div style={{
                width:72, height:72, borderRadius:'50%', overflow:'hidden',
                border: type===c ? '3px solid var(--forest)' : '3px solid var(--line)',
                boxShadow:'var(--shadow-sm)'
              }}>
                <img src={TYPE_PHOTOS[c]} alt={c} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
              </div>
              <span style={{fontSize:'0.8rem', fontWeight:600, color:'var(--ink-soft)'}}>{c}</span>
            </button>
          ))}
        </div>
      </section>

      <section style={{maxWidth:1180, margin:'0 auto', padding:'20px 22px 60px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:20}}>
          <h2 style={{fontSize:'1.7rem'}}>Listings</h2>
          <span style={{fontSize:'0.85rem', color:'var(--ink-soft)'}}>{loading ? 'Loading…' : `${filtered.length} ${filtered.length===1?'listing':'listings'}`}</span>
        </div>

        {!loading && filtered.length === 0 && (
          <div style={{textAlign:'center', padding:'56px 20px', color:'var(--ink-soft)', border:'1.5px dashed var(--line)', borderRadius:'var(--r-md)', background:'var(--surface-sunk)'}}>
            {listings.length===0 ? 'No properties posted yet — be the first to list one.' : 'Nothing matches those filters yet.'}
          </div>
        )}

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(270px,1fr))', gap:22}}>
          {filtered.map((l,i)=>{
            const st = statusOf(l);
            const badgeColors = {
              declared:{bg:'var(--brass-tint)', fg:'#946817'},
              pending:{bg:'var(--blue-tint)', fg:'var(--blue)'},
              confirmed:{bg:'var(--forest-tint)', fg:'var(--forest-dark)'},
              none:{bg:'var(--rust-tint)', fg:'var(--rust)'}
            }[st];
            const img = l.images?.[0] || TYPE_PHOTOS[l.type] || TYPE_PHOTOS.Land;
            return (
              <div key={l.id} className="reveal" style={{animationDelay:`${Math.min(i,8)*0.05}s`, background:'var(--surface)', borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'var(--shadow-md)', transition:'transform .15s ease, box-shadow .15s ease'}}>
                <div style={{ height:190, position:'relative', background:`url(${img}) center/cover` }}>
                  <span style={{position:'absolute', top:12, left:12, background:'rgba(20,24,15,0.6)', color:'#fff', fontSize:'0.68rem', fontWeight:700, padding:'5px 12px', borderRadius:999, textTransform:'uppercase', backdropFilter:'blur(3px)'}}>{l.type}</span>
                  <span style={{position:'absolute', top:12, right:12, background:badgeColors.bg, color:badgeColors.fg, fontSize:'0.68rem', fontWeight:700, padding:'5px 12px', borderRadius:999}}>● {STATUS_LABEL[st]}</span>
                </div>
                <div style={{padding:'16px 18px 18px', display:'flex', flexDirection:'column', gap:6}}>
                  <div style={{fontSize:'0.82rem', color:'var(--ink-soft)'}}>{l.city}, {l.state}</div>
                  <div style={{fontFamily:'Fraunces,serif', fontSize:'1.1rem', fontWeight:700, color:'var(--forest-dark)'}}>{l.title}</div>
                  <div style={{fontSize:'0.82rem', color:'var(--ink-soft)'}}>{l.size}</div>
                  <div className="mono" style={{fontSize:'1.05rem', fontWeight:600, marginTop:4, color:'var(--forest-dark)'}}>{fmtNaira(l.price)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const inputStyle = { padding:'11px 12px', border:'1px solid var(--line)', borderRadius:'var(--r-sm)', background:'#fff', color:'var(--ink)', fontFamily:'Inter,sans-serif', fontSize:'0.92rem' };
