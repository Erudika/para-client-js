import ParaClient, {
  ParaClient as NamedParaClient,
  ParaObject,
  Pager,
  Constraint
} from 'para-client-js';

// The default export and the named export must be the same constructor.
const pc: ParaClient = new ParaClient('app:key', 'secret');
const named: NamedParaClient = new ParaClient('app:key', 'secret', {
  endpoint: 'https://example.com',
  apiPath: '/v1/'
});

// Pager accepts omitted arguments and a boolean `desc`.
const pager = new Pager(1, 'name', false, 10);
const emptyPager = new Pager();
const desc: boolean = pager.desc;

// ParaObject accepts omitted arguments and exposes typed fields.
const obj = new ParaObject('123', 'user');
const emptyObj = new ParaObject();
const id: string | null = obj.getId();
const tags: any[] = obj.getTags();
const appid: string | null = obj.getAppid();
const timestamp: number = obj.getTimestamp();
obj.setTags(['a', 'b']);
obj.setTags(null);

// Constraint helpers are typed.
const required: Constraint = Constraint.required();
const min: Constraint = Constraint.min(1);

export async function promiseStyle(): Promise<void> {
  // Callbacks are optional.
  const created: ParaObject | null = await pc.create(obj);
  const read: ParaObject | null = await pc.read('user', '123');
  const updated: ParaObject | null = await pc.update(obj);
  const list: ParaObject[] = await pc.list('user', pager);
  const query: ParaObject[] = await pc.findQuery('user', 'name:Alice', pager);
  const byId: ParaObject[] | null = await pc.findById('123');
  const count: number = await pc.getCount('user', {});
  const allowed: boolean = await pc.isAllowedTo('*', 'utils/timestamp', 'GET');
  const version: string = await pc.getServerVersion();
  const newId: string = await pc.newId();
  const newTimestamp: number = await pc.getTimestamp();
  const html: string = await pc.markdownToHtml('# title');
  const keys: { accessKey: string; secretKey: string } = await pc.newKeys();
  const types: Record<string, string> = await pc.types();
  const typeCounts: Record<string, number> = await pc.typesCount();
  const signedIn: ParaObject | null = await pc.signIn('password', 'a::b', true);
  const refreshed: boolean = await pc.refreshToken();
  const token: string | null = pc.getAccessToken();

  void [
    created,
    read,
    updated,
    list,
    query,
    byId,
    count,
    allowed,
    version,
    newId,
    newTimestamp,
    html,
    keys,
    types,
    typeCounts,
    signedIn,
    refreshed,
    token,
    named,
    emptyPager,
    desc,
    emptyObj,
    id,
    tags,
    appid,
    timestamp,
    required,
    min
  ];
}

export function callbackStyle(): void {
  // The callback is still accepted as the last argument.
  pc.read('user', '123', (result: ParaObject | null) => {
    void result;
  });
  pc.create(obj, (result: ParaObject | null) => {
    void result;
  });
  // signIn accepts the callback as the third argument or after rememberJWT.
  pc.signIn('password', 'a::b', (result: ParaObject | null) => {
    void result;
  });
  pc.signIn('password', 'a::b', true, (result: ParaObject | null) => {
    void result;
  });
  pc.signOut();
}
