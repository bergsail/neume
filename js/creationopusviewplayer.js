
var resourceBasicUrl = "/resource";

var playingSong = null;
var playingSongId = null;
var activeId = null;

var repeat = false;
var shuffle = false;

var playing = false;
var newsong = false;

var cursorsObj = [];
var bCursor = [];
var svgsObj = [];

var jp=null;

var mp3s = [];
var svgs = [];
var mrcs = [];
mp3s = getMp3s();
svgs = getSvgs();
mrcs = getMrcs();

var measuresData = [];
var currentMeasureId = null;
var currentBaseTime = 0;

var pageWidth = 0;
var pageHeight = 0;//logical

var isCurrentView = true;
var isAnimating = false;
var scrollTopCurrent = 0;

function getMp3s() {
  var mp3s = [];
  console.log($("#song-list-wrap").find("li"));
  $("#song-list-wrap").find("li").each(function(){
    console.log('inli');
     var opusid = $(this).attr("opus-id");
     var opusname = $(this).attr("opus-name");

     var opusmp3url = resourceBasicUrl + "/" + opusid + "/" + opusname + "/" + opusname + ".mp3";
     mp3s.push(opusmp3url);
     // console.log(opusmp3url);
  });
  console.log(resourceBasicUrl);
  return mp3s;
}

function getMrcs() {
  var mrcs = [];
  $("#song-list-wrap").find("li").each(function(){
     var opusid = $(this).attr("opus-id");
     var opusname = $(this).attr("opus-name");

     var opusmrcurl = resourceBasicUrl + "/" + opusid + "/" + opusname + "/" + opusname + ".js";
     mrcs.push(opusmrcurl);

  });

  return mrcs;
}

function getSvgs() {
  var svgs = [];

  var listid = 0;
  $("#song-list-wrap").find("li").each(function(){
    console.log('svgli');
     var opusid = $(this).attr("opus-id");
     var opusname = $(this).attr("opus-name");
     var pagesize = $(this).attr("page-size");

     svgs[listid] = [];

     for (var i = 0; i < pagesize; i++) {

       var number_append;
       if (i < 10) {
          number_append = "00" + i;
       }
       else if (i < 100) {
          number_append = "0" + i;
       }
       else {
          number_append = i;
       }

       var opussvgurl = resourceBasicUrl + "/" + opusid + "/" + opusname + "/" + opusname + number_append+ ".svg";
       svgs[listid].push(opussvgurl)
     }

     listid++;
  });

  return svgs;
}

function resetsong() {
  setProgressUI(0.0001);
  importSvg(activeId);
  loadMrc(activeId);

  cursorsObj = [];
  currentMeasureId = null;
  playingSongId = null;       
  playingSong = null;
  repeat = false;
  playing = false; 
}
$(document).ready(function() {
    
    importSvg(activeId);
    loadMrc(activeId);

    jp = $("#audioplayer");
    //init slider
    $("#song-list-wrap").find("li").each(function(){
        var listItem = $(this);
        $(this).click(function () {   
            $("#current-song").children().remove();
            $("#current-song").append(listItem.children().clone(true));
            $("#song-list-wrap").hide();
            pauseOpus();
            setPauseStateUI();
            activeId = $(this).index();
            setTimeout("resetsong()",300); 
        });
    });

    $("#pause-ic").click(function(){
       pauseOpus();
       setPauseStateUI();
    });

    $("#play-ic").click(function(){
       playOpus();
       setPlayStateUI();
    });
    
});


function mrcJsonCallback(data) {
  measuresData = [];
  var measureSize = data.s;

  var measures = data.m;
  measures = measures.split(']');

  for (var i = 0; i < measureSize; i++) {
     var cell = measures[i].split(' ');
     measuresData.push({
      t:cell[0] * 1000,
      p:cell[1],
      r1:cell[2],
      r2:cell[3],
      r3:cell[4],
      r4:cell[5],
      r5:cell[6]
     });
  }

}

