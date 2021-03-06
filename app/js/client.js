(function() {
  var Client = {
    so:null,
    isFirstConnect:true,
    //当前用户
    user:{'uname':null},
    //游戏信息
    gameInfo:{'user':null}
  };

  Client.connect = function(host,port) {
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
          //console.log(self.so);
          this.so = null;
          alert('服务器连接失败');
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
  Client.login = function(callback) {
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
    glev.text(user.score);

    //如果是第一个登陆的用户
    if(user.uname == this.user.uname && idx == 0) {
      glev.text("GO!");

      glev.on('click',function() {
        self.so.emit('gameStart',null,function(data) {
          glev.off('click');
          glev.text(user.score);
        });
      });
    }
  }

  //更新用户信息
  Client.doUpdateUserInfo = function(data) {
    var self = this;
    var users = data;

    $('#userArea').empty();

    //更新用户
    for(var i=0;i<users.length;i++) {
      self.updataUser(users[i],i);
    }
  }

  //发送消息
  Client.sendMsg = function(msg) {
    this.so.send(msg);
  }

  Client.emitStartDraw = function(data) {
    this.so.emit('startDraw',data);
  }

  Client.emitDrawing = function(data) {
    this.so.emit('drawing',data);
  }

  //发送画板更新事件
  Client.emitPaintUpdate = function(data) {
    this.so.emit('paintUpdate',data);
  }

  //开始画画
  Client.startDraw = function(data) {
    Painter.fire('onStartDraw',data);
  }

  //画画
  Client.drawing = function(data) {
    Painter.fire('onDrawing',data);
  }

  //更新画板
  Client.paintUpdate = function(data) {
    Painter.fire('onPaintUpdate',data);
  }

  //处理游戏回合准备事件
  Client.doQuestionReady = function(data) {
    this.ReadyEffect(data);
  }

  //游戏开始事件
  Client.doStartQuestion = function(data) {
    var user = data[0].user,
        msg = "现在由：" + user.uname + "开始画画";
    this.gameInfo = data[0];
    //清除画板
    Painter.clear();
    //恢复用户样式
    $('#ulx div[id^=u_]').each(function() {
      $(this).attr('class','uready');
    });
    $('#u_' + user.uname).attr('class','uoper');
    $('#operDiv').hide();

    //显示效果层
    $('#effect').show();
    $('#qTime').show();
    $('#qTime').text(data[1]);

    //显示题目回合
    $('#dround').text("第" + this.gameInfo.round + "/" + data[2] + "轮");
    //如果是当前操作用户，修改信息栏
    if(this.user.uname == user.uname) {
      var m ="请按照题目画图，题目是：<span style='color:red'>" + data[0].question.data + "</span>";
      $('#question').html(m);
      //现实操作画图层
      $('#operDiv').show();
    } else {
      $('#question').text(msg);
    }

    $('#msgArea').append(msg+"<br/>");
    $('#msgArea').scrollTop($('#msgArea')[0].scrollHeight);
  }

  //显示信息
  Client.showMessage = function(msg) {
    var p = $('#hb');
    var ww = p.width();
    var wh = p.height();
    var ox = p.offset().left;
    var oy = p.offset().top;
    var dmsg = $('#msg');

    dmsg.text(msg);
    dmsg.css('left',ox+(ww-300)*0.5);
    dmsg.css('top',oy+(wh-130)*0.5);
    $('#msg').fadeIn(100,function() {
      $(this).fadeOut(3000);
    });
  }

  //提示
  Client.doHint = function(data) {
    if(!this.isOperUser()) {
      $('#question').text('Hint:' + data);
    }
    $('#msgArea').append('Hint:' + data + '<br />');
    $('#msgArea').scrolTop($('#msgArea')[0].scrollHeight);
  }

  Client.doAward = function(data) {
    for(var i=0;i<data.length;i++) {
      var u = data[i].user,
          awd = data[i].awd;
      //处理动画
      $("#ulx div[id=aw_]" + u.uname + "]").text("+" + awd + "").attr("class","awardAnim").bind("webkitTransitionEnd",function() {
        $(this).text("").attr('class','award');
      });
      $('#ulx div[id=uc_' + u.uname + "]").text(u.score);
    }
  }

  //结束问题
  Client.doEndquestion = function() {
    Painter.clear();
    //释放鼠标并隐藏
    $('#paintArea').trigger('mouseup').hide();
    //正确显示答案
    Client.showMessage('The correct answer is:' + this.gameInfo.question.data);
  }

  //结束游戏
  Client.doGameOver = function() {
    this.showMessage("Game Over!");
  }

  //处理游戏回答问题事件
  Client.doProcessQuestion = function(data) {
    $('#qTime').text(data.time);
  }

  //处理ready效果
  Client.ReadyEffect = function(data) {
    $('#effect').text(data);
    if(data < 0) {
      $('#effect').hide();
      $('#paintArea').show();
    }
  }
  window.Client = Client;
}())
