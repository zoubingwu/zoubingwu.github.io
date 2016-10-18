---
layout: post
title:  "Javascript中操作数组的一些常用方法总结"
image: ''
date:   2016-10-18 23:28:11
tags:
- Array
description: ''
categories:
- Javascript
serie: learn



---



### 从头部或尾部添加或删除元素

------

- #### pop()

  删除一个数组中的最后的一个元素，并且返回这个元素。

  **pop()**方法删除掉数组中的最后一个元素，并且把这个元素返回。

  注意原数组此时已经被改动，返回的元素保持着原有的类型，并不会存放在一个数组中，不要和后面的方法混淆了。

  ```javascript
  var a = [1, 2, 3, 4, 5];
  var b = a.pop();
  console.log(a); // a = [1, 2, 3, 4];
  console.log(b); // b = 5; typeof b = number;
  ```

- #### push()

  **push()**方法可以添加一个或多个元素到数组的尾部，并返回新的数组的长度。

  需要添加的元素直接作为参数，用逗号隔开。

  ```javascript
  var a = ["a", "b", "c"];
  var b = a.push(1, 2, 3);
  console.log(a); //a = ["a", "b", "c", 1, 2, 3];
  console.log(b); //b = 6;
  ```

- #### shift()

  **shift()**方法删除数组的首个元素，并返回这个元素。该方法会改变数组的长度。

  如果数组为空的话，会返回`undefined`.

  ```javascript
  var a = [];
  var b = [1, 2, 3];
  var c = a.shift();
  var d = b.shift();
  console.log(a); // a = []
  console.log(b); // b = [1, 2]
  console.log(c); // c = undefined
  console.log(d); // d = 1
  ```

- #### unshit()

  **unshift()** 方法在数组的开头添加一个或者多个元素，并返回数组新的 length 值。

  类似于push()方法，只是位置在数组的开头。

  ```javascript
  var a = ["a", "b", "c"];
  var b = a.unshift(1, 2, 3);
  console.log(a); //a = [1, 2, 3, "a", "b", "c"];
  console.log(b); //b = 6;
  ```

### 数组元素的拼接或合并

------

- #### join()

  将数组中的所有元素连接成一个字符串。

  有一个可选参数，即指定每个元素的分隔符，如果省略的话默认是一个逗号，为空字符串则所有元素直接连接。

  ```javascript
  var a = ['Wind', 'Rain', 'Fire'];
  var myVar1 = a.join();      // myVar1的值变为"Wind,Rain,Fire"
  var myVar2 = a.join(', ');  // myVar2的值变为"Wind, Rain, Fire"
  var myVar3 = a.join(' + '); // myVar3的值变为"Wind + Rain + Fire"
  var myVar4 = a.join('');    // myVar4的值变为"WindRainFire"
  var myVar5 = a.join(' ');   // myVar5为"Wind Rain Fire"
  ```

- #### concat()

  将传入的数组或非数组值与原数组合并，组成一个新的数组并返回。参数即为需要合并的数组或者非数组。

  返回的是一个新的数组，原数组没有被修改。

  ```javascript
  var alpha = ["a", "b", "c"];
  var numeric = [1, 2, 3];

  // 组成新数组 ["a", "b", "c", 1, 2, 3]; 原数组 alpha 和 numeric 未被修改
  var alphaNumeric = alpha.concat(numeric);
  ```

- #### reduce()

  接收一个函数作为累加器（accumulator），数组中的每个值（从左到右）开始合并，最终为一个值。这个方法提供了两个参数，第一个为一个函数，确定了如何对数组中的元素操作，第二个为初次调用这个函数时的首个参数，即一个初始值。

  在这个回调函数中又有四个参数，即上次调用的返回值或者提供的初始值，数组中的当前被操作元素，当前被操作元素的索引，调用reduce方法的数组。

  `callback` 执行数组中每个值的函数，包含四个参数

  - `previousValue`

    上一次调用回调返回的值，或者是提供的初始值（initialValue）

  - `currentValue`

    数组中当前被处理的元素

  - `index`

    当前元素在数组中的索引

  - `array`

    调用 `reduce` 的数组

  `initialValue` 作为第一次调用 callback 的第一个参数。

  这个方法相当于把从数组中的第一个元素开始（如果你有提供初始元素就从提供的初始元素开始），不断的和下一个元素进行合并，再把合并的值与下下一个元素合并，一直到最后仅返回一个元素。例如：

  ```javascript
  [0,1,2,3,4].reduce(function(previousValue, currentValue, index, array){
    return previousValue + currentValue;
  });
  ```

  在回调函数中确定了相加的操作，因此数组会从第一个元素0开始，和第二个元素1相加获得1后，又与第三个元素2相加，获得的值再不断重复这一操作，最后返回的结果为10。

  如果传入一个初始值，比如：

  ```javascript
  [0,1,2,3,4].reduce(function(previousValue, currentValue, index, array){
    return previousValue + currentValue;
  }, 10);
  ```

  那么就把10作为第一个元素，与0相加后获得的值再与1相加，不断重复，最后返回值为20.

  **注意**：如果数组为空并且没有提供initialValue， 会抛出[`TypeError`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypeError) 。如果数组仅有一个元素（无论位置如何）并且没有提供initialValue， 或者有提供initialValue但是数组为空，那么此唯一值将被返回并且callback不会被执行。

  再来一个例子，二维数组变为一维数组：

  ```javascript
  var flattened = [[0, 1], [2, 3], [4, 5]].reduce(function(a, b) {
      return a.concat(b);
  });
  // flattened is [0, 1, 2, 3, 4, 5]
  ```