// createMrc("mrc/mrc.js");
function createMrc(url) {
   var os=document.createElement('script');
   os.type='text/javascript';
   os.src=url;
   os.id = "mrcdata";

   var head=document.getElementsByTagName('head')[0];
   head.appendChild(os);
}


function loadMrc(id) {
   measuresData = [];
   $("#mrcdata").remove();
   createMrc(mrcs[id]);
   console.log('loadMrc OK')
}

function importSvg(id) {
    var sheetwrap = $("#sheet-canvas-wrap");
    sheetwrap.children().remove();

    var pageSize = svgs[id].length;
    for (var i = 0; i < pageSize; i++) {
       var page = $("<svg class = 'sheet-canvas'></svg>");
       page.attr("id",'page' + i);
       sheetwrap.append(page);
    }
    setPageTotal(pageSize);
    var number = 0;
    sheetwrap.children().each(function(){
       var sheetid = $(this).attr("id"); 
       var svgPage = Snap("#" + sheetid);

       //load svg page
       var uri = svgs[id][number];
       Snap.load(uri, function (f) {
           var svgc = f.select("svg");
           var width = svgc.attr("viewBox").width;
           var height = svgc.attr("viewBox").height;
           pageWidth = width;
           pageHeight = height;
           svgPage.attr({ viewBox: "0 0 " + width + " " + height + "" });
           var g = f.select("g");
           // var cursor = g.rect(10, 0, 1, 100, 0).attr({fill: "#c00"});
           // cursor.attr({opacity:0});

           svgPage.append(g);
           svgPage.attr({widthCstm: width});
           svgPage.attr({widthCstm: height});
           svgPage.attr({idCstm:sheetid});

           // cursorsObj.push(cursor);
           svgsObj.push(svgPage);

       });

       //add svg cursor
       // var s = Snap("#svg"); 
        // Setting the background
       number++; 
    }); 

    console.log("importsvg OK");   

}

function playSong(id){

    if(playingSongId==null){
        $.jPlayer.timeFormat.padMin = true;
        $.jPlayer.timeFormat.padSec = true;
        $.jPlayer.timeFormat.sepMin = " : ";
        $.jPlayer.timeFormat.sepSec = "";
        jp.jPlayer({
              timeupdate: function(event) {
                var timeCurrent = event.jPlayer.status.currentTime;
                var timeTotal = event.jPlayer.status.duration;
                // console.log(timeCurrent);

                var percent = event.jPlayer.status.currentTime / event.jPlayer.status.duration;
                setProgressUI(percent);

                updateCallback(event.jPlayer.status.currentTime,
                              event.jPlayer.status.duration);
              },
              play: function(event) {
                var timeTotal = event.jPlayer.status.duration;
                var timeTotalFormat = parseInt(timeTotal) / 60;
                timeTotalFormat += ':';
                timeTotalFormat += parseInt(timeTotal) - parseInt(timeTotal) / 60 * 60 ;
                // console.log(timeFormat);
                
              },
              pause: function(event) {
                      
              },
              ended: function(event) {
                 setPauseStateUI();
                 currentMeasureId = null;
                 cursorsObj[cursorsLength - 1].attr({opacity:0});
                 cursorsObj = [];

                 playingSong = null;
                 repeat = false;
                 playing = false;

                 // stopClock();
              },

              swfPath: "http://staticwebpage.bj.bcebos.com/temp",
              cssSelectorAncestor: "#audioplayer",
              supplied: "mp3",
              wmode: "window",
              solution: "html,flash",
              cssSelectorAncestor: '.song-control',
              cssSelector:{
                  currentTime: '.time-current',
                  duration: '.time-total',
              }
        });
    }
    //Save some variables
    playingSongId = id;

    playingSong = mp3s[id];
    // console.log(playingSong);
    jp.jPlayer("setMedia", {
      mp3: playingSong
    });
    jp.jPlayer("play"); 

    // setPlayStateUI();
}

