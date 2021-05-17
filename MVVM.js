class MVVM{
    constructor(option){
        this.$el = option.el;
        this.$data = option.data;

        if(this.$el){
            new Observer(this.$data);
            new Compile(this.$el,this);
        }
    }

}