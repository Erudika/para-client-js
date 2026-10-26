// Examples from the TypeScript section of README.md. Keep them in sync.
import ParaClient from 'para-client-js';
import { ParaClient as NamedParaClient, ParaObject, Pager, Constraint } from 'para-client-js';

// The default export and the named export are the same class.
const first: ParaClient = new ParaClient('ACCESS_KEY', 'SECRET_KEY');
const second: NamedParaClient = new ParaClient('ACCESS_KEY', 'SECRET_KEY');

// Most methods return a promise, so the callback is optional. Results are typed.
const pc = new ParaClient('ACCESS_KEY', 'SECRET_KEY');
const pager = new Pager(1, 'name', true, 10);

export async function example(): Promise<void> {
  const created: ParaObject | null = await pc.create(new ParaObject());
  const user: ParaObject | null = await pc.read('user', '1234');
  const users: ParaObject[] = await pc.list('user', pager);
  const count: number = await pc.getCount('user', {});
  const allowed: boolean = await pc.isAllowedTo('*', 'utils/timestamp', 'GET');

  void [first, second, created, user, users, count, allowed];
}

// ParaObject and Pager constructors accept optional arguments.
// Constraint provides static factory methods.
const obj = new ParaObject('1234', 'user');
const empty = new ParaObject();
const emptyPager = new Pager();
const descending: boolean = emptyPager.desc;
const required: Constraint = Constraint.required();

export { obj, empty, emptyPager, descending, required };

// Browser usage: a blank secret key and signIn().
const browserClient = new ParaClient('ACCESS_KEY', '');

export async function browserSignIn(): Promise<void> {
  const user = await browserClient.signIn('password', '{email}::{password}', true);
  void user;
}
