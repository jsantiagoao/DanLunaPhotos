/**
 * Una sola ejecución en curso por clave (patrón "single flight", el `exhaustMap` de RxJS).
 *
 * Para acciones que no se deben repetir mientras la primera sigue en camino, como
 * descargar una foto: los clics de más se ignoran en lugar de encolarse.
 */
export class SingleFlight {
  private readonly pending = new Set<string>();

  isPending(key: string): boolean {
    return this.pending.has(key);
  }

  async run(key: string, task: () => Promise<void>): Promise<void> {
    if (this.pending.has(key)) return;
    this.pending.add(key);
    try {
      await task();
    } finally {
      this.pending.delete(key);
    }
  }
}
