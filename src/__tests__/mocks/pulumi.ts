import * as pulumi from '@pulumi/pulumi';

export const pulumiRuntimeMocks = {
  newResource: function (args: pulumi.runtime.MockResourceArgs): {
    id: string;
    state: any;
  } {
    return {
      id: args.name, // deterministic naming
      state: args.inputs,
    };
  },
  call: function (args: pulumi.runtime.MockCallArgs) {
    return args.inputs;
  },
};
