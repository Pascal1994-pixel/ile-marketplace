'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Login(){
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e){
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div style={{maxWidth:420, margin:'80px auto', padding:'0 22px'}}>
      <h1 style={{fontSize:'1.6rem', marginBottom:10}}>Sign in to TrustLand Nigeria</h1>
      <p style={{color:'var(--ink-soft)', fontSize:'0.92rem', marginBottom:20}}>
        No password needed — we'll email you a one-time link.
      </p>
      {sent ? (
        <div style={{background:'var(--forest-tint)', color:'var(--forest-dark)', padding:14, borderRadius:10, fontSize:'0.9rem'}}>
          Check your email for a sign-in link.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email" required placeholder="you@example.com" value={email}
            onChange={e=>setEmail(e.target.value)}
            style={{width:'100%', padding:'11px 12px', border:'1px solid var(--line)', borderRadius:8, fontSize:'0.95rem', marginBottom:12}}
          />
          {error && <p style={{color:'var(--rust)', fontSize:'0.85rem'}}>{error}</p>}
          <button type="submit" style={{width:'100%', padding:13, background:'var(--forest)', color:'#fff', borderRadius:999, fontWeight:600}}>
            Send sign-in link
          </button>
        </form>
      )}
    </div>
  );
}
