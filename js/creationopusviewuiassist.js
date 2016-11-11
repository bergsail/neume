$(document).ready(function(){

    //init state
    setPauseStateUI();
    setProgressUI(0);

    var dataCollect = $(".song-sns").attr("data-collect");
    if (dataCollect == "true") {
      setCollectedUI();
    } else {
      setUncollectUI();
    }

    $(".collect-ic").click(function(){
       setCollectedUI();
       postCollect('true');
    });
    $(".collect-ic-active").click(function(){
       setUncollectUI();
       postCollect('false');
    });
    

    // init songinfo
    $("#song-list-wrap").find("li").each(function(){
       var opusid = $(this).attr("opus-id");
       // var opusname = $(this).attr("opus-name");
       // var opusmp3url = resourceBasicUrl + "/" + opusid + "/" + opusname + "/" + opusname + ".mp3";
       // mp3s.push(opusmp3url);
       if ($(this).attr("opus-active") == "true") {
          var songinfodivs = $(this).children()
          var songinfoclone = songinfodivs.clone(true);

          $("#current-song").append(songinfoclone);

          activeId = $(this).index();
       }
    });

    //hover  
    $("#song-list-wrap").hide();

    $("#current-song").hover(
        // function(){
        //    $("#song-list-wrap").show();
        // },
        // function () {
        //    if (!$(".song-list-wrap").is(":hover")) {
        //       $("#song-list-wrap").hide();
        //    }   
        // }
    );

    $("#song-list-wrap").hover(
        // function(){
        //     $("#song-list-wrap").show();
        // },
        // function(){
        //     $("#song-list-wrap").hide();
        // }
    );

    $(".song-item").hover(
        // function(){
        //    $(this).css("border","1px solid white"); 
        // },
        // function(){
        //    $(this).css("border","1px solid gray")
        // }
    );

});

function onCollect(data){
  console.log(data);
}
function postCollect(dataCollect){

    var feedId = $(".song-sns").attr("dataid");
    var routeUrl = 'http://114.215.141.35/frontend/web/index.php/home/favor/create?feedId=' + feedId;
    var formData = new FormData();
    formData.append('feedFavored', dataCollect);
    $.ajax({
        url:routeUrl, //后台处理程序
        type:'post',         //数据发送方式
        dataType:'json',     //接受数据格式
        data:formData,         //要传递的数据
        success:onCollect, //回传函数(这里是函数名)
        processData: false,
        contentType: false
    });
}
function setPauseStateUI() {
	console.log("setpauseState");
  $("#play-ic").show();
  console.log($("#play-ic"));
  $("#pause-ic").css('display','none');
  console.log($("#pause-ic").css('display'));
}

function setPlayStateUI() {
  $("#pause-ic").show();
  $("#play-ic").hide();
}

function setCollectedUI() {
  $(".collect-ic-active").show();
  $(".collect-ic").hide();
}

function setUncollectUI() {
  $(".collect-ic").show();
  $(".collect-ic-active").hide();
}

function setProgressUI(timepercent) {
  // console.log(timepercent);
  var totalWidth = $("#progress").width();
  var currentWidth = totalWidth * timepercent;
  var currentWidthIc = currentWidth - 5;
  // console.log(currentWidth);startClock

  $("#progress-ic").css("margin-left",currentWidthIc + "px");
  $("#time-bar-progress").css("width", currentWidth + "px");
}

function setPageTotal(pageSize) {
	$("#opus-total-page").text(pageSize);
}

function setPageCurrent(pageCurrent) {
	$("#opus-current-page").text(pageCurrent);
}













