export function* map<F, T>(iterable: Iterable<F>, map: (value: F, index: number) => T): Iterable<T> {
    let index = 0;
    for (const item of iterable) yield map(item, index++);
}

export function* flatMap<F, T>(iterable: Iterable<F>, map: (value: F, index: number) => T[]): Iterable<T> {
    let index = 0;
    for (const item of iterable) yield* map(item, index++);
}
