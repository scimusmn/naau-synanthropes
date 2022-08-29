/*******************************************************************************

 Bare Conductive MPR121 library
 ------------------------------

 DataStream.ino - prints capacitive sense data from MPR121 to serial port

 Based on code by Jim Lindblom and plenty of inspiration from the Freescale
 Semiconductor datasheets and application notes.

 Bare Conductive code written by Stefan Dzisiewski-Smith, Peter Krige
 and Szymon Kaliski.

 This work is licensed under a MIT license https://opensource.org/licenses/MIT

 Copyright (c) 2016, Bare Conductive

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

*******************************************************************************/

// serial rate
#define BAUD_RATE 9600

#include <MPR121.h>
#include <MPR121_Datastream.h>
#include <Wire.h>

#include "SerialController.h"
smm::SerialController<> controller;

bool running;
void setRunning(int value) {
	running = value;
	Serial.print("running: ");
	Serial.println(running);
}

#define SPARROW_ELECTRODE 5
#define SPARROW_TTHS 5
#define SPARROW_RTHS 2
#define PIGEON_ELECTRODE 4
#define PIGEON_TTHS 10
#define PIGEON_RTHS 5
#define FALCON_ELECTRODE 3
#define FALCON_TTHS 5
#define FALCON_RTHS 2
#define RACCOON_ELECTRODE 2
#define RACCOON_TTHS 5
#define RACCOON_RTHS 2
#define RAT_ELECTRODE 1
#define RAT_TTHS 5
#define RAT_RTHS 2


#define SET_THRESHOLDS(name, electrode) \
	void set ## name ## Rths(int value) { \
		MPR121.setReleaseThreshold(electrode, value); \
		Serial.print("Set " #name " RTHS to "); \
		Serial.println(value); \
	} \
	void set ## name ## Tths(int value) { \
		MPR121.setTouchThreshold(electrode, value); \
		Serial.print("Set " #name " TTHS to "); \
		Serial.println(value); \
	}


SET_THRESHOLDS(Sparrow, SPARROW_ELECTRODE)
SET_THRESHOLDS(Pigeon, PIGEON_ELECTRODE)
SET_THRESHOLDS(Falcon, FALCON_ELECTRODE)
SET_THRESHOLDS(Raccoon, RACCOON_ELECTRODE)
SET_THRESHOLDS(Rat, RAT_ELECTRODE)


void setThresholds(uint8_t electrode, uint8_t tths, uint8_t rths) {
	MPR121.setTouchThreshold(electrode, tths);
	MPR121.setReleaseThreshold(electrode, rths);
}


void setup(){
	Serial.begin(BAUD_RATE);
	while (!Serial); // only needed for Arduino Leonardo or Bare Touch Board

	// 0x5C is the MPR121 I2C address on the Bare Touch Board
	if (!MPR121.begin(0x5C)) {
		Serial.println("error setting up MPR121");
		switch(MPR121.getError()){
			case NO_ERROR:
				Serial.println("no error");
				break;
			case ADDRESS_UNKNOWN:
				Serial.println("incorrect address");
				break;
			case READBACK_FAIL:
				Serial.println("readback failure");
				break;
			case OVERCURRENT_FLAG:
				Serial.println("overcurrent on REXT pin");
				break;
			case OUT_OF_RANGE:
				Serial.println("electrode out of range");
				break;
			case NOT_INITED:
				Serial.println("not initialised");
				break;
			default:
				Serial.println("unknown error");
				break;
		}
		while(1);
	}

	// set thresholds
	setThresholds(SPARROW_ELECTRODE, SPARROW_TTHS, SPARROW_RTHS);
	setThresholds(PIGEON_ELECTRODE, PIGEON_TTHS, PIGEON_RTHS);
	setThresholds(FALCON_ELECTRODE, FALCON_TTHS, FALCON_RTHS);
	setThresholds(RACCOON_ELECTRODE, RACCOON_TTHS, RACCOON_RTHS);
	setThresholds(RAT_ELECTRODE, RAT_TTHS, RAT_RTHS);

	controller.addCallback("set-running", setRunning);
	controller.addCallback("sparrow-rths", setSparrowRths);
	controller.addCallback("sparrow-tths", setSparrowTths);
	controller.addCallback("pigeon-rths", setPigeonRths);
	controller.addCallback("pigeon-tths", setPigeonTths);
	controller.addCallback("falcon-rths", setFalconRths);
	controller.addCallback("falcon-tths", setFalconTths);
	controller.addCallback("raccoon-rths", setRaccoonRths);
	controller.addCallback("raccoon-tths", setRaccoonTths);
	controller.addCallback("rat-rths", setRatRths);
	controller.addCallback("rat-tths", setRatTths);

	// start datastream object using provided Serial reference
	MPR121_Datastream.begin(&Serial);
}

void loop(){
	controller.update();
	MPR121.updateAll();
	if (running) {
		MPR121_Datastream.update();
	}
}
