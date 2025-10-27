import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const secret = process.env.AUTH_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const signed = jwt.sign({ sub: token.sub, email: token.email }, secret, { expiresIn: '1h' });

    return NextResponse.json({ token: signed });
  } catch (error) {
    console.error('Token route error:', error);
    return NextResponse.json({ error: 'Failed to get token' }, { status: 500 });
  }
}
