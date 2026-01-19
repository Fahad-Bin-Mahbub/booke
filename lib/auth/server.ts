import jwt from "jsonwebtoken";

export type AuthUser = { user_id: number };

type JwtPayloadShape = {
  user: AuthUser;
  iat?: number;
  exp?: number;
};

const JWT_SECRET = process.env.JWT_SECRET || "75655";

export function getAuthUser(req: Request):
  | { ok: true; user: AuthUser }
  | { ok: false; status: number; message: string } {
  const token = req.headers.get("x-auth-token");
  if (!token) {
    return { ok: false, status: 401, message: "No token, authorization denied" };
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadShape;
    if (!decoded?.user?.user_id) {
      return { ok: false, status: 401, message: "Token is not valid" };
    }
    return { ok: true, user: { user_id: Number(decoded.user.user_id) } };
  } catch {
    return { ok: false, status: 401, message: "Token is not valid" };
  }
}

export function issueToken(user_id: number): string {
  const payload: JwtPayloadShape = { user: { user_id } };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "72h" });
}
