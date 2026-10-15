import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { ClinicApp } from "@/components/ClinicApp";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "VidaSaúde | Agenda médica" },
    { name: "description", content: "Agenda médica para organizar consultas, pacientes e retornos do consultório." },
    { property: "og:title", content: "VidaSaúde | Agenda médica" },
    { property: "og:description", content: "Organize consultas, pacientes e retornos do consultório em um só lugar." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Index,
});

function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setReady(true); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); setReady(true); });
    return () => subscription.unsubscribe();
  }, []);
  if (!ready) return <div className="min-h-screen grid place-items-center text-primary"><HeartPulse className="size-10 animate-pulse" aria-label="Carregando" /></div>;
  return user ? <ClinicApp user={user} /> : <SignIn />;
}

function SignIn() {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    const result = register ? await supabase.auth.signUp({ email: email.trim(), password }) : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else if (register && !result.data.session) setMessage("Enviamos um link de confirmação para o seu e-mail.");
  }
  async function google() {
    setBusy(true); setMessage("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) setMessage(result.error.message);
    setBusy(false);
  }
  return <main className="min-h-screen grid lg:grid-cols-2 bg-card">
    <div className="hidden lg:flex bg-sidebar text-sidebar-foreground flex-col justify-between p-16 relative overflow-hidden">
      <div className="flex items-center gap-3 text-2xl font-extrabold"><HeartPulse className="size-11 text-primary" /> VidaSaúde</div>
      <div><span className="text-sidebar-muted text-sm font-semibold uppercase">Gestão do consultório</span><h1 className="mt-6 max-w-xl text-5xl font-bold leading-tight">Mais cuidado em cada encontro.</h1><p className="mt-6 max-w-md text-sidebar-muted text-lg">Sua agenda, seus pacientes e cada consulta em um só lugar.</p></div>
      <p className="text-sidebar-muted text-sm">VidaSaúde · Clínica Médica</p>
    </div>
    <div className="flex items-center justify-center p-6"><div className="w-full max-w-sm">
      <div className="lg:hidden flex items-center gap-2 text-xl font-extrabold text-primary mb-12"><HeartPulse /> VidaSaúde</div>
      <p className="text-primary font-semibold text-sm mb-3">BEM-VINDO À VIDASAÚDE</p><h2 className="text-3xl font-bold">{register ? "Criar sua conta" : "Acesse seu consultório"}</h2><p className="text-muted-foreground mt-2 mb-8">{register ? "Comece a organizar sua agenda." : "Entre para acompanhar sua agenda de consultas."}</p>
      <form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold">E-mail<input className="field mt-2" type="email" required maxLength={255} value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" /></label><label className="block text-sm font-semibold">Senha<input className="field mt-2" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" /></label><Button disabled={busy} className="w-full h-11">{busy ? "Aguarde..." : register ? "Criar conta" : "Entrar"}</Button></form>
      <div className="flex items-center gap-3 my-6 text-muted-foreground text-xs"><span className="h-px bg-border flex-1" />OU<span className="h-px bg-border flex-1" /></div>
      <Button variant="outline" className="w-full h-11" onClick={google} disabled={busy}>Continuar com Google</Button>
      {message && <p role="alert" className="mt-5 text-sm text-primary">{message}</p>}
      <p className="text-center text-sm text-muted-foreground mt-8">{register ? "Já tem uma conta?" : "Ainda não tem uma conta?"} <Button variant="link" className="px-1" onClick={() => { setRegister(!register); setMessage(""); }}>{register ? "Entrar" : "Criar conta"}</Button></p>
    </div></div>
  </main>;
}