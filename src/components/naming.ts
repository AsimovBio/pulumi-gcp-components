import * as pulumi from '@pulumi/pulumi';

interface NamingArgs {
    radical?: string;
    suffix?: string;
    defaultSuffix?: boolean;
}

interface BaseNameArgs {
    radical: string;
    suffix?: string;
}

interface ResourceNameArgs extends BaseNameArgs {
    resourceName?: string;
}

interface NamingFunction {
    (resourceName?: string): string;
}

const config = new pulumi.Config('naming');
const options = {
    radical: config.get('radical'),
    suffix: config.get('suffix'),
    defaultSuffix: config.getBoolean('defaultSuffix'),
};

function makeBaseName(args: NamingArgs): BaseNameArgs {
    const radical = args.radical || pulumi.getProject();

    if (args.suffix) return { radical, suffix: args.suffix };
    if (args.defaultSuffix) return { radical, suffix: pulumi.getStack() };
    return { radical };
}

function makeResourceName(args: ResourceNameArgs): string {
    let name = args.radical;
    if (args.resourceName) name += `-${args.resourceName}`;
    if (args.suffix) name += `-${args.suffix}`;
    return name;
}

export function naming(args: NamingArgs, resourceName?: string): string {
    const baseName = makeBaseName(args);

    return makeResourceName({ ...baseName, resourceName });
}

export function namingFromConfig(resourceName?: string): string {
    return naming(options, resourceName);
}

export function createNaming(args: NamingArgs): NamingFunction {
    return (resourceName?: string): string => naming(args, resourceName);
}

export default namingFromConfig;