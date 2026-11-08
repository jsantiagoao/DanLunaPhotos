import { SingleFlight } from './single-flight';

describe('SingleFlight', () => {
  it('should_ignore_repeated_runs_while_the_first_is_pending', async () => {
    const flight = new SingleFlight();
    let finish!: () => void;
    const task = jest.fn(() => new Promise<void>((r) => (finish = r)));

    const first = flight.run('a', task);
    void flight.run('a', task);
    void flight.run('a', task);
    expect(task).toHaveBeenCalledTimes(1);
    expect(flight.isPending('a')).toBe(true);

    finish();
    await first;
    expect(flight.isPending('a')).toBe(false);
  });

  it('should_allow_a_new_run_once_the_previous_finished', async () => {
    const flight = new SingleFlight();
    const task = jest.fn(() => Promise.resolve());
    await flight.run('a', task);
    await flight.run('a', task);
    expect(task).toHaveBeenCalledTimes(2);
  });

  it('should_release_the_key_when_the_task_fails', async () => {
    const flight = new SingleFlight();
    await expect(flight.run('a', () => Promise.reject(new Error('x')))).rejects.toThrow('x');
    expect(flight.isPending('a')).toBe(false);
  });

  it('should_run_different_keys_in_parallel', () => {
    const flight = new SingleFlight();
    const task = jest.fn(() => new Promise<void>(() => undefined));
    void flight.run('a', task);
    void flight.run('b', task);
    expect(task).toHaveBeenCalledTimes(2);
  });
});
