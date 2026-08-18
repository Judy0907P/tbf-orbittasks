import {
  registerUser,
  loginUser,
  verifyToken,
  getUserById,
} from '../src/services/auth.service';
import { db } from '../src/db/client';

describe('auth service', () => {
  beforeEach(() => {
    db.reset();
  });

  describe('registerUser', () => {
    it('registers a new user and returns a token', async () => {
      const { user, token } = await registerUser({
        email: 'alice@example.com',
        name: 'Alice',
        password: 'hunter22!',
      });
      expect(user.email).toBe('alice@example.com');
      expect(user.name).toBe('Alice');
      expect(user.role).toBe('member');
      expect(user).not.toHaveProperty('passwordHash');
      expect(token).toBeTruthy();
    });

    it('rejects invalid email', async () => {
      await expect(
        registerUser({ email: 'no-at-symbol', name: 'A', password: 'hunter22!' }),
      ).rejects.toThrow('invalid email');
    });

    it('rejects too-short password', async () => {
      await expect(
        registerUser({ email: 'a@b.co', name: 'A', password: 'short' }),
      ).rejects.toThrow('password too short');
    });

    it('rejects duplicate email', async () => {
      await registerUser({ email: 'a@b.co', name: 'A', password: 'hunter22!' });
      await expect(
        registerUser({ email: 'a@b.co', name: 'A2', password: 'hunter22!' }),
      ).rejects.toThrow('email already registered');
    });
  });

  describe('loginUser', () => {
    it('logs in with valid credentials', async () => {
      await registerUser({
        email: 'bob@example.com',
        name: 'Bob',
        password: 'hunter22!',
      });
      const { user, token } = await loginUser('bob@example.com', 'hunter22!');
      expect(user.email).toBe('bob@example.com');
      expect(user).not.toHaveProperty('passwordHash');
      expect(token).toBeTruthy();
    });

    it('rejects wrong password', async () => {
      await registerUser({
        email: 'carol@example.com',
        name: 'Carol',
        password: 'hunter22!',
      });
      await expect(loginUser('carol@example.com', 'wrong')).rejects.toThrow(
        'invalid credentials',
      );
    });

    it('rejects unknown email', async () => {
      await expect(loginUser('nobody@example.com', 'whatever')).rejects.toThrow(
        'invalid credentials',
      );
    });
  });

  describe('verifyToken', () => {
    it('returns userId and role for a valid token', async () => {
      const { user, token } = await registerUser({
        email: 'dave@example.com',
        name: 'Dave',
        password: 'hunter22!',
      });
      expect(verifyToken(token)).toEqual({ userId: user.id, role: user.role });
    });

    it('throws for an invalid token', () => {
      expect(() => verifyToken('not-a-real-token')).toThrow();
    });
  });

  describe('getUserById', () => {
    it('returns the user without passwordHash when found', async () => {
      const { user } = await registerUser({
        email: 'eve@example.com',
        name: 'Eve',
        password: 'hunter22!',
      });
      const found = getUserById(user.id);
      expect(found).toEqual({
        id: user.id,
        email: 'eve@example.com',
        name: 'Eve',
        role: 'member',
      });
      expect(found).not.toHaveProperty('passwordHash');
    });

    it('returns undefined when not found', () => {
      expect(getUserById(999)).toBeUndefined();
    });
  });
});
