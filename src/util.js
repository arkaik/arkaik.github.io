// Opciones y configuración
var mat_size = 12; // Matriz n * n, n = mat_size
var nPlayers = 4; // Número de jugadores
var cPlayers = nPlayers; // Contador de jugadores restantes
var turn = 0;
var health4all = 5;

var texture = cc.textureCache.addImage(res.image_png);
var buttons = cc.textureCache.addImage(res.button_png);

//Herencia estilo Old JS
function Plus (string)
{
  // [JAVA] this.super(...)
  cc.Sprite.call(this, string);
  this.state = "alone";
  this.health = health4all;
  this.defense = 2;
  this.team = 0;
  this.objective = hw.obj[hw.data];
  this.compr = hw.cmp[hw.data];
  this.deselect = hw.des[hw.data];
  this.consequence = hw.cns[hw.data];
  
  var spr_defense = new cc.Sprite(texture);
  spr_defense.setTextureRect(hw.silver);
  this.addChild(spr_defense, 1, "mask"); 
}
Plus.prototype = Object.create(cc.Sprite.prototype);
Plus.prototype.constructor = Plus;

function Cell (string, px, py)
{
  cc.Sprite.call(this, string);
  this.inside = [];
  this.x = px;
  this.y = py;
}
Cell.prototype = Object.create(cc.Sprite.prototype);
Cell.prototype.constructor = Cell;

function CircularMenu (n,r)
{
  if (n <= 0) throw new Error("CircularMenu._ctor(n) : argument must be more or equal than 1.");
  cc.Menu.call(this, []);
  this.nobj = 0;
  this.radius = r;
  this.angle = [];
  //Ángulo entre cada objeto
  var alpha = 2*(Math.PI)/n;
  for (i = 0; i < n; i++)
  {
    this.angle.push(alpha*i);
  }
  
  this.addItem = function(child, zOrder, tag)
  {
    if (!(child instanceof cc.MenuItem) || this.nobj == this.angle.length)
      throw new Error("CircularMenu.addItem() : CircularMenu only supports MenuItem objects as children");
    
    var x = Math.cos(this.angle[this.nobj])*this.radius;
    var y = Math.sin(this.angle[this.nobj])*this.radius;
    cc.log("pos: "+child.getAnchorPoint().x+", "+child.getAnchorPoint().y);
    child.setPosition(x,y);
    child.setAnchorPoint(0,0);
    this.nobj++;
    cc.Menu.prototype.addChild.call(this,child,zOrder,tag);
  }
}
CircularMenu.prototype = Object.create(cc.Menu.prototype);
CircularMenu.constructor = CircularMenu;

var backLayer = cc.Layer.extend(
{
  
  ctor: function()
  {
    this._super();
    this.init();
  },
  
  init: function()
  {
    this._super();
    
    var size = cc.director.getWinSize();
    var sprite = cc.Sprite.create(res.helloBG_png);
    sprite.setPosition(size.width / 2, size.height / 2);
    sprite.setScale(0.8);
    this.addChild(sprite);    
  }
});

var guiLayer = cc.Layer.extend({
  labelTurn: null,
  labelHealth: null,
  menu: null,
  ctor: function()
  {
    this._super();
    this.init();
  },
  
  init: function()
  {
    this._super();
    
    var size = cc.director.getWinSize();
    
    this.labelTurn = new cc.LabelTTF("Team: 0", "Helvetica", 20);
    this.labelTurn.setColor(cc.color(01,1,1));
    this.labelTurn.setPosition(size.width * 0.75, size.height * 0.75);
    this.addChild(this.labelTurn);
    
    this.labelHealth = new Array(nPlayers);
    for (z = 0; z < nPlayers; z++)
    {
      this.labelHealth[z] = new cc.LabelTTF("¦"+z+"¦ HP: "+health4all, "Helvetica", 20);
      this.labelHealth[z].setColor(cc.color(1,1,1));
      this.labelHealth[z].setPosition(size.width * 0.75, size.height*(0.70 - z*0.05));
      this.addChild(this.labelHealth[z]);
    }

  },
  
  updateTurn: function()
  {
    turn = (turn+1)%nPlayers;
    this.labelTurn.setString("Team: "+turn);
  },
  
  updateLH: function(i, h)
  {
    if (i < this.labelHealth.length) this.labelHealth[i].setString("¦"+i+"¦ HP: "+h);
    else cc.log("error in updateLH");
  }
  
});