function playOpus() {
  if (playingSongId == null) {
    playSong(activeId);
  }
  jp.jPlayer("play");


}

function pauseOpus() {
  jp.jPlayer("pause");
}

function updateCallback(currentS, totalMs) {

   var currentMs = currentS * 1000;

   if (currentMeasureId == null) {
     currentMeasureId = 0;
     cursorMeasure(measuresData[currentMeasureId].p,
                   measuresData[currentMeasureId].r1,
                   measuresData[currentMeasureId].r2,
                   measuresData[currentMeasureId].r3,
                   measuresData[currentMeasureId].r4,
                   measuresData[currentMeasureId].r5,
                   measuresData[currentMeasureId].t - currentBaseTime);
     currentMeasureId++;
   } else {
     if (currentMs > measuresData[currentMeasureId - 1].t) {
         cursorMeasure(measuresData[currentMeasureId].p,
                       measuresData[currentMeasureId].r1,
                       measuresData[currentMeasureId].r2,
                       measuresData[currentMeasureId].r3,
                       measuresData[currentMeasureId].r4,
                       measuresData[currentMeasureId].r5,
                       measuresData[currentMeasureId].t - currentBaseTime);
         currentMeasureId++;
     }
   }


}

function cursorMeasure(pageid, xf, xsf,  yf, widthf, heightf, interval) {

    setPageCurrent(pageid);

    var xStart = parseFloat(xsf) * parseFloat(pageWidth);
    var xDst =(parseFloat(xf) + parseFloat(widthf)) * parseFloat(pageWidth);

    var svgPage;
    for (var i = 0; i < svgsObj.length; i++) {
      var idString = svgsObj[i].attr("idCstm");
      var idTemp = idString.substring(4, idString.length);
      if (idTemp == pageid) {
        svgPage = svgsObj[i];
      }
    }

    var pageSelector = "#page" + pageid + " "+ "g";
    var g = svgPage.select(pageSelector);

    var x0 = parseInt(xf * pageWidth);
    var y0 = parseInt(yf * pageHeight) - 20;
    var x1 = parseInt(xf * pageWidth + widthf * pageWidth);
    var y1 = parseInt(yf * pageHeight + heightf * pageHeight) + 20; 

    var pathString = "M"+x0+","+y0+","+x1+","+y0
                   + "M"+x1+","+y0+","+x1+","+y1
                   + "M"+x1+","+y1+","+x0+","+y1
                   + "M"+x0+","+y1+","+x0+","+y0;
    var cursor = g.path(pathString).attr({
        stroke: "#ff0000",
        strokeWidth: 1
    })

    cursor.attr({opacity:0.8});

    cursorsObj.push(cursor);

    var cursorsLength = cursorsObj.length;
    if ( cursorsLength > 1)
       cursorsObj[cursorsLength - 2].attr({opacity:0});

    var physicalHeight = $('#page' + pageid ).height();
    var scrollData = pageid * physicalHeight + yf * physicalHeight - 22;
    isAnimating = true;

    if(isCurrentView || Math.abs(scrollData - scrollTopCurrent) < 100)
     $("#sheet-canvas-wrap").animate({scrollTop: scrollData}, 1000, function(){
      isAnimating=false;
      isCurrentView = true;
      scrollTopCurrent = scrollData;
     });

}

$("#sheet-canvas-wrap").scroll(function(){
  if (isAnimating == false) {
     isCurrentView = false;
     // scrollTopCurrent = $("#sheet-canvas-wrap").scrollTop();
  }

  scrollTopCurrent = $("#sheet-canvas-wrap").scrollTop();

  var physicalHeight = $('#page0').height();
  var currentPageIdFlag = parseInt(scrollTopCurrent / physicalHeight) + 1;
  setPageCurrent(currentPageIdFlag);
});



