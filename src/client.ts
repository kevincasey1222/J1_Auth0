const ManagementClient = require('auth0').ManagementClient;

import { IntegrationProviderAuthenticationError } from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './config';
import { Auth0ManagementClient } from './types/managementClient';

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

// Providers often supply types with their API libraries.

type AcmeUser = {
  id: string;
  name: string;
};

type AcmeGroup = {
  id: string;
  name: string;
  users?: Pick<AcmeUser, 'id'>[];
};

/**
 * An APIClient maintains authentication state and provides an interface to
 * third party data APIs.
 *
 * It is recommended that integrations wrap provider data APIs to provide a
 * place to handle error responses and implement common patterns for iterating
 * resources.
 */
export class APIClient {
  managementClient: any;
  constructor(readonly config: IntegrationConfig) {}

  public async verifyAuthentication(): Promise<void> {
    //retrieves a token automatically and applies it to subsequent requests
    //token expiration is configured on the auth0 site; default is 24 hours
    const management: Auth0ManagementClient = new ManagementClient({
      domain: this.config.domain,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      scope: 'read:users', //scopes also have to be authorized on the auth0 site
    });

    //limit the reply since we're just validating
    const params = {
      per_page: 1,
      page: 0,
    };

    //todo: get ride of this reply. dont need it
    let reply;

    try {
      reply = await management.getUsers(params);
    } catch (err) {
      throw new IntegrationProviderAuthenticationError({
        cause: err,
        endpoint: this.config.domain,
        status: err.status,
        statusText: err.statusText,
      });
    }
    console.log(reply);
  }

  /**
   * Iterates each user resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateUsers(
    iteratee: ResourceIteratee<AcmeUser>,
  ): Promise<void> {
    // TODO paginate an endpoint, invoke the iteratee with each record in the
    // page
    //
    // The provider API will hopefully support pagination. Functions like this
    // should maintain pagination state, and for each page, for each record in
    // the page, invoke the `ResourceIteratee`. This will encourage a pattern
    // where each resource is processed and dropped from memory.

    const users: AcmeUser[] = [
      {
        id: 'acme-user-1',
        name: 'User One',
      },
      {
        id: 'acme-user-2',
        name: 'User Two',
      },
    ];

    for (const user of users) {
      await iteratee(user);
    }
  }

  /**
   * Iterates each group resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateGroups(
    iteratee: ResourceIteratee<AcmeGroup>,
  ): Promise<void> {
    // TODO paginate an endpoint, invoke the iteratee with each record in the
    // page
    //
    // The provider API will hopefully support pagination. Functions like this
    // should maintain pagination state, and for each page, for each record in
    // the page, invoke the `ResourceIteratee`. This will encourage a pattern
    // where each resource is processed and dropped from memory.

    const groups: AcmeGroup[] = [
      {
        id: 'acme-group-1',
        name: 'Group One',
        users: [
          {
            id: 'acme-user-1',
          },
        ],
      },
    ];

    for (const group of groups) {
      await iteratee(group);
    }
  }
}

export function createAPIClient(config: IntegrationConfig): APIClient {
  return new APIClient(config);
}
