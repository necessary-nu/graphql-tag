/**
 * @fileoverview GraphQL tag library for parsing GraphQL queries into AST documents
 *
 * This module provides the `gql` template literal tag and related utilities for
 * parsing GraphQL query strings into standard GraphQL AST documents.
 */

// Re-export all the main functionality
export {
  disableExperimentalFragmentVariables,
  disableFragmentWarnings,
  enableExperimentalFragmentVariables,
  gql,
  resetCaches,
} from './src/index.ts';

// Re-export the default export
export { default } from './src/index.ts';

// Re-export common GraphQL types that users might need
export type {
  DefinitionNode,
  DocumentNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
} from 'graphql';
