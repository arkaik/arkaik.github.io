//////
// hwair.js
//////
// Utilidades para Board Wars
////
var hw = {};
//Colores de celda predefinidos
hw.black = cc.rect(0,0,32,32);
hw.red = cc.rect(32,0,32,32);
hw.green = cc.rect(64,0,32,32);
hw.blue = cc.rect(96,0,32,32);
hw.darkred = cc.rect(128,0,32,32);
hw.darkblue = cc.rect(160,0,32,32);
hw.yellow = cc.rect(0,32,32,32);
hw.magenta = cc.rect(32,32,32,32);
hw.cyan = cc.rect(64,32,32,32);
hw.grey = cc.rect(96,32,32,32);
hw.darkgreen = cc.rect(128,32,32,32);
hw.dotted = cc.rect(160,32,32,32);
// Símbolos predefinidos
hw.plus = cc.rect(0,64,32,32);
hw.rombe = cc.rect(32,64,32,32);
hw.cross = cc.rect(64,64,32,32);
hw.chacana = cc.rect(96,64,32,32);
hw.valcamo = cc.rect(128,64,32,32);
hw.block = cc.rect(0,96,32,32);
hw.glider = cc.rect(32,96,32,32);
hw.maccom = cc.rect(64,96,32,32);
hw.leafcross = cc.rect(96,96,32,32);
hw.hourglass = cc.rect(128,96,32,32);
// Especiales 
hw.gold = cc.rect(160,64,32,32);
hw.silver = cc.rect(160,96,32,32);
hw.gbullet = cc.rect(352,0,32,32);
hw.sbullet = cc.rect(352,32,32,32);

hw.colour = [hw.red, hw.green, hw.blue, hw.yellow, hw.magenta, hw.cyan];
hw.symbol = [hw.plus, hw.rombe, hw.cross, hw.chacana, hw.valcamo, hw.block, hw.glider, hw.maccom, hw.leafcross, hw.hourglass];

//Botones
hw.buttons = [cc.rect(0,0,32,32), cc.rect(32,0,32,32), cc.rect(64,0,32,32), cc.rect(96,0,32,32)];
hw.actions = [cc.rect(0,64,32,32), cc.rect(32,64,32,32), cc.rect(64,64,32,32), cc.rect(96,64,32,32)];

hw.data = 0;
hw.data_sym = new Array(4);

//Tipos de habilidades
hw.obj_contact = function (m)
{
  var nx, ny;
    
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  for (d = -1; d <= 1; d++)
  {
    for (e = -1; e <= 1; e++)
    {
      nx = ox + d;
      ny = oy + e;
      if (0 <= nx && nx < mat_size && 0 <= ny && ny < mat_size)
        m[nx][ny].setTextureRect(hw.red);
    }
  }
};

hw.cmp_contact = function (m, px, py)
{
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  var xx = Math.abs(ox - px) <= 1;
  var yy = Math.abs(oy - py) <= 1;
  
  return xx && yy;
}

hw.des_contact = function (m)
{
  var nx, ny;
    
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  for (d = -1; d <= 1; d++)
  {
    for (e = -1; e <= 1; e++)
    {
      nx = ox + d;
      ny = oy + e;
      if (0 <= nx && nx < mat_size && 0 <= ny && ny < mat_size)
        m[nx][ny].setTextureRect(hw.black);
    }
  }
}

hw.cns_contact = function(m, px, py)
{
  var cx = px * 32+16;
  var cy = py * 32+16;
  var ox = Math.floor(this.getPosition().x/32)*32+16;
  var oy = Math.floor(this.getPosition().y/32)*32+16;
  
  var bullet = new cc.Sprite(texture);
  bullet.setTextureRect(hw.sbullet);
  bullet.setName("bullet");
  bullet.setPosition(ox,oy);
  this.getParent().addChild(bullet);
  var seq = cc.sequence(cc.moveBy(0.5, cx-ox, cy-oy), cc.delayTime(0.5), cc.removeSelf());
  bullet.runAction(seq); 
}

