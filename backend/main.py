import cv2
import os
import cvzone
import pickle
import numpy as np
from concurrent.futures import ThreadPoolExecutor
import time
import psutil
from dotenv import load_dotenv
import json
from flask import Flask, render_template, request, jsonify, Response
from flask_cors import CORS
import threading
import licence_plate_detection
from supabase import create_client, Client
import datetime
import pandas as pd
import paho.mqtt.client as mqtt
from flask_mqtt import Mqtt
from tensorflow.keras.models import load_model
app = Flask(__name__)

app.config['MQTT_BROKER_URL'] = 'broker.emqx.io'  # or 'localhost' if using a local broker
app.config['MQTT_BROKER_PORT'] = 1883
app.config['MQTT_USERNAME'] = ''  # if required
app.config['MQTT_PASSWORD'] = ''  # if required
app.config['MQTT_KEEPALIVE'] = 60
app.config['MQTT_TLS_ENABLED'] = False  # set to True if using TLS

mqtt = Mqtt(app)

load_dotenv()
url = "https://lyalpkfpvzhcyipwxnqt.supabase.co"
key = os.getenv("public_api")
supabase = create_client(url, key)

def loading_excel():
    df = pd.read_excel("log_data.xlsx")

    # Convert time columns to datetime
    df["time_start"] = pd.to_datetime(df["time_start"])
    df["time_end"] = pd.to_datetime(df["time_end"])

    print("Raw data from Excel:")
    print(df)
    return df
CORS(app)
cap = cv2.VideoCapture('carPark.mp4')
perm_counter = 0
with open('CarParkPosition', 'rb') as f:
    posList = pickle.load(f)
posList.sort(key=lambda tup: tup[1])
l={'PARKING_1':[0]*8,'PARKING_2':[0]*8,'PARKING_3':[0]*8,'PARKING_4':[0]*8}
posList.sort()

width, height = 107, 48

# This lock protects access to perm_counter and l between threads.
data_lock = threading.Lock()
data_event = threading.Event()


def get_user_by_id(plate):
    response = supabase.table("license").select("*").eq("license", plate).execute()
    if response.data:
        return True
    return False

def publish_occupancy_data():
    payload = json.dumps(l)
    mqtt.publish("carpark/occupancy", payload)

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
            if pos<=17:
                l['PARKING_1'][pos%7] = 0
            elif pos>17 and pos<=34:
                l['PARKING_2'][pos%7] = 0
            elif pos>34 and pos<=51:
                l['PARKING_3'][pos%7] = 0
            elif pos>51 and pos<=69:
                l['PARKING_4'][pos%7] = 0
        color = (0, 255, 0)
        thickness = 3
    else:
        with data_lock:
            if pos<=17:
                l['PARKING_1'][pos%7] = 1
            elif pos>17 and pos<=34:
                l['PARKING_2'][pos%7] = 1
            elif pos>34 and pos<=51:
                l['PARKING_3'][pos%7] = 1
            elif pos>51 and pos<=69:
                l['PARKING_4'][pos%7] = 1


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
            publish_occupancy_data()
    cvzone.putTextRect(img, f'Free {space_counter}/ {len(posList)}', (100, 50), scale=3,
                       thickness=5, offset=20, colorR=(0, 200, 0))

def event_stream():
    last_counter = None
    while True:
        data_event.wait()
        with data_lock:
            current_counter = perm_counter
            current_list = l.copy()
        if current_counter != last_counter:
            last_counter = current_counter
            yield f"data: {json.dumps(current_list)}\n\n"
        data_event.clear()

@app.route('/data', methods=["POST","GET"])
def getting_data():
    try:
        existing_ids = supabase.table("license").select("id").execute()
        if existing_ids.data:
            last_id = max([record["id"] for record in existing_ids.data])
            new_id = last_id + 1
        else:
            new_id = 1 
        print(existing_ids)
        print(new_id)
        current_time = datetime.datetime.now()
        duration = current_time + datetime.timedelta(minutes=2)
        
        license_plate = "ABCD943"  
        duration_iso = duration.isoformat()
        current_time_iso = current_time.isoformat()

        # Prepare data for Supabase
        supabase_data = {
            "id":new_id,
            "license": license_plate,
            "duration": duration_iso  # ISO string
        }

        # Insert into Supabase
        supabase.table("license").upsert(supabase_data).execute()

        # Prepare data for Excel
        excel_new_row = {
            "license_plate": license_plate,
            "time_start": current_time_iso,  # ISO string
            "time_end": duration_iso          # ISO string
        }

        # Update Excel file
        new_data = pd.DataFrame([excel_new_row])
        existing_data = loading_excel()  # Ensure this function exists and returns a DataFrame
        updated_data = pd.concat([existing_data, new_data], ignore_index=True)
        updated_data.to_excel("log_data.xlsx", index=False)  # Replace with actual file path

        return "done"

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/dashboard_data', methods=["POST","GET"])
def dashboard_data():
    try:
        df = loading_excel()
        print(df)
        # Clean column names (strip whitespace and standardize)
        df.columns = df.columns.str.strip()
        print(df.columns)   
        # Check for required columns
        required_columns = ["license_plate", "time_start", "time_end"]
        if not all(col in df.columns for col in required_columns):
            missing = [col for col in required_columns if col not in df.columns]
            return jsonify({"error": f"Missing columns: {missing}"}), 400
        
        # Convert datetime columns to strings (ISO format)
        df["time_start"] = df["time_start"].dt.strftime('%Y-%m-%dT%H:%M:%S')
        df["time_end"] = df["time_end"].dt.strftime('%Y-%m-%dT%H:%M:%S')
        
        # Group data by License Plate
        grouped = df.groupby("license_plate").apply(
            lambda x: x[["time_start", "time_end"]].to_dict("records")
        ).reset_index(name="Time Intervals")
        
        # Convert to JSON-friendly format
        result = grouped.to_dict(orient="records")
        print(result)
        return jsonify({"data": result}), 200
    
    except FileNotFoundError:
        return jsonify({"error": "Excel file not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.teardown_appcontext
def shutdown_mqtt(exception=None):
    print("Tearing down app context, shutting down MQTT client...")
    mqtt_client.loop_stop()
    mqtt_client.disconnect()

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
'''
def plate_detection():
    model = load_model('model_LicensePlate.h5')
    cap = cv2.VideoCapture('licence_plate.mp4')
    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frame_count += 1
        if frame_count % 50==0:
            plate=licence_plate_detection.sending_data(frame, model)
            if plate=="KA02AG5359":
                payload = json.dumps(l)
                mqtt.publish("carpark/occupancy", payload)
'''
def delete_data():
    while True:
        all_data = supabase.table("license").select("*").execute()
        now = datetime.datetime.now().isoformat()
        response = supabase.table("license").delete().lt("duration", now).execute()
        all_data = supabase.table("license").select("*").execute()
        time.sleep(200)
video_thread = threading.Thread(target=video_processing, daemon=True)
#plate_thread=threading.Thread(target=plate_detection,daemon=True)
delete_thread=threading.Thread(target=delete_data,daemon=True)
#plate_thread.start()
video_thread.start()
delete_thread.start()


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False,host="0.0.0.0",port=5001)
