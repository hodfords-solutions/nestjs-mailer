export interface HbsConfig {
    templateFolder: string;
    templates?: { name: string; path: string }[];
    defaultVariable: Record<string, unknown> | ((...args: unknown[]) => Promise<Record<string, unknown>>);
    helper?: { [_ in string]: (...args: any) => any };
}