- #### reduceRight()

  和reduce()方法一样，只是执行的顺序变成了从右到左，即从数组的最后一个元素开始。

### 数组元素的位置调换或剪切

------
- #### sort()

  对数组的元素做原地的排序，并返回这个数组。 sort 排序可能是不稳定的。默认按照字符串的Unicode码位点（code point）排序。有一个可选的参数，用来指定按某种顺序进行排列的函数。如果省略，元素按照转换为的字符串的诸个字符的Unicode位点进行排序。

  注意如果没有设置参数，那么数字排序时会先被转换为字符串，比如：

  ```javascript
  var scores = [1, 10, 2, 21]; 
  scores.sort(); // [1, 10, 2, 21]
  ```

  此时因为数字都先被转换为了字符串，10的Unicode位点顺序在2之前，所以10在2的前面。因此如果需要正确排序的话就需要设置参数。而数组会按照函数参数的返回值来排序，例如需要比较的两个元素为a和b，那么返回值大于零时，b会排在a之前，返回值小于零时，a会排在b之前。格式如下：

  ```javascript
  function compare(a, b) {
    if (a is less than b by some ordering criterion) {
      return -1; // a会放在b的前面
    }
    if (a is greater than b by the ordering criterion) {
      return 1;  // b会放在a的前面
    }
    // a must be equal to b
    return 0;  //a和b的位置不变
  }
  ```

  假设一个数字数组，要将数组升序排列，思路为`if (a > b) return 1; if (a < b) return -1;`，这样就可以简单的按如下写为：

  ```javascript
  var numbers = [4, 2, 5, 1, 3];
  numbers.sort(function(a, b) {
    return a - b;
  });
  console.log(numbers);  // [1, 2, 3, 4, 5]
  ```

- #### reverse()

  颠倒数组中元素的位置。第一个元素会成为最后一个，最后一个会成为第一个。返回这个数组的引用。

  这个方法直接修改了原数组。

  ```javascript
  var myArray = ['one', 'two', 'three'];
  myArray.reverse(); 

  console.log(myArray) // ['three', 'two', 'one']
  ```

- #### slice()

  浅复制（shallow copy）数组的一部分到一个新的数组，并返回这个新数组。

  包含了两个参数，即开始的索引值和结束的索引值，注意包含了开始索引的值而不包含结束索引的值。当值为负数的时候表示从尾部开始数起。

  slice()不修改原数组而会返回一个新数组，注意如果元素如果是对象引用（不是实例对象）那么拷贝过去有着相同的引用，如果被引用的对象发生改变，则新的和原数组中的都会改变。

  ```javascript
  var fruits = ["banana", "orange", "lemon", "apple", "mango"];
  var a = fruits.slice(1, 3); //["orange", "lemon"]
  var b = fruits.slice(-2); //["apple", "mango"]
  var c = fruits.slice(-2, -1) //["apple"]
  ```


- #### splice()

  用新元素替换旧元素，以此修改数组的内容。

  由被删除的元素组成的一个数组。如果只删除了一个元素，则返回只包含一个元素的数组。如果没有删除元素，则返回空数组。

  **注意**，splice() 方法与 slice() 方法的作用是不同的，splice() 方法会直接对数组进行修改。

  包含了三个参数：

  - `start​`

    从数组的哪一位开始修改内容。如果超出了数组的长度，则从数组末尾开始添加内容；如果是负值，则表示从数组末位开始的第几位。

  - `deleteCount`

    整数，表示要移除的数组元素的个数。如果 `deleteCount` 是 0，则不移除元素。这种情况下，至少应添加一个新元素。如果 `deleteCount `大于`start` 之后的元素的总数，则从 `start` 后面的元素都将被删除（含第 `start` 位）。

  - `item*N*`

    要添加进数组的元素。如果不指定，则 `splice()` 只删除数组元素。

  ```javascript
  var myFish = ["angel", "clown", "mandarin", "surgeon"];

  //从第 2 位开始删除 0 个元素，插入 "drum"
  var removed = myFish.splice(2, 0, "drum");
  //运算后的 myFish:["angel", "clown", "drum", "mandarin", "surgeon"]
  //被删除元素数组：[]，没有元素被删除

  //从第 3 位开始删除 1 个元素
  removed = myFish.splice(3, 1);
  //运算后的myFish：["angel", "clown", "drum", "surgeon"]
  //被删除元素数组：["mandarin"]

  //从第 2 位开始删除 1 个元素，然后插入 "trumpet"
  removed = myFish.splice(2, 1, "trumpet");
  //运算后的myFish: ["angel", "clown", "trumpet", "surgeon"]
  //被删除元素数组：["drum"]

  //从第 0 位开始删除 2 个元素，然后插入 "parrot", "anemone" 和 "blue"
  removed = myFish.splice(0, 2, "parrot", "anemone", "blue");
  //运算后的myFish：["parrot", "anemone", "blue", "trumpet", "surgeon"]
  //被删除元素的数组：["angel", "clown"]

  //从第 3 位开始删除 2 个元素
  removed = myFish.splice(3, Number.MAX_VALUE);
  //运算后的myFish: ["parrot", "anemone", "blue"]
  //被删除元素的数组：["trumpet", "surgeon"]
  ```


- #### map()

  对组中的每个元素，按照参数设置的回调函数操作后的返回值组成一个新的数组。

  `callback` 函数会被自动传入三个参数：数组元素，元素索引，原数组本身。

  例如，求数组中每个数的平方根：

  ```javascript
  var numbers = [1, 4, 9];
  var roots = numbers.map(Math.sqrt);
  /* roots的值为[1, 2, 3], numbers的值仍为[1, 4, 9] */
  ```