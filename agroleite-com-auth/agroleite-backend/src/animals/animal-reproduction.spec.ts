import { applyCalvingTransition, applyMovementTransition, validateAnimalState } from './animal-reproduction';

describe('animal reproduction rules', () => {
  it('blocks a heifer from becoming lactating', () => {
    expect(() => validateAnimalState('heifer', 'lactation')).toThrow(
      'Uma novilha não pode estar em lactação.',
    );
  });

  it('allows a cow to become lactating', () => {
    expect(() => validateAnimalState('cow', 'lactation')).not.toThrow();
  });

  it('promotes a heifer to cow and sets lactation after calving', () => {
    expect(applyCalvingTransition('heifer', new Date('2026-11-01T00:00:00.000Z'))).toEqual({
      category: 'cow',
      status: 'lactation',
      lastCalving: new Date('2026-11-01T00:00:00.000Z'),
    });
  });

  it.each([
    ['drying', { status: 'dry' }],
    ['coverage', { status: 'pregnant' }],
    ['pregnancy_diagnosis', { status: 'pregnant' }],
    ['sale', { status: 'sold' }],
    ['death', { status: 'dead' }],
  ] as const)('applies the %s movement transition', (type, expected) => {
    expect(applyMovementTransition(type, 'lactation', new Date('2026-11-01'))).toMatchObject(expected);
  });

  it('keeps birth separate from calving', () => {
    expect(applyMovementTransition('birth', 'lactation', new Date('2026-11-01'))).toMatchObject({
      category: 'heifer',
      status: 'dry',
      birthDate: new Date('2026-11-01'),
    });
  });

  it('does not allow movement after death', () => {
    expect(() => applyMovementTransition('drying', 'dead', new Date('2026-11-01'))).toThrow(
      'Não é possível registrar movimentações para um animal morto.',
    );
  });
});