hw.obj_junction = function (m)
{  
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  var nx, ny;
  
  for (k = -2; k <= 2; k++)
  {
    
    ny = oy + k;
    if (0 <= ox && ox < mat_size && 0 <= ny && ny < mat_size)
      m[ox][ny].setTextureRect(hw.green);
    
    nx = ox + k;  
    if (0 <= nx && nx < mat_size && 0 <= oy && oy < mat_size)
      m[nx][oy].setTextureRect(hw.green);
  }
}

hw.cmp_junction = function(m, px, py)
{
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  var jx = ox == px
  var jy = oy == py;
  
  var xx = Math.abs(ox - px) <= 2;
  var yy = Math.abs(oy - py) <= 2;
  
  return (jx || jy) && (xx || yy);
}

hw.des_junction = function(m)
{
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  var nx, ny;
  
  for (k = -2; k <= 2; k++)
  {
    
    ny = oy + k;
    if (0 <= ox && ox < mat_size && 0 <= ny && ny < mat_size)
      m[ox][ny].setTextureRect(hw.black);
    
    nx = ox + k;  
    if (0 <= nx && nx < mat_size && 0 <= oy && oy < mat_size)
      m[nx][oy].setTextureRect(hw.black);
  }
}

hw.cns_junction = function(m, px, py)
{
  //Posició a l'espai del món
  var cx = px * 32+16;
  var cy = py * 32+16;
  
  var ox = Math.floor(this.getPosition().x/32)*32+16;
  var oy = Math.floor(this.getPosition().y/32)*32+16;
  
  //cc.log("x: "+cx+"-"+ox+"="+(cx-ox)+", y:"+cy+"-"+oy+"="+(cy-oy));
  var bullet = new cc.Sprite(texture);
  bullet.setTextureRect(hw.gbullet);
  bullet.setName("bullet");
  bullet.setPosition(ox,oy);
  this.getParent().addChild(bullet);
  var seq = cc.sequence(cc.moveTo(0.5, cx, cy), cc.delayTime(0.5), cc.removeSelf());
  bullet.runAction(seq);
  
}

hw.obj_diagonal = function (m)
{  
  var base_node = this.getParent();
  var parent = base_node.getParent();
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  cc.log("obj_diagonal: "+ox+","+oy);
  var nx, ny;
  
  for (k = -2; k <= 2; k++)
  {
    
    nx1 = ox - k;
    nx2 = ox + k;
    ny = oy + k;
    
    if (0 <= nx1 && nx1 < mat_size && 0 <= ny && ny < mat_size)
      m[nx1][ny].setTextureRect(hw.blue);
    
    if (0 <= nx2 && nx2 < mat_size && 0 <= ny && ny < mat_size)
      m[nx2][ny].setTextureRect(hw.blue);
  }
}

hw.cmp_diagonal = function(m, px, py)
{
  var base_node = this.getParent();
  var parent = base_node.getParent();
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
 
  var jj = Math.abs(ox-px) == Math.abs(oy-py);
  
  var xx = Math.abs(ox - px) <= 2;
  var yy = Math.abs(oy - py) <= 2;
  
  return jj && (xx || yy);
}

hw.des_diagonal = function(m)
{
  var base_node = this.getParent();
  var parent = base_node.getParent();
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  var nx, ny;
  
  for (k = -2; k <= 2; k++)
  {
    nx1 = ox - k;
    nx2 = ox + k;
    ny = oy + k;
    
    if (0 <= nx1 && nx1 < mat_size && 0 <= ny && ny < mat_size)
      m[nx1][ny].setTextureRect(hw.black);
    
    if (0 <= nx2 && nx2 < mat_size && 0 <= ny && ny < mat_size)
      m[nx2][ny].setTextureRect(hw.black);
  }
}

hw.cns_diagonal = function(m, px, py)
{
  //Posició a l'espai del món
  var cx = px * 32+16;
  var cy = py * 32+16;

  var base_node = this.getParent();
  var parent = base_node.getParent();
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32)*32+16;
  var oy = Math.floor(orig.y/32)*32+16;
  
  //cc.log("x: "+cx+"-"+ox+"="+(cx-ox)+", y:"+cy+"-"+oy+"="+(cy-oy));
  var bullet = new cc.Sprite(texture);
  bullet.setTextureRect(hw.gbullet);
  bullet.setName("bullet");
  bullet.setPosition(ox,oy);
  base_node.addChild(bullet);
  var seq = cc.sequence(cc.moveTo(0.5, cx, cy), cc.delayTime(0.5), cc.removeSelf());
  bullet.runAction(seq);
  
}

