import re
import serial
from serial.tools.list_ports import comports
import signal
import json 
import keyboard
import random
import time

Key = keyboard.Key


class Animal:
	def __init__(self, name, animationKey, loopKey, idleBlockTime):
		self.name = name
		self.animationKey = animationKey
		self.loopKey = loopKey
		self.idleBlock = time.monotonic()
		self.idleBlockTime = idleBlockTime
		self.state = False

	def UpdateState(self, newState):
		if (not self.state) and newState:
			print("  == %s touched ==" % self.name)
			self.PlayAnimation()
			self.state = newState
		else:
			self.state = newState

	def PlayAnimation(self):
		keyboard.Tap(self.animationKey)
		self.idleBlock = time.monotonic() + self.idleBlockTime

	def PlayIdle(self):
		if time.monotonic() > self.idleBlock:
			print("  %s idle" % self.name)
			keyboard.Tap(self.loopKey)
		else:
			print("  %s idle (blocked)" % self.name)




electrode_map = {
	1: Animal('Rat', Key.R, Key.E, 8),
	2: Animal('Raccoon', Key.C, Key.T, 14),
	3: Animal('Falcon', Key.F, Key.H, 8),
	4: Animal('Pigeon', Key.P, Key.D, 7),
	5: Animal('Sparrow', Key.S, Key.B, 18),
}

def find_controller():
	for port in comports():
		if (port.vid == 0x2a6e and port.pid == 0x8003):
			return port.device
	return None

dev = find_controller()
if (dev == None):
	raise Exception("No touch device found!")
print('Found controller on %s' % dev)

controller = serial.Serial(dev)


def upload_thresholds():
	data = None
	with open('thresholds.json', 'r') as f:
		data = json.load(f)
	for key in data.keys():
		print('uploading %s' % key)
		tths = data[key]['touch']
		rths = data[key]['release']
		print('  TTHS: %d' % tths)
		print('  RTHS: %d' % rths)
		tths_str = '{%s-tths: %d}' % (key, tths)
		rths_str = '{%s-rths: %d}' % (key, rths)
		controller.write(tths_str.encode('utf-8'))
		controller.write(rths_str.encode('utf-8'))

print('uploading thresholds...')
upload_thresholds()
		


# handle SIGINT cleanly
def handler(signum, frame):
	controller.close()
	print('closed port')
	print('bye!')
	exit(0)

signal.signal(signal.SIGINT, handler)

print('Alt+Tab to Resolume')
keyboard.Press(Key.MENU)
keyboard.Tap(Key.TAB)
keyboard.Release(Key.MENU)


print('begin main loop')

loopTime = time.monotonic()
def random_loop():
	global loopTime
	_, animal = random.choice(list(electrode_map.items()))
	animal.PlayIdle()
	loopTime = time.monotonic() + 1 + (2 * random.random())


def process_line(line):
	label_match = re.match(r'^[A-Z]+', line)
	if not label_match:
		return
	label = label_match.group(0)

	if not label == 'TOUCH':
		return
	values = re.split(r'[^\-0-9]+', line)
	values = list(filter(lambda x: x != '', values))
	values = list(map(lambda x: bool(int(x)), values))
	for i in electrode_map.keys():
		animal = electrode_map[i]
		animal.UpdateState(values[i])


while True:
	process_line(controller.readline().decode('utf-8'))
	if loopTime < time.monotonic():
		random_loop()
