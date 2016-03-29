

    function AppViewModel() {
        var self = this;
        self.module_id=ko.observable("432"),
        
        self.action_list=[],
        
        self.structure_list=[],

        self.setModuleId = function(id) {
            self.module_id=id; 
        };

        //删除一个表定义
        self.deleteTableSection = function() {
            console.log('删除一个表定义');
        };
        //return self;
    };

    var vm = new AppViewModel()
    ko.applyBindings(vm);