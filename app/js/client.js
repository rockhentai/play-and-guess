(function() {
  var Client = {
    so:null,
    isFirstConnect:true,
    //当前用户
    user:{'uname':null},
    //游戏信息
    gameInfo:{'user':null}
  };

  Client.connect = function(host,post) {
    var p = port || 80;
    var self = this;

    if(this.so === null) {
      this.so = io.connect('http://' + host + ':' + p,{'reconnect':false});

      if(this.so) {
        //绑定连接socket事件
        this.so.on('connect',function() {
          self.doConnect();
        });

        this.so.on('error',function(data) {
          this.so = null;
          alert('服务器连接失败')；
        });
      }
    } else {
      this.so.socket.reconnect();
    }
  }

  Client.isOperUser = function() {
    return this.user.uname == this.gameInfo.user.uname;
  }

  //登陆
  Client.login = function() {
    this.so.emit('login',{'uname':this.user.uname},function(data) {
      callback(data);
    });
  }

  //连接事件
  Client.doConnect = function() {
    //如果是第一次连接，注册事件
    if(this.isFirstConnect) {
      this.isFirstConnect = false;
      this.bindEvent();
    } else {
      this.so.socket.reconnect();
    }
  }

  Client.bindEvent = function() {
    var self = this;

    this.so.on('message',function(msg) {
      self.doMessage(msg);
    });

    //注册开始画画事件
    this.so.on('startDraw',function(data) {
      self.startDraw(data);
    });

    //处理画画更新事件
    this.so.on('drawing',function(data) {
      self.sraw(data);
    })
  }
}())
