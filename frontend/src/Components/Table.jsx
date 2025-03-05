const Table = () => {
    const data = [
        {
            id: 1,
            license: 'ABC123',
            time: '10:00 AM',
            start: '2023-09-01',
            end: '2023-09-02',
        },
        {
            id: 2,
            license: 'DEF456',
            time: '11:00 AM',
            start: '2023-09-01',
            end: '2023-09-02',
        },
        {
            id: 3,
            license: 'GHI789',
            time: '12:00 PM',
            start: '2023-09-01',
            end: '2023-09-02',
        },
    ];

    return (
        <table className="table-auto border-collapse border border-gray-300 w-full">
            <thead>
                <tr className="bg-gray-200">
                    {/* <th className="border border-gray-300 px-4 py-2">Name</th> */}
                    <th className="border border-gray-300 px-4 py-2">license</th>
                    <th className="border border-gray-300 px-4 py-2">Time</th>
                    <th className="border border-gray-300 px-4 py-2">Start</th>
                    <th className="border border-gray-300 px-4 py-2">End</th>

                </tr>
            </thead>
            <tbody>
                {data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-100">
                        <td className="border border-gray-300 px-4 py-2">{item.license}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.time}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.start}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.end}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;
