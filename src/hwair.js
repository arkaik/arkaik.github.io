////
// hwair.js
////
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

hw.data = undefined;

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
  var ox = Math.floor(this.getPosition().x/32);
  var oy = Math.floor(this.getPosition().y/32);
  
  this.setPosition(cx, cy);
}
 
hw.obj_distance = function (m)
{
  i = Math.abs(i);
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  var nx, ny;
  
  for (c = -2; c <= 2; c++)
  {
    nx = ox + c;
    ny = oy + i;
    if (0 <= nx && nx < mat_size && 0 <= ny && ny < mat_size)
      m[nx][ny].setTextureRect(hw.yellow);
  }
  
  for (d = -2; d <= 2; d++)
  {
    nx = ox - 2;
    ny = oy + d;
    
    if (0 <= nx && nx < mat_size && 0 <= ny && ny < mat_size)
      m[nx][ny].setTextureRect(hw.yellow);
    
    nx = ox + 2;
    ny = oy + d;
    if (0 <= nx && nx < mat_size && 0 <= ny && ny < mat_size)
      m[nx][ny].setTextureRect(hw.yellow); 
  }
  
  for (e = -2; e <= 2; e++)
  {
    nx = ox + e;
    ny = oy - 2;
    if (0 <= nx && nx < mat_size && 0 <= ny && ny < mat_size)
      m[nx][ny].setTextureRect(hw.yellow);
  }
}

hw.cmp_distance = function (m, px, py)
{
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  
  var xx = Math.abs(ox - px) == 2;
  var yy = Math.abs(oy - py) == 2;
  
  return xx || yy;
}

hw.des_distance = function (m)
{
  var orig = this.getPosition();
  var ox = Math.floor(orig.x/32);
  var oy = Math.floor(orig.y/32);
  var nx, ny;
  
  for (c = -2; c <= 2; c++)
  {
    nx = ox + c;
    ny = oy + 2;
    if (0 <= nx && nx < mat_size && 0 <= ny && ny < mat_size)
      m[nx][ny].setTextureRect(hw.black);
  }
  
  for (d = -2; d <= 2; d++)
  {
    nx = ox - 2;
    ny = oy + d;
    
    if (0 <= nx && nx < mat_size && 0 <= ny && ny < mat_size)
      m[nx][ny].setTextureRect(hw.black);
    
    nx = ox + 2;
    ny = oy + d;
    if (0 <= nx && nx < mat_size && 0 <= ny && ny < mat_size)
      m[nx][ny].setTextureRect(hw.black); 
  }
  
  for (e = -2; e <= 2; e++)
  {
    nx = ox + e;
    ny = oy - 2;
    if (0 <= nx && nx < mat_size && 0 <= ny && ny < mat_size)
      m[nx][ny].setTextureRect(hw.black);
  }
  
  m[ox][oy].setTextureRect(hw.black);
}

hw.cns_distance = function ()
{
  var bullet = new cc.Sprite(texture);
  bullet.setTextureRect(hw.gbullet);
  bullet.setName("bullet");
  this.addChild(bullet);
  var mov = cc.moveBy(5, 10, 10);
  var seq = cc.sequence(cc.moveBy(5, 10, 10), cc.removeSelf);
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
  
  var xx = Math.abs(ox - px) == 2;
  var yy = Math.abs(oy - py) == 2;
  
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

hw.cns_junction = function()
{
  var bullet = new cc.Sprite(texture);
  bullet.setTextureRect(hw.gbullet);
  bullet.setName("bullet");
  this.addChild(bullet);
  var seq = cc.sequence(cc.moveBy(5, 10, 10), cc.removeSelf);
  bullet.runAction(seq);
}

hw.obj = [hw.obj_contact, hw.obj_junction];
hw.cmp = [hw.cmp_contact, hw.cmp_junction];
hw.des = [hw.des_contact, hw.des_junction];
hw.cns = [hw.cns_contact, hw.cns_junction];