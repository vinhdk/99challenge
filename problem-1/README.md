# 99 Challenge

## Problem 1:

### Description:

Provide 3 unique implementations of the following function in JavaScript.

**Input**: `n` - any integer

*Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`*.

**Output**: `return` - summation to `n`, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.

```js
var sum_to_n_a = function(n) {
    // your code here
};

var sum_to_n_b = function(n) {
    // your code here
};

var sum_to_n_c = function(n) {
    // your code here
};
```
### Answer:

```js
//#region Loop -> Often use (For, Foreach, Reduce, While,...)
// FOR
var sum_to_n_a = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};
// WHILE
var sum_to_n_a = function(n) {
    let sum = 0;
    let i = 1;
    while (i <= n) {
        sum += i;
        i++;
    }
    return sum;
};
//#endregion

// RECURSIVE
var sum_to_n_b = function(n) {
    if (n === 0) return 0;
    return n + sum_to_n_b(n - 1);
};


// MATH
var sum_to_n_c = function(n) {
    return (n * (n + 1)) / 2;
};
```
