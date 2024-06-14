
document.getElementById('connect-bluetooth').addEventListener('click', function() {
    if (!navigator.bluetooth) {
        alert("Web Bluetooth API is not available in this browser!");
        return;
    }

    navigator.bluetooth.requestDevice({
        // we can filter the decices here
        acceptAllDevices: true
        // we can specify the UUIDs
        // optionalServices: ['battery_service', 'heart_rate']
        // filters: [{ namePrefix: 'MyMusic' }]
    })
    .then(device => {
        console.log("Connecting to device: " + device.name);
        return device.gatt.connect();
    })
    .then(server => {
        console.log("Connected to device!");
        // Service and Character of GATT
        // return server.getPrimaryService('battery_service');
    })
    .catch(error => {
        console.error("Failed to connect: ", error);
    });
});