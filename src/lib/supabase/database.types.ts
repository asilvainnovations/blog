// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;

// Helper type for table rows
export type Tables<T extends string> = Record<string, unknown>;
export type Inserts<T extends string> = Record<string, unknown>;
export type Updates<T extends string> = Record<string, unknown>;
