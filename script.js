var globalID;
var running = false;
var firstrun = true;
var elapsedtime = 0;
var t0;
var ta;
var tb;
var dt;
var width;
var height;
var vector;
var angle;
var a_abs;
var v_abs;
var r_abs;
var crashed = false;

var resize = function() {
  width = window.innerWidth
  height = window.innerHeight
  document.getElementById("canvas").width = width
  document.getElementById("canvas").height = height
}
window.onresize = resize
resize()

var state = {
  vx: 0.16,
  vy: -0.08,
  x0: (width / 2),
  y0: (height / 2),
  x: (width / 2),
  y: (height / 15),
  m1: 10,
  m2: 1,
  m2_rad: 25,
  G: 10,
}

document.getElementById("m1").style.top = state.y - 10 + 'px';
document.getElementById("m1").style.left = state.x - 10 + 'px';

function a(x,y) {
  G = state.G
  m1 = state.m1
  m2 = state.m2
  x0 = state.x0
  y0 = state.y0
  s = G*m1*m2/(m1*(Math.sqrt((x-x0)**2+(y-y0)**2))**3)
  return {ax: -s*(x-x0), ay: -s*(y-y0)}
}

function update(dt) {
  state.vx = state.vx + dt*a(state.x, state.y).ax
  state.vy = state.vy + dt*a(state.x, state.y).ay
  state.x = state.x + dt*state.vx
  state.y = state.y + dt*state.vy
  document.getElementById("m1").style.top = state.y - 10 + 'px';
  document.getElementById("m1").style.left = state.x - 10 + 'px';
  a_abs = 100000*Math.sqrt(a(state.x, state.y).ax**2+a(state.x, state.y).ay**2);
  v_abs = 100*Math.sqrt(state.vx**2+state.vy**2);
  r_abs = 0.1*Math.sqrt((state.x-state.x0)**2+(state.y-state.y0)**2);
  if (r_abs/0.1 - 5 < state.m2_rad) {
    running = false;
  }
  $("#acceleration").html("a = " + Math.round(a_abs));
  $("#velocity").html("v = " + Math.round(v_abs));
  $("#position").html("r = " + Math.round(r_abs));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loop() {
  if (firstrun) {
    firstrun = false;
    t0 = ta
  }
  tb = new Date().getTime();
  dt = (tb - ta) / 1000;
  update(dt*700);
  $("#time").html("t = " + Math.round(elapsedtime));
  ta = new Date().getTime();
  elapsedtime = (ta - t0) / 1000;
  if (running == true) {
    globalID = requestAnimationFrame(loop);
  } else if (running == false) {
    async function demo() {
      crashed = true;
      pause();
      $("#m1").css({"background-image": "url('blow.png')"});
      await sleep(4000);
      reset();
    }
    demo();
  }
}

function start() {
  state.vx = vector.x/1000
  state.vy = vector.y/1000
  ta = new Date().getTime();
  firstrun = true;
  globalID = requestAnimationFrame(loop);
  running = true;
  $("#arrow").css({"display": "none"});
  $("#canvas").css({"cursor": "pointer"});
}

function pause() {
  cancelAnimationFrame(globalID);
  running = false;
  elapsedtime = 0;
  $("#arrow").css({"display": "none"});
  if (crashed == false) {
    $("#canvas").css({"cursor": "pointer"})
  } else if (crashed == true) {
    $("#canvas").css({"cursor": "wait"});
  }
}

function reset() {
  crashed = false;
  $("#canvas").css({"cursor": "default"})
  $("#m1").css({"background-image": "url('moon.png')"});
  cancelAnimationFrame(globalID);
  running = false;
  elapsedtime = 0;
  state.x = width/2
  state.y = height/15
  document.getElementById("m1").style.top = state.y - 10 + 'px';
  document.getElementById("m1").style.left = state.x - 10 + 'px';
  $("#arrow").css({"display": "none"});
  $("#canvas").css({"cursor": "pointer"})
}

$("#canvas").on("click", function() {
  if (running == true) {
    pause()
  } else if (running == false && crashed == false) {
    start()
  }
});

(function() {
    document.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        var dot, eventDoc, doc, body, pageX, pageY;
        event = event || window.event;
        if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;
            event.pageX = event.clientX +
              (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
              (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
              (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
              (doc && doc.clientTop  || body && body.clientTop  || 0 );
        }

        if (running == true) {
          $("#arrow").css({"display": "none"});
        } else if (running == false && crashed == false) {
          $("#arrow").css({"display": "inline"});
          $("#canvas").css({"cursor": "none"})
        }
        vector = {x: event.pageX - state.x, y: event.pageY - state.y}
        angle = -180*Math.atan(-vector.y/vector.x)/Math.PI
        if (vector.x < 0) {
          angle = 180-180*Math.atan(-vector.y/vector.x)/Math.PI
        } else {
          angle = -180*Math.atan(-vector.y/vector.x)/Math.PI
        }
        $("#arrow").css({"top": state.y,
                         "left": state.x,
                         "width": Math.sqrt(vector.x**2+vector.y**2),
                         "transform": "rotate(" + angle +"deg) translateY(-1.5px)",
        });
    }
})();
