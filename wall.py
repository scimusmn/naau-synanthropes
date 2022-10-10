import re
import serial
from serial.tools.list_ports import comports
import signal
import json 
import keyboard
import random
import time

Key = keyboard.Key


# each animal image is controlled by an Animal class
class Animal:
	animationBlock = time.monotonic()
	# name: the name of the animal (e.g. 'rat')
	# animationKey: the key to press to trigger the full animation in Resolume
	# loopKey: the key to press to trigger the idle loop animation in Resolume
	# idleBlockTime: the time in seconds to prevent the idle animation from triggering
	#                after the full animation starts
	def __init__(self, name, animationKey, loopKey, idleBlockTime):
		self.name = name
		self.animationKey = animationKey
		self.loopKey = loopKey
		self.idleBlock = time.monotonic()
		self.idleBlockTime = idleBlockTime
		self.state = False

	# update the state of the electrode and play the animation if appropriate
	def UpdateState(self, newState):
		if (not self.state) and newState:
			print("  == %s touched ==" % self.name)
			self.PlayAnimation()
			self.state = newState
		else:
			self.state = newState

	# play the full animation
	def PlayAnimation(self):
		if time.monotonic() > Animal.animationBlock:
			keyboard.Tap(self.animationKey)
			self.idleBlock = time.monotonic() + self.idleBlockTime
			Animal.animationBlock = self.idleBlock
		else:
			print("    blocked animation for %s" % self.name)

	# play the idle animation
	def PlayIdle(self):
		if time.monotonic() > self.idleBlock:
			print("  %s idle" % self.name)
			keyboard.Tap(self.loopKey)
		else:
			# the full animation is still playing! don't interrupt it
			print("  %s idle (blocked)" % self.name)


# mapping from the electrode channel number to the animal object to manage it
electrode_map = {
	1: Animal('Rat', Key.R, Key.E, 7.34), # rat has no idle animation, but E isn't bound to anything
	2: Animal('Raccoon', Key.C, Key.T, 13.16),
	3: Animal('Falcon', Key.F, Key.H, 5.7),
	4: Animal('Pigeon', Key.P, Key.D, 5.9),
	5: Animal('Sparrow', Key.S, Key.B, 16.26),
}


######## SET UP SERIAL ########

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


# configure the touch board's electrode thresholds from 'thresholds.json'
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
#ensure data stream is running
controller.write(b'{set-running:1}')
		


# handle SIGINT cleanly
def handler(signum, frame):
	controller.close()
	print('closed port')
	print('bye!')
	exit(0)

signal.signal(signal.SIGINT, handler)

# make sure we're in Resolume so the key presses get where they need to
print('Alt+Tab to Resolume')

def alt_tab():
	keyboard.Press(Key.MENU)
	keyboard.Tap(Key.TAB)
	keyboard.Release(Key.MENU)
alt_tab()
alt_tab()


print('begin main loop')

# this function triggers the idle loop animations randomly
loopTime = time.monotonic()
def random_loop():
	global loopTime
	_, animal = random.choice(list(electrode_map.items()))
	animal.PlayIdle()
	# trigger again in 1-3 seconds
	loopTime = time.monotonic() + 1 + (2 * random.random())


# process each incoming line, and update electrode states
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


# loop forever (until someone hits Ctrl-C, and then exit cleanly)
while True:
	process_line(controller.readline().decode('utf-8'))
	if loopTime < time.monotonic():
		# trigger an idle animation
		random_loop()
