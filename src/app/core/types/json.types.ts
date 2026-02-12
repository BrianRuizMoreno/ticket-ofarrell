export type JsonPrimitive = string | number | boolean | null;

export type JsonArray = ReadonlyArray<JsonValue>;

export type JsonObject = {
  [key: string]: JsonValue | undefined;
};

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepReadonly<U>>
  : T[K] extends Array<infer U>
  ? ReadonlyArray<DeepReadonly<U>>
  : T[K] extends object
  ? DeepReadonly<T[K]>
  : T[K];
};