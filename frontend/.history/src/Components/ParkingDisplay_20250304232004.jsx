import { useEffect, useState } from "react";
import mqtt from "mqtt";
import ParkingScene from "./ParkingScene"; // Keep your ParkingScene component

const MQTT_BROKER = "ws://your-mqtt-broker:port"; // Replace with actual WebSocket URL
const MQTT_TOPIC = "parking/slots"; // Replace with your MQTT topic

const initialSlotData = {
    PARKING_1: [1, 1, 1, 1, 1, 1, 1, 1],
    PARKING_2: [1, 1, 1, 1, 1, 1, 1, 1],
    PARKING_3: [1, 1, 1, 1, 1, 1, 1, 1],
    PARKING_4: [1, 1, 1, 1, 1, 1, 1, 1]
};

export default function ParkingDisplay() {
    const [slots, setSlots] = useState(initialSlotData);

    useEffect(() => {
        // Connect to MQTT broker
        const client = mqtt.connect(MQTT_BROKER);

        client.on("connect", () => {
            console.log("Connected to MQTT broker");
            client.subscribe(MQTT_TOPIC, (err) => {
                if (!err) {
                    console.log(`Subscribed to topic: ${MQTT_TOPIC}`);
                }
            });
        });

        client.on("message", (topic, message) => {
            if (topic === MQTT_TOPIC) {
                try {
                    const data = JSON.parse(message.toString());
                    setSlots(data);
                } catch (error) {
                    console.error("Error parsing MQTT message:", error);
                }
            }
        });

        client.on("error", (err) => {
            console.error("MQTT Error:", err);
        });

        return () => {
            client.end();
        };
    }, []);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
            {Object.keys(slots).map((parking, index) => (
                <div key={parking}>
                    <ParkingScene
                        slots={slots[parking]}
                        position={[index % 2 * 10, 0, -Math.floor(index / 2) * 10]}
                        parkingName={parking}
                    />
                </div>
            ))}
        </div>
    );
}
