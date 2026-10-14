import { NextResponse, type NextRequest } from 'next/server';
import { authActive, clientAuth, estAdmin } from './lib/supabase-auth';

// Routes /admin protégées par la session Supabase Auth.
// Le middleware rafraîchit aussi la session (cookies) à chaque requête admin.
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const connexion = req.nextUrl.pathname === '/admin/login';

  if (!authActive()) {
    return connexion ? res : NextResponse.redirect(new URL('/admin/login', req.url));
  }

  const supabase = clientAuth({
    getAll: () => req.cookies.getAll(),
    setAll: (liste) => {
      for (const { name, value } of liste) req.cookies.set(name, value);
      res = NextResponse.next({ request: req });
      for (const { name, value, options } of liste) res.cookies.set(name, value, options);
    },
  });
  const {
    data: { user: compte },
  } = await supabase.auth.getUser();
  const user = estAdmin(compte) ? compte : null;

  if (!user && !connexion) {
    const url = new URL('/admin/login', req.url);
    return NextResponse.redirect(url);
  }
  if (user && connexion) return NextResponse.redirect(new URL('/admin', req.url));
  return res;
}

export const config = { matcher: ['/admin', '/admin/:path*'] };
