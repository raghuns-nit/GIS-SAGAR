import {createClient,type Session} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL as string|undefined;
const publishableKey=import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined;
const configured=!!(url&&publishableKey);
export const authClient=configured?createClient(url!,publishableKey!,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}):null;
export function authConfigured(){return configured;}
export async function pilotSignIn(email:string,password:string){if(!authClient)throw new Error('Pilot sign-in is not configured in this deployment.');const {data,error}=await authClient.auth.signInWithPassword({email,password});if(error)throw new Error(error.message==='Invalid login credentials'?'Email or password is incorrect.':error.message);return data.session as Session;}
export async function pilotSignOut(){await authClient?.auth.signOut();}
export async function pilotSession(){const {data}=await authClient?.auth.getSession()??{data:{session:null}};return data.session;}
