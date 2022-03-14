import { namingFromConfig } from '../../components/naming';

jest.mock('@pulumi/pulumi', () => ({
  Config: jest.fn().mockImplementation(() => ({
    get: (option: string): string | undefined => {
      if (option === 'radical') return 'main';
      return undefined;
    },
    getBoolean: (option: string): boolean | undefined => {
      if (option === 'defaultSuffix') return true;
      return undefined;
    },
  })),
  getStack: jest.fn().mockReturnValue('sandbox'),
}));

describe('naming from config', () => {
  it('with defaultSuffix', () => {
    const name = namingFromConfig();
    expect(name).toBe('main-sandbox');
  });
});
