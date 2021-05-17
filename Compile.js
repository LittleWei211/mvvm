class Compile{
    constructor(el,vm){
        this.cel = this.isElement(el) ? el : document.querySelector(el);
        this.vm = vm;
        //1:将真实dom移入虚拟dom中；
        let fragment = this.domElement2Fragment(this.cel);
        //2:编译模板，提取{{name}} 和 v-model的元素节点，将相应的值给到对于的节点；
        this.compile(fragment,this.vm);
        //3：将虚拟dom fragment放回真实dom；
        this.cel.appendChild(fragment);
    }
    /*核心方法*/
    domElement2Fragment(el){
        let fragment = document.createDocumentFragment();
        let firstChild = null;
        while(firstChild = el.firstChild){//递归将dom元素移入到fragement中
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
    compileElement(node){//编译元素节点
        //1:判断元素节点是否包含v-xxx指令；
        let attrs = node.attributes;//获取节点的属性如 type='text' v-model='name' class='cl1'
        Array.from(attrs).forEach( attr => {
            let attrName = attr.name;
            if(this.isDirective(attrName)){
                let expr = attr.value;
                //node节点  data  属性(expr)
                let [,type] = attrName.split('-')
                CompileUtil[type](node,this.vm,expr);
            }
        })
    }
    compileText(node){
        //1：提取文本节点中的{{}};
        let regBrace = /\{\{([^}]+)\}\}/g;
        let expr = node.textContent;
        if(regBrace.test(expr)){
            CompileUtil["text"](node,this.vm,expr);
        }
    }
    compile(fg){
        Array.from(fg.childNodes).forEach(node =>{
            //console.log(node);
            if(this.isElement(node)){//如果是元素节点，则继续编译
                this.compileElement(node);
                this.compile(node);
            }else{
                this.compileText(node);
            }
        })
    }
    /*辅助方法*/
    isElement(node){
        return node.nodeType === 1;
    }
    isDirective(name){
        return name.includes('v-');
    }

    
}
CompileUtil = {
    getVal(vm,expr){
        return expr.split('.').reduce((pre,next)=>{
            return pre[next]
        },vm.$data)
    },
    getTextVal(vm,expr){
        return expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            //console.log(arguments);
            return this.getVal(vm,arguments[1])
        });
    },
    setVal(vm,expr,value){
        expr = expr.split('.');
        return expr.reduce((pre,next,currentIndex)=>{
            if(currentIndex === expr.length -1){
                return pre[next] = value;
            }
            return pre[next];
        },vm.$data)
    },
    model(node,vm,expr){
        let modelUpdateFn = this.updater['modelUpdater'];
        //console.log(this.getVal(vm,expr));
        new Watcher(vm,expr,(newValue)=>{
            modelUpdateFn && modelUpdateFn(node,this.getVal(vm,expr));
        });
        node.addEventListener('input',(e)=>{
            let newValue = e.target.value;
            this.setVal(vm,expr,newValue);
        })
        modelUpdateFn && modelUpdateFn(node,this.getVal(vm,expr));
    },
    text(node,vm,expr){
        let textUpdateFn = this.updater['textUpdater'];
        //this.getTextVal(vm,expr);
        expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            //console.log(arguments);
            new Watcher(vm,arguments[1],(newValue)=>{
                textUpdateFn && textUpdateFn(node,this.getTextVal(vm,expr));
            });
        });
        node.addEventListener('input',(e)=>{
            //console.log(e.target.value);
            modelUpdateFn && modelUpdateFn(node,e.target.value);
        })
        textUpdateFn && textUpdateFn(node,this.getTextVal(vm,expr));
    },
    updater:{
        modelUpdater(node,value){
            node.value = value;
        },
        textUpdater(node,value){
            node.textContent = value;
        }
    }
}