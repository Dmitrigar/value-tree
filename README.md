# Value Tree example

This is example of parsing and rendering tree data.

It takes array of path-value pairs as shown below.
  ```
  [
    { path: '0:alpha', value: 'one' },
    { path: '1:beta/0:gamma', value: 'two' }
  ]
  ```

It parses path-value pairs to the corresponding value tree.
  ```
  {
    name: 'root',
    children: [
      {
        name: 'alpha',
        value: 'one'
      },
      {
        name: 'beta',
        children: [
          {
            name: 'gamma',
            value: 'two'
          }
        ]
      }
    ]
  }
  ```

It renders obtained value tree to HTML with some interactive features:
  - click node's name to toggle it's path visibility
  - click node's value to edit it's value
  

## Browser support

This example is meant to support as many browsers as possible so it uses vanilla javascript.

## Running example

  - Clone repository to your local computer.

  - Run following command from project root directory:

    ```
    npm start
    ```

  - Go to http://localhost:3000

## Running tests

  - Run following command from project root directory
    ```
    npm test
    ```
