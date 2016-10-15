/**
 * Created by steve on 9/9/2016. A
 */
//open spi port
var SPI = require('pi-spi');
//var numberLEDS = 50; // set this global in app
var buffer = new Buffer(3*numberLEDS);
var array = new Array(3*numberLEDS);
var spi = SPI.initialize("/dev/spidev0.0");
spi.clockSpeed(2e6); //2 mHZ
server = require('./rgbledserver.js');
server.start(receivedcommand,8201);


for(var i = 0; i < buffer.length; i+=3){
    buffer[i]=110;
    buffer[i+1]=110;
    buffer[i+2]=0;
}

writeSPI();

function receivedcommand(o){
    console.log("error here" + o);

    if (o.command == 'ledSetColor' ){
        ledSetColor (o.led,o.value);
        writeSPI();

    } else if (o.command == 'setlevel' ){
        console.log(o);
        console.log(o.obj)
        for (var i = o.obj.startled; i <= o.obj.endled; i++){

            ledSetColor (i,o.value);
        }

        writeSPI();


    }


    console.log(o);



}



//fadeSimple(20,25,.1,10);
//fadeColor(5,10,255,0,200,10);

function copyBuffer(){
    for(var i = 0; i< buffer.length; i++){
        array[i] = buffer[i];
    }
}

function updateBuffer(){
    for(var i = 0; i< buffer.length; i++){
        buffer[i] = array[i];
    }
}

function setBlackout(){ // all lights immediately off
    for(var i = 0; i < buffer.length; i+=3) {
        buffer[i] = 0;
        buffer[i + 1] = 0;
        buffer[i + 2] = 0;
    }
    writeSPI();
}

function setAllOn(){ //all lights immediately on white max bright
    for(var i = 0; i < buffer.length; i+=3) {
        buffer[i] = 255;
        buffer[i + 1] = 255;
        buffer[i + 2] = 255;
    }
    writeSPI();
}

function fadeSimple(startLED, endLed, fadeLevel, fadeTime){// fades up or down. Fade level is between 0 and 1 with 1 being all bright.  50% level is .5
    var count = 0;
    var intervalTime = parseInt((fadeTime *1000)/255);
    var stepSizeB = (buffer[((startLED-1)*3)]-  buffer[((startLED-1)*3)]*(fadeLevel))/255;
    var stepSizeG = (buffer[((startLED-1)*3) + 1]-  buffer[((startLED-1)*3) + 1]*(fadeLevel))/255;
    var stepSizeR = (buffer[((startLED-1)*3) + 2]-  buffer[((startLED-1)*3) + 2]*(fadeLevel))/255;
    copyBuffer(); // send data to non 8 bit array
    var simpleFadeInterval = setInterval(function(){
        count +=1;
        if(count >  255){
            clearInterval(simpleFadeInterval);
        }
        for(var i = (startLED-1)*3; i < (endLed)*3; i+=3){
            array[i] -= stepSizeB;
            array[i+1] -= stepSizeG;
            array[i+2] -= stepSizeR;
        }

        updateBuffer(); //bring back buffer to output
        writeSPI();
       // console.log(count +    " "+ buffer[15] +    " "+ buffer[16]+    " "+ buffer[17] + " " + array[15]);
    },intervalTime);
}


function fadeColor(startLED, endLed, red, green, blue, fadeTime){ // fades up or down automatically
    var count = 0;
    var intervalTime = parseInt((fadeTime *1000)/255);
    var stepSizeB = (buffer[((startLED-1)*3)]-  blue)/255;
    var stepSizeG = (buffer[((startLED-1)*3) + 1]-  green)/255;
    var stepSizeR = (buffer[((startLED-1)*3) + 2]-  red)/255;
    copyBuffer(); // send data to non 8 bit array
    var simpleFadeInterval = setInterval(function(){
        count +=1;
        if(count >  255){
            clearInterval(simpleFadeInterval);
        }
        for(var i = (startLED-1)*3; i < (endLed)*3; i+=3){
            array[i] -= stepSizeB;
            array[i+1] -= stepSizeG;
            array[i+2] -= stepSizeR;
        }
        updateBuffer(); //bring back buffer to output
        writeSPI();
    },intervalTime);
}




function writeSPI(){ //sends entire buffer to led strip
    spi.write(buffer,function(e){
        if(e) console.log(e);
    });
}

function ledSetColor(number,value){ // first led is led 1  //
    number = (number-1)*3;

    if (typeof(value) == 'number'){

        buffer[number] = value;
        buffer[number +1] = value;
        buffer[number +2] = value;

    }else
    {


        buffer[number] = value[2];
        buffer[number +1] = value[1];
        buffer[number +2] = value[0];
    }
}