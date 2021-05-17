class Observer{
    constructor(data){
        this.data = data;
        this.observer(this.data);//执行数据劫持（设置get,set）方法；
    }
    /**核心方法 */
    observer(obj){
        if(!obj || typeof obj !=='object'){//只有obj存在并且为对象时候才劫持
            return;
        }
        let keys = Object.keys(obj);
        keys.forEach((key)=>{//循环劫持obj的key
            this.defineReactive(obj,key,obj[key]);
            this.observer(obj[key]); //如果key对于的值为obj则递归深度劫持；
        })
    }
    defineReactive(obj,key,value){//定义数据劫持方法（定义响应式）
        let dep = new Dep();
        let that = this;
        Object.defineProperty(obj,key,{
            configurable:true,
            enumerable:true,
            get:function(){ 
                Dep.target && dep.addSub(Dep.target);
                return value;
            },
            set:function(newValue){
                if(value !== newValue){
                    that.observer(newValue);//在设置属性值时，如果设置的值是一个对象那么继续劫持该对象
                    value = newValue;
                    dep.notify();
                }
            }
        })
    }

    /**普通方法 */
}

class Dep{
    constructor(){
        this.subs = [];
    }
    addSub(watcher){
        this.subs.push(watcher)
    }
    notify(){
        console.log('notify');
        this.subs.forEach((watcher)=>{
            watcher.update();
        })
    }
}