(function() {
  var cli = require('./client');
  var data = require('./data');
  var http = require('http');

  var Server = function() {
    this.io = null;
    this.clients = [];
    //定时器句柄
    this.tHand = null;
    this.info = null;
    //当前游戏配置信息
    this.cfg = null;
  }

  Server.prototype = {
    listen:function(port) {
      var srv = http.createServer(function(req,res) {});
      this.io = require('socket.io').listen(srv);
      //设置日志级别
      this.io.set('log level',1);
      srv.listen(port);
      this.bindEvent();

      //获取游戏信息
      this.info = data.gameData().info;
      this.cfg = data.gameData().cfg;
    },

    //绑定事件
    bindEvent:function() {
      var self = this;
      this.io.sockets.on('connection',function(socket) {
        self.doConnect(socket);
      })
    },

    doConnect:function(socket) {
      this.addClient(socket);
    },

    addClient:function(socket) {
      console.log('add new client:' +　socket.id);
      this.clients.push(cli.newClient(this,socket));
    },

    removeClientByID:function(sID) {
      var idx = -1;
      for(var i=0;i<this.clients.length;i++) {
        if(this.clients[i].so.id == sID) {
          idx = i;
          break;
        }
      }

      if(idx != -1) {
        this.clients.splice(idx,1);
      }

      //如果所有客户端都退出，则游戏复位
      if(this.info.status != 0 && this.clinets.length == 0) {
        clearInterval(this.tHand);
        this.resetGameInfo();
      }
    },

    //判断用户是否存在
    isUserExists:function(client) {
      for(var i=0;i<this.clients.length;i++) {
        if(client != this.clients[i] && this.clients[i].user.uname == client.user.uname) {
          return true;
        }
      }
      return false;
    },

    //获取所有用户姓名
    getAllUser:function() {
      var p = [];
      for(var i=0;i<this.clients.length;i++) {
        p.push(this.clients[i].user);
      }
      return p;
    },

    //广播消息
    broadcastMsg:function(msg) {
      this.io.sockets.send(msg);
    },

    //广播事件
    broadcastEvent:function(eventName,data) {
      this.io.sockets.emit(eventName,data);
    },

    updateUserInfo:function() {
      var users = this.getAllUser();
      if(users.length != 0) {
        this.broadcastEvent('updateUserInfo',users);
      }
    },

    isRightAnswer:function(ans) {
      return ans == this.info.question.data;
    },

    //随机生成题目
    getRandQuestion:function() {
      var tidx = Math.random()*this.cfg.qtype.length|0,
          didx = Math.random()*this.cfg.qdata[tidx].length|0,
          type = this.cfg.qtype[tidx],
          ques = this.cfg.qdata[tidx][didx];
      return {'type':type,'data':ques};
    },

    getNextUser:function() {
      if(this.clients.length != 0) {
        var idx = (++this.info.uIdx)%this.clients.length;
        this.info.uIdx = idx;
        return this.clients[idx].user;
      } else {
        return null;
      }
    },

    //重置游戏数据
    resetGameInfo:function() {
      var info = this.info;
      info.time = 0;
      info.round = 0;
      info.uIdx = -1;
      info.user = null;
      info.question = {'type':null,'data':null};
      info.status = 0;
      info.rUserCount = 0;
      info.rUser = null;
    },

    processQuestion:function() {
      if(this.isQuestionOver()) {
        //结束问题
        this.endQuestion();
      } else {
        this.broadcastEvent('processQuestion',{'time':this.cfg.time - this.info.time});
      }

      if(this.info.time == 8) {
        this.broadcastEvent('hint',this.info.question.data.length + '个字');
      } else if(this.info.time == 16) {
        this.broadcastEvent('hint','类型：' + this.info.question.type);
      }

      console.log(this.cfg.time);
    },

    startGameRound:function() {
      var self = this;
      if(this.info.round == this.cfg.round) {
        this.endGameRound();
        return;
      }
      this.info.status = 1;
      this.info.round++;
      this.broadcastMsg('--第' + (this.info.round) + '回合开始--');
      this.startQuestion();
    },

    startQuestion:function() {
      var self = this;
      var info = this.info;
      info.time = 0;
      info.status = 1;
      info.question = this.getRandQuestion();
      info.user = this.getNextUser();
      info.rUserCount = 0;
      info.rUser = null;
      this.broadcastEvent('startQuestion',[info,this.cfg.time,this.cfg.round]);
      this.doQuestionReady();
    },

    doQuestionReady:function() {
      var time = 5;
      var self = this;
      this.io.sockets.emit('questionReady',time);
      this.tHand = setInterval(function() {
        if(time < 0) {
          clearInterval(self.tHand);
          self.tHand = setInterval(function() {
            self.info.time++;
            self.processQuestion();
          },1000);
        } else {
          self.io.sockets.emit('questionReady',--time);
        }
      },1000);
    },

    //检查是否可以结束一个问题
    isQuestionOver:function() {
      return this.info.status == 1 && (this.isAllRight() || this.info.time == this.cfg.time);
    },

    endQuestion:function() {
      var self = this;
      clearInterval(this.tHand);
      this.info.status = 2;
      //3秒后重新开始一个问题
      var t = 3;
      this.broadcastEvent('endquestion');
      self.tHand = setInterval(function() {
        t--;
        if(t == 0) {
          if(self.info.uIdx != self.clients.length-1) {
            self.startQuestion();
          } else {
            self.startGameRound();
          }
        }
      },1000);
    },

    endGameRound:function() {
      clearInterval(this.tHand);
      this.resetGameInfo();
      this.broadcastEvent('gameover',this.getAllUser());
    },

    isAllRight:function() {
      return this.clients.length-1 == this.info.rUserCount;
    },

    //第一个答出来的得2分，其他1分，只有一个答对，就得3分
    getAward:function(user) {
      var result = 0;
      if(user.uname != this.info.user.uname) {
        this.info.rUserCount++;
        if(this.info.rUserCount == 1) {
          result = 2;
        } else {
          result = 1;
        }
      }
      return result;
    }
  }

  new Server().listen(9000);
}())
