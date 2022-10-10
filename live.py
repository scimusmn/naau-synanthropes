import re
import serial
from serial.tools.list_ports import comports
import signal
import json 

import numpy as np
import matplotlib.pyplot as pt

animals = {
	'rat': 0,
	'raccoon': 1,
	'falcon': 2,
	'pigeon': 3,
	'sparrow': 4,
}

ANIMAL_TO_SHOW = animals['pigeonee']

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
#ensure data stream is running
controller.write(b'{set-running:1}')


streams = [
	np.zeros(100),
	np.zeros(100),
	np.zeros(100),
	np.zeros(100),
	np.zeros(100),
]

updates = 0


def process_line(line):
	global updates
	label_match = re.match(r'^[A-Z]+', line)
	if not label_match:
		return
	label = label_match.group(0)
	
	if (label != 'DIFF'):
		return

	values = re.split(r'[^\-0-9]+', line)
	values = list(filter(lambda x: x != '', values))
	values = list(map(lambda x: int(x), values))
	updates += 1
	for i in range(0,5):
		streams[i] = np.roll(streams[i], -1)
		streams[i][99] = values[i+1]

# handle SIGINT cleanly
def handler(signum, frame):
	controller.close()
	print('closed port')
	print('bye!')
	exit(0)

signal.signal(signal.SIGINT, handler)

# set up animated plot

fig, ax = pt.subplots()
(ln,) = ax.plot(np.arange(100), np.linspace(0, 50, 100), animated=True)
pt.show(block=False)
pt.pause(0.1)
bg = fig.canvas.copy_from_bbox(fig.bbox)
ax.draw_artist(ln)
fig.canvas.blit(fig.bbox)

# loop forever (until someone hits Ctrl-C, and then exit cleanly)
while True:
	process_line(controller.readline().decode('utf-8'))
	if (updates >= 5):
		fig.canvas.restore_region(bg)
		ln.set_ydata(streams[ANIMAL_TO_SHOW])
		ax.draw_artist(ln)
		fig.canvas.blit(fig.bbox)
		fig.canvas.flush_events()
		updates = 0