var animLayer = cc.Layer.extend({
  gui_layer: null,
  matrix: null, // Matriz de celdas
  player: null, // Vector de jugadores
  cursor: null,
  ctor: function()
  {
    this._super();
    this.init();
  },
  
  init: function()
  {
    this._super();
    
    // Tablero
    this.matrix = new Array(mat_size);
    for (i = 0; i < mat_size; i++)
    {
      this.matrix[i] = new Array(mat_size);
      for (j = 0; j < mat_size; j++)
      {
        
        this.matrix[i][j] = new Cell(texture, i, j);
        this.matrix[i][j].setTextureRect(hw.black);
        this.matrix[i][j].setPosition(32*i+16, 32*j+16);
        this.addChild(this.matrix[i][j]);
      }
      
    }

    this.player = new Array(nPlayers);
    for (p = 0; p < this.player.length; p++)
    {
      var rpx = Math.floor(Math.random()*mat_size);
      var rpy = Math.floor(Math.random()*mat_size);
      this.player[p] = new Plus(texture);
      this.player[p].setPosition(32*rpx+16,32*rpy+16); //TO DO Random
      this.player[p].setTextureRect(hw.symbol[p]);
      this.player[p].getChildByName("mask").setPosition(16,16);
      this.addChild(this.player[p]);
      this.player[p].team = p;

      this.matrix[rpx][rpy].inside[p] = this.player[p];
    }
    
    this.cursor = new cc.Sprite(texture);
    this.cursor.setTextureRect(hw.dotted);
    this.cursor.setPosition(16,16);
    this.addChild(this.cursor);
    
    var i1x = Math.floor(this.player[0].getPosition().x/32);
    var i1y = Math.floor(this.player[0].getPosition().y/32);
    this.matrix[i1x][i1y].setTextureRect(hw.blue);
  
    var list_act = cc.EventListener.create(
    {
        event: cc.EventListener.CUSTOM,
        eventName: "action",
        callback: function(event)
        {
          // Objetivo actual
          var target = event.getCurrentTarget();
          var parent = target.getParent();
          var nteam = turn;

          //Posición de origen
          var orig = target.getPosition();
          var ox = Math.floor(orig.x/32);
          var oy = Math.floor(orig.y/32);

          //Posición destino
          var pt = event.getUserData().location;
          var px = Math.floor(pt.x/32);
          var py = Math.floor(pt.y/32);

          var ok = cc.rectContainsPoint(target.getBoundingBoxToWorld(), pt);
          var plz = nteam == target.team;
      // var alive = target.health > 0;
          
          if (ok && plz && target.state == "alone")
          {
            
            //TO DO: Subclass of (Menu) and (MenuItem): CircularMenu, CircularMenuItem.
            var ab1 = new cc.MenuItemSprite(new cc.Sprite(res.button_png),new cc.Sprite(res.button_png), function(){}, this);
            ab1.getNormalImage().setTextureRect(hw.buttons[0]);
            ab1.getSelectedImage().setTextureRect(hw.buttons[0]);
            ab1.setAnchorPoint(0,0);
            var ab2 = new cc.MenuItemSprite(new cc.Sprite(res.button_png),new cc.Sprite(res.button_png), function(){}, this);
            ab2.getNormalImage().setTextureRect(hw.buttons[0]);
            ab2.getSelectedImage().setTextureRect(hw.buttons[0]);
            var ab3 = new cc.MenuItemSprite(new cc.Sprite(res.button_png),new cc.Sprite(res.button_png), function(){}, this);
            ab3.getNormalImage().setTextureRect(hw.buttons[0]);
            ab3.getSelectedImage().setTextureRect(hw.buttons[0]);
            var ab4 = new cc.MenuItemSprite(new cc.Sprite(res.button_png),new cc.Sprite(res.button_png), function(){}, this);
            ab4.getNormalImage().setTextureRect(hw.buttons[0]);
            ab4.getSelectedImage().setTextureRect(hw.buttons[0]);
            parent.menu = new CircularMenu(4,32);
            parent.menu.addItem(ab1);
            parent.menu.addItem(ab2);
            parent.menu.addItem(ab3);
            parent.menu.addItem(ab4);
            parent.menu.setPosition(ox*32,oy*32);
            var mcoord = parent.menu.getPosition();
            cc.log("menu: "+mcoord.x+", "+mcoord.y);
            //parent.menu.setPosition(ox-mcoord.x,oy-mcoord.y);
            parent.addChild(parent.menu,10,100);
            target.objective(parent.matrix);
            target.state = "selected";
          }
          else if (target.state == "selected")
          { 
            if (target.compr(parent.matrix, px, py))
            {
              parent.matrix[ox][oy].inside[target.team] = undefined;
              
              //Toda acción tiene su consecuencia... (hue hue)
              target.consequence(parent.matrix, px, py);

              var affected = null;
              for (i = 0; i < parent.matrix[px][py].inside.length; i++)
              {
                affected = parent.matrix[px][py].inside[i];
                
                if (affected != undefined && affected.team != target.team)
                {
                  affected.health -= 1;
                  parent.gui_layer.updateLH(affected.team, affected.health);
                  if (affected.health <= 0)
                  {
                    parent.matrix[px][py].inside[i] = undefined;
                    parent.removeChild(parent.player[i]);
                    --cPlayers;
                    if (cPlayers == 1)
                    {
                      cc.log("You win, gg ez");
                      parent.gui_layer.labelHealth[turn].setString("You win, gg ez");
                    }
                  }
                }
              }

              target.state = "moving";
            }
            
            
            event.stopPropagation();
          }
          else if (target.state == "moving")
          {
            if (target.compr(parent.matrix, px, py))
            {
              var cx = px*32+16;
              var cy = py*32+16;
              //Devolver a su estado original las celdas rojas
              target.deselect(parent.matrix);
              target.runAction(cc.moveTo(1,cx, cy));
              parent.matrix[px][py].inside[target.team] = target;
              
              parent.gui_layer.updateTurn();
              nteam = (nteam+1)%nPlayers;
              //cc.log("Next player is "+nteam+" with "+parent.player[nteam].health+" HP");
              // Indicar siguiente jugador si vivo
                
              while (parent.player[nteam].health <= 0 && nPlayers > 1)
              {
                parent.gui_layer.updateTurn();
                nteam = (nteam+1)%nPlayers;
                //cc.log("Next player is "+nteam+" with "+parent.player[nteam].health+" HP");
              }  
                
              var ix = Math.floor(parent.player[nteam].getPosition().x/32);
              var iy = Math.floor(parent.player[nteam].getPosition().y/32);
              parent.matrix[ix][iy].setTextureRect(hw.blue);
              //parent.removeChildbyTag(100);
              target.state = "alone";
            }
          }
          
        }
      }
    );
    
    var list_touch = cc.EventListener.create(
    {
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: true,
      onTouchBegan: function(touch, event){
        //cc.log("Touched");
        return true;
      },
      onTouchEnded: function(touch, event)
      {
        //cc.log("Touching end");
        var ev = new cc.EventCustom("action");
        var loc = touch.getLocation();
        ev.setUserData(
          {
            location: loc
          }
        );
        cc.eventManager.dispatchEvent(ev);
        return true;
      }
    });
  
    var list_key = cc.EventListener.create(
    {
        event: cc.EventListener.KEYBOARD,
        onKeyReleased: function (keyCode, event)
        {
          var cursor = event.getCurrentTarget();
          var parent = cursor.getParent();
          var cpos = cursor.getPosition();
          //cc.log(keyCode);
          if (keyCode == 37) //Izquierda
          {
            var newpos = cc.p(cpos.x-32,cpos.y);
            if(cc.rectContainsPoint(parent.getBoundingBoxToWorld(), newpos))
              cursor.setPosition(cpos.x-32, cpos.y);
          }
          if (keyCode == 38) //Arriba
          {
            var newpos = cc.p(cpos.x,cpos.y+32);
            if(cc.rectContainsPoint(parent.getBoundingBoxToWorld(), newpos))
              cursor.setPosition(cpos.x, cpos.y+32);
          }
          if (keyCode == 39) //Derecha
          {
            var newpos = cc.p(cpos.x+32,cpos.y);
            if(cc.rectContainsPoint(parent.getBoundingBoxToWorld(), newpos))
              cursor.setPosition(cpos.x+32, cpos.y);
          }
          if (keyCode == 40) //Abajo
          {
            var newpos = cc.p(cpos.x,cpos.y-32);
            if(cc.rectContainsPoint(parent.getBoundingBoxToWorld(), newpos))
              cursor.setPosition(cpos.x, cpos.y-32);
          }
          if (keyCode == 32) //Espacio
          {
            var event = new cc.EventCustom("action");
            event.setUserData(
              {
                location: cpos
              }
            );
            cc.eventManager.dispatchEvent(event);
          }
          
        }
    });
   
    cc.eventManager.addListener(list_key, this.cursor);
    cc.eventManager.addListener(list_touch, this);
    for (em = 0; em < this.player.length; em++)
    {
      cc.eventManager.addListener(list_act.clone(), this.player[em]);
    }
  }
});

