import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

function parseAdminEmails(): string[] {
  const raw = import.meta.env.VITE_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user?.email) return false;
  const allowed = parseAdminEmails();
  if (allowed.length === 0) return false;
  return allowed.includes(user.email.toLowerCase());
}

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  if (!isAdminUser(data.user)) {
    await supabase.auth.signOut();
    throw new Error("This account is not authorized for admin access.");
  }
  return data;
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getAdminSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const session = data.session;
  if (session && !isAdminUser(session.user)) {
    await supabase.auth.signOut();
    return null;
  }
  return session;
}

export function onAdminAuthChange(
  callback: (session: Session | null) => void
) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session && !isAdminUser(session.user)) {
      supabase.auth.signOut();
      callback(null);
      return;
    }
    callback(session);
  });
  return subscription;
}
