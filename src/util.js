// Opciones y configuración
var mat_size = 15; // Matriz n * n, n = mat_size
var nPlayers = 4; // Número de jugadores
var cPlayers = nPlayers; // Contador de jugadores restantes
var turn = 0;
var health4all = 5;

var texture = cc.textureCache.addImage(res.image_png);

//Herencia estilo Old JS
function Plus (string)
{
  // [JAVA] this.super(...)
  cc.Sprite.call(this, string);
  this.state = "alone";
  this.health = health4all;
  this.defense = 2;
  this.team = 0;
  this.objective = hw.obj_contact;
  this.compr = hw.cmp_contact;
  this.deselect = hw.des_contact;
  this.consequence = hw.cns_contact;
  
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
      this.player[p] = new Plus(texture);
      this.player[p].setPosition(32*p+16,32*p+16); //TO DO Random
      this.player[p].setTextureRect(hw.symbol[p]);
      this.player[p].getChildByName("mask").setPosition(16,16);
      this.addChild(this.player[p]);
      this.player[p].team = p;

      this.matrix[p][p].inside[p] = this.player[p];
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
            target.state = "selected";
            target.objective(parent.matrix);
          }
          else if (target.state == "selected")
          { 
            if (target.compr(parent.matrix, px, py))
            {
              target.state = "alone";
              
              //Devolver a su estado original las celdas rojas
              target.deselect(parent.matrix);

              parent.matrix[ox][oy].inside[target.team] = undefined;
              
              //Toda acción tiene su consecuencia... (hue hue)
              target.consequence(parent.matrix, px, py);

              var affected = null;
              for (i = 0; i < parent.matrix[px][py].inside.length; i++)
              {
                affected = parent.matrix[px][py].inside[i];
                
                if (affected != undefined)
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
            }
          
            event.stopPropagation();
          }
        }
      }
    );
    
    var list_plus = cc.EventListener.create(
    {
      event: cc.EventListener.MOUSE,
      swallowTouches: false,
      onMouseUp: function(event)
      {
        var ev = new cc.EventCustom("action");
        var loc = event.getLocation();
        ev.setUserData(
          {
            location: loc
          }
        );
        cc.eventManager.dispatchEvent(ev);
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
    cc.eventManager.addListener(list_plus, this);
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
    
    var spritebg = new cc.Sprite(res.helloBG_png);
    spritebg.setPosition(centerpos);
    this.addChild(spritebg);
    
    this.opt = new cc.EditBox(cc.size(130,40), cc.Scale9Sprite.create(res.greenbox_png));
    this.opt.setString("EditBox Sample");
    this.opt.setPosition(centerpos);
    this.opt.setFontColor(cc.color(255, 250, 0));
    this.opt.setDelegate(this);
    this.addChild(this.opt);
    
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