var playScene = cc.Scene.extend({
  onEnter:function ()
  {
    this._super();
    
    var back = new cc.LayerColor(cc.color(192,192,192,255));
    var anim = new animLayer();
    var gui = new guiLayer();
    
    this.addChild(back);
    this.addChild(anim);
    this.addChild(gui);
    
    anim.gui_layer = gui;
  }
});

var menuLayer = cc.Layer.extend({
  opt: null,
  
  ctor: function()
  {
    this._super();
    this.init();
  },
  init: function()
  {
    this._super();

    var winsize = cc.director.getWinSize();
    var centerpos = cc.p(winsize.width / 2, winsize.height / 2);
    
    var colorLayer = new cc.LayerColor(cc.color(255,255,255,255));
    this.addChild(colorLayer);
    
    var spritebg = new cc.Sprite(res.helloBG_png);
    spritebg.setPosition(centerpos);
    this.addChild(spritebg);
    
    this.opt = new cc.EditBox(cc.size(130,40), cc.Scale9Sprite.create(res.greenbox_png));
    this.opt.setString("EditBox Sample");
    this.opt.setPosition(centerpos);
    this.opt.setFontColor(cc.color(255, 250, 0));
    this.opt.setDelegate(this);
    this.addChild(this.opt);
    
    var b1 = new cc.MenuItemSprite(new cc.Sprite(res.button_png),new cc.Sprite(res.button_png), function(){hw.data = 0;}, this);
    b1.getNormalImage().setTextureRect(hw.buttons[1]);
    b1.getSelectedImage().setTextureRect(hw.buttons[1]);
    var b2 = new cc.MenuItemSprite(new cc.Sprite(res.button_png),new cc.Sprite(res.button_png), function(){hw.data = 1;}, this);
    b2.getNormalImage().setTextureRect(hw.buttons[2]);
    b2.getSelectedImage().setTextureRect(hw.buttons[2]);
    b2.setPosition(32,0);
    var b3 = new cc.MenuItemSprite(new cc.Sprite(res.button_png),new cc.Sprite(res.button_png), function(){hw.data = 2;}, this);
    b3.getNormalImage().setTextureRect(hw.buttons[3]);
    b3.getSelectedImage().setTextureRect(hw.buttons[3]);
    b3.setPosition(64,0);
    var menu_b = new cc.Menu(b1,b2,b3);
    menu_b.setPosition(cc.p(winsize.width/3, winsize.height*0.75));
    this.addChild(menu_b);
    
    cc.MenuItemFont.setFontSize(60);
    var button = new cc.MenuItemSprite(new cc.Sprite(res.greenbox_png),new cc.Sprite(res.greenbox_png), this.onPlay, this);
    var menu = new cc.Menu(button);
    menu.setPosition(cc.p(winsize.width/2, winsize.height*0.25));
    this.addChild(menu);
  },
  onPlay: function()
  {
    cc.log(this.opt.getString());
    cc.director.runScene(new playScene());
  }
});

var menuScene = cc.Scene.extend({
  onEnter: function()
  {
    this._super();
    var layer = new menuLayer();
    this.addChild(layer);
  }
});
