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
        var b = $("<span class='color'></span>").css('background',bColor[i]);
        b.on('click',function(e) {
          self.fire('onPaintUpdate',{'color':$(this).css('background')});
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
      
    }
  }
}())
