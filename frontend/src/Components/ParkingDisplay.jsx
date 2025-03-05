import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Box, Environment, MeshReflectorMaterial, OrbitControls, Plane, Text } from "@react-three/drei";
import { MeshBasicMaterial, MeshStandardMaterial } from "three";
import { Car2 } from "./Car2";
import mqtt from "mqtt";
import { ParkingLot } from "./ParkingLot.jsx";

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const MQTT_BROKER = "ws://broker.hivemq.com:8000/mqtt"; // Use WebSocket-based MQTT broker
const MQTT_TOPIC = "carpark/occupancy"; // Topic where backend publishes parking data

function ParkingScene({ slots, position, parkingName }) {
    const numColumns = 4; // Define the number of columns
    const spacing = 2; // Define the spacing between cars

    return (
        <Canvas
            style={{ height: "50vh", width: "50vw" }}
            camera={{ position: [0, 5, 10], fov: 50 }}
        >
            {slots.map((slot, index) =>
                slot === 1 ? (
                    <Car2
                        key={index}
                        rotation={[0, Math.random() < 0.5 ? 0 : Math.PI, 0]}
                        position={[
                          -(numColumns - 1) * spacing / 2 + (index % numColumns) * spacing,
                          0,
                          -(Math.floor(index / numColumns)) * spacing + 3
                        ]}
                        scale={[0.02, 0.02, 0.02]}
                        color={getRandomColor()}
                    />
                ) : null
            )}
            <Text
                position={[0, 4, 0]}
                fontSize={0.5}
                color="black"
                anchorX="center"
                anchorY="middle"
            >
                {parkingName}
            </Text>
            <ParkingLot scale={2.8} position={[2, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
            <Environment preset="sunset" />
            <OrbitControls
                minAzimuthAngle={-Math.PI / 4}
                maxAzimuthAngle={Math.PI / 4}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 2}
            />
        </Canvas>
    );
}

export default function ParkingDisplay() {
    // Initialize slots state from sessionStorage if available
    const [slots, setSlots] = useState(() => {
        const saved = sessionStorage.getItem('slots');
        return saved ? JSON.parse(saved) : null;
    });

    const [parkingData, setParkingData] = useState([]);

    useEffect(() => {
        const client = mqtt.connect('ws://broker.emqx.io:8083/mqtt');

        client.on("connect", () => {
            console.log("Connected to MQTT Broker1");
            client.subscribe(MQTT_TOPIC);
        });

        client.on("message", (topic, message) => {
            try {
                console.log(`Received from ${topic}:`, message.toString());
                const parsedData = JSON.parse(message.toString());
                setSlots(parsedData);
                // Save the data to sessionStorage
                sessionStorage.setItem('slots', JSON.stringify(parsedData));
            } catch (error) {
                console.error("Error parsing MQTT message:", error);
            }
        });

        // Error handling
        [client].forEach(c => {
            c.on("error", (err) => console.error("MQTT error:", err));
            c.on("offline", () => console.log("MQTT offline"));
        });

        return () => {
            client.end();
        };
    }, []);

    /*
    useEffect(() => {
        // Example: Fetch initial slot data from Flask API and store in sessionStorage
        fetch("http://127.0.0.1:5000/api/initial-slot-data")
            .then((res) => res.json())
            .then((data) => {
                setSlots(data);
                sessionStorage.setItem('slots', JSON.stringify(data));
            });

        const interval = setInterval(() => {
            fetch("http://127.0.0.1:5000/api/parking-data") // Replace with actual backend URL
                .then((res) => res.json())
                .then((data) => {
                    setSlots(data);
                    sessionStorage.setItem('slots', JSON.stringify(data));
                });
        }, 5000); // Fetch data every 5 seconds

        return () => clearInterval(interval);
    }, []);
    */

    if (!slots) {
        return <div>Loading...</div>;
    }

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

            <div>
                <h2>Smart Parking System</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 50px)", gap: "10px" }}>
                    {parkingData.map((status, index) => (
                        <div
                            key={index}
                            style={{
                                width: "50px",
                                height: "50px",
                                backgroundColor: status === 1 ? "red" : "green", // 1 = Occupied (Red), 0 = Free (Green)
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "bold",
                                borderRadius: "5px"
                            }}
                        >
                            {status === 1 ? "🚗" : "🅿"}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
