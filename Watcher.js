
class Watcher{
    constructor(vm,expr,cb) {
       this.vm = vm;
       this.expr = expr;
       this.cb = cb;
       this.value = this.getOldVal(); 
       //console.log(this.value);
    }
    getVal(vm,expr){
        return expr.split('.').reduce((pre,next)=>{
            return pre[next]
        },vm.$data)
    }
    getOldVal(){
        console.log(Dep);
        Dep.target = this;
        let val = null;
        val = this.getVal(this.vm,this.expr);
        Dep.target = null;
        return val;
    }
    //对外暴露的更新数据方法;
    update(){
        let newValue = this.getVal(this.vm,this.expr);
        let oldValue = this.value;
        if(oldValue !== newValue){
            this.cb(newValue)
        }
    }
}