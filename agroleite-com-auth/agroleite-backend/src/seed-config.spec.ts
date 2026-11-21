describe('admin bootstrap config', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.ADMIN_SEED;
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should stay disabled when ADMIN_SEED is not explicitly enabled', () => {
    const enabled = process.env.ADMIN_SEED?.toLowerCase() === 'true';
    expect(enabled).toBe(false);
  });

  it('should fail when ADMIN_SEED is true but email or password is missing', () => {
    process.env.ADMIN_SEED = 'true';
    process.env.ADMIN_EMAIL = '';
    process.env.ADMIN_PASSWORD = '';

    const email = process.env.ADMIN_EMAIL?.trim();
    const password = process.env.ADMIN_PASSWORD?.trim();
    const seedEnabled = process.env.ADMIN_SEED?.toLowerCase() === 'true';

    expect(seedEnabled).toBe(true);
    expect(Boolean(email && password)).toBe(false);
  });

  it('should allow explicit admin bootstrap values', () => {
    process.env.ADMIN_SEED = 'true';
    process.env.ADMIN_EMAIL = 'admin@empresa.com';
    process.env.ADMIN_PASSWORD = 'SenhaForte123!';

    const email = process.env.ADMIN_EMAIL?.trim();
    const password = process.env.ADMIN_PASSWORD?.trim();
    const seedEnabled = process.env.ADMIN_SEED?.toLowerCase() === 'true';

    expect(seedEnabled).toBe(true);
    expect(email).toBe('admin@empresa.com');
    expect(password).toBe('SenhaForte123!');
  });
});
