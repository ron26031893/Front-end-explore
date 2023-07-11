实现可迭代协议的对象就可以放到`for...of`循环中遍历了

**可迭代协议（Iteratable）**

1. 对象内部有一个Symbol.iterator的属性，该属性指向一个迭代器的工厂函数

**迭代器协议（Iterator）**

1. 实现next方法，该方法返回一个IteratorResult对象
   - IteratorResult对象包含一个done属性和一个value属性
     - done，表示是否可以再次执行next方法
     - value，表示本次执行next方法所得到的值
2. 实现return方法，该方法用于提前中断迭代

````javascript
//按照协议内容实现的简易Array类
function MyArray(){
    this.length = 0;
    this.push = (value)=>{
        this[this.length++] = value 
    }
    this.pop = (value) =>{
        this[--this.length] = undefined
    }
    this[Symbol.iterator] = ()=>{
        let length = -1;
        let thisArg = this;
        return {
            next(){
                if(++length<thisArg.length){
                    return {done:false, value:thisArg[length]}
                }else{
                    return {done:true, value:undefined}
                }
            },
            return(){
                console.log('exit early')
                return {done:true}
            }
        }
    }
}

const myArr = new MyArray();
myArr.push(1);
myArr.push(2);
for(let value of myArr){
    console.log(value)
}
//1 
//2

for(let value of myArr){
	console.log(value);
    break;
}
//1
//exit early
````

````javascript
//看到书上有个Array的迭代器不会关闭的例子，尝试写了一个
//本质上是多用了一个闭包来保存状态
function MyArray(){
    this.length = 0;
    this.push = (value)=>{
        this[this.length++] = value 
    }
    this.pop = (value) =>{
        this[--this.length] = undefined
    }
    this[Symbol.iterator] = ()=>{
        let length = -1;
        let thisArg = this;
        return {
            next(){
                if(++length<thisArg.length){
                    return {done:false, value:thisArg[length]}
                }else{
                    return {done:true, value:undefined}
                }
            },
            return(){
                console.log('exit early')
                return {done:true}
            },
            [Symbol.iterator](){
                let thisArg = this;
                return {
                    next:thisArg.next,
                    return(){
						console.log('iterator\'s iterator exit early')
                        return {done:true}
                    }
                }
            }
        }
    }
}

const myArr = new MyArray();

myArr.push(1);
myArr.push(2);

const iter = myArr[Symbol.iterator]();
for(let value of iter){
    console.log(value);
    break;
}
//1
//iterator's iterator exit early
for(let value of iter){
    console.log(value);
}
//2
````

