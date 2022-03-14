import { namingFromConfig } from '../../components/naming';

jest.mock('@pulumi/pulumi', () => ({
  Config: jest.fn().mockImplementation(() => ({
    get: (option: string): string | undefined => {
      if (option === 'radical') return 'main';
      if (option === 'suffix') return 'dev';
      return undefined;
    },
    getBoolean: (option: string): boolean | undefined => {
      if (option === 'defaultSuffix') return true;
      return undefined;
    },
  })),
}));

describe('naming from config', () => {
  it('with suffix', () => {
    const name = namingFromConfig();
    expect(name).toBe('main-dev');
  });
});
