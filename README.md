# Australian Ad Observatory Dashboard

## Developing

Once you've created a project and installed dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production build, run:

```bash
npm run build
```

This will create a static site in the `build` directory that can be deployed to any static site hosting service. To serve the site locally, use `serve`:

```bash
npm install -g serve
serve build
```

# Notes

## Boolean Query

Operators:

| Operator | Example   | Description                       |
| -------- | --------- | --------------------------------- |
| `AND`    | `a AND b` | Both `a` and `b` must be present  |
| `OR`     | `a OR b`  | Either `a` or `b` must be present |
| `NOT`    | `NOT a`   | `a` must not be present           |

Use parentheses to group expressions, e.g.,

`(a AND b) OR c`

`a` and `b` can be a boolean expression, e.g.,

`((MATCH("cats") AND MATCH("dogs")) OR NOT MATCH("birds")) AND BETWEEN_DATES("2024-01-01", "2024-12-31")`

The above query is represented as a tree structure:

```plaintext
AND
├── OR
│   ├── AND
│   │   ├── MATCH("cats")
│   │   └── MATCH("dogs")
│   └── NOT
│       └── MATCH("birds")
└── BETWEEN_DATES("2024-01-01", "2024-12-31")
```

### Data Structure

An operator or function are referred to as a "method" in the query:

```typescript
type Query = {
  method: "string",
  args: Query[] | string[],
}
```

Example query json to search for ads containing "cats":

```json
{
  "method": "MATCH",
  "args": ["cats"]
}
```

Example query json to search for ads containing "cats" and "dogs":

```json
{
  "method": "AND",
  "args": [
    {
      "method": "MATCH",
      "args": ["cats"]
    },
    {
      "method": "MATCH",
      "args": ["dogs"]
    }
  ]
}
```

### Parsing

The query json can be parsed into a tree structure (e.g., a `Query` class in Python):

```python
methods = {}

class Query:
  def __init__(self, method: str, args: list):
    self.method = methods[method]
    self.args = args

  def test(self, value):
    return self.method(self.args, value)

  def from_dict(dict):
    if isinstance(dict, str):
      return dict
    method = dict["method"]
    args = dict["args"]
    if isinstance(args, list):
      args = [Query.from_dict(arg) for arg in args]
    return Query(method, args)

def register(method_name: str, limit_args=-1):
  """Decorator to register a method to be used in the Query class.

  Args:
      method_name (str): The name of the query method.
      limit_args (int, optional): The number of arguments the method expects. Defaults to -1 (no limit).
  """
  def decorator(func):
    def inner(args, value):
      if limit_args != -1 and len(args) != limit_args:
        raise ValueError(f"Method {method_name} expects {limit_args} arguments, got {len(args)}")
      return func(args, value)
    methods[method_name] = inner
    return inner
  return decorator

@register("AND", limit_args=2)
def AND(args: list[Query], value):
  return all(arg.test(value) for arg in args)

@register("OR", limit_args=2)
def OR(args: list[Query], value):
  return any(arg.test(value) for arg in args)

@register("NOT", limit_args=1)
def NOT(args: list[Query], value):
  return not args[0].test(value)

@register("MATCH", limit_args=1)
def MATCH(args: list[str], value):
  return args[0] in value

@register("EXACT MATCH", limit_args=1)
def EXACT_MATCH(args: list[str], value):
  return args[0] == value

if __name__ == "__main__":
  json_query = {
    "method": "AND",
    "args": [
      {
        "method": "MATCH",
        "args": ["cats"]
      },
      {
        "method": "MATCH",
        "args": ["dogs"]
      }
    ]
  }
  query = Query.from_dict(json_query)
  
  complex_query = Query.from_dict({
    "method": "OR",
    "args": [
      {
        "method": "AND",
        "args": [
          {
            "method": "MATCH",
            "args": ["cats"]
          },
          {
            "method": "MATCH",
            "args": ["dogs"]
          }
        ]
      },
      {
        "method": "MATCH",
        "args": ["bird"]
      }
    ]
  })

  print("Simple query: MATCH('cats') AND MATCH('dogs')")
  print(query.test("This string contains cats but not dogs. Actually it does contain dogs."))
  print(query.test("This string contains cats only. And a bird."))
  print("Complex query: (MATCH('cats') AND MATCH('dogs')) OR MATCH('bird')")
  print(complex_query.test("This string contains cats but not dogs. Actually it does contain dogs."))
  print(complex_query.test("This string contains cats only. And a bird."))
```

### Query Builder

The frontend will have two types of query builders:

- Text-based query builder, i.e., a text input where users can type a query string like `MATCH("cats") AND MATCH("dogs")`
- Visual query builder, i.e., a drag-and-drop interface where users can build a query tree (similar to version 1)

Both query builders will generate a query json similar to the examples above.