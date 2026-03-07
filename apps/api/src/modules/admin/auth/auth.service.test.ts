import { describe, expect, it, vi } from 'vitest';
import { hashSync } from 'bcryptjs';
import { AdminAuthService } from './auth.service';

function createRepositoryMock() {
  return {
    findByEmail: vi.fn(),
    findById: vi.fn(),
  };
}

function createJwtServiceMock() {
  return {
    signAsync: vi.fn(),
  };
}

describe('AdminAuthService', () => {
  it('issues token when credentials are valid', async () => {
    const repository = createRepositoryMock();
    const jwtService = createJwtServiceMock();
    const service = new AdminAuthService(repository as never, jwtService as never);

    repository.findByEmail.mockResolvedValue({
      id: 1,
      email: 'admin@example.com',
      name: 'MVP Admin',
      role: 'SUPER_ADMIN',
      passwordHash: hashSync('admin1234!', 10),
    });

    jwtService.signAsync.mockResolvedValue('test-token');

    const result = await service.login({
      email: 'admin@example.com',
      password: 'admin1234!',
    });

    expect(result).toEqual({
      accessToken: 'test-token',
      admin: {
        id: 1,
        email: 'admin@example.com',
        name: 'MVP Admin',
        role: 'SUPER_ADMIN',
      },
    });
  });

  it('throws INVALID_CREDENTIALS when admin does not exist', async () => {
    const repository = createRepositoryMock();
    const jwtService = createJwtServiceMock();
    const service = new AdminAuthService(repository as never, jwtService as never);

    repository.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'admin1234!',
      }),
    ).rejects.toMatchObject({
      response: {
        code: 'INVALID_CREDENTIALS',
      },
    });
  });

  it('throws INVALID_TOKEN when user in token is not found', async () => {
    const repository = createRepositoryMock();
    const jwtService = createJwtServiceMock();
    const service = new AdminAuthService(repository as never, jwtService as never);

    repository.findById.mockResolvedValue(null);

    await expect(
      service.me({
        sub: 999,
        email: 'admin@example.com',
        role: 'SUPER_ADMIN',
      }),
    ).rejects.toMatchObject({
      response: {
        code: 'INVALID_TOKEN',
      },
    });
  });
});
