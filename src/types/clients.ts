// Client refers to an application that Auth0 supports
// For the class that we use to talk to the management API, see managementClient.ts
//schema per https://auth0.com/docs/api/management/v2/#!/Clients/get_clients
export interface Auth0Client {
  //there are more fields.
  //this is just a stub for now
  client_id?: string;
  tenant?: string;
  name?: string;
  description?: string;
  global?: string;
}
