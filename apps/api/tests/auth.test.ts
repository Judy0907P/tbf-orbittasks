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

  it('registers a new user', async () => {
    const { user, token } = await registerUser({
      email: 'alice@example.com',
      name: 'Alice',
      password: 'hunter22!',
    });
    expect(user.email).toBe('alice@example.com');
    expect(token).toBeTruthy();
  });

  it('rejects invalid email on register', async () => {
    await expect(
      registerUser({ email: 'no-at-symbol', name: 'A', password: 'hunter22!' }),
    ).rejects.toThrow('invalid email');
  });

  it('rejects short password on register', async () => {
    await expect(
      registerUser({ email: 'a@b.co', name: 'A', password: 'short' }),
    ).rejects.toThrow('too short');
  });

  it('rejects duplicate email on register', async () => {
    await registerUser({ email: 'a@b.co', name: 'A', password: 'hunter22!' });
    await expect(
      registerUser({ email: 'a@b.co', name: 'A2', password: 'hunter22!' }),
    ).rejects.toThrow('already registered');
  });

  it('logs in with valid credentials', async () => {
    await registerUser({
      email: 'bob@example.com',
      name: 'Bob',
      password: 'hunter22!',
    });
    const { user, token } = await loginUser('bob@example.com', 'hunter22!');
    expect(user.email).toBe('bob@example.com');
    const verified = verifyToken(token);
    expect(verified.userId).toBe(user.id);
  });

  it('rejects bad password', async () => {
    await registerUser({
      email: 'carol@example.com',
      name: 'Carol',
      password: 'hunter22!',
    });
    await expect(loginUser('carol@example.com', 'wrong')).rejects.toThrow(
      'invalid credentials',
    );
  });

  it('rejects unknown email at login', async () => {
    await expect(loginUser('nobody@example.com', 'whatever')).rejects.toThrow(
      'invalid credentials',
    );
  });

  it('verifyToken returns userId and role for a valid token', async () => {
    const { user, token } = await registerUser({
      email: 'dave@example.com',
      name: 'Dave',
      password: 'hunter22!',
    });
    const verified = verifyToken(token);
    expect(verified.userId).toBe(user.id);
    expect(verified.role).toBe(user.role);
  });

  it('rejects invalid token in verifyToken', () => {
    expect(() => verifyToken('not-a-real-token')).toThrow();
  });

  it('getUserById returns the user without passwordHash', async () => {
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

  it('getUserById returns undefined when missing', () => {
    expect(getUserById(999)).toBeUndefined();
  });
});
