// CommonJS TypeScript consumer. This file must resolve the `require` types
// condition in package.json, not the ESM declarations.
import { ParaClient, ParaObject, Pager } from 'para-client-js';
import DefaultParaClient from 'para-client-js';
import pkg = require('para-client-js');

const pc: ParaClient = new ParaClient('ACCESS_KEY', 'SECRET_KEY');
const defaultPc: DefaultParaClient = new DefaultParaClient('ACCESS_KEY', 'SECRET_KEY');
const requiredPc: pkg.ParaClient = new pkg.ParaClient('ACCESS_KEY', 'SECRET_KEY');
const obj: ParaObject = new ParaObject('1234', 'user');
const pager: Pager = new Pager();

async function example(): Promise<void> {
  const user: ParaObject | null = await pc.read('user', '1234');
  const users: ParaObject[] = await pc.list('user', pager);
  void [user, users, defaultPc, requiredPc, obj];
}

void example;
