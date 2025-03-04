import cv2
import cvzone
import pickle
import numpy as np
from concurrent.futures import ThreadPoolExecutor
import time
import psutil
import json
from flask import Flask, render_template, request, jsonify, Response
import threading
import licence_plate_detection
'''
MQTT_BROKER = "localhost"    # Update if your broker is elsewhere
MQTT_PORT = 1883
MQTT_TOPIC_OCCUPANCY = "carpark/occupancy"
MQTT_TOPIC_CCTV = "carpark/cctv"

# Set up MQTT client
mqtt_client = mqtt.Client()
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
mqtt_client.loop_start()  # Start MQTT network loop in background
latest_frame = None
'''
app = Flask(__name__)

cap = cv2.VideoCapture('carPark.mp4')
perm_counter = 0
with open('CarParkPosition', 'rb') as f:
    posList = pickle.load(f)
posList.sort(key=lambda tup: tup[1])
print(posList)
l={'PARKING_1':[],'PARKING_2':[],'PARKING_3':[]}
posList.sort()
count1=0
count2=0
count3=0
for i in posList:
    if i[0]<367:
        l['PARKING_1'].append(0)
        count1+=1
    elif i[0]>=367 and i[0]<700:
        l['PARKING_2'].append(0)
        count2+=1
    else:
        l['PARKING_3'].append(0)
        count3+=1
print(l)
print(count1,count2,count3)
width, height = 107, 48

# This lock protects access to perm_counter and l between threads.
data_lock = threading.Lock()
data_event = threading.Event()


def publish_occupancy_data():
    """Publish the occupancy list (l) to MQTT."""
    payload = json.dumps(l)
    mqtt_client.publish(MQTT_TOPIC_OCCUPANCY, payload)
    print("Published occupancy:", payload)

def publish_cctv_frame(frame):
    """Encode the frame as JPEG and publish to MQTT."""
    # Encode frame as JPEG
    ret, buffer = cv2.imencode('.jpg', frame)
    if ret:
        # Optionally, encode in base64 so the data is textual
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')
        payload = json.dumps({"frame": jpg_as_text})
        mqtt_client.publish(MQTT_TOPIC_CCTV, payload)
        
  
def check_parking_space_single(img_processed, pos):
    global l, perm_counter
    x, y = posList[pos]
    img_crop = img_processed[y:y+height, x:x+width]
    count = cv2.countNonZero(img_crop)
    cvzone.putTextRect(img, str(count), (x, y + height - 3), scale=1,
                       thickness=2, offset=0, colorR=(0, 0, 255))
    if count < 950:
        with data_lock:
            if x<367 and pos<=count1:
                l['PARKING_1'][pos] = 0
            elif x>=367 and x<700 and pos>count1 and pos<count2+count1:
                l['PARKING_2'][pos-count1] = 0
            else:
                l['PARKING_3'][pos-count2-count1] = 0
        color = (0, 255, 0)
        thickness = 3
    else:
        with data_lock:
            if x<367 and pos<=count1:
                l['PARKING_1'][pos] = 1
            elif x>=367 and x<700 and pos>count1 and pos<count2+count1:
                l['PARKING_2'][pos-count1] = 1
            else:
                l['PARKING_3'][pos-count2-count1] = 1
        color = (0, 0, 255)
        thickness = 2
    cv2.rectangle(img, posList[pos], (posList[pos][0] + width, posList[pos][1] + height), color, thickness)
    cvzone.putTextRect(img, str(count), (x, y + height - 3), scale=1,
                       thickness=2, offset=0, colorR=color)
    return count

def check_parking_space_parallel(img_processed):
    global perm_counter
    space_counter = 0
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(check_parking_space_single, img_processed, pos) for pos in range(len(posList))]
        for future in futures:
            count = future.result()
            if count is not None and count < 950:
                space_counter += 1
    with data_lock:
        if perm_counter != space_counter:
            perm_counter = space_counter
            data_event.set()
            #publish_occupancy_data()
    cvzone.putTextRect(img, f'Free {space_counter}/ {len(posList)}', (100, 50), scale=3,
                       thickness=5, offset=20, colorR=(0, 200, 0))

def event_stream():
    last_counter = None
    while True:
        data_event.wait()
        print("sending")
        with data_lock:
            current_counter = perm_counter
            current_list = l.copy()
        if current_counter != last_counter:
            last_counter = current_counter
            yield f"data: {json.dumps(current_list)}\n\n"
        time.sleep(0.5)
@app.route('/stream')
def stream():
    return Response(event_stream(), mimetype="text/event-stream")

def video_processing():
    global cap, img
    while True:
        if cap.get(cv2.CAP_PROP_POS_FRAMES) == cap.get(cv2.CAP_PROP_FRAME_COUNT):
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        success, img = cap.read()
        img=cv2.line(img,(367,0),(367,720),(255,0,0),10)
        img=cv2.line(img,(700,0),(700,720),(255,0,0),10)
        if not success:
            continue
        img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img_blur = cv2.GaussianBlur(img_gray, (3, 3), 1)
        img_threshold = cv2.adaptiveThreshold(img_blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                              cv2.THRESH_BINARY_INV, 25, 16)
        img_median = cv2.medianBlur(img_threshold, 5)
        kernel = np.ones((3, 3), np.uint8)
        img_dilate = cv2.dilate(img_median, kernel, iterations=1)
        check_parking_space_parallel(img_dilate)
        cv2.imshow("Image", img)
        with data_lock:
            latest_frame = img.copy()
        #publish_cctv_frame(img)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    cap.release()
    cv2.destroyAllWindows()
def plate_detection():        
    img_ori=cv2.imread('licence_plate.jpg')
    print(licence_plate_detection.sending_data(img_ori))
video_thread = threading.Thread(target=video_processing, daemon=True)
#plate_thread=threading.Thread(target=plate_detection,daemon=True)
#plate_thread.start()
video_thread.start()


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
