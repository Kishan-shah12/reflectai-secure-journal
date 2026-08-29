import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebaseAdmin';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
  requestId?: string;
}

/**
 * Authentication Middleware:
 * Extracts and verifies the Firebase ID Token from the Authorization header.
 * Derives the canonical UID from the verified token.
 * Never trusts client-supplied user IDs in request bodies or query parameters.
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: 'Authentication required.',
      details: 'Missing Authorization header.'
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1].trim()) {
    res.status(401).json({
      error: 'Authentication required.',
      details: 'Malformed Authorization header format. Expected Bearer <token>.'
    });
    return;
  }

  const idToken = parts[1].trim();

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    if (!decodedToken.uid) {
      res.status(401).json({
        error: 'Authentication required.',
        details: 'Token payload missing user identifier.'
      });
      return;
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error: any) {
    // Determine token error type safely without leaking raw stack trace
    let message = 'Invalid or expired authentication token.';
    if (error.code === 'auth/id-token-expired') {
      message = 'Authentication token has expired. Please refresh your session.';
    } else if (error.code === 'auth/argument-error') {
      message = 'Invalid token structure.';
    }

    res.status(401).json({
      error: 'Authentication required.',
      details: message
    });
  }
}
