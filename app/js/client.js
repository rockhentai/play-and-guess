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
      self.drawing(data);
    });

    this.so.on('paintUpdate',function(data) {
      self.paintUpdate(data);
    });

    this.so.on('updateUserInfo',function(data) {
      self.doUpdateUserInfo(data);
    });

    this.so.on('questionReady',function(data) {
      self.doQuestionReady(data);
    });

    this.so.on('startQuestion',function(data) {
      self.doStartQuestion(data);
    });

    this.so.on('processQuestion',function(data) {
      self.doProcessQuestion(data);
    });

    this.so.on('hint',function(data) {
      self.doHint(data);
    });

    this.so.on('award',function(data) {
      self.doAward(data);
    });

    this.so.on('endquestion',function(data) {
      self.doEndquestion(data);
    });

    this.so.on('gameover',function(data) {
      self.doGameover(data);
    });
  }

  Client.doMessage = function(msg) {
    $('#msgArea').append(msg).append('<br />');
    $('#msgArea').scrollTop($('#msgArea')[0].scrollHeight);
  }

  Client.updateUser = function(user,idx) {
    var self = this;
    if(user.uname == this.user.uname) {
      this.user = user;
    }

    // 创建用户UI
    var px = $("<div id='ulx' class='ulx'></div>");
    var ud = $("<div id='u_" + user.uname + "' class='uready'><div id='aw_" + user.uname + "' class='award'></div></div>");
    var glev = $("<div id='uc_'" + user.uname + "' class='ugo'></div>");

    px.append("<div style='overflow:hidden'>" + user.uname + "</div>").append(ud).append(glev);
  }
}())
