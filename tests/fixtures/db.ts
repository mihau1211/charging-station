const chargingStationType1 = {
    name: 'Type 6',
    plug_count: 3,
    efficiency: 0.3,
    current_type: 'AC'
}

const chargingStationType2 = {
    name: 'Type 7',
    plug_count: 3,
    efficiency: 0.3,
    current_type: 'AC'
}

const chargingStation1 = {
    name: 'CS 1',
    device_id: '1b29634d-a62a-4dac-8586-f0946c72e0aa',
    ip_address: '10.10.10.10',
    firmware_version: 'V1'
}

const chargingStation2 = {
    name: 'CS 2',
    device_id: '1b29634d-a62a-4dac-8586-f0946c72e0aa',
    ip_address: '172.0.10.131',
    firmware_version: 'V1'
}

const chargingStation3 = {
    name: 'CS 3',
    device_id: '1b29634d-a62a-4dac-8586-f0946c72e0aa',
    ip_address: '172.0.10.131',
    firmware_version: 'V1'
}

const connector1 = {
    name: "C 1",
    priority: false
}

const connector2 = {
    name: "C 2",
    priority: true
}

const connector3 = {
    name: "C 3",
    priority: false
}

const connector4 = {
    name: "C 4",
    priority: false
}

export {
    chargingStationType1,
    chargingStationType2,
    chargingStation1,
    chargingStation2,
    chargingStation3,
    connector1,
    connector2,
    connector3,
    connector4
}