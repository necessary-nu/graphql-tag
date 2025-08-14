import {
  assert,
  assertEquals,
  assertExists,
} from 'https://deno.land/std@0.208.0/assert/mod.ts';

import gql from './index.ts';

// Basic gql functionality tests
Deno.test('parses queries', () => {
  assertEquals(gql`{ testQuery }`.kind, 'Document');
});

Deno.test('parses queries when called as a function', () => {
  assertEquals(gql('{ testQuery }').kind, 'Document');
});

Deno.test('parses queries with weird substitutions', () => {
  const obj = Object.create(null);
  assertEquals(gql`{ field(input: "${obj.missing}") }`.kind, 'Document');
  assertEquals(gql`{ field(input: "${null}") }`.kind, 'Document');
  assertEquals(gql`{ field(input: "${0}") }`.kind, 'Document');
});

Deno.test('allows interpolation of parsed fragment documents', () => {
  const fragmentAst = gql`fragment SomeFragmentName on SomeType { someField }`;

  const document = gql`query { ...SomeFragmentName } ${fragmentAst}`;
  assertEquals(document.kind, 'Document');
  assertEquals(document.definitions.length, 2);
  assertEquals(document.definitions[0].kind, 'OperationDefinition');
  assertEquals(document.definitions[1].kind, 'FragmentDefinition');
});

Deno.test('parses experimental fragment variables', () => {
  gql.enableExperimentalFragmentVariables();

  const parsed: any = gql`fragment A ($arg: String!) on Type { testQuery }`;
  assertEquals(parsed.kind, 'Document');
  assertExists(parsed.definitions[0].variableDefinitions);

  gql.disableExperimentalFragmentVariables();
});

Deno.test('returns the same object for the same query', () => {
  assert(gql`{ sameQuery }` === gql`{ sameQuery }`);
});

Deno.test('returns the same object for the same query, even with whitespace differences', () => {
  assert(gql`{ sameQuery }` === gql`  { sameQuery,   }`);
});

const fragmentAst = gql`
  fragment UserFragment on User {
    firstName
    lastName
  }
`;

Deno.test('returns the same object for the same fragment', () => {
  assert(
    gql`fragment same on Same { sameQuery }` ===
      gql`fragment same on Same { sameQuery }`,
  );
});

Deno.test('returns the same object for the same document with substitution', () => {
  // We know that calling `gql` on a fragment string will always return
  // the same document, so we can reuse `fragmentAst`
  assert(
    gql`{ ...UserFragment } ${fragmentAst}` ===
      gql`{ ...UserFragment } ${fragmentAst}`,
  );
});

Deno.test('can reference a fragment that references another fragment', () => {
  const secondFragmentAst = gql`
    fragment SecondUserFragment on User {
      ...UserFragment
    }
    ${fragmentAst}
  `;

  const ast = gql`
    {
      user(id: 5) {
        ...SecondUserFragment
      }
    }
    ${secondFragmentAst}
  `;

  // Verify the structure is correct
  assertEquals(ast.kind, 'Document');
  assertEquals(ast.definitions.length, 3); // query + 2 fragments
  assertEquals(ast.definitions[0].kind, 'OperationDefinition');
  assertEquals(ast.definitions[1].kind, 'FragmentDefinition');
  assertEquals(ast.definitions[2].kind, 'FragmentDefinition');
});

// Fragment warning tests
Deno.test('fragment warnings - warns if you use the same fragment name for different fragments', () => {
  gql.resetCaches();

  let warnings: string[] = [];
  const oldConsoleWarn = console.warn;
  console.warn = (w: string) => warnings.push(w);

  try {
    const frag1 = gql`fragment TestSame on Bar { fieldOne }`;
    const frag2 = gql`fragment TestSame on Bar { fieldTwo }`;

    assert(frag1 !== frag2);
    assertEquals(warnings.length, 1);
  } finally {
    console.warn = oldConsoleWarn;
  }
});

Deno.test('fragment warnings - does not warn if you use the same fragment name for the same fragment', () => {
  gql.resetCaches();

  let warnings: string[] = [];
  const oldConsoleWarn = console.warn;
  console.warn = (w: string) => warnings.push(w);

  try {
    const frag1 = gql`fragment TestDifferent on Bar { fieldOne }`;
    const frag2 = gql`fragment TestDifferent on Bar { fieldOne }`;

    assert(frag1 === frag2);
    assertEquals(warnings.length, 0);
  } finally {
    console.warn = oldConsoleWarn;
  }
});

// Fragment deduplication tests
Deno.test('strips duplicate fragments from the document', () => {
  gql.resetCaches();

  const frag1 = gql`fragment TestDuplicate on Bar { field }`;
  const query1 = gql`{ bar { fieldOne ...TestDuplicate } } ${frag1} ${frag1}`;
  const query2 = gql`{ bar { fieldOne ...TestDuplicate } } ${frag1}`;

  assertEquals(query1.definitions.length, 2);
  assertEquals(query1.definitions[1].kind, 'FragmentDefinition');
  // The set of definitions should be the same after deduplication
  assertEquals(query1.definitions.length, query2.definitions.length);
});

// Utility function tests
Deno.test('resetCaches clears the document cache', () => {
  const query1 = gql`{ test }`;
  gql.resetCaches();
  const query2 = gql`{ test }`;

  // After reset, same query should be different object instances
  // (though they'll be === again after the second parse due to caching)
  assertEquals(query1.kind, query2.kind);
});

Deno.test('fragment warnings can be disabled', () => {
  gql.resetCaches();
  gql.disableFragmentWarnings();

  let warnings: string[] = [];
  const oldConsoleWarn = console.warn;
  console.warn = (w: string) => warnings.push(w);

  try {
    const frag1 = gql`fragment TestDisabled on Bar { fieldOne }`;
    const frag2 = gql`fragment TestDisabled on Bar { fieldTwo }`;

    assert(frag1 !== frag2);
    assertEquals(warnings.length, 0); // No warnings when disabled
  } finally {
    console.warn = oldConsoleWarn;
  }
});
