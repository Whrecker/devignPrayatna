import React, { useState } from 'react';

const Form = () => {
    const [licensePlate, setLicensePlate] = useState('');
    const [duration, setDuration] = useState('');
    const [timestamp, setTimestamp] = useState('');
    const [time, setTime] = useState('');


    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log('License Plate:', licensePlate);
        console.log('Duration:', duration);
        console.log('Timestamp:', timestamp);
        console.log('Time:', time);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">License Form</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="license-plate">
                        License Plate
                    </label>
                    <input
                        type="text"
                        id="license-plate"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duration">
                        Duration
                    </label>
                    <input
                        type="text"
                        id="duration"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="timestamp">
                        Timestamp
                    </label>
                    <input
                        type="datetime-local"
                        id="timestamp"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={timestamp}
                        onChange={(e) => setTimestamp(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
                        Time
                    </label>
                    <input
                        type="time"
                        id="time"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Form;
