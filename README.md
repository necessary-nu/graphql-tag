# graphql-tag for Deno

> **A Deno-native GraphQL tag library** - This is a complete port of [graphql-tag](https://github.com/apollographql/graphql-tag) rebuilt specifically for the Deno runtime.

[![JSR Package](https://jsr.io/badges/@necessary/graphql-tag)](https://jsr.io/@necessary/graphql-tag) 
[![Deno CI](https://github.com/necessary/graphql-tag/actions/workflows/deno.yml/badge.svg)](https://github.com/necessary/graphql-tag/actions/workflows/deno.yml)
![Deno Compatibility](https://img.shields.io/badge/deno-1.x%20%7C%202.x-brightgreen)

## Why Deno?

This library is purpose-built for Deno's modern JavaScript runtime:

- **Zero build step** - TypeScript runs directly, no compilation needed
- **JSR ecosystem** - Uses JavaScript Registry for fast, reliable dependencies  
- **Secure by default** - Explicit permissions model
- **Built-in testing** - No external test frameworks required
- **Integrated tooling** - Formatting, linting, and type-checking included
- **Web standards** - Modern APIs and ES modules throughout

## What's Included

- `gql` A JavaScript template literal tag that parses GraphQL query strings into the standard GraphQL AST.

`graphql-tag` uses [the reference `graphql` library](https://jsr.io/@necessary/graphql) from JSR as a dependency.

## Quick Start

### Option 1: Direct Import (Recommended)

```typescript
import gql from 'jsr:@necessary/graphql-tag@^2.12.6';

const query = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      name
      email
    }
  }
`;
```

### Option 2: Add to deno.json

```json
{
  "imports": {
    "gql": "jsr:@necessary/graphql-tag@^2.12.6"
  }
}
```

Then import:
```typescript
import gql from 'gql';
```

### Option 3: Deno CLI

```bash
deno add @necessary/graphql-tag
```

---

**Note for Node.js users:** This library is Deno-specific. For Node.js projects, use the original [graphql-tag](https://www.npmjs.com/package/graphql-tag) from npm.

### gql

The `gql` template literal tag can be used to concisely write a GraphQL query that is parsed into a standard GraphQL AST. It is the recommended method for passing queries to [Apollo Client](https://github.com/apollographql/apollo-client). While it is primarily built for Apollo Client, it generates a generic GraphQL AST which can be used by any GraphQL client.

```js
import gql from 'graphql-tag';

const query = gql`
  {
    user(id: 5) {
      firstName
      lastName
    }
  }
`
```

The above query now contains the following syntax tree.

```js
{
  "kind": "Document",
  "definitions": [
    {
      "kind": "OperationDefinition",
      "operation": "query",
      "name": null,
      "variableDefinitions": null,
      "directives": [],
      "selectionSet": {
        "kind": "SelectionSet",
        "selections": [
          {
            "kind": "Field",
            "alias": null,
            "name": {
              "kind": "Name",
              "value": "user",
              ...
            }
          }
        ]
      }
    }
  ]
}
```

#### Fragments

The `gql` tag can also be used to define reusable fragments, which can easily be added to queries or other fragments.

```js
import gql from 'graphql-tag';

const userFragment = gql`
  fragment User_user on User {
    firstName
    lastName
  }
`
```

The above `userFragment` document can be embedded in another document using a template literal placeholder.

```js
const query = gql`
  {
    user(id: 5) {
      ...User_user
    }
  }
  ${userFragment}
`
```

**Note:** _While it may seem redundant to have to both embed the `userFragment` variable in the template literal **AND** spread the `...User_user` fragment in the graphQL selection set, this requirement makes static analysis by tools such as `eslint-plugin-graphql` possible._

#### Why use this?

GraphQL strings are the right way to write queries in your code, because they can be statically analyzed using tools like [eslint-plugin-graphql](https://github.com/apollographql/eslint-plugin-graphql). However, strings are inconvenient to manipulate, if you are trying to do things like add extra fields, merge multiple queries together, or other interesting stuff.

That's where this package comes in - it lets you write your queries with [ES2015 template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) and compile them into an AST with the `gql` tag.

#### Caching parse results

This package only has one feature - it caches previous parse results in a simple dictionary. This means that if you call the tag on the same query multiple times, it doesn't waste time parsing it again. It also means you can use `===` to compare queries to check if they are identical.


## Development

This project uses Deno's built-in tooling - no external dependencies needed:

```bash
# Run all tests
deno task test

# Type checking
deno task check

# Auto-format code
deno task fmt

# Lint code
deno task lint

# Full development check
deno task dev
```

### Running Tests
```bash
# All tests
deno test --allow-read src/tests.ts

# With coverage
deno test --allow-read --coverage=coverage src/tests.ts
deno coverage coverage
```

## Differences from Original graphql-tag

This Deno fork removes Node.js and build-tool specific features:

### ❌ Removed Features
- **Webpack loader** (`graphql-tag/loader`) - Not applicable to Deno's module system
- **Build-time preprocessing** - Deno compiles TypeScript directly
- **CommonJS exports** - Uses modern ES modules only
- **Flow type definitions** - Deno uses TypeScript natively

### ✅ Maintained Features  
- **Core `gql` functionality** - Template literal parsing works identically
- **Fragment composition** - Template literal interpolation of fragments
- **Document caching** - Performance optimization through result caching  
- **Fragment warnings** - Duplicate fragment name detection
- **Experimental fragment variables** - Optional feature flag support

## Migration from Node.js

If you're migrating from the original graphql-tag:

```diff
// Before (Node.js)
- import gql from 'graphql-tag';
// After (Deno)  
+ import gql from 'jsr:@necessary/graphql-tag';

// Usage remains the same
const query = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      name
      email
    }
  }
`;
```

### Warnings

This package will emit a warning if you have multiple fragments of the same name. You can disable this with:

```js
import { disableFragmentWarnings } from 'graphql-tag';

disableFragmentWarnings()
```

### Experimental Fragment Variables

This package exports an `experimentalFragmentVariables` flag that allows you to use experimental support for [parameterized fragments](https://github.com/facebook/graphql/issues/204).

You can enable / disable this with:

```js
import { enableExperimentalFragmentVariables, disableExperimentalFragmentVariables } from 'graphql-tag';
```

Enabling this feature allows you to declare documents of the form.

```graphql
fragment SomeFragment ($arg: String!) on SomeType {
  someField
}
```

## Resources

- **[Deno Runtime](https://deno.com/)** - Modern JavaScript runtime
- **[JSR Registry](https://jsr.io/@necessary/graphql-tag)** - This package on JSR  
- **[GraphQL AST Explorer](https://astexplorer.net/#/drYr8X1rnP/1)** - Explore GraphQL ASTs interactively
- **[Original graphql-tag](https://github.com/apollographql/graphql-tag)** - Node.js version (for reference)

## Contributing

This is a Deno-focused port. Contributions welcome! For core GraphQL functionality issues, consider also contributing upstream to [apollographql/graphql-tag](https://github.com/apollographql/graphql-tag).

---

**Built for Deno** - Fast, secure, and modern JavaScript runtime
