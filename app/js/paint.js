(function() {
  var Painter = {
    ctx:null,
    w:0,
    h:0,
    //状态-1：初始或结束状态，0：开始画，1：画画中
    status:0,
    //当前画笔颜色
    bColor:null,
    //当前画笔大小
    bWidth:null,

    init:function() {
      var can = $('#paintArea')[0];
      this.ctx = can.getContext('2d');
      this.w = can.width;
      this.h = can.height;
      this.setBGColor();
      this.setBrushColor();
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      //初始化画板事件
      this.initCanvas();
      //初始化画笔颜色
      this.initBrush();
      //初始化橡皮
      this.initEraser();
    },

    initBrush:function() {
      var bColor = ["#000000","#999999","#FFFFFF","#FF0000","#FF9900","#FFFF00","#008000","#00CCFF","#0099FF","#FF33CC","#CC66FF","#FFCCCC","#6633FF","#CCFFCC"];
      var bWidth = [2,8,16,24];
      var bDiv = $('#color');
      var self = this;
      for(var i=0;i<bColor.length;i++) {
        var b = $("<span class='color'></span>").css('background-color',bColor[i]);
        b.on('click',function(e) {
          console.log($(this).css('background-color'));
          self.fire('onPaintUpdate',{'color':$(this).css('background-color')});
        });
        bDiv.append(b);
      }

      var bcDiv = $('#pen');
      for(var i=0;i<bWidth.length;i++) {
        var bw = $("<div class='bwid' data-bidx='" + (i) +"'></div>");
        bw.css('background-image',"url(img/bc" + (i+1) + ".png)");
        bw.on('click',function(e) {
          self.fire('onPaintUpdate',{'width':bWidth[this.getAttribute('data-bidx')]});
        });
        bcDiv.append(bw);
      }
    },

    initEraser:function() {
      var self = this;
      //绑定清楚屏幕事件
      $('#btnClear').click(function(e) {
        self.clear();
      });
      //擦除
      $('#btnRub').click(function(e) {
        self.setBrushColor('white');
        self.setBrushWidth(32);
      });
    },

    //设置背景
    setBGColor:function(color) {
      this.ctx.fillStyle = color || 'white';
      this.ctx.fillRect(0,0,this.w,this.h);
    },

    //设置画笔颜色
    setBrushColor:function(color) {
      //alert(1);
      this.bColor = color || 'black';
      // console.log(this.bColor);
      this.ctx.strokeStyle = this.bColor;
    },

    //设置画笔宽度
    setBrushWidth:function(width) {
      this.bWidth = width || 1;
      this.ctx.lineWidth = this.bWidth;
    },

    //初始化画板
    initCanvas:function() {
      var can = $('#paintArea');
      var self = this;

      //鼠标按下
      can.on('mousedown',function(e) {
        // if(!Client.isOperUser) {
        //   return;
        // }

        e.preventDefault();
        this.x = e.offsetX;
        this.y = e.offsetY;
        //console.log(self.bColor);
        self.fire('onStartDraw',{'x':this.x,'y':this.y});
        //鼠标移动
        can.on('mousemove',function(e) {

          var nx = e.offsetX;
          var ny = e.offsetY;
          self.fire('onDrawing',{'x':nx,'y':ny});
          this.x = nx;
          this.y = ny;
        });

        //鼠标抬起
        can.on('mouseup',function() {
          can.off('mousemove');
          self.fire('onDrawEnd');
        });
      });
    },

    clear:function() {
      this.ctx.clearRect(0,0,this.w,this.h);
    },

    fire:function(eventName,param) {
      if(this[eventName]) {
        this[eventName](param);
      }
    },

    //开始画画
    onStartDraw:function(data) {
      this.status = 0;
      this.ctx.beginPath();
      this.ctx.moveTo(data.x,data.y);
      // if(Client.isOperUser()) {
      //   Client.emitStarDraw(data);
      // }
    },

    //画画事件
    onDrawing:function(data) {
      if(this.status == 0) {
        this.status = 1;
      }
      this.ctx.lineTo(data.x,data.y);
      this.ctx.stroke();
      // if(Client.isOperUser()) {
      //   Client.emitDrawing(data);
      // }
    },

    onPaintUpdate:function(data) {
      var w = data.width || this.bWidth,
          c = data.color || this.bColor;
      var param = {'width':w,'color':c};
      this.setBrushWidth(w);
      this.setBrushColor(c);
      //发送画板更新事件
      // if(Client.isOperUser()) {
      //   Client.emitPaintUpdate(param);
      // }
    }
  }
  Painter.init();
  window.Painter = Painter;
}())
