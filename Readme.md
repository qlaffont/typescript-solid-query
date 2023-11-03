# typescript-solid-query

Solid Query Generator for @graphql-codegen.

Package used to wait a PR who need to be merged : [https://github.com/dotansimha/graphql-code-generator-community/pull/474](https://github.com/dotansimha/graphql-code-generator-community/pull/474)

## How to use

```bash
npm i typescript-solid-query
# OR
pnpm i typescript-solid-query
```

```yaml
overwrite: true
schema: ${GQL_URL}
documents: "src/services/**/*.gql"
generates:
  src/services/api/generated/graphql.ts:
    plugins:
      - "typescript-solid-query" # YOU CAN NOW ADD THIS PLUGIN

```
