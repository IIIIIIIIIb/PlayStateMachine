//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////、
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.createGameScene = function () {
        var sky = this.createBitmapByName("bg_jpg");
        this.addChild(sky);
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;
        this.Player = new Pole();
        this.addChild(this.Player);
        this.Player.x = this.Player.y = 300;
        this.Player.Idle();
        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.Moveba, this);
        /*
                //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
                // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
                RES.getResAsync("description", this.startAnimation, this)
        */
    };
    p.Moveba = function (evt) {
        this.Player.Move(evt.stageX, evt.stageY);
        //   console.log(evt.stageX+" "+evt.stageY);
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    p.startAnimation = function (result) {
        var self = this;
        var parser = new egret.HtmlTextParser();
        var textflowArr = [];
        for (var i = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }
        var textfield = self.textfield;
        var count = -1;
        var change = function () {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            var lineArr = textflowArr[count];
            self.changeDescription(textfield, lineArr);
            var tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, self);
        };
        change();
    };
    /**
     * 切换描述内容
     * Switch to described content
     */
    p.changeDescription = function (textfield, textFlow) {
        textfield.textFlow = textFlow;
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
var Pole = (function (_super) {
    __extends(Pole, _super);
    function Pole() {
        _super.call(this);
        this.MySta = new StaMac;
        this.MoveSpeed = 20;
        this.Modle = 0;
        this.IdleAnime = new Array();
        this.MoveAnime = new Array();
        this.Polepic = this.createBitmapByName("01_png");
        this.addChild(this.Polepic);
        this.LoadPic();
        this.anchorOffsetX = this.Polepic.width / 2;
        this.anchorOffsetY = this.Polepic.height / 2;
    }
    var d = __define,c=Pole,p=c.prototype;
    p.LoadPic = function () {
        var texture = RES.getRes("01_png");
        this.IdleAnime.push(texture);
        texture = RES.getRes("01_png");
        this.IdleAnime.push(texture);
        texture = RES.getRes("02_png");
        this.IdleAnime.push(texture);
        texture = RES.getRes("03_png");
        this.IdleAnime.push(texture);
        texture = RES.getRes("04_png");
        this.IdleAnime.push(texture);
        texture = RES.getRes("05_png");
        this.IdleAnime.push(texture);
        texture = RES.getRes("06_png");
        this.IdleAnime.push(texture);
        texture = RES.getRes("07_png");
        this.IdleAnime.push(texture);
        texture = RES.getRes("08_png");
        this.IdleAnime.push(texture);
        texture = RES.getRes("09_png");
        this.MoveAnime.push(texture);
        texture = RES.getRes("2_png");
        this.MoveAnime.push(texture);
        texture = RES.getRes("3_png");
        this.MoveAnime.push(texture);
        texture = RES.getRes("4_png");
        this.MoveAnime.push(texture);
        texture = RES.getRes("5_png");
        this.MoveAnime.push(texture);
        texture = RES.getRes("6_png");
        this.MoveAnime.push(texture);
        texture = RES.getRes("7_png");
        this.MoveAnime.push(texture);
        texture = RES.getRes("8_png");
        this.MoveAnime.push(texture);
        texture = RES.getRes("9_png");
        this.MoveAnime.push(texture);
        texture = RES.getRes("10_png");
        this.MoveAnime.push(texture);
        texture = RES.getRes("11_png");
        this.MoveAnime.push(texture);
        texture = RES.getRes("12_png");
        this.MoveAnime.push(texture);
        texture = RES.getRes("13_png");
        this.MoveAnime.push(texture);
        texture = RES.getRes("14_png");
    };
    p.PlayAnimation = function (Ani) {
        var count = 0;
        var Bit = this.Polepic;
        var M = this.Modle;
        //console.log("M:"+M);
        var timer = new egret.Timer(100, 0);
        timer.addEventListener(egret.TimerEvent.TIMER, Play, this);
        timer.start();
        function Play() {
            Bit.texture = Ani[count];
            if (count < Ani.length - 1) {
                //   console.log(Ani.length+" "+count);
                count++;
            }
            else {
                count = 0;
            }
            if (this.Modle != M) {
                //console.log("tM:"+M+" nowM:"+this.Modle); 
                timer.stop();
            }
        }
    };
    p.Move = function (x, y) {
        var MS = new Move(x, y, this);
        this.MySta.Reload(MS);
    };
    p.Idle = function () {
        var IS = new Idle(this);
        this.MySta.Reload(IS);
    };
    /**
         * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
         * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
         */
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    return Pole;
}(egret.DisplayObjectContainer));
egret.registerClass(Pole,'Pole');
var Move = (function () {
    function Move(x, y, Player) {
        this.Y = y;
        this.X = x;
        this.Player = Player;
    }
    var d = __define,c=Move,p=c.prototype;
    p.Load = function () {
        var _this = this;
        this.Player.Modle++;
        var x = this.X - this.Player.x;
        var y = this.Y - this.Player.y;
        if (x > 0) {
            this.Player.scaleX = 1;
        }
        else {
            this.Player.scaleX = -1;
        }
        var z = Math.pow(x * x + y * y, 0.5);
        //console.log(xx+" "+yy);
        // console.log(this.Tx + " " + this.Ty);
        var time = z / this.Player.MoveSpeed;
        this.timer = new egret.Timer(50, time);
        this.Time = time;
        //console.log(this.LeastTime);
        //   console.log("time:"+time);
        this.timer.addEventListener(egret.TimerEvent.TIMER, function () {
            _this.Player.x += x / time;
            _this.Player.y += y / time;
            _this.Time--;
            if (_this.Time < 1) {
                _this.timer.stop();
                //        this.Player.Modle=-1;
                //         console.log("1");
                if (_this.Time > -10) {
                    _this.Player.Idle();
                }
            }
        }, this);
        this.timer.start();
        this.Player.PlayAnimation(this.Player.MoveAnime);
        //     console.log("kaishiM");
    };
    p.exit = function () {
        this.Time = -10;
        //       console.log("exitM");
    };
    return Move;
}());
egret.registerClass(Move,'Move',["Sta"]);
var Idle = (function () {
    function Idle(Player) {
        this.Player = Player;
    }
    var d = __define,c=Idle,p=c.prototype;
    p.Load = function () {
        //      console.log("Loadidle");
        this.Player.Modle = 0;
        this.Player.PlayAnimation(this.Player.IdleAnime);
    };
    p.exit = function () {
        //  console.log("exitIdle");
    };
    return Idle;
}());
egret.registerClass(Idle,'Idle',["Sta"]);
var StaMac = (function () {
    function StaMac() {
    }
    var d = __define,c=StaMac,p=c.prototype;
    p.Reload = function (S) {
        if (this.nowSta) {
            this.nowSta.exit();
        }
        this.nowSta = S;
        this.nowSta.Load();
    };
    return StaMac;
}());
egret.registerClass(StaMac,'StaMac');
//# sourceMappingURL=Main.js.map