import ParaClient, { ParaObject, Pager, Constraint } from './index.js';

// Expose the helper classes on the global constructor for browser users.
ParaClient.ParaObject = ParaObject;
ParaClient.Pager = Pager;
ParaClient.Constraint = Constraint;

export default ParaClient;
