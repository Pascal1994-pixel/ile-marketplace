'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

const STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta",
"Ebonyi","Edo","Ekiti","Enugu","FCT (Abuja)","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi",
"Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];

export default function PostListing(){
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title:'', type:'Land', size:'', state:'', city:'', price:'',
    doc_type:'Certificate of Occupancy (C of O)', description:'', seller_name:'', seller_phone:''
  });

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      setSession(data.session);
      setChecking(false);
      if (!data.session) router.push('/login');
    });
  },[router]);

  function update(field, value){ setForm(f=>({ ...f, [field]: value })); }

  async function handleSubmit(e){
    e.preventDefault();
    setSaving(true);
    try{
      const imageUrls = [];
      for (const file of files.slice(0,3)){
        const path = `${session.user.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from('listing-images').upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('listing-images').getPublicUrl(path);
        imageUrls.push(pub.publicUrl);
      }

      const { error } = await supabase.from('listings').insert({
        owner_id: session.user.id,
        title: form.title,
        type: form.type,
        size: form.size,
        state: form.state,
        city: form.city,
        price: Number(form.price),
        doc_type: form.doc_type,
        description: form.description,
        images: imageUrls,
        seller_name: form.seller_name,
        seller_phone: form.seller_phone,
        status: 'declared'
      });
      if (error) throw error;

      await supabase.from('profiles').update({ name: form.seller_name, phone: form.seller_phone }).eq('id', session.user.id);

      router.push('/');
    }catch(err){
      alert('Could not publish: ' + err.message);
    }finally{
      setSaving(false);
    }
  }

  if (checking) return <p style={{padding:40}}>Loading…</p>;
  if (!session) return null;

  return (
    <div style={{maxWidth:600, margin:'40px auto', padding:'0 22px 60px'}}>
      <h1 style={{fontSize:'1.6rem', marginBottom:6}}>Post a property</h1>
      <p style={{color:'var(--brass)', background:'var(--brass-tint)', fontSize:'0.8rem', padding:'9px 11px', borderRadius:8, marginBottom:18}}>
        Be accurate about your documents — this is shown to every buyer exactly as you enter it.
      </p>
      <form onSubmit={handleSubmit}>
        <Field label="Title">
          <input required value={form.title} onChange={e=>update('title', e.target.value)} placeholder="e.g. 2 plots of dry land, gated estate" style={inputStyle}/>
        </Field>
        <Row>
          <Field label="Property type">
            <select value={form.type} onChange={e=>update('type', e.target.value)} style={inputStyle}>
              <option>Land</option><option>House</option><option>Apartment</option><option>Commercial</option>
            </select>
          </Field>
          <Field label="Size">
            <input required value={form.size} onChange={e=>update('size', e.target.value)} placeholder="e.g. 500 sqm" style={inputStyle}/>
          </Field>
        </Row>
        <Row>
          <Field label="State">
            <select required value={form.state} onChange={e=>update('state', e.target.value)} style={inputStyle}>
              <option value="">Select state</option>
              {STATES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="City / LGA">
            <input required value={form.city} onChange={e=>update('city', e.target.value)} placeholder="e.g. Epe" style={inputStyle}/>
          </Field>
        </Row>
        <Row>
          <Field label="Price (₦)">
            <input required type="number" min="0" value={form.price} onChange={e=>update('price', e.target.value)} placeholder="15000000" style={inputStyle}/>
          </Field>
          <Field label="Documents you hold">
            <select value={form.doc_type} onChange={e=>update('doc_type', e.target.value)} style={inputStyle}>
              <option>Certificate of Occupancy (C of O)</option>
              <option>Governor's Consent</option>
              <option>Survey Plan / Deed of Assignment</option>
              <option>None yet</option>
            </select>
          </Field>
        </Row>
        <Field label="Description">
          <textarea required rows={3} value={form.description} onChange={e=>update('description', e.target.value)} style={{...inputStyle, resize:'vertical'}}/>
        </Field>
        <Field label="Photos (optional, up to 3)">
          <input type="file" accept="image/*" multiple onChange={e=>setFiles(Array.from(e.target.files).slice(0,3))} />
        </Field>
        <Row>
          <Field label="Your name">
            <input required value={form.seller_name} onChange={e=>update('seller_name', e.target.value)} style={inputStyle}/>
          </Field>
          <Field label="Phone / WhatsApp">
            <input required value={form.seller_phone} onChange={e=>update('seller_phone', e.target.value)} style={inputStyle}/>
          </Field>
        </Row>
        <button type="submit" disabled={saving} style={{width:'100%', padding:13, background:'var(--forest)', color:'#fff', borderRadius:999, fontWeight:600, marginTop:10}}>
          {saving ? 'Publishing…' : 'Publish listing'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }){
  return <div style={{marginBottom:14}}><label style={{display:'block', fontSize:'0.78rem', fontWeight:600, marginBottom:5, color:'var(--ink-soft)'}}>{label}</label>{children}</div>;
}
function Row({ children }){
  return <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>{children}</div>;
}
const inputStyle = { width:'100%', padding:'10px 11px', border:'1px solid var(--line)', borderRadius:8, fontSize:'0.92rem', fontFamily:'Inter,sans-serif' };
