import { supabase } from './supabase.js';
import { flash } from './utils.js';

export let currentUser = null;

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function initAuth({ onAuthenticated, onSignedOut }) {
  async function showApp(user) {
    currentUser = user;
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('bottom-nav').style.display = 'flex';
    document.getElementById('logout-btn').style.display = 'block';
    await onAuthenticated(user);
  }

  async function hideApp() {
    currentUser = null;
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('bottom-nav').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('main').innerHTML = '';
    document.getElementById('subtabs').innerHTML = '';
    if (onSignedOut) await onSignedOut();
  }

  document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('auth-msg');
    msg.textContent = '';
    try {
      await signIn(
        document.getElementById('auth-email').value.trim(),
        document.getElementById('auth-password').value
      );
    } catch (err) {
      msg.textContent = err.message;
    }
  });

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await signOut();
    flash('Déconnecté');
  });

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) showApp(session.user);
    else hideApp();
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) showApp(session.user);
    else if (event === 'SIGNED_OUT') hideApp();
  });
}