hw.obj_wave = function (m)
{
   
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  m[ox][oy].setTextureRect(hw.darkred);
}

hw.cmp_wave = function (m, px, py)
{
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  var xx = ox == px;
  var yy = oy == py;
  
  return xx && yy;
}

hw.des_wave = function (m)
{
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  m[ox][oy].setTextureRect(hw.black);
}

hw.cns_wave = function ()
{
  var seqs = new Array(8);
  for (i = 0; i < 8; ++i)
  { 
    var bullet = new cc.Sprite(texture, hw.gbullet);
    this.addChild(bullet);
    var seq = cc.sequence(cc.moveBy(5, 10, 10), cc.removeSelf);
    seq.setTarget(bullet);
    seqs[i] = seq;
  }
  cc.log("wave");
  var spa = cc.spawn(seqs);
  
  this.runAction(spa);
}

hw.obj = [hw.obj_contact, hw.obj_junction, hw.obj_diagonal, hw.obj_wave];
hw.cmp = [hw.cmp_contact, hw.cmp_junction, hw.cmp_diagonal, hw.cmp_wave];
hw.des = [hw.des_contact, hw.des_junction, hw.des_diagonal, hw.des_wave];
hw.cns = [hw.cns_contact, hw.cns_junction, hw.cns_diagonal, hw.cns_wave];

hw.f1 = function(menu,target)
{
  return function()
  {
    this.removeChild(menu);
    target.objective(this.getParent().matrix);
    target.state = "moving";
    target.pos_act[0] = false;
    target.num_pos_act -= 1;
  }
};

hw.f2 = function(menu, target)
{
  return function()
  {
    this.removeChild(menu);
    target.objective(this.getParent().matrix);
    target.state = "selected";
    target.pos_act[1] = false;
    target.num_pos_act -= 1;
  }
};

hw.f3 = function(menu, target)
{
  return function()
  {
    this.removeChild(menu);
    target.state = "alone";
    target.pos_act[2] = false;
    target.num_pos_act -= 1;
  }
};

hw.f4 = function(menu, target)
{
  return function()
  {
    var parent = this.getParent();
    this.removeChild(menu);
    var orig = target.getPosition();
    var ix = Math.floor(orig.x/32);
    var iy = Math.floor(orig.y/32);
    //parent.matrix[ix][iy].setTextureRect(hw.blue);
    target.num_pos_act = 4;
    target.pos_act = [true,true,true,true];

    parent.matrix[ix][iy].setTextureRect(hw.black);
    var nteam = parent.gui_layer.turn;
    parent.gui_layer.updateTurn();
    
    nteam = (nteam+1)%nPlayers;
              
    while (parent.player[nteam].health <= 0 && nPlayers > 1)
    {
      parent.gui_layer.updateTurn();
      nteam = (nteam+1)%nPlayers;
    }

    var nx = Math.floor(parent.player[nteam].getPosition().x/32);
    var ny = Math.floor(parent.player[nteam].getPosition().y/32);
    parent.matrix[nx][ny].setTextureRect(hw.blue);

    target.state = "alone";
  }
};

hw.menu_functions = [hw.f1, hw.f2, hw.f3, hw.f4];

hw.create_menu = function(target)
{
  var base_node = target.getParent();
  var parent = base_node.getParent();
  var orig = target.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);

  var cmenu = new CircularMenu(4, 48);
  cc.log(target.pos_act);
  for (i = 0; i < hw.menu_functions.length; ++i)
  {
    if (target.pos_act[i])
    {
      var ab = new cc.MenuItemSprite(new cc.Sprite(res.button_png, hw.actions[i]),new cc.Sprite(res.button_png, hw.actions[i]), hw.menu_functions[i](cmenu,target), base_node); 
      cmenu.addItem(ab);
    }
  }

  cmenu.setPosition(ox*32,oy*32);
  base_node.addChild(cmenu,10,100);
};
