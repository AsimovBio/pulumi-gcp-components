import * as pulumi from '@pulumi/pulumi';

import { naming } from '../../components/naming';

jest.mock('@pulumi/pulumi');
Object.defineProperty(pulumi, 'getProject', {
  value: jest.fn().mockReturnValue('infra'),
});
Object.defineProperty(pulumi, 'getStack', {
  value: jest.fn().mockReturnValue('sandbox'),
});

describe('with radical and without resource name', () => {
  it('with suffix and with defaultSuffix', () => {
    const name = naming({
      radical: 'main',
      suffix: 'dev',
      defaultSuffix: true,
    });
    expect(name).toBe('main-dev');
  });

  it('with suffix and without defaultSuffix', () => {
    const name = naming({ radical: 'main', suffix: 'dev' });
    expect(name).toBe('main-dev');
  });

  it('without suffix and with defaultSuffix', () => {
    const name = naming({ radical: 'main', defaultSuffix: true });
    expect(name).toBe('main-sandbox');
  });

  it('without suffix and without defaultSuffix', () => {
    const name = naming({ radical: 'main' });
    expect(name).toBe('main');
  });
});

describe('without radical and without resource name', () => {
  it('with suffix and with defaultSuffix', () => {
    const name = naming({ suffix: 'dev', defaultSuffix: true });
    expect(name).toBe('infra-dev');
  });

  it('with suffix and without defaultSuffix', () => {
    const name = naming({ suffix: 'dev' });
    expect(name).toBe('infra-dev');
  });

  it('without suffix and with defaultSuffix', () => {
    const name = naming({ defaultSuffix: true });
    expect(name).toBe('infra-sandbox');
  });

  it('without suffix and without defaultSuffix', () => {
    const name = naming({});
    expect(name).toBe('infra');
  });
});

describe('with radical and with resource name', () => {
  it('with suffix and with defaultSuffix', () => {
    const name = naming(
      { radical: 'main', suffix: 'dev', defaultSuffix: true },
      'log-sink'
    );
    expect(name).toBe('main-log-sink-dev');
  });

  it('with suffix and without defaultSuffix', () => {
    const name = naming({ radical: 'main', suffix: 'dev' }, 'log-sink');
    expect(name).toBe('main-log-sink-dev');
  });

  it('without suffix and with defaultSuffix', () => {
    const name = naming({ radical: 'main', defaultSuffix: true }, 'log-sink');
    expect(name).toBe('main-log-sink-sandbox');
  });

  it('without suffix and without defaultSuffix', () => {
    const name = naming({ radical: 'main' }, 'log-sink');
    expect(name).toBe('main-log-sink');
  });
});

describe('without radical and with resource name', () => {
  it('with suffix and with defaultSuffix', () => {
    const name = naming({ suffix: 'dev', defaultSuffix: true }, 'log-sink');
    expect(name).toBe('infra-log-sink-dev');
  });

  it('with suffix and without defaultSuffix', () => {
    const name = naming({ suffix: 'dev' }, 'log-sink');
    expect(name).toBe('infra-log-sink-dev');
  });

  it('without suffix and with defaultSuffix', () => {
    const name = naming({ defaultSuffix: true }, 'log-sink');
    expect(name).toBe('infra-log-sink-sandbox');
  });

  it('without suffix and without defaultSuffix', () => {
    const name = naming({}, 'log-sink');
    expect(name).toBe('infra-log-sink');
  });
});
