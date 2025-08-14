# graphql-tag (Deno Fork)

> **This is a Deno-compatible fork** of the original [graphql-tag](https://github.com/apollographql/graphql-tag) library, ported to work natively with Deno's modern JavaScript runtime.

[![JSR](https://jsr.io/badges/@necessary/graphql)](https://jsr.io/@necessary/graphql) 
[![Deno CI](https://github.com/necessary/graphql-tag/actions/workflows/deno.yml/badge.svg)](https://github.com/necessary/graphql-tag/actions/workflows/deno.yml)

**Key differences from the original:**
- 🦕 **Deno-native**: No build step required, runs TypeScript directly
- 📦 **JSR dependencies**: Uses JavaScript Registry instead of npm
- 🧪 **Deno testing**: Uses Deno.test with standard library assertions
- 🚀 **Modern tooling**: Built-in formatting, linting, and type checking
- ❌ **No webpack loader**: Removed Node.js/webpack-specific features

Helpful utilities for parsing GraphQL queries in Deno. Includes:

- `gql` A JavaScript template literal tag that parses GraphQL query strings into the standard GraphQL AST.

`graphql-tag` uses [the reference `graphql` library](https://jsr.io/@necessary/graphql) from JSR as a dependency.

## Installation & Usage

### Deno

Import directly from JSR:

```typescript
import gql from 'jsr:@necessary/graphql-tag';
// Or import from a specific version
import gql from 'jsr:@necessary/graphql-tag@^2.12.6';
```

Or add to your `deno.json`:

```json
{
  "imports": {
    "graphql-tag": "jsr:@necessary/graphql-tag@^2.12.6"
  }
}
```

### Node.js/npm Users

For Node.js projects, use the original [graphql-tag](https://www.npmjs.com/package/graphql-tag) from npm.

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


### Development Commands

This Deno fork includes built-in development tasks:

```bash
# Run tests
deno task test

# Type checking
deno task check

# Format code
deno task fmt

# Lint code
deno task lint

# Development workflow (check + test)
deno task dev
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

- [Original graphql-tag](https://github.com/apollographql/graphql-tag) - The Node.js version this fork is based on
- [JSR @necessary/graphql](https://jsr.io/@necessary/graphql) - The Deno-compatible GraphQL library dependency
- [GraphQL AST Explorer](https://astexplorer.net/#/drYr8X1rnP/1) - Explore GraphQL ASTs interactively
- [Deno Documentation](https://docs.deno.com/) - Learn more about the Deno runtime

## Contributing

This is a community-maintained fork focused on Deno compatibility. For general GraphQL-tag features and bug reports that affect the core functionality, please consider contributing to the original [apollographql/graphql-tag](https://github.com/apollographql/graphql-tag) repository.
